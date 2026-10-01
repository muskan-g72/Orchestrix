"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Activity,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Zap,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Playground",
    href: "/dashboard",
    icon: Sparkles,
    badge: null,
    shortcut: "1",
  },
  {
    name: "Traces",
    href: "/dashboard/traces",
    icon: Activity,
    badge: null,
    shortcut: "2",
  },
  {
    name: "Usage & Budget",
    href: "/dashboard/usage",
    icon: BarChart3,
    badge: null,
    shortcut: "3",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Sliders,
    badge: null,
    shortcut: "4",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    healthStatus,
    healthLatencyMs,
    isMock,
    virtualKey,
  } = useDashboard();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-[#09090B]/80 backdrop-blur-xl transition-all duration-300 z-30 select-none flex-shrink-0",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/80">
        <Link
          href="/"
          className="flex items-center gap-2.5 overflow-hidden group"
          title="Back to Orchestrix Landing"
        >
          <div className="w-8 h-8 rounded-10 bg-gradient-to-br from-violet via-cyan to-mint p-[1px] flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#09090B] rounded-[9px] flex items-center justify-center">
              <span className="font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet to-cyan text-sm">
                OX
              </span>
            </div>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-tight text-text group-hover:text-cyan transition-colors">
                Orchestrix
              </span>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Gateway Console
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-8 text-muted hover:text-text hover:bg-surface-hover transition-colors",
            isSidebarCollapsed && "mx-auto mt-1"
          )}
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl+[)" : "Collapse sidebar (Ctrl+[)"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-12 text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-violet/15 text-text border border-violet/30 shadow-[0_0_15px_rgba(124,92,255,0.15)]"
                  : "text-muted hover:text-text hover:bg-surface border border-transparent"
              )}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-cyan"
                    : "text-muted group-hover:text-text"
                )}
              />

              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <Pill variant="cyan" size="sm">
                      {item.badge}
                    </Pill>
                  )}
                  <span className="text-[10px] font-mono text-muted/40 group-hover:text-muted/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    ⌘{item.shortcut}
                  </span>
                </>
              )}

              {/* Active bar glow on edge */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-violet to-cyan rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Status Area */}
      <div className="p-3 border-t border-border/80 bg-surface/30">
        {!isSidebarCollapsed ? (
          <div className="space-y-2">
            {/* Gateway status card */}
            <div className="p-2.5 rounded-10 bg-[#09090B]/60 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      isMock
                        ? "bg-warn"
                        : healthStatus === "ready"
                        ? "bg-mint"
                        : healthStatus === "waking"
                        ? "bg-cyan"
                        : "bg-danger"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      isMock
                        ? "bg-warn"
                        : healthStatus === "ready"
                        ? "bg-mint"
                        : healthStatus === "waking"
                        ? "bg-cyan"
                        : "bg-danger"
                    )}
                  />
                </span>
                <span className="font-mono text-[11px] text-text">
                  {isMock
                    ? "Mock Engine"
                    : healthStatus === "ready"
                    ? "Gateway Ready"
                    : healthStatus === "waking"
                    ? "Waking (~1m)"
                    : "Gateway Offline"}
                </span>
              </div>

              {healthLatencyMs !== null && !isMock && (
                <span className="text-[10px] font-mono text-muted">
                  {healthLatencyMs}ms
                </span>
              )}
            </div>

            {/* Active Key Indicator */}
            <div className="flex items-center justify-between text-[11px] font-mono text-muted px-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-violet" />
                <span>Key:</span>
              </span>
              <span className="text-text font-medium text-cyan truncate max-w-[110px]">
                {virtualKey}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                isMock
                  ? "bg-warn shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  : healthStatus === "ready"
                  ? "bg-mint shadow-[0_0_8px_rgba(94,234,212,0.5)]"
                  : healthStatus === "waking"
                  ? "bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  : "bg-danger shadow-[0_0_8px_rgba(248,113,113,0.5)]"
              )}
              title={
                isMock
                  ? "Mock Engine Active"
                  : `Gateway Status: ${healthStatus}`
              }
            />
          </div>
        )}
      </div>
    </aside>
  );
}
