import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, Users, Settings, FileText, PlusCircle } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/patients", icon: Users, label: "Patienten", disabled: true },
    { href: "/", icon: PlusCircle, label: "Neue Sitzung", disabled: false },
    { href: "/plans", icon: FileText, label: "Behandlungspläne", disabled: true },
    { href: "/settings", icon: Settings, label: "Einstellungen", disabled: true },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col fixed left-0 top-0 text-white z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">DentAI</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;

          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed select-none"
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </span>
            );
          }

          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-teal-600/20 text-teal-400 font-medium" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
            DS
          </div>
          <div>
            <div className="text-sm font-medium">Dr. Schmidt</div>
            <div className="text-xs text-slate-400">Zahnarztpraxis</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
