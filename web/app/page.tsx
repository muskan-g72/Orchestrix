"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { FutureCharacterSlot } from "@/components/landing/FutureCharacterSlot";
import { RequestLifecycle } from "@/components/landing/RequestLifecycle";
import { CapabilitiesCubes } from "@/components/landing/CapabilitiesCubes";
import { ArchitectureDiagram } from "@/components/landing/ArchitectureDiagram";
import { ExecutionTimeline } from "@/components/landing/ExecutionTimeline";
import { MetricsStrip } from "@/components/landing/MetricsStrip";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  Cpu,
} from "lucide-react";

// Lazy-load React Three Fiber Canvas with SSR false for Lighthouse performance >= 90
const HeroNetworkScene = dynamic(
  () =>
    import("@/components/landing/HeroNetworkScene").then(
      (mod) => mod.HeroNetworkScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] lg:h-[560px] flex items-center justify-center">
        <div className="font-mono text-xs text-muted flex items-center gap-2 animate-pulse">
          <Activity className="h-4 w-4 text-cyan" />
          <span>Mounting 3D Execution Graph...</span>
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden">
      {/* 1. Aurora Blurred Background (Graphite control room atmosphere) */}
      <AuroraBackground />

      {/* Navigation Bar */}
      <Navbar />

      {/* SECTION 1: HERO (SPLIT) */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Control Room Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill variant="mint" dot pulse size="sm">
                Control Room Active
              </Pill>
              <Pill variant="violet" size="sm">
                FastAPI Gateway
              </Pill>
              <Pill variant="cyan" size="sm">
                Deterministic
              </Pill>
            </div>

            {/* Brand Title: Orchestrix (H1 fluid clamp up to ~80px) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-tighter text-text leading-none">
              Orchestrix
            </h1>

            {/* Tagline */}
            <p className="font-heading font-medium text-xl sm:text-2xl lg:text-3xl text-cyan tracking-tight">
              AI execution you can audit.
            </p>

            {/* Product Truth Summary */}
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl">
              Deterministic AI execution gateway with virtual-key authentication, atomic
              PostgreSQL budget reservation, Groq primary with Gemini fallback, strict JSON
              validation with bounded one-cycle repair, allowlisted tools, and persistent
              traces.
            </p>

            {/* Product Truth Badge */}
            <div className="p-3.5 rounded-16 bg-surface border border-violet/20 flex items-start gap-2.5 text-xs text-muted max-w-lg">
              <ShieldCheck className="h-4 w-4 text-violet shrink-0 mt-0.5" />
              <span>
                <strong className="text-text">Product Truth: </strong>
                Orchestrix has <strong>no autonomous planner or agent framework</strong>.
                Every request follows predeclared, auditable code paths.
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  Open dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <a
                href="https://orchestrix-yc6s.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="lg">
                  View API docs
                  <ExternalLink className="h-4 w-4 ml-2 opacity-70" />
                </Button>
              </a>
            </div>

            {/* Reserved slot component for future 3D character GLB */}
            <FutureCharacterSlot className="mt-2" />
          </div>

          {/* Hero Right (6 cols): React Three Fiber Interactive Network */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-24 border border-border/80 bg-[#09090B]/50 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <Pill variant="violet" size="sm" dot>
                  Execution Topology
                </Pill>
                <span className="font-mono text-[10px] text-muted hidden sm:inline">
                  Interactive Gateway Graph &bull; Dual Fallback
                </span>
              </div>

              {/* R3F Canvas */}
              <HeroNetworkScene />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 (METRICS STRIP): Displayed as live health indicator strip right under hero */}
      <MetricsStrip />

      {/* SECTION 2: REQUEST LIFECYCLE */}
      <div id="lifecycle">
        <RequestLifecycle />
      </div>

      {/* SECTION 3: CAPABILITIES */}
      <div id="capabilities">
        <CapabilitiesCubes />
      </div>

      {/* SECTION 4: ARCHITECTURE */}
      <div id="architecture">
        <ArchitectureDiagram />
      </div>

      {/* SECTION 5: EXECUTION TIMELINE */}
      <div id="timeline">
        <ExecutionTimeline />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
