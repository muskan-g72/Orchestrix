"use client";

import React, { useState } from "react";
import { Pill } from "@/components/Pill";
import {
  KeyRound,
  Coins,
  ArrowLeftRight,
  ShieldCheck,
  Wrench,
  ScrollText,
} from "lucide-react";

interface Capability {
  id: string;
  name: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentClass: string;
  neighbors: string[]; // neighbor IDs that light up when hovered
  headline: string;
  details: string[];
}

const CAPABILITIES: Capability[] = [
  {
    id: "virtual-keys",
    name: "Virtual Keys",
    tag: "Access & Identity",
    icon: KeyRound,
    color: "#7C5CFF",
    accentClass: "border-violet/40 text-violet",
    neighbors: ["atomic-budgets", "traces"],
    headline: "Predefined request budgets without raw provider exposure",
    details: [
      "Deterministic seed allocations (vk_open: 50, vk_tiny: 2, vk_edge: 1).",
      "Per-key execution preferences persisted atomically.",
      "Bearer authorization header validation on all protected endpoints.",
    ],
  },
  {
    id: "atomic-budgets",
    name: "Atomic Budgets",
    tag: "Concurrency Guard",
    icon: Coins,
    color: "#22D3EE",
    accentClass: "border-cyan/40 text-cyan",
    neighbors: ["virtual-keys", "fallback"],
    headline: "Single conditional PostgreSQL UPDATE with zero overspend",
    details: [
      "Row-level locking serializes concurrent requests under load.",
      "Zero race conditions even under sustained Locust stress benchmarks.",
      "Fallback, repair, and tools consume zero additional request units.",
    ],
  },
  {
    id: "fallback",
    name: "Provider Fallback",
    tag: "High Availability",
    icon: ArrowLeftRight,
    color: "#5EEAD4",
    accentClass: "border-mint/40 text-mint",
    neighbors: ["atomic-budgets", "validation"],
    headline: "Groq primary with automatic Gemini failover",
    details: [
      "Groq (llama-3.3-70b-versatile) serves low-latency completions.",
      "Gemini (gemini-2.5-flash) acts as hot standby on operational 5xx.",
      "Hard ceiling of 4 provider attempts per task pipeline.",
    ],
  },
  {
    id: "validation",
    name: "Schema Validation",
    tag: "Structured JSON",
    icon: ShieldCheck,
    color: "#7C5CFF",
    accentClass: "border-violet/40 text-violet",
    neighbors: ["fallback", "bounded-tools"],
    headline: "Pydantic contract enforcement with 1-cycle repair",
    details: [
      "Models must return strictly valid JSON envelopes.",
      "At most ONE deterministic repair prompt on the active provider.",
      "Categorized errors: parsing, structure, semantic, or protocol.",
    ],
  },
  {
    id: "bounded-tools",
    name: "Bounded Tools",
    tag: "Allowlisted Registry",
    icon: Wrench,
    color: "#22D3EE",
    accentClass: "border-cyan/40 text-cyan",
    neighbors: ["validation", "traces"],
    headline: "Pre-registered functions with validated arguments",
    details: [
      "Registry owns all callable definitions (e.g. text_statistics).",
      "At most one tool execution per task step with execution timeout.",
      "Zero shell execution, arbitrary network calls, or agent recursion.",
    ],
  },
  {
    id: "traces",
    name: "Execution Traces",
    tag: "Privacy Conscious",
    icon: ScrollText,
    color: "#5EEAD4",
    accentClass: "border-mint/40 text-mint",
    neighbors: ["bounded-tools", "virtual-keys"],
    headline: "Persistent audit history without storing prompt data",
    details: [
      "Records attempt count, provider switches, token metrics, and runtimes.",
      "User prompts, credentials, and raw responses are NEVER persisted.",
      "Virtual-key ownership prevents cross-tenant trace discovery.",
    ],
  },
];

export function CapabilitiesCubes() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeNeighbors = hoveredId
    ? CAPABILITIES.find((c) => c.id === hoveredId)?.neighbors || []
    : [];

  return (
    <section className="relative py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Pill variant="violet" dot size="sm" className="mb-4">
          Core Engine
        </Pill>
        <h2 className="text-3xl sm:text-5xl font-bold font-heading tracking-tight mb-4">
          System Capabilities
        </h2>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          Six foundational pillars engineered for determinism, auditability, and mathematical predictability.
          Hover to inspect technical mechanics and interconnected guardrails.
        </p>
      </div>

      {/* 3D Glass Cubes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          const isCurrent = hoveredId === cap.id;
          const isNeighbor = activeNeighbors.includes(cap.id);

          return (
            <div
              key={cap.id}
              onMouseEnter={() => setHoveredId(cap.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative perspective-[1000px] h-[360px] group cursor-pointer"
            >
              {/* Card Container simulating 3D Glass Depth */}
              <div
                className={`relative w-full h-full rounded-24 p-6 transition-all duration-500 bg-[#09090B]/90 backdrop-blur-xl border ${
                  isCurrent
                    ? "border-violet/60 shadow-[0_0_35px_-5px_rgba(124,92,255,0.4)] scale-[1.02]"
                    : isNeighbor
                    ? "border-cyan/50 shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]"
                    : "border-border hover:border-border-hover"
                }`}
              >
                {/* Visual Glass Cube Header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle, ${cap.color}25 0%, ${cap.color}05 100%)`,
                      border: `1px solid ${cap.color}50`,
                      color: cap.color,
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    {isNeighbor && (
                      <Pill variant="cyan" size="sm" pulse dot>
                        Linked Guardrail
                      </Pill>
                    )}
                    <Pill
                      variant={
                        cap.color === "#7C5CFF"
                          ? "violet"
                          : cap.color === "#22D3EE"
                          ? "cyan"
                          : "mint"
                      }
                      size="sm"
                    >
                      {cap.tag}
                    </Pill>
                  </div>
                </div>

                {/* Capability Title & Headline */}
                <h3 className="text-xl font-heading font-bold text-text mb-2 flex items-center justify-between">
                  {cap.name}
                </h3>
                <p className="text-xs font-mono text-cyan mb-4 leading-relaxed">
                  {cap.headline}
                </p>

                {/* Bullet Points with Details */}
                <ul className="space-y-2.5 text-xs text-muted leading-relaxed">
                  {cap.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: cap.color }}
                      />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Linked Nodes Footnote */}
                <div className="absolute bottom-5 left-6 right-6 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted/70">
                  <span>Guarded with:</span>
                  <span className="text-text font-semibold">
                    {cap.neighbors.join(" &bull; ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
