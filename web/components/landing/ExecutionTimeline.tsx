"use client";

import React, { useState } from "react";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import {
  Terminal,
  Clock,
  Cpu,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Database,
  EyeOff,
  Code2,
} from "lucide-react";

interface TimelineRow {
  id: string;
  type: "Attempt" | "Tool Call" | "Repair" | "Fallback" | "Finalize";
  label: string;
  sublabel: string;
  provider: string;
  durationMs: number;
  status: "completed" | "validation_error" | "standby" | "active";
  statusText: string;
  color: string;
  logDetails: {
    attempt_number?: number;
    attempt_type?: string;
    provider?: string;
    tokens_in?: number;
    tokens_out?: number;
    error_category?: string | null;
    tool_name?: string;
    tool_number?: number;
    sanitized_input_keys?: string[];
    persisted_payload: string;
    privacy_note: string;
  };
}

const TIMELINE_ROWS: TimelineRow[] = [
  {
    id: "row-attempt-1",
    type: "Attempt",
    label: "Attempt 01: Groq Primary Model Call",
    sublabel: "llama-3.3-70b-versatile via Gateway Client",
    provider: "groq",
    durationMs: 640,
    status: "validation_error",
    statusText: "422: JSON Schema Mismatch",
    color: "#FBBF24",
    logDetails: {
      attempt_number: 1,
      attempt_type: "initial",
      provider: "groq",
      tokens_in: 340,
      tokens_out: 68,
      error_category: "structure",
      sanitized_input_keys: ["text", "depth"],
      persisted_payload: "JSON validation failed: missing key 'reading_time_minutes'",
      privacy_note: "Raw prompt text and candidate output were discarded immediately from memory.",
    },
  },
  {
    id: "row-tool-1",
    type: "Tool Call",
    label: "Tool Call: Allowlisted 'text_statistics'",
    sublabel: "Bounded execution under 100ms ceiling",
    provider: "local_registry",
    durationMs: 18,
    status: "completed",
    statusText: "200: Validated Output",
    color: "#22D3EE",
    logDetails: {
      tool_name: "text_statistics",
      tool_number: 1,
      sanitized_input_keys: ["text"],
      persisted_payload: "{ words: 420, sentences: 24, chars: 2840 }",
      privacy_note: "Tool executed locally in isolated Python worker; zero outbound network access.",
    },
  },
  {
    id: "row-repair-1",
    type: "Repair",
    label: "Repair 01: Bounded Schema Correction",
    sublabel: "Single-cycle correction prompt with error diff",
    provider: "groq",
    durationMs: 420,
    status: "completed",
    statusText: "200: Schema Validated",
    color: "#7C5CFF",
    logDetails: {
      attempt_number: 2,
      attempt_type: "repair",
      provider: "groq",
      tokens_in: 410,
      tokens_out: 142,
      error_category: null,
      persisted_payload: "{ summary: '...', key_points: [...], reading_time_minutes: 1.2 }",
      privacy_note: "Model repaired structure on first try. Repair cycle terminated safely.",
    },
  },
  {
    id: "row-fallback-1",
    type: "Fallback",
    label: "Fallback Check: Gemini Standby Route",
    sublabel: "gemini-2.5-flash hot reserve",
    provider: "gemini",
    durationMs: 0,
    status: "standby",
    statusText: "Hot Standby (Not Needed)",
    color: "#5EEAD4",
    logDetails: {
      attempt_type: "fallback_route",
      provider: "gemini",
      tokens_in: 0,
      tokens_out: 0,
      persisted_payload: "Fallback trigger skipped: primary completed within bounded limit.",
      privacy_note: "Zero cost incurred; standby remains authenticated and health-checked.",
    },
  },
  {
    id: "row-finalize-1",
    type: "Finalize",
    label: "Finalize: Atomic PostgreSQL Trace Settle",
    sublabel: "GatewayStore token accounting & trace settlement",
    provider: "postgresql",
    durationMs: 14,
    status: "completed",
    statusText: "Settled (Trace Recorded)",
    color: "#5EEAD4",
    logDetails: {
      provider: "postgresql",
      tokens_in: 750,
      tokens_out: 210,
      persisted_payload: "usage_events recorded, task trace marked completed (task_id: 7d91e3bf)",
      privacy_note: "Privacy policy enforced: sensitive payloads stripped before DB insert.",
    },
  },
];

export function ExecutionTimeline() {
  const [selectedRow, setSelectedRow] = useState<TimelineRow>(TIMELINE_ROWS[0]);

  return (
    <section className="relative py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Pill variant="violet" dot size="sm" className="mb-4">
          Observable Traces
        </Pill>
        <h2 className="text-3xl sm:text-5xl font-bold font-heading tracking-tight mb-4">
          Execution Timeline
        </h2>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          IDE-style timeline view inspecting every millisecond of gateway execution.
          Hover over any phase to inspect the privacy-conscious trace envelope.
        </p>
      </div>

      {/* IDE Window Frame */}
      <GlassCard radius="24" className="overflow-hidden border-border/80 shadow-2xl">
        {/* IDE Top Bar */}
        <div className="bg-[#09090B] border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#EF4444]/60" />
            <span className="h-3 w-3 rounded-full bg-[#F59E0B]/60" />
            <span className="h-3 w-3 rounded-full bg-[#10B981]/60" />
            <div className="ml-4 flex items-center gap-2 font-mono text-xs text-muted">
              <Code2 className="h-3.5 w-3.5 text-violet" />
              <span>orchestrix_gateway :: task_execution_trace.log</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted hidden sm:inline">
              Task ID: <code className="text-cyan">7d91e3bf-1c4e-4b2a</code>
            </span>
            <Pill variant="mint" size="sm" dot>
              Status: 200 OK
            </Pill>
          </div>
        </div>

        {/* IDE Main Content: Split Timeline & Log Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Left: Timeline Rows (7 cols) */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-border bg-[#09090B]/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-muted mb-4 px-2">
              <span>EXECUTION PHASE</span>
              <span>DURATION</span>
            </div>

            {TIMELINE_ROWS.map((row) => {
              const isSelected = selectedRow.id === row.id;

              return (
                <div
                  key={row.id}
                  onMouseEnter={() => setSelectedRow(row)}
                  className={`p-4 rounded-16 border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-surface border-violet/50 shadow-glow-violet/30"
                      : "bg-surface/40 border-border/60 hover:bg-surface hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-heading font-semibold text-sm text-text">
                        {row.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      <span className="font-mono text-xs font-bold text-text">
                        {row.durationMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-muted pl-4">
                    <span>{row.sublabel}</span>
                    <span
                      style={{ color: row.color }}
                      className="font-semibold text-[11px]"
                    >
                      {row.statusText}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex items-center justify-between text-xs font-mono text-muted px-2 border-t border-border">
              <span>Total Pipeline Latency:</span>
              <span className="text-mint font-bold text-sm">1,092ms</span>
            </div>
          </div>

          {/* Right: Live Log Inspector Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#040406]/90 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <div className="flex items-center gap-2 text-violet font-semibold">
                  <Terminal className="h-4 w-4" />
                  <span>PHASE LOG INSPECTOR</span>
                </div>
                <Pill variant="violet" size="sm">
                  {selectedRow.type}
                </Pill>
              </div>

              {/* JSON Metadata Viewer */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-muted">Target Provider: </span>
                  <span className="text-cyan font-bold">
                    {selectedRow.logDetails.provider || "gateway_core"}
                  </span>
                </div>

                {selectedRow.logDetails.tokens_in !== undefined && (
                  <div>
                    <span className="text-muted">Token Consumption: </span>
                    <span className="text-text">
                      {selectedRow.logDetails.tokens_in} prompt +{" "}
                      {selectedRow.logDetails.tokens_out} completion
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-muted">Recorded Event: </span>
                  <div className="mt-1 p-2 rounded-8 bg-black/60 border border-white/10 text-[11px] text-mint overflow-x-auto">
                    {selectedRow.logDetails.persisted_payload}
                  </div>
                </div>
              </div>

              {/* Privacy Shield Notice */}
              <div className="p-3.5 rounded-12 bg-surface border border-mint/20 space-y-2">
                <div className="flex items-center gap-2 text-mint font-bold text-[11px]">
                  <ShieldCheck className="h-4 w-4 text-mint shrink-0" />
                  <span>Privacy-Conscious Trace Policy</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {selectedRow.logDetails.privacy_note}
                </p>
              </div>
            </div>

            {/* Bottom Nonce / Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-[10px] text-muted/70">
              <span className="flex items-center gap-1.5">
                <EyeOff className="h-3 w-3 text-cyan" />
                Raw Prompts Never Persisted
              </span>
              <span>DB: PostgreSQL 17</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
