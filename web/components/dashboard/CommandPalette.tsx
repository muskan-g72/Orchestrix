"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Layers,
  Activity,
  KeyRound,
  Zap,
  Sliders,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Clock,
  Check,
} from "lucide-react";
import { useDashboard, RecentTrace } from "@/lib/dashboard-context";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Skills & Workflows" | "Traces" | "Virtual Keys" | "Mode & Gateway" | "Navigation";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  badge?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    virtualKey,
    setVirtualKey,
    isMock,
    toggleMock,
    recentTraces,
  } = useDashboard();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Build command list
  const commands: CommandItem[] = [
    // Skills
    {
      id: "skill-summarize",
      category: "Skills & Workflows",
      title: "Run Skill: summarize",
      subtitle: "Execute text summarization with structured schema validation",
      icon: Sparkles,
      badge: "Skill",
      action: () => {
        router.push("/dashboard?tab=skill&name=summarize");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "skill-extract-action-items",
      category: "Skills & Workflows",
      title: "Run Skill: extract_action_items",
      subtitle: "Extract actionable tasks, assignees, and deadlines",
      icon: Sparkles,
      badge: "Skill",
      action: () => {
        router.push("/dashboard?tab=skill&name=extract_action_items");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "wf-article-processing",
      category: "Skills & Workflows",
      title: "Run Workflow: article_processing",
      subtitle: "Sequential 3-step pipeline: summarize -> extract -> statistics",
      icon: Layers,
      badge: "Workflow",
      action: () => {
        router.push("/dashboard?tab=workflow&name=article_processing");
        setIsCommandPaletteOpen(false);
      },
    },

    // Navigation
    {
      id: "nav-playground",
      category: "Navigation",
      title: "Go to Playground",
      subtitle: "Interactive skill & workflow execution console",
      icon: Sparkles,
      action: () => {
        router.push("/dashboard");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "nav-traces",
      category: "Navigation",
      title: "Go to Execution Traces",
      subtitle: "Inspect ordered attempt histories and tool executions",
      icon: Activity,
      action: () => {
        router.push("/dashboard/traces");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "nav-usage",
      category: "Navigation",
      title: "Go to Usage & Budget",
      subtitle: "Inspect virtual key request allocations and token metrics",
      icon: BarChart3,
      action: () => {
        router.push("/dashboard/usage");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Go to Settings & Preferences",
      subtitle: "Manage tenant preference key-value storage",
      icon: Sliders,
      action: () => {
        router.push("/dashboard/settings");
        setIsCommandPaletteOpen(false);
      },
    },

    // Virtual Keys
    {
      id: "vk-open",
      category: "Virtual Keys",
      title: "Switch to key: vk_open",
      subtitle: "Standard development key (50 request budget)",
      icon: KeyRound,
      badge: virtualKey === "vk_open" ? "Active" : undefined,
      action: () => {
        setVirtualKey("vk_open");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "vk-tiny",
      category: "Virtual Keys",
      title: "Switch to key: vk_tiny",
      subtitle: "Tiny quota test key (5 request budget - tests 429 exhaustion)",
      icon: KeyRound,
      badge: virtualKey === "vk_tiny" ? "Active" : undefined,
      action: () => {
        setVirtualKey("vk_tiny");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "vk-edge",
      category: "Virtual Keys",
      title: "Switch to key: vk_edge",
      subtitle: "Edge quota test key (10 request budget)",
      icon: KeyRound,
      badge: virtualKey === "vk_edge" ? "Active" : undefined,
      action: () => {
        setVirtualKey("vk_edge");
        setIsCommandPaletteOpen(false);
      },
    },

    // Mode
    {
      id: "toggle-mock",
      category: "Mode & Gateway",
      title: isMock ? "Switch to Live Gateway (Render Backend)" : "Switch to Mock Mode (Deterministic Engine)",
      subtitle: isMock
        ? "Route requests to live FastAPI gateway at onrender.com"
        : "Use client-side deterministic mock data without network calls",
      icon: Zap,
      badge: isMock ? "Mock" : "Live",
      action: () => {
        toggleMock();
        setIsCommandPaletteOpen(false);
      },
    },

    // Recent Traces
    ...recentTraces.slice(0, 5).map((trace: RecentTrace) => ({
      id: `trace-${trace.id}`,
      category: "Traces" as const,
      title: `Open Trace: ${trace.name} (${trace.id.slice(0, 8)}...)`,
      subtitle: `Status: ${trace.status} • ${trace.type.toUpperCase()}`,
      icon: Clock,
      badge: trace.status,
      action: () => {
        router.push(`/dashboard/traces?id=${trace.id}&type=${trace.type}`);
        setIsCommandPaletteOpen(false);
      },
    })),
  ];

  // Filter commands based on search
  const filtered = commands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Group by category
  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  // Key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  let runningIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-bg/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl rounded-24 border border-border bg-[#09090B]/95 backdrop-blur-2xl shadow-2xl overflow-hidden border-violet/30 shadow-[0_0_50px_rgba(124,92,255,0.2)]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80">
          <Search className="w-5 h-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search skills, traces, or switch keys..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-text text-sm sm:text-base outline-none placeholder:text-muted/60"
          />
          <kbd className="bg-surface px-2 py-0.5 rounded text-[11px] font-mono text-muted border border-border">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted text-sm">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((category) => {
              const categoryCommands = filtered.filter(
                (c) => c.category === category
              );

              return (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-muted/80">
                    {category}
                  </div>

                  <div className="space-y-0.5">
                    {categoryCommands.map((cmd) => {
                      const itemIndex = runningIndex++;
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-12 text-left transition-colors text-xs sm:text-sm",
                            isSelected
                              ? "bg-violet/20 text-text border border-violet/40 shadow-[0_0_12px_rgba(124,92,255,0.15)]"
                              : "text-muted hover:text-text hover:bg-surface border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "p-2 rounded-8 flex-shrink-0",
                                isSelected
                                  ? "bg-cyan/20 text-cyan"
                                  : "bg-surface text-muted"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-text truncate">
                                {cmd.title}
                              </p>
                              {cmd.subtitle && (
                                <p className="text-[11px] text-muted truncate mt-0.5">
                                  {cmd.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {cmd.badge && (
                              <Pill
                                variant={
                                  cmd.badge === "Active" || cmd.badge === "completed"
                                    ? "mint"
                                    : "violet"
                                }
                                size="sm"
                                className="text-[10px]"
                              >
                                {cmd.badge}
                              </Pill>
                            )}
                            <ArrowRight
                              className={cn(
                                "w-3.5 h-3.5 transition-transform",
                                isSelected
                                  ? "text-cyan translate-x-0.5"
                                  : "text-muted/40 opacity-0"
                              )}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-surface/50 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-bg px-1.5 py-0.5 rounded border border-border">
                ↑
              </kbd>{" "}
              <kbd className="bg-bg px-1.5 py-0.5 rounded border border-border">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="bg-bg px-1.5 py-0.5 rounded border border-border">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>Orchestrix Command v1.0</span>
        </div>
      </div>
    </div>
  );
}
