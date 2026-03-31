import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const commands = [
  { text: "python3 torchain_automator.py", delay: 500, type: "input" },
  { text: "Initializing TorChain Automator v2.0...", delay: 800, type: "output", color: "text-muted-foreground" },
  { text: "[+] Checking dependencies...", delay: 1200, type: "output", color: "text-blue-400" },
  { text: "[OK] Tor is installed.", delay: 1500, type: "output", color: "text-primary" },
  { text: "[OK] Proxychains is installed.", delay: 1600, type: "output", color: "text-primary" },
  { text: "\n--- TORCHAIN MENU ---", delay: 1800, type: "output", color: "text-white font-bold" },
  { text: "1. Install & Configure Tor", delay: 1850, type: "output" },
  { text: "2. Configure Proxychains", delay: 1900, type: "output" },
  { text: "3. Start Anonymous Mode", delay: 1950, type: "output" },
  { text: "4. Check IP Status", delay: 2000, type: "output" },
  { text: "5. Stop Tor", delay: 2050, type: "output" },
  { text: "6. Add Extra Proxy", delay: 2100, type: "output" },
  { text: "7. Show Config", delay: 2150, type: "output" },
  { text: "8. Tor Status", delay: 2200, type: "output" },
  { text: "9. Exit\n", delay: 2250, type: "output" },
  { text: "Select an option: 3", delay: 3500, type: "input" },
  { text: "[*] Stopping existing Tor instances...", delay: 3800, type: "output", color: "text-yellow-400" },
  { text: "[+] Starting Tor service...", delay: 4500, type: "output", color: "text-blue-400" },
  { text: "[+] Verifying connection through SOCKS5 127.0.0.1:9050...", delay: 5200, type: "output" },
  { text: "[OK] Successfully routed through Tor network.", delay: 6000, type: "output", color: "text-primary font-bold" },
  { text: "[*] Previous IP: 198.51.100.42", delay: 6200, type: "output", color: "text-muted-foreground" },
  { text: "[*] Current IP: 185.220.101.13 (Germany)", delay: 6500, type: "output", color: "text-primary" },
];

export function TerminalSimulator() {
  const [lines, setLines] = useState<typeof commands>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < commands.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, commands[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, commands[currentIndex].delay - (currentIndex > 0 ? commands[currentIndex - 1].delay : 0));
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-lg overflow-hidden border border-border bg-card terminal-shadow relative">
      {/* Mac OS like window controls */}
      <div className="flex items-center px-4 py-3 bg-secondary/50 border-b border-border">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="mx-auto text-xs font-mono text-muted-foreground">root@kali:~</div>
      </div>
      
      {/* Terminal content */}
      <div className="p-6 font-mono text-sm h-[400px] overflow-y-auto bg-black/50">
        {lines.map((line, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            key={i} 
            className={`mb-1 ${line.color || 'text-foreground'}`}
          >
            {line.type === 'input' ? (
              <div className="flex">
                <span className="text-primary mr-2">root@kali:~#</span>
                <span>{line.text}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{line.text}</div>
            )}
          </motion.div>
        ))}
        {currentIndex < commands.length && (
          <div className="flex mt-1">
            <span className="text-primary mr-2">root@kali:~#</span>
            <span className="typing-cursor"></span>
          </div>
        )}
        {currentIndex >= commands.length && (
           <div className="flex mt-1">
           <span className="text-primary mr-2">root@kali:~#</span>
           <span className="typing-cursor"></span>
         </div>
        )}
      </div>
    </div>
  );
}
