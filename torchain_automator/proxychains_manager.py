"""
TorChain Automator - Proxychains Manager Module
Handles detection, installation, and configuration of Proxychains.
"""

import os
import re
import shutil
import subprocess

from logger import setup_logger, log_proxy_route

logger = setup_logger("proxychains")

CONF_PATHS = [
    "/etc/proxychains4.conf",
    "/etc/proxychains.conf",
]

DEFAULT_CONF_TEMPLATE = """\
# proxychains.conf — managed by TorChain Automator

# Proxy chaining mode
#   dynamic_chain  — skips dead proxies automatically
#   strict_chain   — all proxies must be alive (in order)
#   round_robin_chain — rotate through proxies
dynamic_chain

# Quiet mode — suppresses proxychains output
quiet_mode

# Proxy DNS through the proxy chain to prevent DNS leaks
proxy_dns

# Timeouts (milliseconds)
tcp_read_time_out  15000
tcp_connect_time_out 8000

[ProxyList]
# ── Primary: Tor SOCKS5 ───────────────────────────────────────────────
socks5  127.0.0.1 9050

# ── Optional additional proxies ───────────────────────────────────────
# Add more proxies below in the format:
#   socks5  <ip>  <port>  [user]  [pass]
#   socks4  <ip>  <port>
#   http    <ip>  <port>  [user]  [pass]
#
# Examples (disabled by default):
# socks5  127.0.0.1  9150
# http    1.2.3.4    8080
"""


def _run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    logger.debug("Running: %s", " ".join(cmd))
    return subprocess.run(cmd, capture_output=True, text=True, check=check)


def is_proxychains_installed() -> bool:
    """
    Return True if proxychains4 or proxychains binary is found in PATH.
    """
    found = shutil.which("proxychains4") is not None or shutil.which("proxychains") is not None
    logger.debug("Proxychains installed: %s", found)
    return found


def install_proxychains() -> bool:
    """
    Install proxychains-ng (proxychains4) using apt-get.

    Returns:
        True on success, False on failure.
    """
    logger.info("Proxychains not found. Attempting installation…")
    print("[*] Proxychains is not installed. Installing now (requires sudo)…")

    try:
        _run(["sudo", "apt-get", "update", "-y"])
        _run(["sudo", "apt-get", "install", "-y", "proxychains4"])
        if is_proxychains_installed():
            logger.info("Proxychains installed successfully.")
            print("[+] Proxychains installed successfully.")
            return True

        logger.error("Proxychains binary not found after installation.")
        print("[-] Proxychains binary not found after installation.")
        return False
    except subprocess.CalledProcessError as exc:
        logger.error("Proxychains installation failed: %s", exc)
        print(f"[-] Installation error: {exc}")
        return False


def ensure_proxychains_installed() -> bool:
    """
    Check if Proxychains is installed; install if absent.

    Returns:
        True if Proxychains is available after this call.
    """
    if is_proxychains_installed():
        logger.info("Proxychains is already installed.")
        print("[+] Proxychains is already installed.")
        return True
    return install_proxychains()


def find_conf_path() -> str | None:
    """
    Return the first existing proxychains config path, or None.
    """
    for path in CONF_PATHS:
        if os.path.isfile(path):
            return path
    return None


def configure_proxychains(extra_proxies: list[str] | None = None) -> bool:
    """
    Write a fresh proxychains configuration file.

    The configuration enables:
    - dynamic_chain mode (dead proxies are skipped)
    - SOCKS5 127.0.0.1:9050  (Tor)
    - Any additional proxies supplied in extra_proxies

    Args:
        extra_proxies: Optional list of extra proxy lines, e.g.
                       ["socks5  10.0.0.1  1080", "http  1.2.3.4  8080"]

    Returns:
        True on success, False on failure.
    """
    if not ensure_proxychains_installed():
        return False

    conf_path = find_conf_path() or "/etc/proxychains4.conf"
    logger.info("Writing proxychains config to %s", conf_path)
    print(f"[*] Configuring Proxychains at {conf_path}…")

    content = DEFAULT_CONF_TEMPLATE

    if extra_proxies:
        extra_block = "\n".join(extra_proxies)
        content = content.rstrip() + f"\n\n# ── User-supplied additional proxies ────────────────────────────────\n{extra_block}\n"

    try:
        tmp_path = "/tmp/proxychains_torchain.conf"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(content)

        _run(["sudo", "cp", tmp_path, conf_path])
        _run(["sudo", "chmod", "644", conf_path])
        logger.info("Proxychains configured successfully.")
        print("[+] Proxychains configuration written successfully.")

        route_summary = "SOCKS5 127.0.0.1:9050 (Tor)"
        if extra_proxies:
            route_summary += " + " + ", ".join(extra_proxies)
        log_proxy_route(route_summary)

        return True
    except (OSError, subprocess.CalledProcessError) as exc:
        logger.error("Failed to write proxychains config: %s", exc)
        print(f"[-] Could not write config: {exc}")
        return False


def show_current_config() -> None:
    """
    Print the current proxychains configuration to the terminal.
    """
    conf_path = find_conf_path()
    if not conf_path:
        print("[-] No proxychains configuration file found.")
        return

    print(f"\n[*] Current config: {conf_path}\n")
    try:
        with open(conf_path, "r", encoding="utf-8") as f:
            print(f.read())
    except OSError as exc:
        print(f"[-] Could not read config: {exc}")


def add_proxy_interactive() -> None:
    """
    Prompt the user to add an extra proxy to the configuration file.
    """
    conf_path = find_conf_path()
    if not conf_path:
        print("[-] No config file found. Run 'Configure Proxychains' first.")
        return

    print("\nProxy types: socks5, socks4, http")
    proxy_type = input("Enter proxy type: ").strip().lower()
    proxy_ip   = input("Enter proxy IP: ").strip()
    proxy_port = input("Enter proxy port: ").strip()

    if not proxy_type or not proxy_ip or not proxy_port:
        print("[-] Incomplete proxy details. Aborting.")
        return

    line = f"{proxy_type}  {proxy_ip}  {proxy_port}"

    try:
        tmp_path = "/tmp/proxy_append.conf"
        with open(conf_path, "r", encoding="utf-8") as f:
            existing = f.read()

        existing = existing.rstrip() + f"\n{line}\n"

        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(existing)

        _run(["sudo", "cp", tmp_path, conf_path])
        logger.info("Added proxy: %s", line)
        print(f"[+] Proxy added: {line}")
        log_proxy_route(f"Added proxy: {line}")
    except (OSError, subprocess.CalledProcessError) as exc:
        logger.error("Failed to add proxy: %s", exc)
        print(f"[-] Error: {exc}")
