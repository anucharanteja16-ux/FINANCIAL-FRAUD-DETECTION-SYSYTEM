#!/usr/bin/env python3
"""
TorChain Automator — GUI Interface
===================================
A tkinter-based graphical front-end for the TorChain Automator tool.

Usage:
    sudo python3 gui.py
"""

import os
import sys
import time
import threading
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox

from logger import setup_logger
from tor_manager import (
    ensure_tor_installed,
    start_tor,
    stop_tor,
    tor_status,
)
from proxychains_manager import (
    configure_proxychains,
    show_current_config,
    find_conf_path,
    add_proxy_interactive,
)
from ip_checker import get_real_ip, get_tor_ip, check_ip_status

logger = setup_logger("gui")

# ── Colour palette ────────────────────────────────────────────────────────────
BG          = "#0d1117"
PANEL       = "#161b22"
BORDER      = "#30363d"
ACCENT      = "#58a6ff"
SUCCESS     = "#3fb950"
WARNING     = "#d29922"
DANGER      = "#f85149"
TEXT        = "#c9d1d9"
TEXT_DIM    = "#8b949e"
BTN_BG      = "#21262d"
BTN_HOVER   = "#30363d"
BTN_ACTIVE  = "#388bfd"


class TorChainApp(tk.Tk):
    """Main application window."""

    def __init__(self):
        super().__init__()

        self.title("TorChain Automator")
        self.geometry("900x650")
        self.minsize(800, 550)
        self.configure(bg=BG)
        self.resizable(True, True)

        self._build_ui()
        self._refresh_status()

        self.protocol("WM_DELETE_WINDOW", self._on_close)
        logger.info("GUI started.")

    # ── UI Construction ───────────────────────────────────────────────────────

    def _build_ui(self) -> None:
        """Assemble all widgets."""
        # Header
        header = tk.Frame(self, bg=PANEL, pady=12)
        header.pack(fill="x")

        tk.Label(
            header,
            text="⛓  TorChain Automator",
            font=("Courier New", 20, "bold"),
            fg=ACCENT,
            bg=PANEL,
        ).pack(side="left", padx=20)

        self.status_label = tk.Label(
            header,
            text="● Tor: checking…",
            font=("Courier New", 11),
            fg=TEXT_DIM,
            bg=PANEL,
        )
        self.status_label.pack(side="right", padx=20)

        # Body — sidebar + output
        body = tk.Frame(self, bg=BG)
        body.pack(fill="both", expand=True, padx=12, pady=12)

        self._build_sidebar(body)
        self._build_output(body)

        # Footer
        footer = tk.Frame(self, bg=PANEL, pady=6)
        footer.pack(fill="x", side="bottom")
        tk.Label(
            footer,
            text="Run with sudo for full functionality  •  Logs saved to logs/",
            font=("Courier New", 9),
            fg=TEXT_DIM,
            bg=PANEL,
        ).pack()

    def _build_sidebar(self, parent: tk.Frame) -> None:
        """Build the left-hand button panel."""
        sidebar = tk.Frame(parent, bg=PANEL, width=220, padx=10, pady=10)
        sidebar.pack(side="left", fill="y", padx=(0, 12))
        sidebar.pack_propagate(False)

        tk.Label(
            sidebar,
            text="ACTIONS",
            font=("Courier New", 10, "bold"),
            fg=TEXT_DIM,
            bg=PANEL,
            pady=6,
        ).pack(fill="x")

        ttk.Separator(sidebar, orient="horizontal").pack(fill="x", pady=(0, 8))

        buttons = [
            ("🛠  Install & Configure Tor",   self._action_install_tor),
            ("⚙️  Configure Proxychains",      self._action_configure_pc),
            ("🚀  Start Anonymous Mode",       self._action_start_anon),
            ("🔍  Check IP Status",            self._action_check_ip),
            ("⏹  Stop Tor",                   self._action_stop_tor),
            ("➕  Add Extra Proxy",            self._action_add_proxy),
            ("📄  Show Proxychains Config",    self._action_show_config),
            ("ℹ️  Tor Service Status",          self._action_tor_status),
        ]

        self._btns: list[tk.Button] = []
        for label, cmd in buttons:
            btn = self._make_button(sidebar, label, cmd)
            self._btns.append(btn)

        ttk.Separator(sidebar, orient="horizontal").pack(fill="x", pady=8)

        tk.Button(
            sidebar,
            text="🗑  Clear Output",
            command=self._clear_output,
            bg=BTN_BG,
            fg=TEXT_DIM,
            activebackground=BTN_HOVER,
            activeforeground=TEXT,
            relief="flat",
            bd=0,
            padx=10,
            pady=6,
            font=("Courier New", 10),
            cursor="hand2",
        ).pack(fill="x", pady=2)

    def _make_button(self, parent, label: str, command) -> tk.Button:
        btn = tk.Button(
            parent,
            text=label,
            command=command,
            bg=BTN_BG,
            fg=TEXT,
            activebackground=BTN_ACTIVE,
            activeforeground="#ffffff",
            relief="flat",
            bd=0,
            padx=10,
            pady=8,
            font=("Courier New", 10),
            anchor="w",
            cursor="hand2",
        )
        btn.pack(fill="x", pady=2)
        btn.bind("<Enter>", lambda e, b=btn: b.configure(bg=BTN_HOVER))
        btn.bind("<Leave>", lambda e, b=btn: b.configure(bg=BTN_BG))
        return btn

    def _build_output(self, parent: tk.Frame) -> None:
        """Build the right-hand output panel."""
        right = tk.Frame(parent, bg=BG)
        right.pack(side="left", fill="both", expand=True)

        tk.Label(
            right,
            text="OUTPUT",
            font=("Courier New", 10, "bold"),
            fg=TEXT_DIM,
            bg=BG,
            pady=4,
        ).pack(anchor="w")

        self.output = scrolledtext.ScrolledText(
            right,
            bg=PANEL,
            fg=TEXT,
            insertbackground=TEXT,
            font=("Courier New", 11),
            relief="flat",
            bd=0,
            padx=10,
            pady=10,
            state="disabled",
            wrap="word",
        )
        self.output.pack(fill="both", expand=True)

        self.output.tag_configure("success", foreground=SUCCESS)
        self.output.tag_configure("warning", foreground=WARNING)
        self.output.tag_configure("danger",  foreground=DANGER)
        self.output.tag_configure("accent",  foreground=ACCENT)
        self.output.tag_configure("dim",     foreground=TEXT_DIM)

        # IP display strip
        ip_strip = tk.Frame(right, bg=PANEL, pady=8)
        ip_strip.pack(fill="x", pady=(8, 0))

        for col, (key, attr) in enumerate([("Real IP", "real_ip_var"), ("Tor IP", "tor_ip_var")]):
            tk.Label(
                ip_strip,
                text=key,
                font=("Courier New", 9, "bold"),
                fg=TEXT_DIM,
                bg=PANEL,
            ).grid(row=0, column=col * 2, padx=(12, 4), pady=2, sticky="w")
            var = tk.StringVar(value="—")
            setattr(self, attr, var)
            tk.Label(
                ip_strip,
                textvariable=var,
                font=("Courier New", 11, "bold"),
                fg=ACCENT,
                bg=PANEL,
            ).grid(row=0, column=col * 2 + 1, padx=(0, 24), pady=2, sticky="w")

    # ── Output helpers ────────────────────────────────────────────────────────

    def _write(self, text: str, tag: str = "") -> None:
        """Append a line of text to the output area (thread-safe)."""
        self.output.configure(state="normal")
        if tag:
            self.output.insert("end", text + "\n", tag)
        else:
            self.output.insert("end", text + "\n")
        self.output.see("end")
        self.output.configure(state="disabled")

    def _clear_output(self) -> None:
        self.output.configure(state="normal")
        self.output.delete("1.0", "end")
        self.output.configure(state="disabled")

    def _separator(self) -> None:
        self._write("─" * 52, "dim")

    def _run_in_thread(self, func) -> None:
        """Run a blocking function in a background thread to keep the GUI responsive."""
        self._set_buttons_state("disabled")
        thread = threading.Thread(target=self._thread_wrapper, args=(func,), daemon=True)
        thread.start()

    def _thread_wrapper(self, func) -> None:
        try:
            func()
        except Exception as exc:
            self.after(0, self._write, f"[ERROR] {exc}", "danger")
            logger.exception("Unhandled error in thread: %s", exc)
        finally:
            self.after(0, self._set_buttons_state, "normal")
            self.after(0, self._refresh_status)

    def _set_buttons_state(self, state: str) -> None:
        for btn in self._btns:
            btn.configure(state=state)

    # ── Status bar ────────────────────────────────────────────────────────────

    def _refresh_status(self) -> None:
        """Update the Tor status indicator in the header."""
        status = tor_status()
        if status == "active":
            self.status_label.configure(text="● Tor: ACTIVE", fg=SUCCESS)
        elif status == "inactive":
            self.status_label.configure(text="● Tor: INACTIVE", fg=DANGER)
        else:
            self.status_label.configure(text=f"● Tor: {status.upper()}", fg=WARNING)
        self.after(10_000, self._refresh_status)

    # ── Action handlers ───────────────────────────────────────────────────────

    def _action_install_tor(self) -> None:
        self._run_in_thread(self._do_install_tor)

    def _do_install_tor(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[1] Install & Configure Tor", "accent")
        self.after(0, self._separator)

        real_ip = get_real_ip()
        self.after(0, self._write, f"    Current public IP: {real_ip}")
        self.after(0, lambda: self.real_ip_var.set(real_ip))

        ok = ensure_tor_installed()
        if ok:
            self.after(0, self._write, "[+] Tor is ready.", "success")
            self.after(0, self._write, "    Use 'Start Anonymous Mode' to activate Tor.")
        else:
            self.after(0, self._write, "[-] Tor setup encountered errors. See logs/tor.log.", "danger")

    def _action_configure_pc(self) -> None:
        self._run_in_thread(self._do_configure_pc)

    def _do_configure_pc(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[2] Configure Proxychains", "accent")
        self.after(0, self._separator)
        ok = configure_proxychains()
        if ok:
            self.after(0, self._write, "[+] Proxychains configured (SOCKS5 127.0.0.1:9050).", "success")
        else:
            self.after(0, self._write, "[-] Configuration failed. See logs/proxychains.log.", "danger")

    def _action_start_anon(self) -> None:
        self._run_in_thread(self._do_start_anon)

    def _do_start_anon(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[3] Starting Anonymous Mode…", "accent")
        self.after(0, self._separator)

        self.after(0, self._write, "[*] Step 1/4 — Checking real IP…")
        real_ip = get_real_ip()
        self.after(0, self._write, f"    Real IP: {real_ip}")
        self.after(0, lambda: self.real_ip_var.set(real_ip))

        self.after(0, self._write, "[*] Step 2/4 — Ensuring Tor is installed…")
        if not ensure_tor_installed():
            self.after(0, self._write, "[-] Cannot continue — Tor installation failed.", "danger")
            return

        self.after(0, self._write, "[*] Step 3/4 — Configuring Proxychains…")
        configure_proxychains()

        self.after(0, self._write, "[*] Step 4/4 — Starting Tor service…")
        if not start_tor():
            self.after(0, self._write, "[-] Failed to start Tor service.", "danger")
            return

        self.after(0, self._write, "[+] Tor is running. Waiting for circuits…")
        time.sleep(6)

        tor_ip = get_tor_ip()
        self.after(0, lambda: self.tor_ip_var.set(tor_ip))

        if real_ip != tor_ip and tor_ip not in ("Unknown", "Unknown (Tor may not be running)"):
            self.after(0, self._write, f"[+] SUCCESS — Anonymous IP: {tor_ip}", "success")
            self.after(0, self._write, "    Your traffic is routed through Tor.", "success")
        else:
            self.after(0, self._write, f"[!] Tor IP: {tor_ip}", "warning")
            self.after(0, self._write, "    IPs may match if Tor circuits are still building.", "warning")

    def _action_check_ip(self) -> None:
        self._run_in_thread(self._do_check_ip)

    def _do_check_ip(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[4] IP Status Check", "accent")
        self.after(0, self._separator)

        self.after(0, self._write, "[*] Fetching real public IP…")
        real_ip = get_real_ip()
        self.after(0, self._write, f"    Real IP : {real_ip}")
        self.after(0, lambda: self.real_ip_var.set(real_ip))

        self.after(0, self._write, "[*] Fetching Tor exit-node IP…")
        tor_ip = get_tor_ip()
        self.after(0, self._write, f"    Tor IP  : {tor_ip}")
        self.after(0, lambda: self.tor_ip_var.set(tor_ip))

        if real_ip != tor_ip and tor_ip not in ("Unknown", "Unknown (Tor may not be running)"):
            self.after(0, self._write, "[+] Traffic is being routed through Tor.", "success")
        elif tor_ip == "Unknown (Tor may not be running)":
            self.after(0, self._write, "[!] Tor does not appear to be running.", "warning")
        else:
            self.after(0, self._write, "[-] Both IPs match — Tor may not be active.", "danger")

    def _action_stop_tor(self) -> None:
        if not messagebox.askyesno("Stop Tor", "Are you sure you want to stop the Tor service?"):
            return
        self._run_in_thread(self._do_stop_tor)

    def _do_stop_tor(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[5] Stopping Tor…", "accent")
        self.after(0, self._separator)
        ok = stop_tor()
        if ok:
            self.after(0, self._write, "[+] Tor service stopped.", "success")
            self.after(0, lambda: self.tor_ip_var.set("—"))
        else:
            self.after(0, self._write, "[-] Failed to stop Tor.", "danger")

    def _action_add_proxy(self) -> None:
        """Open a small dialog to add an extra proxy."""
        dialog = tk.Toplevel(self)
        dialog.title("Add Extra Proxy")
        dialog.geometry("380x220")
        dialog.configure(bg=PANEL)
        dialog.resizable(False, False)
        dialog.grab_set()

        def label(text):
            tk.Label(dialog, text=text, font=("Courier New", 10), fg=TEXT, bg=PANEL).pack(anchor="w", padx=20, pady=(8, 0))

        label("Proxy Type:")
        type_var = tk.StringVar(value="socks5")
        type_menu = ttk.Combobox(dialog, textvariable=type_var, values=["socks5", "socks4", "http"], state="readonly", width=12)
        type_menu.pack(anchor="w", padx=20)

        label("IP Address:")
        ip_entry = tk.Entry(dialog, bg=BTN_BG, fg=TEXT, insertbackground=TEXT, font=("Courier New", 10), relief="flat", width=28)
        ip_entry.pack(anchor="w", padx=20)

        label("Port:")
        port_entry = tk.Entry(dialog, bg=BTN_BG, fg=TEXT, insertbackground=TEXT, font=("Courier New", 10), relief="flat", width=10)
        port_entry.pack(anchor="w", padx=20)

        def submit():
            ptype = type_var.get().strip()
            pip   = ip_entry.get().strip()
            pport = port_entry.get().strip()
            if not pip or not pport:
                messagebox.showwarning("Missing Fields", "Please fill in all fields.", parent=dialog)
                return
            dialog.destroy()
            self._run_in_thread(lambda: self._do_add_proxy(ptype, pip, pport))

        tk.Button(
            dialog, text="Add Proxy", command=submit,
            bg=ACCENT, fg="#000000", font=("Courier New", 10, "bold"),
            relief="flat", padx=12, pady=6, cursor="hand2",
        ).pack(pady=12)

    def _do_add_proxy(self, ptype: str, pip: str, pport: str) -> None:
        conf_path = find_conf_path()
        if not conf_path:
            self.after(0, self._write, "[-] No Proxychains config found. Run Configure Proxychains first.", "danger")
            return
        line = f"{ptype}  {pip}  {pport}"
        try:
            tmp = "/tmp/torchain_proxy_add.conf"
            with open(conf_path, "r", encoding="utf-8") as f:
                content = f.read()
            content = content.rstrip() + f"\n{line}\n"
            with open(tmp, "w", encoding="utf-8") as f:
                f.write(content)
            import subprocess
            subprocess.run(["sudo", "cp", tmp, conf_path], check=True, capture_output=True)
            self.after(0, self._separator)
            self.after(0, self._write, f"[+] Proxy added: {line}", "success")
        except Exception as exc:
            self.after(0, self._write, f"[-] Failed to add proxy: {exc}", "danger")

    def _action_show_config(self) -> None:
        self._run_in_thread(self._do_show_config)

    def _do_show_config(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[7] Proxychains Configuration", "accent")
        self.after(0, self._separator)
        conf_path = find_conf_path()
        if not conf_path:
            self.after(0, self._write, "[-] No config file found. Run Configure Proxychains first.", "warning")
            return
        try:
            with open(conf_path, "r", encoding="utf-8") as f:
                for line in f:
                    stripped = line.rstrip()
                    if stripped.startswith("#"):
                        self.after(0, self._write, stripped, "dim")
                    elif stripped.startswith("socks") or stripped.startswith("http"):
                        self.after(0, self._write, stripped, "success")
                    else:
                        self.after(0, self._write, stripped)
        except OSError as exc:
            self.after(0, self._write, f"[-] Could not read config: {exc}", "danger")

    def _action_tor_status(self) -> None:
        self._run_in_thread(self._do_tor_status)

    def _do_tor_status(self) -> None:
        self.after(0, self._separator)
        self.after(0, self._write, "[8] Tor Service Status", "accent")
        self.after(0, self._separator)
        status = tor_status()
        colour = "success" if status == "active" else ("danger" if status == "inactive" else "warning")
        self.after(0, self._write, f"    Tor is currently: {status.upper()}", colour)

    # ── Window close ──────────────────────────────────────────────────────────

    def _on_close(self) -> None:
        logger.info("GUI closed by user.")
        self.destroy()


def main() -> None:
    os.makedirs("logs", exist_ok=True)
    if os.geteuid() != 0:
        print("[!] WARNING: Some features require sudo. Run with: sudo python3 gui.py")
    app = TorChainApp()
    app.mainloop()


if __name__ == "__main__":
    main()
