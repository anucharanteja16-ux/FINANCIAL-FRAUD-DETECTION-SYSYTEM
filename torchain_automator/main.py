#!/usr/bin/env python3
"""
TorChain Automator
==================
A modular Python tool that automatically installs, configures, and manages
Tor and Proxychains on Debian/Ubuntu-based Linux systems.

Usage:
    sudo python3 main.py
"""

import os
import sys
import time

from logger import setup_logger
from tor_manager import (
    ensure_tor_installed,
    start_tor,
    stop_tor,
    tor_status,
)
from proxychains_manager import (
    ensure_proxychains_installed,
    configure_proxychains,
    show_current_config,
    add_proxy_interactive,
)
from ip_checker import check_ip_status, get_real_ip

logger = setup_logger("main")

BANNER = r"""
╔══════════════════════════════════════════════════════════╗
║          TorChain Automator  —  by TorChain Dev          ║
║       Automated Tor + Proxychains Setup for Linux        ║
╚══════════════════════════════════════════════════════════╝
"""

MENU = """
  ┌─────────────────────────────────────────┐
  │           MAIN MENU                     │
  ├─────────────────────────────────────────┤
  │  1. Install & Configure Tor             │
  │  2. Configure Proxychains               │
  │  3. Start Anonymous Mode                │
  │  4. Check IP Status                     │
  │  5. Stop Tor                            │
  │  6. Add Extra Proxy                     │
  │  7. Show Proxychains Config             │
  │  8. Show Tor Service Status             │
  │  0. Exit                                │
  └─────────────────────────────────────────┘
"""


def separator(char: str = "─", width: int = 56) -> None:
    """Print a visual separator line."""
    print(char * width)


def pause() -> None:
    """Wait for the user to press Enter before continuing."""
    input("\n  Press Enter to return to the menu…")


def menu_install_tor() -> None:
    """Menu option 1 — Install and configure Tor."""
    separator()
    print("  [1] Install & Configure Tor")
    separator()
    logger.info("User selected: Install & Configure Tor")

    real_ip = get_real_ip()
    print(f"\n  [*] Your current public IP: {real_ip}")

    success = ensure_tor_installed()
    if success:
        print("\n  [*] Tor is ready. Use option 3 to start anonymous mode.")
    else:
        print("\n  [-] Tor setup encountered errors. Check the logs/ directory.")

    pause()


def menu_configure_proxychains() -> None:
    """Menu option 2 — Configure Proxychains."""
    separator()
    print("  [2] Configure Proxychains")
    separator()
    logger.info("User selected: Configure Proxychains")

    success = configure_proxychains()
    if not success:
        print("\n  [-] Configuration failed. Check the logs/ directory.")

    pause()


def menu_start_anonymous() -> None:
    """Menu option 3 — Start anonymous mode (Tor + IP check)."""
    separator()
    print("  [3] Start Anonymous Mode")
    separator()
    logger.info("User selected: Start Anonymous Mode")

    print("\n  [*] Step 1/3 — Ensuring Tor is installed…")
    if not ensure_tor_installed():
        print("  [-] Cannot start anonymous mode without Tor.")
        pause()
        return

    print("\n  [*] Step 2/3 — Ensuring Proxychains is configured…")
    configure_proxychains()

    print("\n  [*] Step 3/3 — Starting Tor service…")
    if start_tor():
        print("\n  [+] Tor service is running.")
        print("  [*] Waiting 5 seconds for Tor to establish circuits…")
        time.sleep(5)
        print()
        check_ip_status()
    else:
        print("  [-] Failed to start Tor service.")

    pause()


def menu_check_ip() -> None:
    """Menu option 4 — Check current IP status."""
    separator()
    print("  [4] Check IP Status")
    separator()
    logger.info("User selected: Check IP Status")
    print()
    check_ip_status()
    pause()


def menu_stop_tor() -> None:
    """Menu option 5 — Stop Tor."""
    separator()
    print("  [5] Stop Tor")
    separator()
    logger.info("User selected: Stop Tor")
    stop_tor()
    pause()


def menu_add_proxy() -> None:
    """Menu option 6 — Add an extra proxy entry."""
    separator()
    print("  [6] Add Extra Proxy")
    separator()
    logger.info("User selected: Add Extra Proxy")
    add_proxy_interactive()
    pause()


def menu_show_config() -> None:
    """Menu option 7 — Display the current Proxychains configuration."""
    separator()
    print("  [7] Show Proxychains Config")
    separator()
    logger.info("User selected: Show Proxychains Config")
    show_current_config()
    pause()


def menu_tor_status() -> None:
    """Menu option 8 — Show Tor service status."""
    separator()
    print("  [8] Tor Service Status")
    separator()
    logger.info("User selected: Tor Service Status")
    status = tor_status()
    print(f"\n  Tor service is currently: {status.upper()}")
    pause()


HANDLERS = {
    "1": menu_install_tor,
    "2": menu_configure_proxychains,
    "3": menu_start_anonymous,
    "4": menu_check_ip,
    "5": menu_stop_tor,
    "6": menu_add_proxy,
    "7": menu_show_config,
    "8": menu_tor_status,
}


def main() -> None:
    """Application entry point — display menu and dispatch user choices."""
    os.makedirs("logs", exist_ok=True)
    logger.info("TorChain Automator started.")
    print(BANNER)

    while True:
        print(MENU)
        try:
            choice = input("  Enter your choice: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n  [*] Exiting TorChain Automator. Stay safe!")
            logger.info("TorChain Automator exited by user (Ctrl+C / EOF).")
            sys.exit(0)

        if choice == "0":
            print("\n  [*] Exiting TorChain Automator. Stay safe!\n")
            logger.info("TorChain Automator exited normally.")
            sys.exit(0)

        handler = HANDLERS.get(choice)
        if handler:
            handler()
        else:
            print(f"\n  [!] Invalid option '{choice}'. Please choose 0–8.")


if __name__ == "__main__":
    if os.geteuid() != 0:
        print("\n[!] WARNING: TorChain Automator should be run as root (sudo).")
        print("    Some features (install, configure, start/stop Tor) require elevated privileges.\n")
    main()
