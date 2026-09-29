"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      magnetic = true,
      isLoading = false,
      disabled,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (forwardedRef || internalRef) as React.RefObject<HTMLButtonElement>;
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || disabled || isLoading) return;

      const element = buttonRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Max magnetic displacement 8px as required
      const MAX_DISPLACEMENT = 8;
      const moveX = Math.max(
        -MAX_DISPLACEMENT,
        Math.min(MAX_DISPLACEMENT, (distanceX / (rect.width / 2)) * MAX_DISPLACEMENT)
      );
      const moveY = Math.max(
        -MAX_DISPLACEMENT,
        Math.min(MAX_DISPLACEMENT, (distanceY / (rect.height / 2)) * MAX_DISPLACEMENT)
      );

      setOffset({ x: moveX, y: moveY });
      onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic) {
        setOffset({ x: 0, y: 0 });
      }
      onMouseLeave?.(e);
    };

    const sizeStyles = {
      sm: "px-3.5 py-1.5 text-xs font-medium rounded-12 gap-1.5",
      md: "px-5 py-2.5 text-sm font-semibold rounded-12 gap-2",
      lg: "px-6 py-3.5 text-base font-semibold rounded-16 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-violet via-[#896BFF] to-cyan text-white shadow-glow-violet/30 hover:shadow-glow-violet/60 active:scale-[0.98] border border-white/20",
      secondary:
        "bg-surface border border-border text-text hover:bg-surface-hover hover:border-border-hover active:scale-[0.98]",
    };

    return (
      <motion.button
        ref={buttonRef}
        animate={{ x: offset.x, y: offset.y }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          mass: 0.8,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-heading select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...(props as any)}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
