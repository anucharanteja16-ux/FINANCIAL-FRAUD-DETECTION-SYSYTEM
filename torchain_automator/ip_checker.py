"""
TorChain Automator - IP Checker Module
Verifies the public IP address before and after enabling Tor.
"""

import subprocess
import urllib.request
import json

from logger import setup_logger, log_ip_change

logger = setup_logger("ip")

IP_SERVICES = [
    "https://api.ipify.org?format=json",
    "https://api.my-ip.io/ip.json",
    "https://ipinfo.io/json",
]


def _fetch_ip_direct(url: str) -> str | None:
    """
    Fetch the public IP from a URL using the standard library (no proxy).

    Args:
        url: The IP-lookup service endpoint.

    Returns:
        The IP address string, or None on failure.
    """
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("ip") or data.get("query") or data.get("origin")
    except Exception as exc:
        logger.debug("Direct IP fetch failed for %s: %s", url, exc)
        return None


def get_real_ip() -> str:
    """
    Return the machine's current public IP address (bypassing any proxy).

    Returns:
        The public IP string, or an error message on failure.
    """
    for url in IP_SERVICES:
        ip = _fetch_ip_direct(url)
        if ip:
            logger.info("Real IP detected: %s", ip)
            return ip.strip()

    logger.error("Could not determine real IP from any service.")
    return "Unknown"


def get_tor_ip() -> str:
    """
    Return the public IP address as seen through the Tor SOCKS5 proxy.
    Uses curl with proxychains4 so the request is routed through Tor.

    Returns:
        The Tor exit-node IP string, or an error message on failure.
    """
    cmd = ["proxychains4", "-q", "curl", "-s", "--max-time", "20",
           "https://api.ipify.org?format=json"]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0 and result.stdout.strip():
            data = json.loads(result.stdout.strip())
            ip = data.get("ip", "Unknown")
            logger.info("Tor IP detected: %s", ip)
            return ip
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError) as exc:
        logger.warning("proxychains4 check failed (%s), trying curl socks5…", exc)

    try:
        result = subprocess.run(
            ["curl", "-s", "--socks5", "127.0.0.1:9050",
             "--max-time", "20", "https://api.ipify.org?format=json"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0 and result.stdout.strip():
            data = json.loads(result.stdout.strip())
            ip = data.get("ip", "Unknown")
            logger.info("Tor IP (via curl socks5): %s", ip)
            return ip
    except Exception as exc:
        logger.error("Tor IP check failed: %s", exc)

    return "Unknown (Tor may not be running)"


def check_ip_status() -> dict:
    """
    Check and display the real IP vs the Tor IP, and log the change.

    Returns:
        A dict with keys 'real_ip' and 'tor_ip'.
    """
    print("\n[*] Fetching your real public IP address…")
    real_ip = get_real_ip()
    print(f"    Original IP  : {real_ip}")

    print("[*] Fetching your Tor exit-node IP address…")
    tor_ip = get_tor_ip()
    print(f"    Anonymous IP : {tor_ip}")

    if real_ip != "Unknown" and tor_ip not in ("Unknown", "Unknown (Tor may not be running)"):
        if real_ip != tor_ip:
            print("\n[+] SUCCESS — Your traffic is being routed through Tor!")
            log_ip_change(real_ip, tor_ip)
        else:
            print("\n[-] WARNING — Both IPs match. Tor may not be active.")
    else:
        print("\n[!] Could not fully verify anonymity. Check your Tor service.")

    return {"real_ip": real_ip, "tor_ip": tor_ip}
