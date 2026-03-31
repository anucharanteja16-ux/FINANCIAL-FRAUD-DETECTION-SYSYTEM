import { Shield, Terminal as TerminalIcon, Github, Download, ChevronRight, Lock, Layers } from "lucide-react";
import { TerminalSimulator } from "@/components/TerminalSimulation";
import { FeatureBento } from "@/components/FeatureBento";
import { IpReveal } from "@/components/IpReveal";
import { CodeSnippet } from "@/components/CodeSnippet";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold tracking-tight text-white">TORCHAIN</span>
            <span className="font-mono text-muted-foreground text-sm border border-border rounded px-1.5 py-0.5 ml-2">v2.0</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors font-mono hidden md:block">Architecture</a>
            <a href="#verification" className="text-sm text-muted-foreground hover:text-white transition-colors font-mono hidden md:block">Verification</a>
            <a href="#interface" className="text-sm text-muted-foreground hover:text-white transition-colors font-mono hidden md:block">Interface</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm text-white bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors font-mono border border-border">
              <Github className="w-4 h-4" />
              <span>Source</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-secondary/50 border border-primary/30 text-primary px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest font-semibold">System Operational</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight tracking-tighter text-white glitch-effect" data-text="Absolute Network Anonymity.">
              Absolute Network <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">Anonymity.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              TorChain Automator is a Python-powered Linux tool that automatically installs Tor and Proxychains, routes all internet traffic through the Tor network, and verifies anonymity. Built for security researchers and privacy advocates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#download" className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-mono font-bold uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Download className="w-5 h-5" />
                <span>Initialize Tool</span>
              </a>
              <a href="#architecture" className="flex items-center justify-center space-x-2 bg-transparent border border-border text-white px-8 py-4 rounded-md font-mono font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
                <TerminalIcon className="w-5 h-5" />
                <span>View Docs</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground font-mono mt-8">
              <div className="flex items-center"><Lock className="w-4 h-4 mr-2 text-primary" /> SOCKS5 Routing</div>
              <div className="flex items-center"><Layers className="w-4 h-4 mr-2 text-primary" /> CLI & GUI Support</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur opacity-20"></div>
            <div className="bg-card border border-border rounded-xl p-4 relative font-mono text-sm shadow-2xl">
              <div className="flex items-center space-x-2 mb-4 border-b border-border/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground ml-2">Quick Start</span>
              </div>
              <pre className="text-gray-300 overflow-x-auto">
                <code className="block leading-loose">
                  <span className="text-primary">$</span> git clone https://github.com/user/torchain-automator.git<br/>
                  <span className="text-primary">$</span> cd torchain-automator<br/>
                  <span className="text-primary">$</span> chmod +x main.py<br/>
                  <span className="text-primary">$</span> sudo python3 main.py<br/>
                  <br/>
                  <span className="text-muted-foreground"># Or launch the graphical interface</span><br/>
                  <span className="text-primary">$</span> sudo python3 gui.py
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">Core Architecture</h2>
            <p className="text-muted-foreground">Three powerful modules working in tandem to ensure your digital footprint remains untraceable.</p>
          </motion.div>
          <FeatureBento />
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <CodeSnippet />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-6">Zero Third-Party Dependencies.</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                TorChain Automator is built for extreme environments where installing pip packages isn't an option. It relies purely on Python's standard library and system binaries.
              </p>
              <ul className="space-y-4 font-mono text-sm">
                <li className="flex items-start text-gray-300">
                  <Shield className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <span>Subprocess Execution: Direct interaction with systemctl and native Linux utilities.</span>
                </li>
                <li className="flex items-start text-gray-300">
                  <Lock className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <span>Secure Local Binding: Hardcodes Tor traffic to 127.0.0.1:9050.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IP Reveal Section */}
      <section id="verification" className="py-24 relative overflow-hidden bg-secondary/10 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">Verification Protocol</h2>
            <p className="text-muted-foreground">Never guess if your traffic is secured. Real-time pre and post-routing IP verification.</p>
          </motion.div>
          <IpReveal />
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section id="interface" className="py-32 relative bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <TerminalSimulator />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Command Line Precision.
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Interact with the Tor network through a clean, menu-driven terminal interface. No complex configuration files to edit manually. Everything from SOCKS5 proxy setup to service management is automated.
              </p>
              
              <ul className="space-y-4 font-mono text-sm">
                {[
                  "Install & Configure Tor",
                  "Configure Proxychains",
                  "Start Anonymous Mode",
                  "Check IP Status",
                  "Stop Tor Service",
                  "View Detailed Logs"
                ].map((item, i) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4 text-primary mr-2" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-32 relative">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Shield className="w-16 h-16 text-primary mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Take Back Control.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Ready to secure your network traffic? Download TorChain Automator and start routing through the Tor network in seconds.
          </p>
          <button className="inline-flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-md font-mono font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Release</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-background text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm font-bold text-white">TORCHAIN</span>
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            For educational and security research purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
