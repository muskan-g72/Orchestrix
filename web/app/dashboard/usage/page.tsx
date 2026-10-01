"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  KeyRound,
  Zap,
  Coins,
  ShieldCheck,
  ZapOff,
  RefreshCw,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Database,
  Lock,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { DemoDataPill } from "@/components/dashboard/DemoDataPill";
import { UsageResponse } from "@/lib/api/types";
import { OrchestrixApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const KEY_PRESETS = [
  {
    key: "vk_open",
    name: "vk_open",
    badge: "50 Requests",
    desc: "Primary test key with full standard allocation.",
  },
  {
    key: "vk_tiny",
    name: "vk_tiny",
    badge: "5 Requests",
    desc: "Low-quota key to verify atomic 429 budget exhaustion.",
  },
  {
    key: "vk_edge",
    name: "vk_edge",
    badge: "10 Requests",
    desc: "Edge-case key to test concurrency reservation locks.",
  },
];

export default function UsagePage() {
  const {
    client,
    virtualKey,
    setVirtualKey,
    isMock,
    toggleMock,
  } = useDashboard();

  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | OrchestrixApiError | null>(null);

  const fetchUsageData = useCallback(async (keyToFetch = virtualKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await client.getUsage(keyToFetch);
      setUsage(data);
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Failed to fetch usage", 500, "Unknown Error");
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [client, virtualKey]);

  useEffect(() => {
    fetchUsageData(virtualKey);
  }, [fetchUsageData, virtualKey]);

  const handleKeySelect = (k: string) => {
    setVirtualKey(k);
    fetchUsageData(k);
  };

  const isExhausted = usage ? usage.remaining <= 0 : false;
  const percentUsed = usage
    ? Math.min(100, Math.round((usage.requests / usage.budget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan" />
            <span>Virtual Key Usage & Budgets</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Real-time accounting tracked via PostgreSQL atomic reservation locks to guarantee zero-overspend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMock && <DemoDataPill />}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fetchUsageData()}
            isLoading={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Virtual Key Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {KEY_PRESETS.map((item) => {
          const isSelected = virtualKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleKeySelect(item.key)}
              className={cn(
                "p-4 rounded-16 border text-left transition-all space-y-2 relative overflow-hidden",
                isSelected
                  ? "bg-violet/15 border-violet/50 text-text shadow-[0_0_20px_rgba(124,92,255,0.2)]"
                  : "bg-surface border-border text-muted hover:text-text hover:bg-surface-hover hover:border-border-hover"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-text flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-violet" />
                  {item.name}
                </span>
                <Pill
                  variant={isSelected ? "cyan" : "default"}
                  size="sm"
                  className="text-[10px]"
                >
                  {item.badge}
                </Pill>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                {item.desc}
              </p>

              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet to-cyan" />
              )}
            </button>
          );
        })}
      </div>

      {/* Friendly 429 Exhausted Alert Banner */}
      {isExhausted && (
        <div className="rounded-16 border border-warn/40 bg-warn/10 p-5 shadow-[0_0_25px_rgba(251,191,36,0.15)] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-12 bg-warn/20 text-warn flex-shrink-0 mt-0.5">
                <ZapOff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-text text-base">
                    Virtual Key Quota Exhausted (HTTP 429)
                  </h4>
                  <Pill variant="warn" size="sm" className="font-mono text-[10px]">
                    429 RATE LIMIT
                  </Pill>
                </div>
                <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                  The key <strong className="text-warn font-mono">{virtualKey}</strong> has 0 remaining requests. Orchestrix PostgreSQL locks serialize requests and will reject any execution calls with HTTP 429 until the budget is replenished.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleKeySelect("vk_open")}
                className="text-xs"
              >
                Switch to vk_open
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleMock}
                className="text-xs"
              >
                Switch to Mock Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error state if fetch failed */}
      {error && <ErrorCard error={error} onRetry={() => fetchUsageData()} />}

      {/* Metrics Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 rounded-16 bg-surface/50 border border-border animate-pulse"
            />
          ))}
        </div>
      ) : usage ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Request Budget */}
            <GlassCard className="p-0" innerClassName="p-4 space-y-2">
              <div className="flex items-center justify-between text-muted text-xs font-mono">
                <span className="uppercase tracking-wider">Request Budget</span>
                <KeyRound className="w-4 h-4 text-violet" />
              </div>
              <div className="text-2xl font-bold font-mono text-text">
                {usage.requests}{" "}
                <span className="text-sm font-normal text-muted">/ {usage.budget}</span>
              </div>
              <p className="text-[11px] text-muted font-mono">
                {usage.remaining} remaining allocation
              </p>
            </GlassCard>

            {/* 2. Tokens In */}
            <GlassCard className="p-0" innerClassName="p-4 space-y-2">
              <div className="flex items-center justify-between text-muted text-xs font-mono">
                <span className="uppercase tracking-wider">Prompt Tokens</span>
                <Coins className="w-4 h-4 text-cyan" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan">
                {usage.tokens_in.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted font-mono">
                Inbound prompt consumption
              </p>
            </GlassCard>

            {/* 3. Tokens Out */}
            <GlassCard className="p-0" innerClassName="p-4 space-y-2">
              <div className="flex items-center justify-between text-muted text-xs font-mono">
                <span className="uppercase tracking-wider">Completion Tokens</span>
                <Coins className="w-4 h-4 text-mint" />
              </div>
              <div className="text-2xl font-bold font-mono text-mint">
                {usage.tokens_out.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted font-mono">
                Validated structured output tokens
              </p>
            </GlassCard>

            {/* 4. Spend Counter */}
            <GlassCard className="p-0" innerClassName="p-4 space-y-2">
              <div className="flex items-center justify-between text-muted text-xs font-mono">
                <span className="uppercase tracking-wider">Spend Unit</span>
                <ShieldCheck className="w-4 h-4 text-violet" />
              </div>
              <div className="text-2xl font-bold font-mono text-text">
                {usage.spend}{" "}
                <span className="text-sm font-normal text-muted">credits</span>
              </div>
              <p className="text-[11px] text-muted font-mono">
                Atomic reservation accounting
              </p>
            </GlassCard>
          </div>

          {/* Visual Budget Progress Card */}
          <GlassCard className="p-0" innerClassName="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-heading font-semibold text-text text-base">
                  Budget Utilization Progress
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Virtual Key: <span className="font-mono text-cyan">{usage.key}</span>
                </p>
              </div>

              <Pill
                variant={isExhausted ? "danger" : percentUsed > 75 ? "warn" : "mint"}
                size="md"
              >
                {percentUsed}% Consumed
              </Pill>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden p-0.5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isExhausted
                      ? "bg-danger shadow-[0_0_12px_rgba(248,113,113,0.5)]"
                      : percentUsed > 75
                      ? "bg-warn shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                      : "bg-gradient-to-r from-violet via-cyan to-mint shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  )}
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-muted">
                <span>0 req</span>
                <span>{usage.requests} used</span>
                <span>{usage.budget} budget max</span>
              </div>
            </div>

            {/* Architecture Explainer Box */}
            <div className="p-4 rounded-12 bg-bg/80 border border-border space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-text">
                <Lock className="w-4 h-4 text-cyan" />
                <span>How Orchestrix Atomic Budgeting Works</span>
              </div>
              <p className="text-muted leading-relaxed">
                Before dispatching to Groq or Gemini, Orchestrix executes an atomic PostgreSQL reservation query (<code className="font-mono text-violet">SELECT ... FOR UPDATE</code>). If remaining budget is greater than zero, a temporary reservation is decremented. On success, completion tokens are recorded. On failure, the reservation is safely released.
              </p>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
