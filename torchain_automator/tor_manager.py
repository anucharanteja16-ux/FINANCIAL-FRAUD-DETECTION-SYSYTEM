"""
TorChain Automator - Tor Manager Module
Handles detection, installation, and control of the Tor service.
"""

import subprocess
import shutil
import sys

from logger import setup_logger

logger = setup_logger("tor")


def _run(cmd: list[str], check: bool = True, capture: bool = True) -> subprocess.CompletedProcess:
    """
    Run a shell command and return the result.

    Args:
        cmd:     List of command tokens.
        check:   If True, raise on non-zero exit code.
        capture: If True, capture stdout/stderr.

    Returns:
        CompletedProcess instance.
    """
    logger.debug("Running: %s", " ".join(cmd))
    return subprocess.run(
        cmd,
        capture_output=capture,
        text=True,
        check=check,
    )


def is_tor_installed() -> bool:
    """
    Check whether Tor is installed on the system.

    Returns:
        True if the 'tor' binary is found in PATH, False otherwise.
    """
    found = shutil.which("tor") is not None
    logger.debug("Tor installed: %s", found)
    return found


def install_tor() -> bool:
    """
    Install Tor using the system package manager (apt-get).
    Requires root/sudo privileges.

    Returns:
        True if installation succeeded, False on failure.
    """
    logger.info("Tor not found. Attempting installation via apt-get…")
    print("[*] Tor is not installed. Installing now (requires sudo)…")

    try:
        _run(["sudo", "apt-get", "update", "-y"], capture=False)
        _run(["sudo", "apt-get", "install", "-y", "tor"], capture=False)
        if is_tor_installed():
            logger.info("Tor installed successfully.")
            print("[+] Tor installed successfully.")
            return True
        else:
            logger.error("Tor installation completed but binary not found.")
            print("[-] Installation finished but 'tor' binary not found.")
            return False
    except subprocess.CalledProcessError as exc:
        logger.error("Tor installation failed: %s", exc)
        print(f"[-] Error during Tor installation: {exc}")
        return False


def ensure_tor_installed() -> bool:
    """
    Check if Tor is installed; install it if not.

    Returns:
        True if Tor is available after this call, False otherwise.
    """
    if is_tor_installed():
        logger.info("Tor is already installed.")
        print("[+] Tor is already installed.")
        return True
    return install_tor()


def start_tor() -> bool:
    """
    Start the Tor service via systemctl (falls back to running 'tor' directly).

    Returns:
        True if Tor started successfully, False otherwise.
    """
    if not ensure_tor_installed():
        return False

    logger.info("Starting Tor service…")
    print("[*] Starting Tor service…")

    try:
        _run(["sudo", "systemctl", "start", "tor"], capture=False)
        logger.info("Tor service started via systemctl.")
        print("[+] Tor service started.")
        return True
    except subprocess.CalledProcessError:
        logger.warning("systemctl failed, trying direct 'tor' invocation…")

    try:
        subprocess.Popen(
            ["tor"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        logger.info("Tor started as a background process.")
        print("[+] Tor started as a background process.")
        return True
    except FileNotFoundError:
        logger.error("Could not start Tor — binary not found.")
        print("[-] Could not start Tor.")
        return False


def stop_tor() -> bool:
    """
    Stop the Tor service.

    Returns:
        True if Tor stopped successfully, False otherwise.
    """
    logger.info("Stopping Tor service…")
    print("[*] Stopping Tor service…")

    try:
        _run(["sudo", "systemctl", "stop", "tor"], capture=False)
        logger.info("Tor service stopped.")
        print("[+] Tor service stopped.")
        return True
    except subprocess.CalledProcessError as exc:
        logger.error("Failed to stop Tor: %s", exc)
        print(f"[-] Could not stop Tor: {exc}")
        return False


def tor_status() -> str:
    """
    Return the current status of the Tor service as a string.

    Returns:
        A human-readable status string.
    """
    try:
        result = _run(["sudo", "systemctl", "is-active", "tor"], check=False)
        status = result.stdout.strip()
        logger.debug("Tor systemctl status: %s", status)
        return status
    except Exception:
        return "unknown"
