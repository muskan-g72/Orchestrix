"use client";

import React from "react";
import { Loader2, Zap, ArrowRight, X } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Button } from "@/components/Button";

export function ColdStartBanner() {
  const { healthStatus, toggleMock, isMock, checkHealth } = useDashboard();
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || isMock || (healthStatus !== "waking" && healthStatus !== "checking")) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-violet/20 via-cyan/20 to-violet/20 border-b border-violet/30 px-4 py-2.5 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-text flex-1">
          <Loader2 className="w-4 h-4 text-cyan animate-spin flex-shrink-0" />
          <span>
            <strong className="text-cyan font-medium">Gateway Cold-Start:</strong>{" "}
            <span className="text-muted hidden md:inline">
              Orchestrix backend is waking up from sleep (~45–60s on Render free-tier).
            </span>{" "}
            Live calls will queue or retry.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleMock}
            className="py-1 px-2.5 text-xs bg-bg/80 border-cyan/40 text-cyan hover:bg-cyan/10"
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            Switch to Mock Mode
          </Button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-muted hover:text-text rounded-md transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
