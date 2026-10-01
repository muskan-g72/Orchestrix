"use client";

import React from "react";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/utils";

export interface DemoDataPillProps {
  className?: string;
  tooltip?: string;
  size?: "sm" | "md";
}

export function DemoDataPill({
  className,
  tooltip = "Mock deterministic response",
  size = "sm",
}: DemoDataPillProps) {
  return (
    <span title={tooltip} className="inline-flex">
      <Pill
        variant="warn"
        size={size}
        dot
        className={cn(
          "bg-warn/15 border-warn/40 text-warn shadow-[0_0_10px_rgba(251,191,36,0.2)] font-mono uppercase tracking-wider text-[10px]",
          className
        )}
      >
        Demo Data
      </Pill>
    </span>
  );
}
