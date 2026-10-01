"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  Zap,
  Command,
  ChevronDown,
  RefreshCw,
  Check,
  Plus,
  Radio,
  Server,
  Sparkles,
} from "lucide-react";
import { useDashboard, VirtualKeyType } from "@/lib/dashboard-context";
import { Pill } from "@/components/Pill";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const PRESET_KEYS = [
  {
    key: "vk_open",
    label: "vk_open",
    description: "Standard key (50 request budget)",
    badge: "50 req",
  },
  {
    key: "vk_tiny",
    label: "vk_tiny",
    description: "Tiny budget (5 request test key)",
    badge: "5 req",
  },
  {
    key: "vk_edge",
    label: "vk_edge",
    description: "Edge key (10 request test key)",
    badge: "10 req",
  },
];

export function TopBar() {
  const pathname = usePathname();
  const {
    virtualKey,
    setVirtualKey,
    isMock,
    toggleMock,
    healthStatus,
    healthLatencyMs,
    checkHealth,
    setIsCommandPaletteOpen,
  } = useDashboard();

  const [isKeyDropdownOpen, setIsKeyDropdownOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsKeyDropdownOpen(false);
        setShowCustomInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualHealthRefresh = async () => {
    setIsRefreshingHealth(true);
    await checkHealth();
    setIsRefreshingHealth(false);
  };

  const handleSelectKey = (key: VirtualKeyType) => {
    setVirtualKey(key);
    setIsKeyDropdownOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKeyInput.trim()) {
      setVirtualKey(customKeyInput.trim());
      setCustomKeyInput("");
      setShowCustomInput(false);
      setIsKeyDropdownOpen(false);
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Skill & Workflow Playground";
    if (pathname.startsWith("/dashboard/traces")) return "Execution Traces";
    if (pathname.startsWith("/dashboard/usage")) return "Usage & Budgets";
    if (pathname.startsWith("/dashboard/settings")) return "Gateway Preferences";
    return "Dashboard";
  };

  return (
    <header className="h-16 border-b border-border/80 bg-[#09090B]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="font-heading font-semibold text-text text-sm sm:text-base tracking-tight">
          {getPageTitle()}
        </h1>

        {isMock && (
          <Pill
            variant="warn"
            size="sm"
            dot
            className="hidden md:inline-flex text-[10px]"
          >
            Mock Mode
          </Pill>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-10 bg-surface border border-border text-muted hover:text-text hover:border-border-hover transition-colors text-xs font-mono group"
          title="Open Command Palette (Cmd+K / Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5 text-violet group-hover:text-cyan transition-colors" />
          <span className="hidden sm:inline text-muted/80">Command</span>
          <kbd className="bg-bg/80 px-1.5 py-0.5 rounded text-[10px] text-muted border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Live / Mock Toggle */}
        <div className="flex items-center p-0.5 rounded-10 bg-surface border border-border">
          <button
            onClick={() => isMock && toggleMock()}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-8 text-xs font-medium transition-all",
              !isMock
                ? "bg-violet/20 text-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)] border border-cyan/30"
                : "text-muted hover:text-text"
            )}
            title="Live Gateway: Executes directly against Orchestrix backend"
          >
            <Radio
              className={cn(
                "w-3 h-3",
                !isMock ? "text-cyan animate-pulse" : "text-muted"
              )}
            />
            <span className="hidden sm:inline">Live</span>
          </button>

          <button
            onClick={() => !isMock && toggleMock()}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-8 text-xs font-medium transition-all",
              isMock
                ? "bg-warn/20 text-warn shadow-[0_0_10px_rgba(251,191,36,0.2)] border border-warn/30"
                : "text-muted hover:text-text"
            )}
            title="Mock Mode: Deterministic offline responses with zero latency"
          >
            <Zap className="w-3 h-3 text-warn" />
            <span className="hidden sm:inline">Mock</span>
          </button>
        </div>

        {/* Virtual Key Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsKeyDropdownOpen(!isKeyDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-10 bg-surface border border-border hover:border-violet/40 text-xs font-mono transition-all text-text group"
            title="Active Virtual Key for Admission & Budgets"
          >
            <KeyRound className="w-3.5 h-3.5 text-violet group-hover:text-cyan transition-colors" />
            <span className="font-semibold text-text max-w-[80px] sm:max-w-[110px] truncate">
              {virtualKey}
            </span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {isKeyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-16 border border-border bg-[#09090B]/95 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-border/80">
                <p className="text-xs font-heading font-semibold text-text">
                  Virtual Key Switcher
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Orchestrix tracks atomic token budgets per virtual key.
                </p>
              </div>

              <div className="py-1 space-y-1">
                {PRESET_KEYS.map((item) => {
                  const isSelected = virtualKey === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectKey(item.key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-10 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-violet/15 text-text border border-violet/30"
                          : "text-muted hover:text-text hover:bg-surface"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-text">
                            {item.label}
                          </span>
                          {isSelected && (
                            <Check className="w-3 h-3 text-cyan" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <Pill
                        variant={isSelected ? "cyan" : "default"}
                        size="sm"
                        className="text-[10px]"
                      >
                        {item.badge}
                      </Pill>
                    </button>
                  );
                })}
              </div>

              {/* Custom Key Section */}
              <div className="pt-2 mt-1 border-t border-border">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-8 text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-violet" />
                    <span>Enter custom key...</span>
                  </button>
                ) : (
                  <form onSubmit={handleCustomKeySubmit} className="space-y-2 p-1">
                    <input
                      type="text"
                      placeholder="e.g. vk_custom_abc"
                      value={customKeyInput}
                      onChange={(e) => setCustomKeyInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-8 bg-bg border border-border focus:border-cyan text-xs font-mono text-text outline-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="px-2 py-1 text-xs text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-violet text-white rounded-6 text-xs font-medium hover:bg-violet/90"
                      >
                        Set Key
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Health status dot with quick refresh */}
        <button
          onClick={handleManualHealthRefresh}
          disabled={isRefreshingHealth}
          className="p-2 rounded-10 text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-colors relative"
          title={`Gateway Status: ${healthStatus}. Click to ping /healthz.`}
        >
          <RefreshCw
            className={cn(
              "w-3.5 h-3.5",
              isRefreshingHealth && "animate-spin text-cyan"
            )}
          />
          <span
            className={cn(
              "absolute top-1.5 right-1.5 w-2 h-2 rounded-full",
              isMock
                ? "bg-warn"
                : healthStatus === "ready"
                ? "bg-mint shadow-[0_0_6px_rgba(94,234,212,0.6)]"
                : healthStatus === "waking"
                ? "bg-cyan shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                : "bg-danger shadow-[0_0_6px_rgba(248,113,113,0.6)]"
            )}
          />
        </button>
      </div>
    </header>
  );
}
