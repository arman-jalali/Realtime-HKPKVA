import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Users, Settings, FileText, PlusCircle } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/patients", icon: Users, label: "Patienten", disabled: true },
    { href: "/", icon: PlusCircle, label: "Neue Sitzung", disabled: false },
    { href: "/plans", icon: FileText, label: "Behandlungspläne", disabled: true },
    { href: "/settings", icon: Settings, label: "Einstellungen", disabled: true },
  ];

  return (
    <aside className="w-56 bg-[#111] h-screen flex flex-col fixed left-0 top-0 text-white z-50">
      {/* Wordmark */}
      <div className="px-6 py-7 border-b border-white/8">
        <span className="font-display font-bold text-lg tracking-tight text-white">RealCost</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;

          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/25 cursor-not-allowed select-none"
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </span>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-2",
                isActive
                  ? "border-white text-white font-medium bg-white/6"
                  : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/4"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-6 py-5 border-t border-white/8">
        <div className="text-sm font-medium text-white/70">Dr. Schmidt</div>
        <div className="text-xs text-white/30 mt-0.5">Zahnarztpraxis</div>
      </div>
    </aside>
  );
}
