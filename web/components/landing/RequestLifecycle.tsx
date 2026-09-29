"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Pill } from "@/components/Pill";
import {
  Key,
  Database,
  FileCode2,
  Cpu,
  CheckCircle2,
  HardDrive,
  ArrowRight,
  Shield,
} from "lucide-react";

interface LifecycleStep {
  number: string;
  title: string;
  action: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentClass: string;
  shortDesc: string;
  expandedDesc: string;
  technicalGuarantee: string;
}

const STEPS: LifecycleStep[] = [
  {
    number: "01",
    title: "Authenticate",
    action: "Bearer Key Resolution",
    tag: "Virtual-Key Auth",
    icon: Key,
    color: "#7C5CFF",
    accentClass: "border-violet/30 text-violet",
    shortDesc: "Validates incoming Bearer token against seeded virtual keys (`vk_open`, `vk_tiny`, `vk_edge`).",
    expandedDesc:
      "Gateway resolves client ownership and checks validity before any model resources are touched. Unknown or malformed tokens are immediately rejected with 401 without exposing stack traces.",
    technicalGuarantee: "Client never receives or manages raw LLM provider credentials.",
  },
  {
    number: "02",
    title: "Reserve Budget",
    action: "Atomic Conditional UPDATE",
    tag: "Concurrency Safe",
    icon: Database,
    color: "#22D3EE",
    accentClass: "border-cyan/30 text-cyan",
    shortDesc: "Atomically increments request count in PostgreSQL with conditional constraint checking.",
    expandedDesc:
      "Uses serialized SQL: `UPDATE virtual_keys SET requests = requests + 1 WHERE key = :key AND requests < budget`. Guarantees exactly zero budget overspending under concurrent load.",
    technicalGuarantee: "Admitted requests consume exactly 1 budget unit; repairs and fallbacks consume 0 additional units.",
  },
  {
    number: "03",
    title: "Build Prompt",
    action: "YAML Skill Synthesis",
    tag: "Predeclared Schemas",
    icon: FileCode2,
    color: "#5EEAD4",
    accentClass: "border-mint/30 text-mint",
    shortDesc: "Loads static YAML skill template, merges user preferences, and sanitizes input data.",
    expandedDesc:
      "Loads definitions for registered skills (`summarize`, `extract_action_items`) or workflows (`article_processing`). Enforces input envelopes with Pydantic.",
    technicalGuarantee: "No dynamic prompt injection or uncontrolled planning agents.",
  },
  {
    number: "04",
    title: "Provider Call",
    action: "Primary Groq + Gemini Fallback",
    tag: "Dual-Engine Routing",
    icon: Cpu,
    color: "#7C5CFF",
    accentClass: "border-violet/30 text-violet",
    shortDesc: "Dispatches to Groq primary (`llama-3.3-70b-versatile`) with automatic fallback to Gemini.",
    expandedDesc:
      "Provider selection is gateway-controlled. If Groq experiences 5xx, network timeout, or provider failure, the request automatically falls back to Gemini Flash without failing the client.",
    technicalGuarantee: "Maximum 4 provider attempts per task execution strictly enforced.",
  },
  {
    number: "05",
    title: "Validate / Repair",
    action: "JSON Envelope Verification",
    tag: "1-Cycle Bounded Repair",
    icon: CheckCircle2,
    color: "#FBBF24",
    accentClass: "border-warn/30 text-warn",
    shortDesc: "Validates response JSON. If invalid, executes at most ONE targeted repair attempt.",
    expandedDesc:
      "Extracts structured JSON payload and checks structure against schema. If parsing or semantic validation fails, gateway sends the exact error back for one repair attempt on current provider.",
    technicalGuarantee: "Deterministic bounded repair prevents infinite hallucination loops.",
  },
  {
    number: "06",
    title: "Settle Trace",
    action: "Atomic PostgreSQL Persistence",
    tag: "Privacy Conscious",
    icon: HardDrive,
    color: "#5EEAD4",
    accentClass: "border-mint/30 text-mint",
    shortDesc: "Records attempt count, final provider, token usage, and tool timings atomically.",
    expandedDesc:
      "Settles final usage tokens and task trace in PostgreSQL. Trace lookup is virtual-key scoped; unknown or non-owned IDs return 404 to prevent ownership discovery.",
    technicalGuarantee: "User prompts and raw model responses are never persisted in execution traces.",
  },
];

export function RequestLifecycle() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Pill variant="cyan" dot size="sm" className="mb-4">
          Deterministic Pipeline
        </Pill>
        <h2 className="text-3xl sm:text-5xl font-bold font-heading tracking-tight mb-4">
          Request Lifecycle
        </h2>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          Every task follows an auditable, six-phase execution lifecycle under strict gateway control.
          Zero autonomous branching, zero speculative iterations.
        </p>
      </div>

      {/* Grid of 6 Floating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isHovered = hoveredIndex === idx;

          // Independent subtle spring float offsets
          const floatDurations = [4.2, 4.8, 5.2, 4.5, 5.0, 4.6];
          const floatDelays = [0, 0.4, 0.2, 0.6, 0.1, 0.5];

          return (
            <motion.div
              key={step.number}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: floatDurations[idx],
                delay: floatDelays[idx],
                repeat: Infinity,
                ease: "easeInOut",
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="h-full"
            >
              <GlassCard
                radius="16"
                glow={isHovered}
                className={`h-full transition-all duration-300 ${
                  isHovered ? "border-violet/40 scale-[1.02]" : "border-border"
                }`}
                innerClassName="p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-muted/60">
                      {step.number}
                    </span>
                    <Pill
                      variant={
                        step.color === "#7C5CFF"
                          ? "violet"
                          : step.color === "#22D3EE"
                          ? "cyan"
                          : step.color === "#5EEAD4"
                          ? "mint"
                          : "warn"
                      }
                      size="sm"
                    >
                      {step.tag}
                    </Pill>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-10 w-10 rounded-12 flex items-center justify-center border"
                      style={{
                        backgroundColor: `${step.color}15`,
                        borderColor: `${step.color}40`,
                        color: step.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-text">
                        {step.title}
                      </h3>
                      <p className="font-mono text-xs text-muted">
                        {step.action}
                      </p>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <p className="text-muted text-sm leading-relaxed mb-4">
                    {step.shortDesc}
                  </p>

                  {/* Expanded Content on Hover */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isHovered ? "max-h-48 opacity-100 mb-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pt-3 border-t border-border/80 text-xs text-muted/90 leading-relaxed space-y-2">
                      <p>{step.expandedDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Guarantee Footer */}
                <div className="pt-3 border-t border-border flex items-start gap-2 text-xs">
                  <Shield className="h-3.5 w-3.5 text-cyan shrink-0 mt-0.5" />
                  <span className="text-[11px] font-mono text-muted/90 leading-tight">
                    {step.technicalGuarantee}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
