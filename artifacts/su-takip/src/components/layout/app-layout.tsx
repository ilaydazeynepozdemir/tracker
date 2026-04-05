import React from "react";
import { Link, useLocation } from "wouter";
import { Droplets, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Droplets, label: "Today" },
    { href: "/history", icon: History, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background max-w-md mx-auto relative shadow-2xl overflow-hidden ring-1 ring-border">
      <header className="px-6 py-5 bg-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/20">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-secondary text-white p-1.5 rounded-lg shadow-sm">
            <Droplets className="w-5 h-5" />
          </div>
          Su Takip
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-card/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-safe flex justify-between items-center z-20">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 group">
              <div 
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 ease-out",
                  isActive 
                    ? "bg-primary/10 text-primary scale-110" 
                    : "text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-secondary"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
