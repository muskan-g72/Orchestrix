import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: "12" | "16" | "24";
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  innerClassName,
  radius = "16",
  glow = false,
  ...props
}: GlassCardProps) {
  const radiusMap = {
    "12": { outer: "rounded-12", inner: "rounded-[11px]" },
    "16": { outer: "rounded-16", inner: "rounded-[15px]" },
    "24": { outer: "rounded-24", inner: "rounded-[23px]" },
  };

  return (
    <div
      className={cn(
        "relative p-[1px] bg-gradient-to-br from-violet/30 via-violet/10 to-cyan/30 transition-all duration-300",
        radiusMap[radius].outer,
        glow && "hover:shadow-glow-violet/40 hover:from-violet/50 hover:to-cyan/50",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full h-full bg-[#09090B]/90 backdrop-blur-xl p-6 transition-colors",
          radiusMap[radius].inner,
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
