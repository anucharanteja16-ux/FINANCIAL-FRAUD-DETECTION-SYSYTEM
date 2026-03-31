import { Link, useLocation } from "wouter";
import { ShieldAlert, Activity, Search, History, Map, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/analyze", label: "Analyze Message", icon: Search },
  { href: "/history", label: "Analysis History", icon: History },
  { href: "/roadmap", label: "Architecture", icon: Database },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <ShieldAlert className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight">FraudShield</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-2 h-2 rounded-full bg-threat-safe shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs font-medium text-muted-foreground">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center px-4 shrink-0">
          <ShieldAlert className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg">FraudShield</span>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="pointer-events-none fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </main>
    </div>
  );
}
