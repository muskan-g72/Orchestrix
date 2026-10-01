"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/Pill";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { Layers, ExternalLink, Terminal, Shield } from "lucide-react";

export function Navbar() {
  const [isAwake, setIsAwake] = useState<boolean | null>(null);

  useEffect(() => {
    // Ping healthz proxy
    api
      .getHealth()
      .then((res) => setIsAwake(res.status === "ok"))
      .catch(() => setIsAwake(false));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090B]/85 backdrop-blur-xl border-b border-border/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-12 bg-gradient-to-br from-violet to-cyan flex items-center justify-center shadow-glow-violet/30 transition-transform duration-300 group-hover:scale-105">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-text">
            Orchestrix
          </span>
          <span className="hidden sm:inline-block">
            <Pill variant="mint" size="sm" dot pulse>
              Deterministic Gateway
            </Pill>
          </span>
        </Link>

        {/* Section Anchors */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-muted">
          <a href="#lifecycle" className="hover:text-text transition-colors">
            Lifecycle
          </a>
          <a href="#capabilities" className="hover:text-text transition-colors">
            Capabilities
          </a>
          <a href="#architecture" className="hover:text-text transition-colors">
            Architecture
          </a>
          <a href="#timeline" className="hover:text-text transition-colors">
            Timeline
          </a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="https://orchestrix-yc6s.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="secondary" size="sm">
              API Docs
              <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
            </Button>
          </a>

          <a href="#timeline">
            <Button variant="primary" size="sm">
              <Terminal className="h-3.5 w-3.5 mr-1.5" />
              Audit Console
            </Button>
          </a>
        </div>
      </div>
    </nav>
  );
}
