"use client";

import React from "react";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { Database, ShieldAlert, Cpu, Lock, CheckCircle2 } from "lucide-react";

export function ArchitectureDiagram() {
  return (
    <section className="relative py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Pill variant="mint" dot size="sm" className="mb-4">
          Auditable Topology
        </Pill>
        <h2 className="text-3xl sm:text-5xl font-bold font-heading tracking-tight mb-4">
          Gateway Architecture
        </h2>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          PostgreSQL serializes concurrent admission. Orchestration coordinates predeclared skills,
          bounded tools, and dual providers without an autonomous agent loop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Isometric SVG Diagram with Flowing Light (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard radius="24" className="overflow-hidden p-2">
            <div className="relative w-full aspect-[16/11] bg-[#09090B]/90 rounded-24 flex items-center justify-center p-4">
              <svg
                viewBox="0 0 680 460"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Flowing Light Gradients */}
                  <linearGradient id="flowVioletCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="50%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#5EEAD4" />
                  </linearGradient>

                  <linearGradient id="flowingPulse" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#22D3EE" stopOpacity="1" />
                    <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0.2" />
                  </linearGradient>

                  <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Flowing Connector Lines */}
                {/* 1. Client to API */}
                <path
                  d="M110 230 L 220 230"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M110 230 L 220 230"
                  stroke="url(#flowingPulse)"
                  strokeWidth="2.5"
                  strokeDasharray="12 12"
                  className="animate-flow-dash"
                />

                {/* 2. API to Auth/Budget */}
                <path
                  d="M280 200 L 360 120"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M280 200 L 360 120"
                  stroke="#7C5CFF"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  className="animate-flow-dash"
                />

                {/* 3. API to Executor */}
                <path
                  d="M280 230 L 360 230"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M280 230 L 360 230"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeDasharray="10 10"
                  className="animate-flow-dash"
                />

                {/* 4. Auth/Budget to PostgreSQL */}
                <path
                  d="M450 120 L 530 120"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M450 120 L 530 120"
                  stroke="#5EEAD4"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  className="animate-flow-dash"
                />

                {/* 5. Executor to Providers (Groq & Gemini) */}
                <path
                  d="M460 230 L 530 230"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M460 230 L 530 230"
                  stroke="#7C5CFF"
                  strokeWidth="2.5"
                  strokeDasharray="10 10"
                  className="animate-flow-dash"
                />

                {/* 6. Executor down to PostgreSQL Traces */}
                <path
                  d="M410 270 L 410 350 L 530 350"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                />
                <path
                  d="M410 270 L 410 350 L 530 350"
                  stroke="#5EEAD4"
                  strokeWidth="2"
                  strokeDasharray="12 12"
                  className="animate-flow-dash"
                />

                {/* ISOMETRIC NODE 1: Client */}
                <g transform="translate(30, 195)">
                  <rect width="90" height="70" rx="14" fill="#121218" stroke="rgba(255,255,255,0.12)" />
                  <rect x="8" y="8" width="74" height="24" rx="6" fill="#7C5CFF" fillOpacity="0.15" />
                  <text x="45" y="24" textAnchor="middle" fill="#7C5CFF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">CLIENT</text>
                  <text x="45" y="46" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif">API Consumer</text>
                  <text x="45" y="58" textAnchor="middle" fill="#A1A1AA" fontSize="8" fontFamily="monospace">Bearer vk_*</text>
                </g>

                {/* ISOMETRIC NODE 2: FastAPI Gateway Routes */}
                <g transform="translate(200, 185)">
                  <rect width="100" height="90" rx="16" fill="#151520" stroke="#7C5CFF" strokeWidth="1.5" />
                  <rect x="8" y="8" width="84" height="24" rx="8" fill="#7C5CFF" fillOpacity="0.2" />
                  <text x="50" y="24" textAnchor="middle" fill="#7C5CFF" fontSize="11" fontFamily="sans-serif" fontWeight="bold">FASTAPI</text>
                  <text x="50" y="50" textAnchor="middle" fill="#F4F4F5" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Gateway Layer</text>
                  <text x="50" y="66" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="monospace">/v1/tasks</text>
                  <text x="50" y="78" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="monospace">/v1/workflows</text>
                </g>

                {/* ISOMETRIC NODE 3: Auth & Budget */}
                <g transform="translate(340, 80)">
                  <rect width="120" height="80" rx="16" fill="#131720" stroke="#22D3EE" strokeWidth="1.5" />
                  <text x="60" y="28" textAnchor="middle" fill="#22D3EE" fontSize="10" fontFamily="sans-serif" fontWeight="bold">AUTH & BUDGET</text>
                  <text x="60" y="48" textAnchor="middle" fill="#F4F4F5" fontSize="11" fontFamily="sans-serif">Atomic Lock</text>
                  <text x="60" y="66" textAnchor="middle" fill="#5EEAD4" fontSize="9" fontFamily="monospace">requests &lt; budget</text>
                </g>

                {/* ISOMETRIC NODE 4: TaskExecutor */}
                <g transform="translate(340, 185)">
                  <rect width="130" height="95" rx="16" fill="#161524" stroke="#7C5CFF" strokeWidth="1.5" />
                  <text x="65" y="28" textAnchor="middle" fill="#7C5CFF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">TASK EXECUTOR</text>
                  <text x="65" y="48" textAnchor="middle" fill="#F4F4F5" fontSize="11" fontFamily="sans-serif">YAML Skills</text>
                  <text x="65" y="64" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="sans-serif">JSON 1-Repair</text>
                  <text x="65" y="80" textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="monospace">Bounded Tools</text>
                </g>

                {/* ISOMETRIC NODE 5: Providers */}
                <g transform="translate(520, 180)">
                  <rect width="130" height="100" rx="16" fill="#14191C" stroke="#5EEAD4" strokeWidth="1.5" />
                  <text x="65" y="26" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">PROVIDERS</text>
                  <rect x="12" y="38" width="106" height="24" rx="6" fill="#5EEAD4" fillOpacity="0.12" />
                  <text x="65" y="54" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Groq (Primary)</text>
                  <rect x="12" y="68" width="106" height="24" rx="6" fill="#FBBF24" fillOpacity="0.12" stroke="#FBBF24" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x="65" y="84" textAnchor="middle" fill="#FBBF24" fontSize="10" fontFamily="sans-serif">Gemini (Fallback)</text>
                </g>

                {/* ISOMETRIC NODE 6: PostgreSQL Storage */}
                <g transform="translate(520, 75)">
                  <rect width="130" height="85" rx="16" fill="#12171E" stroke="#22D3EE" strokeWidth="1.5" />
                  <text x="65" y="26" textAnchor="middle" fill="#22D3EE" fontSize="10" fontFamily="sans-serif" fontWeight="bold">POSTGRESQL 17</text>
                  <text x="65" y="48" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif">GatewayStore</text>
                  <text x="65" y="66" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="monospace">Alembic Migrations</text>
                </g>

                {/* ISOMETRIC NODE 7: Persistent Traces */}
                <g transform="translate(520, 315)">
                  <rect width="130" height="75" rx="16" fill="#111818" stroke="#5EEAD4" strokeWidth="1.5" />
                  <text x="65" y="26" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">AUDIT TRACES</text>
                  <text x="65" y="46" textAnchor="middle" fill="#F4F4F5" fontSize="10" fontFamily="sans-serif">Attempts & Tokens</text>
                  <text x="65" y="62" textAnchor="middle" fill="#5EEAD4" fontSize="8" fontFamily="monospace">Zero Secrets Stored</text>
                </g>
              </svg>
            </div>
          </GlassCard>
        </div>

        {/* Right: Real SQL Code Card & Concurrency Proof (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-24 bg-surface border border-violet/30 shadow-glow-violet/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-violet font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-violet" />
                Atomic Budget Reservation
              </span>
              <Pill variant="mint" size="sm">
                PostgreSQL Serialized
              </Pill>
            </div>

            <p className="text-muted text-xs leading-relaxed mb-4">
              Budget reservation occurs via a single atomic SQL statement executed before model dispatch.
              PostgreSQL serializes concurrent row-level locks, mathematically preventing overspending.
            </p>

            {/* Real SQL Snippet Card as required */}
            <div className="rounded-16 bg-[#040406] border border-border p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80 text-[10px] text-muted">
                <span>app/db.py: reserve_request()</span>
                <span className="text-mint">Guaranteed Atomic</span>
              </div>
              <pre className="text-text leading-relaxed">
                <span className="text-violet font-bold">UPDATE</span> virtual_keys{"\n"}
                <span className="text-violet font-bold">SET</span> requests = requests + <span className="text-cyan">1</span>{"\n"}
                <span className="text-violet font-bold">WHERE</span> key = <span className="text-mint">:key</span> <span className="text-violet font-bold">AND</span> requests &lt; budget{"\n"}
                <span className="text-violet font-bold">RETURNING</span> key;
              </pre>
            </div>

            <div className="mt-4 pt-4 border-t border-border/80 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted text-[11px]">Concurrency Guarantee</p>
                <p className="text-text font-bold mt-0.5">Zero Double-Spend</p>
              </div>
              <div>
                <p className="text-muted text-[11px]">Unit Accounting</p>
                <p className="text-text font-bold mt-0.5">1 Req = 1 Budget Unit</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-24 bg-surface border border-border space-y-3 text-xs text-muted">
            <div className="flex items-center gap-2 font-heading font-bold text-text text-sm">
              <CheckCircle2 className="h-4 w-4 text-mint" />
              Determinism vs Autonomous Planners
            </div>
            <p className="leading-relaxed">
              Orchestrix explicitly avoids autonomous agent frameworks, dynamic tool discovery,
              or infinite loop repair. Every branch, attempt ceiling, and tool callable is predeclared
              and auditable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
