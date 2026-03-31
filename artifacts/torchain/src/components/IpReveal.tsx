import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, RefreshCw, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';

export function IpReveal() {
  const [isActive, setIsActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsActive(!isActive);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-8 rounded-xl border border-border/50 bg-secondary/20 backdrop-blur-sm overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Connection Status */}
        <div className="flex flex-col space-y-6">
          <div className="inline-flex items-center space-x-2 bg-background/80 border border-border px-3 py-1.5 rounded-full w-fit">
            <Shield className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-destructive'}`} />
            <span className="text-xs font-mono font-medium tracking-wider">
              {isActive ? 'ANONYMOUS MODE ACTIVE' : 'CONNECTION EXPOSED'}
            </span>
          </div>
          
          <h3 className="text-3xl font-display font-bold">
            Verify your footprint in <span className="text-primary">real-time</span>.
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            The built-in IP Checker module constantly monitors your external facing IP, ensuring that traffic is exclusively routed through the Tor network before any outbound request is made.
          </p>

          <button 
            onClick={handleToggle}
            disabled={isAnimating}
            className={`
              relative overflow-hidden group w-full md:w-auto px-6 py-4 rounded-md font-mono text-sm font-bold uppercase tracking-widest transition-all duration-300
              ${isActive 
                ? 'bg-destructive/10 text-destructive border border-destructive/50 hover:bg-destructive/20' 
                : 'bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20'}
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              {isAnimating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isActive ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span>{isAnimating ? 'ROUTING TRAFFIC...' : isActive ? 'DISABLE PROXYCHAINS' : 'INITIALIZE TOR NODE'}</span>
            </div>
          </button>
        </div>

        {/* IP Display Widget */}
        <div className="bg-background border border-border rounded-lg p-6 font-mono relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Network Interface</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Status</span>
          </div>

          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.div 
                key="exposed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <div className="text-[10px] text-destructive uppercase tracking-widest mb-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-2"></span>
                    Real IP Address
                  </div>
                  <div className="text-3xl font-bold tracking-wider text-white">198.51.100.42</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Seattle, United States</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center text-xs text-destructive bg-destructive/5 p-2 rounded">
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  ISP and local network can monitor traffic
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="secured"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <div className="text-[10px] text-primary uppercase tracking-widest mb-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                    Tor Exit Node IP
                  </div>
                  <div className="text-3xl font-bold tracking-wider text-white text-glow">185.220.101.13</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Berlin, Germany</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center text-xs text-primary bg-primary/5 p-2 rounded">
                  <CheckCircle2 className="w-3 h-3 mr-2" />
                  Traffic encrypted and routed through Tor network
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
