import React from "react";
import { cn } from "@/lib/utils";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "cyan" | "mint" | "danger" | "warn";
  size?: "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export function Pill({
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  children,
  className,
  ...props
}: PillProps) {
  const variantStyles = {
    default: "bg-surface border-border text-muted",
    violet: "bg-violet/10 border-violet/30 text-violet shadow-[0_0_12px_rgba(124,92,255,0.15)]",
    cyan: "bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_12px_rgba(34,211,238,0.15)]",
    mint: "bg-mint/10 border-mint/30 text-mint shadow-[0_0_12px_rgba(94,234,212,0.15)]",
    danger: "bg-danger/10 border-danger/30 text-danger shadow-[0_0_12px_rgba(248,113,113,0.15)]",
    warn: "bg-warn/10 border-warn/30 text-warn shadow-[0_0_12px_rgba(251,191,36,0.15)]",
  };

  const dotColors = {
    default: "bg-muted",
    violet: "bg-violet",
    cyan: "bg-cyan",
    mint: "bg-mint",
    danger: "bg-danger",
    warn: "bg-warn",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-mono tracking-tight",
    md: "px-3 py-1 text-xs font-mono tracking-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors select-none font-medium",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
