"use client";

import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Eye, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: unknown;
  title?: string;
  className?: string;
  initialCollapsed?: boolean;
  maxHeight?: string;
}

export function JsonViewer({
  data,
  title = "Payload",
  className,
  initialCollapsed = false,
  maxHeight = "max-h-96",
}: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighter helper
  const highlightJson = (jsonStr: string) => {
    return jsonStr.split("\n").map((line, idx) => {
      // Highlight keys, strings, numbers, booleans, nulls
      const highlighted = line.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "text-[#22D3EE]"; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "text-[#7C5CFF] font-medium"; // key
            } else {
              cls = "text-[#5EEAD4]"; // string
            }
          } else if (/true|false/.test(match)) {
            cls = "text-[#FBBF24]"; // boolean
          } else if (/null/.test(match)) {
            cls = "text-[#F87171]"; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );

      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-4 text-right select-none text-muted/40 font-mono text-[11px]">
            {idx + 1}
          </span>
          <span
            className="table-cell whitespace-pre font-mono text-xs text-text/90"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      );
    });
  };

  return (
    <div
      className={cn(
        "rounded-12 border border-border bg-[#09090B]/80 overflow-hidden font-mono text-xs shadow-inner backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center justify-between px-3.5 py-2 bg-surface border-b border-border/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-muted hover:text-text font-medium text-xs transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <Code className="w-3.5 h-3.5 text-violet" />
          <span>{title}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-hover transition-colors flex items-center gap-1 text-[11px] px-2"
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-mint" />
                <span className="text-mint">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          className={cn(
            "p-3 overflow-auto bg-[#070709]/90 custom-scrollbar",
            maxHeight
          )}
        >
          <div className="table w-full border-collapse">
            {highlightJson(formattedJson)}
          </div>
        </div>
      )}
    </div>
  );
}
