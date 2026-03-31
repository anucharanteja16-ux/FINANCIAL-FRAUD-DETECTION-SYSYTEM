# TorChain Automator

A clean, modular Python tool that automatically installs, configures, and manages **Tor** and **Proxychains** on Debian/Ubuntu-based Linux systems. It lets you route your internet traffic anonymously through the Tor network with a single command.

---

## Features

- Automatic detection and installation of Tor and Proxychains
- Automatic configuration of `/etc/proxychains4.conf` with SOCKS5 support and multiple proxy routing
- One-click anonymous mode (installs → configures → starts Tor)
- IP verification — see your real IP vs your Tor exit-node IP side by side
- Fully logged — all actions, IP changes, and proxy routes are saved to the `logs/` directory
- Simple numbered menu interface — beginner friendly

---

## Requirements

| Requirement | Notes |
|---|---|
| Linux (Debian/Ubuntu) | `apt-get` is used for installation |
| Python 3.10+ | Uses built-in `subprocess`, `urllib`, `logging` |
| sudo / root access | Required to install packages and manage services |
| Internet connection | Required to install Tor and check IPs |

No third-party Python packages are needed. Everything in `requirements.txt` is optional (uncomment if you want extras like `rich` or `colorama`).

---

## Folder Structure

```
torchain_automator/
├── main.py                  # Entry point — menu interface
├── tor_manager.py           # Tor detection, install, start, stop
├── proxychains_manager.py   # Proxychains detection, install, configure
├── ip_checker.py            # Real IP vs Tor IP verification
├── logger.py                # Logging setup (file + console)
├── requirements.txt         # Python dependencies (mostly stdlib)
├── README.md                # This file
└── logs/
    ├── main.log             # General application logs
    ├── tor.log              # Tor-specific logs
    ├── proxychains.log      # Proxychains-specific logs
    ├── ip.log               # IP check logs
    ├── ip_changes.log       # Before/after IP change records
    └── proxy_routes.log     # Proxy routing records
```

---

## How to Run — Step by Step

### GUI Mode (Recommended)

```bash
sudo python3 gui.py
```

A graphical window will open with buttons for every action, a live output console, and a real-time IP display strip showing your Real IP vs Tor IP side by side.

### Terminal / Menu Mode

```bash
sudo python3 main.py
```

### 1. Clone or download the project

```bash
git clone https://github.com/your-username/torchain-automator.git
cd torchain-automator/torchain_automator
```

Or simply copy the `torchain_automator/` folder onto your Linux machine.

### 2. Make sure Python 3.10+ is installed

```bash
python3 --version
```

### 3. Run the tool with sudo

```bash
sudo python3 main.py
```

> **Why sudo?** Installing Tor and Proxychains via `apt-get`, writing to `/etc/proxychains4.conf`, and controlling the `tor` systemd service all require root privileges.

### 4. Use the menu

```
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
```

**Recommended first-time flow:**

1. Select **3 — Start Anonymous Mode**  
   This automatically: installs Tor → installs Proxychains → configures everything → starts Tor → shows your before/after IP.

### 5. Using Proxychains manually

Once Tor is running you can route any application through it:

```bash
proxychains4 firefox
proxychains4 curl https://check.torproject.org
proxychains4 python3 my_script.py
```

### 6. Stop Tor when done

Select **5 — Stop Tor** from the menu, or:

```bash
sudo systemctl stop tor
```

---

## Log Files

All logs are saved automatically in the `logs/` directory:

| File | Contents |
|---|---|
| `main.log` | Overall application activity |
| `tor.log` | Tor install / start / stop events |
| `proxychains.log` | Proxychains install / config events |
| `ip.log` | Every IP lookup attempt |
| `ip_changes.log` | Timestamped before→after IP records |
| `proxy_routes.log` | Proxy routes written to the config |

---

## Adding Extra Proxies

Select **6 — Add Extra Proxy** from the menu and follow the prompts. You can add:

- `socks5  <IP>  <PORT>`
- `socks4  <IP>  <PORT>`
- `http    <IP>  <PORT>`

These are appended to `/etc/proxychains4.conf` and used automatically in `dynamic_chain` mode.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Permission denied` | Run with `sudo python3 main.py` |
| Tor IP same as real IP | Wait 10 s for Tor circuits to build, then recheck |
| `proxychains4: command not found` | Select option 2 to install/configure Proxychains |
| `curl: command not found` | Run `sudo apt-get install curl` |
| Tor service won't start | Check `logs/tor.log` and `sudo journalctl -u tor` |

---

## Suggested Future Improvements

1. **GUI version** — Use `tkinter` or `PyQt6` to build a desktop GUI around the same modular functions.
2. **Automatic IP rotation** — Schedule `sudo systemctl reload tor` every N minutes to get a new exit node.
3. **Browser integration** — Auto-launch Firefox in a pre-configured Tor profile.
4. **Proxy scraper** — Automatically fetch free SOCKS5 proxies from public lists and add them to the chain.
5. **VPN + Tor chaining** — Detect an active VPN and inform the user of the double-hop route.
6. **Cross-distro support** — Add `dnf`/`yum` (Fedora/RHEL) and `pacman` (Arch) install paths.
7. **Real-time traffic monitor** — Use `psutil` to show live bandwidth through the Tor tunnel.
8. **Tor Bridge support** — Configure Tor to use bridges when the standard network is blocked.

---

## Disclaimer

This tool is provided for **educational and legitimate privacy purposes only**.  
Use it responsibly and in compliance with the laws of your jurisdiction.  
The authors are not responsible for any misuse.
