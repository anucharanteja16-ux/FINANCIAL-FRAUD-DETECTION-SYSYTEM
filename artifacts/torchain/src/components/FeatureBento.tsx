import { Terminal, Shield, Network, Zap, Lock, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Tor Manager",
    description: "Automated detection, installation, and configuration of the Tor service. Manages systemd services and SOCKS5 bindings transparently.",
    icon: Network,
    delay: 0.1
  },
  {
    title: "Proxychains Router",
    description: "Forces any TCP connection made by any given application to follow through proxy like TOR or any other SOCKS4, SOCKS5 or HTTP(S) proxy.",
    icon: Shield,
    delay: 0.2
  },
  {
    title: "IP Verification",
    description: "Real-time auditing of external IP addresses. Compares pre-routing and post-routing IPs to guarantee network anonymity.",
    icon: Zap,
    delay: 0.3
  },
  {
    title: "Dual Interfaces",
    description: "Deploy headless via the terminal menu interface, or use the integrated tkinter GUI for desktop environments.",
    icon: Terminal,
    delay: 0.4
  },
  {
    title: "Zero Dependencies",
    description: "Written in pure Python utilizing the standard library subprocess module. No pip installs required beyond the core system tools.",
    icon: Cpu,
    delay: 0.5
  },
  {
    title: "Audit Logging",
    description: "Comprehensive operation logging saved directly to the logs/ directory. Trace every configuration change and connection state.",
    icon: Lock,
    delay: 0.6
  }
];

export function FeatureBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: feature.delay }}
          className="group relative bg-card border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-colors duration-300 overflow-hidden"
        >
          {/* Hover gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3 text-white">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
