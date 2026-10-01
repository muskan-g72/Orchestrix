"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  KeyRound,
  FileQuestion,
  Layers,
  ZapOff,
  ServerCrash,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { OrchestrixApiError } from "@/lib/api/errors";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { useDashboard } from "@/lib/dashboard-context";
import { cn } from "@/lib/utils";

interface ErrorCardProps {
  error: Error | OrchestrixApiError | string | null;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorCard({
  error,
  onRetry,
  className,
  compact = false,
}: ErrorCardProps) {
  const { setVirtualKey, toggleMock, isMock } = useDashboard();
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const isApiError = error instanceof OrchestrixApiError;
  const status = isApiError ? error.status : 0;
  const message = typeof error === "string" ? error : error.message;
  const detail = isApiError ? error.detail : undefined;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          status,
          message,
          detail,
          errorObject: error,
        },
        null,
        2
      )
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorMeta = () => {
    switch (status) {
      case 401:
        return {
          title: "Virtual Key Authentication Failed (401)",
          icon: KeyRound,
          variant: "danger" as const,
          explanation:
            "The active virtual key is missing, unregistered, or invalid. Orchestrix requires a valid Bearer token for protected execution endpoints.",
          remediation:
            "Switch the active virtual key in the top bar to 'vk_open' (or valid configured key) or switch to Mock Mode.",
          quickAction: {
            label: "Switch to vk_open",
            onClick: () => setVirtualKey("vk_open"),
          },
        };
      case 404:
        return {
          title: "Resource or Trace Not Found (404)",
          icon: FileQuestion,
          variant: "warn" as const,
          explanation:
            "The requested skill, workflow, or execution trace does not exist or was created under a different virtual key (cross-key trace access is restricted).",
          remediation:
            "Verify the trace ID string, check if the skill name is spelled correctly (summarize, extract_action_items), or make sure your active virtual key matches the one used to execute.",
        };
      case 422:
        return {
          title: "Input Schema Validation Error (422)",
          icon: Layers,
          variant: "warn" as const,
          explanation:
            "The input payload failed Pydantic schema validation. Required parameters might be missing or formatted incorrectly.",
          remediation:
            "Ensure the input object matches the skill or workflow schema (e.g. { \"text\": \"...\" } for summarize).",
        };
      case 429:
        return {
          title: "Virtual Key Budget Exhausted (429)",
          icon: ZapOff,
          variant: "danger" as const,
          explanation:
            "The current virtual key has zero remaining request budget. Orchestrix PostgreSQL atomic locks strictly enforce budgets to prevent unbounded spending.",
          remediation:
            "Keys like vk_tiny or vk_edge have small test budgets. Switch to 'vk_open' for standard testing or toggle Mock Mode.",
          quickAction: {
            label: "Switch to vk_open",
            onClick: () => setVirtualKey("vk_open"),
          },
        };
      case 500:
        return {
          title: "Gateway Internal Error (500)",
          icon: ServerCrash,
          variant: "danger" as const,
          explanation:
            "The Orchestrix gateway encountered an unexpected internal error or database connection issue during execution recording.",
          remediation:
            "Check gateway deployment logs or switch to Mock Mode to continue developing UI workflows.",
          quickAction: !isMock
            ? {
                label: "Switch to Mock Mode",
                onClick: () => toggleMock(),
              }
            : undefined,
        };
      case 502:
        return {
          title: "Upstream Provider Unavailable (502)",
          icon: ServerCrash,
          variant: "danger" as const,
          explanation:
            "Both Groq primary and Gemini fallback failed, or bounded schema repair attempts exceeded limits.",
          remediation:
            "Verify upstream API keys on the server or try again in a few seconds.",
        };
      default:
        return {
          title: "Gateway Request Error",
          icon: AlertTriangle,
          variant: "danger" as const,
          explanation:
            message || "An unexpected error occurred while communicating with Orchestrix.",
          remediation:
            "Check network connectivity to the gateway or toggle Mock Mode to use local deterministic mock handlers.",
          quickAction: !isMock
            ? {
                label: "Toggle Mock Mode",
                onClick: () => toggleMock(),
              }
            : undefined,
        };
    }
  };

  const meta = getErrorMeta();
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "rounded-16 border p-5 transition-all",
        meta.variant === "danger"
          ? "bg-danger/10 border-danger/30 text-text shadow-[0_0_20px_rgba(248,113,113,0.15)]"
          : "bg-warn/10 border-warn/30 text-text shadow-[0_0_20px_rgba(251,191,36,0.15)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2.5 rounded-12 flex-shrink-0 mt-0.5",
              meta.variant === "danger"
                ? "bg-danger/20 text-danger"
                : "bg-warn/20 text-warn"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-heading font-semibold text-text text-sm sm:text-base">
                {meta.title}
              </h4>
              {status > 0 && (
                <Pill
                  variant={meta.variant}
                  size="sm"
                  className="font-mono text-[10px]"
                >
                  HTTP {status}
                </Pill>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
              {meta.explanation}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          title="Copy error details"
          className="p-1.5 rounded-8 text-muted hover:text-text hover:bg-surface-hover transition-colors flex-shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-mint" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {!compact && (
        <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
          <div className="text-xs font-mono text-muted/90 bg-bg/60 p-2.5 rounded-8 overflow-x-auto border border-border">
            <span className="text-violet select-none">detail: </span>
            {detail || message}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
            <span className="text-xs text-muted flex items-center gap-1.5">
              💡 <span className="font-medium text-text/80">Suggestion:</span>{" "}
              {meta.remediation}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {meta.quickAction && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={meta.quickAction.onClick}
                  className="text-xs"
                >
                  {meta.quickAction.label}
                </Button>
              )}
              {onRetry && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onRetry}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
