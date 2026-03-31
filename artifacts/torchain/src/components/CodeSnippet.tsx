import { motion } from 'framer-motion';

const pythonCode = `import subprocess
import time
from logger import log_operation

class TorManager:
    def __init__(self):
        self.proxy_port = 9050
        self.proxy_host = "127.0.0.1"

    def start_tor_service(self):
        """Starts Tor service and verifies SOCKS5 routing."""
        log_operation("INFO", "Initializing Tor service...")
        try:
            # Execute systemctl without third-party dependencies
            subprocess.run(["systemctl", "start", "tor"], check=True)
            time.sleep(2)
            
            # Verify daemon status
            status = subprocess.run(
                ["systemctl", "is-active", "tor"], 
                capture_output=True, 
                text=True
            )
            
            if status.stdout.strip() == "active":
                log_operation("SUCCESS", f"Tor bound to {self.proxy_host}:{self.proxy_port}")
                return True
                
        except subprocess.CalledProcessError as e:
            log_operation("CRITICAL", f"Failed to start Tor daemon: {e}")
            return False
            
        return False`;

export function CodeSnippet() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-border/50 bg-[#0d0d0d] shadow-2xl relative">
      <div className="absolute top-0 right-0 p-4">
         <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">tor_manager.py</span>
      </div>
      <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-[13px] leading-relaxed">
          <code className="text-gray-300">
            {pythonCode.split('\n').map((line, i) => {
              // Basic syntax highlighting simulation
              let highlightedLine = line
                .replace(/\b(import|from|class|def|try|except|return|if)\b/g, '<span class="text-primary">$1</span>')
                .replace(/\b(self|subprocess|time)\b/g, '<span class="text-cyan-400">$1</span>')
                .replace(/("""[\s\S]*?""")/g, '<span class="text-muted-foreground">$1</span>')
                .replace(/(#.*)/g, '<span class="text-muted-foreground">$1</span>')
                .replace(/("[^"]*")/g, '<span class="text-yellow-300">$1</span>');

              return (
                <div key={i} className="table-row">
                  <span className="table-cell text-right pr-4 text-white/20 select-none">{i + 1}</span>
                  <span className="table-cell whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
