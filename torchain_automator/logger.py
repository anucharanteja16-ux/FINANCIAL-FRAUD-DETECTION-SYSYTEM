"""
TorChain Automator - Logging Module
Handles all logging for the application.
"""

import os
import logging
from datetime import datetime

LOGS_DIR = os.path.join(os.path.dirname(__file__), "logs")


def setup_logger(name: str) -> logging.Logger:
    """
    Set up and return a named logger that writes to both console and file.

    Args:
        name: The name for this logger (e.g. 'tor', 'proxychains', 'ip')

    Returns:
        A configured logging.Logger instance.
    """
    os.makedirs(LOGS_DIR, exist_ok=True)

    log_filename = os.path.join(LOGS_DIR, f"{name}.log")
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    file_handler = logging.FileHandler(log_filename, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


def log_ip_change(original_ip: str, new_ip: str) -> None:
    """
    Record an IP address change event to a dedicated IP change log.

    Args:
        original_ip: The public IP address before enabling Tor.
        new_ip:      The public IP address after enabling Tor.
    """
    os.makedirs(LOGS_DIR, exist_ok=True)

    ip_log_path = os.path.join(LOGS_DIR, "ip_changes.log")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = (
        f"[{timestamp}] IP CHANGE — Original: {original_ip} | Anonymous: {new_ip}\n"
    )

    with open(ip_log_path, "a", encoding="utf-8") as f:
        f.write(entry)


def log_proxy_route(proxy_info: str) -> None:
    """
    Record proxy routing information to a dedicated proxy log.

    Args:
        proxy_info: A string describing the proxy route or configuration used.
    """
    os.makedirs(LOGS_DIR, exist_ok=True)

    proxy_log_path = os.path.join(LOGS_DIR, "proxy_routes.log")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] PROXY ROUTE — {proxy_info}\n"

    with open(proxy_log_path, "a", encoding="utf-8") as f:
        f.write(entry)
