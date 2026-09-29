"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { SpotlightCard } from "@/components/SpotlightCard";
import { api, OrchestrixApiError } from "@/lib/api";
import {
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Code2,
  Key,
  Compass,
} from "lucide-react";

export default function DesignPage() {
  const [activeTab, setActiveTab] = useState<"tokens" | "components" | "api">(
    "tokens"
  );
  const [apiOutput, setApiOutput] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [magnetDebug, setMagnetDebug] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const runApiTest = async (testName: string, action: () => Promise<unknown>) => {
    setIsApiLoading(true);
    setApiStatus(`Executing ${testName}...`);
    try {
      const result = await action();
      setApiOutput(JSON.stringify(result, null, 2));
      setApiStatus(`Success: ${testName}`);
    } catch (err: unknown) {
      if (err instanceof OrchestrixApiError) {
        setApiOutput(
          JSON.stringify(
            {
              errorName: err.name,
              status: err.status,
              statusText: err.statusText,
              detail: err.detail,
              payload: err.payload,
            },
            null,
            2
          )
        );
        setApiStatus(`Mapped Typed Error: ${err.name} (${err.status})`);
      } else {
        setApiOutput(String(err));
        setApiStatus(`Error: ${testName}`);
      }
    } finally {
      setIsApiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text pb-24 selection:bg-violet/30 selection:text-text">
      {/* Top Banner / Truth Badge */}
      <header className="border-b border-border/80 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-12 bg-gradient-to-br from-violet to-cyan flex items-center justify-center shadow-glow-violet/40">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-tight text-text">
                Orchestrix
              </span>
              <span className="ml-2 font-mono text-xs text-muted">
                Design System & Foundation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill variant="mint" dot pulse size="sm">
              Deterministic Gateway
            </Pill>
            <Pill variant="violet" size="sm">
              Next.js App Router
            </Pill>
            <Pill variant="cyan" size="sm">
              Lenis Smooth
            </Pill>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Architecture Notice / Product Truth */}
        <div className="mb-10 p-4 rounded-16 bg-surface border border-violet/20 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-violet shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-text">Product Truth: </span>
            <span className="text-muted">
              Orchestrix is a deterministic FastAPI AI execution gateway (virtual-key
              auth, atomic budget reservation, Groq primary + Gemini fallback, YAML
              skills, JSON validation with one repair, allowlisted tools, fixed
              workflows, persistent traces). It has{" "}
              <strong className="text-warn">NO autonomous planner or agent framework</strong>
              .
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border pb-4 mb-10">
          <button
            onClick={() => setActiveTab("tokens")}
            className={`px-4 py-2 rounded-12 font-heading font-medium text-sm transition-all ${
              activeTab === "tokens"
                ? "bg-surface border border-border text-white shadow-sm"
                : "text-muted hover:text-text hover:bg-surface/50"
            }`}
          >
            1. Theme Tokens & Typography
          </button>
          <button
            onClick={() => setActiveTab("components")}
            className={`px-4 py-2 rounded-12 font-heading font-medium text-sm transition-all ${
              activeTab === "components"
                ? "bg-surface border border-border text-white shadow-sm"
                : "text-muted hover:text-text hover:bg-surface/50"
            }`}
          >
            2. Foundational Components
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 rounded-12 font-heading font-medium text-sm transition-all ${
              activeTab === "api"
                ? "bg-surface border border-border text-white shadow-sm"
                : "text-muted hover:text-text hover:bg-surface/50"
            }`}
          >
            3. Typed API Client & Mock Traces
          </button>
        </div>

        {/* TAB 1: TOKENS */}
        {activeTab === "tokens" && (
          <div className="space-y-12">
            {/* Colors Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  Color Tokens
                </h2>
                <p className="text-muted text-sm">
                  Palette tokens calibrated for low-contrast dark elegance with high-chroma cyber accents.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-16 bg-[#09090B] border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#09090B] border border-white/10 mb-3 shadow-inner" />
                  <p className="font-heading font-bold text-sm">bg</p>
                  <p className="font-mono text-xs text-muted">#09090B</p>
                  <p className="text-[11px] text-muted/80 mt-1">Deep background</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-white/[0.04] border border-white/10 mb-3" />
                  <p className="font-heading font-bold text-sm">surface</p>
                  <p className="font-mono text-xs text-muted">rgba(255,255,255,0.04)</p>
                  <p className="text-[11px] text-muted/80 mt-1">Card body surface</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 border border-white/[0.08] mb-3 flex items-center justify-center text-xs text-muted">
                    1px border
                  </div>
                  <p className="font-heading font-bold text-sm">border</p>
                  <p className="font-mono text-xs text-muted">rgba(255,255,255,0.08)</p>
                  <p className="text-[11px] text-muted/80 mt-1">Structural rule</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#F4F4F5] mb-3" />
                  <p className="font-heading font-bold text-sm">text</p>
                  <p className="font-mono text-xs text-muted">#F4F4F5</p>
                  <p className="text-[11px] text-muted/80 mt-1">Primary typography</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#A1A1AA] mb-3" />
                  <p className="font-heading font-bold text-sm">muted</p>
                  <p className="font-mono text-xs text-muted">#A1A1AA</p>
                  <p className="text-[11px] text-muted/80 mt-1">Secondary labels</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#7C5CFF] mb-3 shadow-glow-violet/40" />
                  <p className="font-heading font-bold text-sm text-violet">violet</p>
                  <p className="font-mono text-xs text-muted">#7C5CFF</p>
                  <p className="text-[11px] text-muted/80 mt-1">Brand Primary</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#22D3EE] mb-3 shadow-glow-cyan/40" />
                  <p className="font-heading font-bold text-sm text-cyan">cyan</p>
                  <p className="font-mono text-xs text-muted">#22D3EE</p>
                  <p className="text-[11px] text-muted/80 mt-1">Accent Cyber</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#5EEAD4] mb-3 shadow-[0_0_20px_rgba(94,234,212,0.3)]" />
                  <p className="font-heading font-bold text-sm text-mint">mint</p>
                  <p className="font-mono text-xs text-muted">#5EEAD4</p>
                  <p className="text-[11px] text-muted/80 mt-1">Success / Active</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#F87171] mb-3 shadow-[0_0_20px_rgba(248,113,113,0.3)]" />
                  <p className="font-heading font-bold text-sm text-danger">danger</p>
                  <p className="font-mono text-xs text-muted">#F87171</p>
                  <p className="text-[11px] text-muted/80 mt-1">Failures / 502</p>
                </div>

                <div className="p-4 rounded-16 bg-surface border border-border">
                  <div className="h-16 w-full rounded-12 bg-[#FBBF24] mb-3 shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                  <p className="font-heading font-bold text-sm text-warn">warn</p>
                  <p className="font-mono text-xs text-muted">#FBBF24</p>
                  <p className="text-[11px] text-muted/80 mt-1">Budget / Rate limit</p>
                </div>
              </div>
            </section>

            {/* Radius Tokens Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  Border Radius Tokens
                </h2>
                <p className="text-muted text-sm">
                  Required specifications: Radius 12, 16, and 24.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-12 bg-surface border border-border">
                  <p className="font-heading font-bold text-base mb-1">Radius 12px</p>
                  <p className="font-mono text-xs text-muted mb-4">rounded-12 (0.75rem)</p>
                  <div className="h-20 w-full rounded-12 bg-violet/10 border border-violet/30 flex items-center justify-center text-xs font-mono text-violet">
                    Used for Buttons, Pills, Badges
                  </div>
                </div>

                <div className="p-6 rounded-16 bg-surface border border-border">
                  <p className="font-heading font-bold text-base mb-1">Radius 16px</p>
                  <p className="font-mono text-xs text-muted mb-4">rounded-16 (1.0rem)</p>
                  <div className="h-20 w-full rounded-16 bg-cyan/10 border border-cyan/30 flex items-center justify-center text-xs font-mono text-cyan">
                    Used for GlassCard, SpotlightCard
                  </div>
                </div>

                <div className="p-6 rounded-24 bg-surface border border-border">
                  <p className="font-heading font-bold text-base mb-1">Radius 24px</p>
                  <p className="font-mono text-xs text-muted mb-4">rounded-24 (1.5rem)</p>
                  <div className="h-20 w-full rounded-24 bg-mint/10 border border-mint/30 flex items-center justify-center text-xs font-mono text-mint">
                    Used for Layout Containers & Modals
                  </div>
                </div>
              </div>
            </section>

            {/* Typography Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  Typography & Fluid Scale
                </h2>
                <p className="text-muted text-sm">
                  Space Grotesk (headings), Inter (body), JetBrains Mono (code). Fluid clamp() scale up to ~80px with tight tracking.
                </p>
              </div>

              <div className="space-y-6 p-6 rounded-24 bg-surface border border-border">
                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-violet mb-2">
                    Hero / H1 Display • clamp(2.5rem, 5vw + 1rem, 5rem) • ~80px max • -0.035em tracking
                  </p>
                  <h1 className="tracking-tighter">Deterministic AI Execution</h1>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-cyan mb-2">
                    H2 Heading • clamp(2rem, 3.5vw + 0.5rem, 3.5rem) • ~56px max • -0.03em tracking
                  </p>
                  <h2 className="tracking-tight">Atomic Budget Reservation & Fallback</h2>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-mint mb-2">
                    H3 Heading • clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem) • ~40px max • -0.025em tracking
                  </p>
                  <h3 className="tracking-tight">YAML Skill Definitions & Bounded Tools</h3>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-muted mb-2">
                    H4 Heading • clamp(1.25rem, 1.5vw + 0.5rem, 1.75rem) • ~28px max
                  </p>
                  <h4>Strict Schema Validation With One Repair Cycle</h4>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="font-mono text-xs text-muted mb-2">
                    Body Font • Inter Regular 16px / 1.6
                  </p>
                  <p className="text-muted max-w-2xl text-base leading-relaxed">
                    Orchestrix routes requests strictly through predictable pipelines. Upstream model calls
                    are handled via Groq as primary with automated Gemini fallback, while all attempts,
                    token usage, and allowlisted tool traces are recorded persistently in PostgreSQL.
                  </p>
                </div>

                <div>
                  <p className="font-mono text-xs text-muted mb-2">
                    Code Font • JetBrains Mono 14px
                  </p>
                  <pre className="p-4 rounded-12 bg-black/60 border border-border font-mono text-xs text-mint overflow-x-auto">
                    {`UPDATE virtual_keys
SET requests = requests + 1
WHERE key = :key AND requests < budget
RETURNING key;`}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: COMPONENTS */}
        {activeTab === "components" && (
          <div className="space-y-12">
            {/* GlassCard Showcase */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  GlassCard
                </h2>
                <p className="text-muted text-sm">
                  backdrop-blur-xl + 1px violet-to-cyan gradient border. Surface translucency rgba(255,255,255,0.04).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard glow>
                  <div className="flex items-center justify-between mb-4">
                    <Pill variant="violet" dot size="sm">
                      Provider Gateway
                    </Pill>
                    <span className="font-mono text-xs text-muted">Radius 16</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2">
                    Groq Primary + Gemini Fallback
                  </h3>
                  <p className="text-muted text-sm mb-4 leading-relaxed">
                    Provider routing is gateway-owned. Clients cannot alter upstream model
                    dispatch, guaranteeing auditable and predictable cost governance.
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Cpu className="h-4 w-4 text-violet" />
                    <span className="font-mono text-xs text-text">
                      Max 4 attempts per task execution
                    </span>
                  </div>
                </GlassCard>

                <GlassCard radius="24" glow>
                  <div className="flex items-center justify-between mb-4">
                    <Pill variant="cyan" dot size="sm">
                      Bounded Tools
                    </Pill>
                    <span className="font-mono text-xs text-muted">Radius 24</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2">
                    Allowlisted Tool Registry
                  </h3>
                  <p className="text-muted text-sm mb-4 leading-relaxed">
                    Only registered, type-safe callables such as `text_statistics` execute.
                    No arbitrary shell or untrusted external network requests are permitted.
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Database className="h-4 w-4 text-cyan" />
                    <span className="font-mono text-xs text-text">
                      Validated parameter envelopes
                    </span>
                  </div>
                </GlassCard>
              </div>
            </section>

            {/* Button Showcase */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  Button
                </h2>
                <p className="text-muted text-sm">
                  Primary and Secondary variants with magnetic hover (max 8px displacement, spring stiffness 120, damping 18).
                </p>
              </div>

              <div className="p-8 rounded-24 bg-surface border border-border space-y-8">
                <div>
                  <h4 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">
                    Magnetic Hover Feedback
                  </h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const dx = Math.round(e.clientX - (rect.left + rect.width / 2));
                        const dy = Math.round(e.clientY - (rect.top + rect.height / 2));
                        setMagnetDebug({
                          x: Math.max(-8, Math.min(8, Math.round(dx * 0.1))),
                          y: Math.max(-8, Math.min(8, Math.round(dy * 0.1))),
                        });
                      }}
                      onMouseLeave={() => setMagnetDebug({ x: 0, y: 0 })}
                    >
                      Primary Magnetic LG
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    <Button variant="secondary" size="lg">
                      Secondary Magnetic LG
                    </Button>

                    <Button variant="primary" size="md">
                      Primary MD
                    </Button>

                    <Button variant="secondary" size="md">
                      Secondary MD
                    </Button>

                    <Button variant="secondary" size="sm">
                      Small SM
                    </Button>

                    <Button variant="primary" size="md" isLoading>
                      Processing
                    </Button>

                    <Button variant="secondary" size="md" disabled>
                      Disabled
                    </Button>
                  </div>
                  <div className="mt-4 font-mono text-xs text-muted">
                    Active Magnetic Displacement:{" "}
                    <span className="text-cyan font-bold">
                      x: {magnetDebug.x}px, y: {magnetDebug.y}px
                    </span>{" "}
                    (Clamped to max ±8px)
                  </div>
                </div>
              </div>
            </section>

            {/* Pill Showcase */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  Pill
                </h2>
                <p className="text-muted text-sm">
                  System status badges supporting indicator dots, pulse rings, and all theme tokens.
                </p>
              </div>

              <div className="p-6 rounded-24 bg-surface border border-border space-y-6">
                <div>
                  <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
                    Status Variants with Pulse Indicators
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Pill variant="mint" dot pulse>
                      Groq Primary Active
                    </Pill>
                    <Pill variant="cyan" dot pulse>
                      Gemini Standby
                    </Pill>
                    <Pill variant="violet" dot>
                      YAML Skill Loaded
                    </Pill>
                    <Pill variant="warn" dot pulse>
                      Budget 1 Remaining
                    </Pill>
                    <Pill variant="danger" dot>
                      Validation Failed
                    </Pill>
                    <Pill variant="default" dot>
                      Trace Persisted
                    </Pill>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
                    Sizes & Plain Tags
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill variant="violet" size="sm">
                      sm / skill:summarize
                    </Pill>
                    <Pill variant="cyan" size="md">
                      md / workflow:article_processing
                    </Pill>
                    <Pill variant="mint" size="sm">
                      200 OK
                    </Pill>
                    <Pill variant="danger" size="sm">
                      502 Bad Gateway
                    </Pill>
                  </div>
                </div>
              </div>
            </section>

            {/* SpotlightCard Showcase */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                  SpotlightCard
                </h2>
                <p className="text-muted text-sm">
                  Cursor-following radial highlight effect tracking mouse interaction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SpotlightCard radius="16" className="p-6">
                  <div className="h-10 w-10 rounded-12 bg-violet/20 border border-violet/30 flex items-center justify-center text-violet mb-4">
                    <Key className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-2">
                    Virtual-Key Auth
                  </h4>
                  <p className="text-muted text-sm leading-relaxed">
                    Bearer token validation maps to predefined client allocations without
                    exposing database credentials or model API keys.
                  </p>
                </SpotlightCard>

                <SpotlightCard radius="16" className="p-6">
                  <div className="h-10 w-10 rounded-12 bg-cyan/20 border border-cyan/30 flex items-center justify-center text-cyan mb-4">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-2">
                    Atomic Reservations
                  </h4>
                  <p className="text-muted text-sm leading-relaxed">
                    PostgreSQL conditional UPDATE serializes concurrent requests, guaranteeing
                    strict budget ceilings with zero overspending.
                  </p>
                </SpotlightCard>

                <SpotlightCard radius="16" className="p-6">
                  <div className="h-10 w-10 rounded-12 bg-mint/20 border border-mint/30 flex items-center justify-center text-mint mb-4">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-2">
                    Persistent Traces
                  </h4>
                  <p className="text-muted text-sm leading-relaxed">
                    Structured traces persist attempts, provider switches, token usage,
                    and bounded tool durations without storing prompt payloads.
                  </p>
                </SpotlightCard>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: TYPED API CLIENT & MOCK TRACES */}
        {activeTab === "api" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-heading tracking-tight mb-1">
                Typed Gateway API Client
              </h2>
              <p className="text-muted text-sm">
                Configured with base URL <code className="text-cyan">{api.baseUrl}</code>. MOCK mode active:{" "}
                <code className="text-mint">{String(api.isMock)}</code>.
              </p>
            </div>

            {/* Test Action Buttons */}
            <div className="p-6 rounded-24 bg-surface border border-border">
              <h4 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">
                Interactive Gateway Operations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => runApiTest("GET /healthz", () => api.getHealth())}
                >
                  <Activity className="h-4 w-4 mr-2 text-mint" />
                  GET /healthz
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    runApiTest("GET /usage?key=vk_open", () =>
                      api.getUsage("vk_open")
                    )
                  }
                >
                  <Database className="h-4 w-4 mr-2 text-cyan" />
                  GET /usage
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    runApiTest("POST /v1/tasks/execute", () =>
                      api.executeTask({
                        skill: "summarize",
                        input: {
                          text: "Orchestrix is a deterministic AI execution gateway built on FastAPI.",
                        },
                      })
                    )
                  }
                >
                  <Sparkles className="h-4 w-4 mr-2 text-white" />
                  POST /v1/tasks/execute
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    runApiTest("GET /v1/tasks/{id} (Trace)", () =>
                      api.getTaskTrace("7d91e3bf-1c4e-4b2a-89a1-52f01f8d9b1c")
                    )
                  }
                >
                  <Terminal className="h-4 w-4 mr-2 text-violet" />
                  GET /v1/tasks/{`{id}`}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    runApiTest("POST /v1/workflows/execute", () =>
                      api.executeWorkflow({
                        workflow: "article_processing",
                        input: {
                          text: "Orchestrix provides deterministic 3-step article analysis.",
                        },
                      })
                    )
                  }
                >
                  <Layers className="h-4 w-4 mr-2 text-cyan" />
                  POST /v1/workflows/execute
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    runApiTest("GET /v1/workflows/{id}", () =>
                      api.getWorkflowTrace("f3a0984c-789a-4c22-b5e1-0cde19842a3f")
                    )
                  }
                >
                  <Code2 className="h-4 w-4 mr-2 text-mint" />
                  GET /v1/workflows/{`{id}`}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    runApiTest("GET /v1/preferences", () => api.getPreferences())
                  }
                >
                  GET /v1/preferences
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="border-danger/30 text-danger hover:bg-danger/10"
                  onClick={() =>
                    runApiTest("Trigger 429 Budget Error", () =>
                      api.executeTask(
                        { skill: "summarize", input: {} },
                        "vk_exhausted"
                      )
                    )
                  }
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-danger" />
                  Trigger 429 (Typed)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="border-warn/30 text-warn hover:bg-warn/10"
                  onClick={() =>
                    runApiTest("Trigger 401 Unauthorized", () =>
                      api.executeTask(
                        { skill: "summarize", input: {} },
                        "invalid_key"
                      )
                    )
                  }
                >
                  <Key className="h-4 w-4 mr-2 text-warn" />
                  Trigger 401 (Typed)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="border-danger/30 text-danger hover:bg-danger/10"
                  onClick={() =>
                    runApiTest("Trigger 404 Not Found", () =>
                      api.getTaskTrace("not_found")
                    )
                  }
                >
                  Trigger 404 (Typed)
                </Button>
              </div>
            </div>

            {/* Output Display */}
            <div className="p-6 rounded-24 bg-surface border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-violet" />
                  <span className="font-heading font-semibold text-sm">
                    API Response & Trace Inspector
                  </span>
                </div>
                {apiStatus && (
                  <span className="font-mono text-xs text-mint flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {apiStatus}
                  </span>
                )}
              </div>

              <pre className="p-4 rounded-16 bg-black/80 border border-white/10 font-mono text-xs text-text overflow-x-auto min-h-[260px] max-h-[500px]">
                {isApiLoading ? (
                  <span className="text-muted animate-pulse">
                    Executing typed API request...
                  </span>
                ) : apiOutput ? (
                  apiOutput
                ) : (
                  <span className="text-muted">
                    Click any operation above to execute through the typed /lib/api client and inspect realistic task traces or mapped error responses.
                  </span>
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
