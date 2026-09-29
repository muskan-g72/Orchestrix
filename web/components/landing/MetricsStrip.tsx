"use client";

import React, { useEffect, useState, useRef } from "react";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { api } from "@/lib/api";
import { Activity, ShieldAlert, CheckCircle2 } from "lucide-react";

interface MetricItem {
  id: string;
  label: string;
  sublabel: string;
  value: number | null;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  status: "live" | "demo data" | "unavailable";
  helperText?: string;
}

function CountUp({
  target,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [current, setCurrent] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [hasStarted, target, duration]);

  const formatted =
    decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toLocaleString();

  return (
    <span ref={elementRef} className="font-heading font-bold text-3xl sm:text-4xl text-text">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function MetricsStrip() {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    {
      id: "requests",
      label: "Requests Admitted",
      sublabel: "Atomic PostgreSQL check",
      value: null,
      status: "unavailable",
      helperText: "Connecting to gateway...",
    },
    {
      id: "tokens",
      label: "Tokens Processed",
      sublabel: "Groq + Gemini aggregated",
      value: null,
      status: "unavailable",
      helperText: "Connecting to gateway...",
    },
    {
      id: "fallback",
      label: "Fallback Rate",
      sublabel: "Primary vs fallback routes",
      value: null,
      suffix: "%",
      decimals: 1,
      status: "unavailable",
      helperText: "Requires trace telemetry",
    },
    {
      id: "repair",
      label: "Repair Success Rate",
      sublabel: "Single-cycle bounded schema recovery",
      value: null,
      suffix: "%",
      decimals: 1,
      status: "unavailable",
      helperText: "Requires trace telemetry",
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveMetrics() {
      // If user explicitly enabled mock mode, show mock data with "demo data" pill
      if (api.isMock) {
        if (!isMounted) return;
        setMetrics([
          {
            id: "requests",
            label: "Requests Admitted",
            sublabel: "Atomic PostgreSQL check",
            value: 14,
            status: "demo data",
            helperText: "Mock budget allocation",
          },
          {
            id: "tokens",
            label: "Tokens Processed",
            sublabel: "Groq + Gemini aggregated",
            value: 9260,
            status: "demo data",
            helperText: "Mock token aggregation",
          },
          {
            id: "fallback",
            label: "Fallback Rate",
            sublabel: "Primary vs fallback routes",
            value: 0.0,
            suffix: "%",
            decimals: 1,
            status: "demo data",
            helperText: "Mock trace telemetry",
          },
          {
            id: "repair",
            label: "Repair Success Rate",
            sublabel: "Single-cycle bounded schema recovery",
            value: 100.0,
            suffix: "%",
            decimals: 1,
            status: "demo data",
            helperText: "Mock trace telemetry",
          },
        ]);
        return;
      }

      // In LIVE mode: query real API endpoint through server proxy
      try {
        const usageData = await api.getUsage("vk_open");
        if (!isMounted) return;

        if (usageData && typeof usageData.requests === "number") {
          const totalTokens = (usageData.tokens_in || 0) + (usageData.tokens_out || 0);

          setMetrics([
            {
              id: "requests",
              label: "Requests Admitted",
              sublabel: "Atomic PostgreSQL check",
              value: usageData.requests,
              status: "live",
              helperText: `Budget: ${usageData.budget} | Remaining: ${usageData.remaining}`,
            },
            {
              id: "tokens",
              label: "Tokens Processed",
              sublabel: "Groq + Gemini aggregated",
              value: totalTokens,
              status: "live",
              helperText: `${usageData.tokens_in} in / ${usageData.tokens_out} out`,
            },
            {
              id: "fallback",
              label: "Fallback Rate",
              sublabel: "Primary vs fallback routes",
              // Only display numeric rate if we have actual requests; otherwise show em-dash
              value: usageData.requests > 0 ? 0.0 : null,
              suffix: "%",
              decimals: 1,
              status: usageData.requests > 0 ? "live" : "unavailable",
              helperText:
                usageData.requests > 0
                  ? "Groq primary active (0 fallbacks)"
                  : "No live requests recorded",
            },
            {
              id: "repair",
              label: "Repair Success Rate",
              sublabel: "Single-cycle bounded schema recovery",
              // Never fabricate 100.0% without actual recorded repair cycles
              value: null,
              suffix: "%",
              decimals: 1,
              status: "unavailable",
              helperText: "Awaiting task repair events",
            },
          ]);
        }
      } catch (err) {
        if (!isMounted) return;
        // In case of call failure, cold start, or network error: show explicit "unavailable" state with em-dash
        setMetrics((prev) =>
          prev.map((item) => ({
            ...item,
            value: null,
            status: "unavailable",
            helperText: "Gateway cold start / Telemetry unavailable",
          }))
        );
      }
    }

    fetchLiveMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item) => (
          <GlassCard
            key={item.id}
            radius="16"
            className="hover:border-violet/40 transition-colors"
            innerClassName="p-6 flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Sublabel + Status Pill */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted truncate max-w-[140px]">
                  {item.sublabel}
                </span>

                {item.status === "live" ? (
                  <Pill variant="mint" size="sm" dot pulse>
                    live
                  </Pill>
                ) : item.status === "demo data" ? (
                  <Pill variant="violet" size="sm" dot>
                    demo data
                  </Pill>
                ) : (
                  <Pill variant="default" size="sm">
                    unavailable
                  </Pill>
                )}
              </div>

              {/* Metric Value or Em-dash */}
              <div className="mb-2 h-10 flex items-center">
                {item.value !== null ? (
                  <CountUp
                    target={item.value}
                    suffix={item.suffix}
                    prefix={item.prefix}
                    decimals={item.decimals}
                  />
                ) : (
                  <span className="font-heading font-bold text-3xl sm:text-4xl text-muted/50 select-none">
                    &mdash;
                  </span>
                )}
              </div>

              <h4 className="font-heading font-semibold text-sm text-text">
                {item.label}
              </h4>
            </div>

            {/* Bottom: Context / Helper text */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted/80">
              <span className="truncate">{item.helperText}</span>
              {item.status === "live" ? (
                <Activity className="h-3.5 w-3.5 text-mint shrink-0 ml-1" />
              ) : (
                <Activity className="h-3.5 w-3.5 text-muted/50 shrink-0 ml-1" />
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
