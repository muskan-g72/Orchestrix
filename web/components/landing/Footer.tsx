import React from "react";
import { Pill } from "@/components/Pill";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#09090B] py-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Product Truth Notice Box */}
        <div className="p-6 rounded-24 bg-surface border border-violet/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-violet shrink-0 mt-0.5" />
            <div className="text-xs text-muted leading-relaxed">
              <strong className="text-text">Product Truth:</strong> Orchestrix is a deterministic
              FastAPI AI execution gateway (virtual-key auth, atomic budget reservation, Groq primary
              + Gemini fallback, YAML skills, JSON validation with one repair, allowlisted tools, fixed
              workflows, persistent traces). It has <strong>no autonomous planner or agent framework</strong>.
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Pill variant="mint" size="sm" dot>
              Zero Speculation
            </Pill>
            <Pill variant="cyan" size="sm">
              FastAPI + Postgres
            </Pill>
          </div>
        </div>

        {/* Links and Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60 text-xs font-mono text-muted">
          <div>
            &copy; 2026 Orchestrix Gateway. Deterministic execution platform.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/muskan-g72/Orchestrix"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              GitHub Repository
              <ArrowUpRight className="h-3 w-3 opacity-70" />
            </a>
            <a
              href="https://orchestrix-yc6s.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              Swagger Docs
              <ArrowUpRight className="h-3 w-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
