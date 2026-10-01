"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  Search,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Coins,
  ArrowRight,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  History,
} from "lucide-react";
import { useDashboard, RecentTrace } from "@/lib/dashboard-context";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { DemoDataPill } from "@/components/dashboard/DemoDataPill";
import { JsonViewer } from "@/components/dashboard/JsonViewer";
import { TaskTraceResponse, WorkflowTraceResponse } from "@/lib/api/types";
import { OrchestrixApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type TraceType = "task" | "workflow";

const SAMPLE_TRACE_IDS = {
  task: "7d91e3bf-1c4e-4b2a-89a1-52f01f8d9b1c",
  workflow: "f3a0984c-789a-4c22-b5e1-0cde19842a3f",
};

function TracesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    client,
    virtualKey,
    isMock,
    recentTraces,
    removeRecentTrace,
    clearRecentTraces,
  } = useDashboard();

  const [traceType, setTraceType] = useState<TraceType>("task");
  const [traceIdInput, setTraceIdInput] = useState<string>("");
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [taskTrace, setTaskTrace] = useState<TaskTraceResponse | null>(null);
  const [workflowTrace, setWorkflowTrace] = useState<WorkflowTraceResponse | null>(null);
  const [error, setError] = useState<Error | OrchestrixApiError | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"timeline" | "raw">("timeline");

  // Read URL query params on mount/change
  useEffect(() => {
    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type");

    if (idParam) {
      setTraceIdInput(idParam);
      setActiveTraceId(idParam);
      if (typeParam === "workflow" || typeParam === "task") {
        setTraceType(typeParam as TraceType);
      }
      fetchTrace(idParam, (typeParam as TraceType) || traceType);
    }
  }, [searchParams]);

  const fetchTrace = async (id: string, type: TraceType) => {
    if (!id.trim()) return;

    setIsLoading(true);
    setError(null);
    setTaskTrace(null);
    setWorkflowTrace(null);
    setActiveTraceId(id);

    try {
      if (type === "task") {
        const data = await client.getTaskTrace(id, virtualKey);
        setTaskTrace(data);
      } else {
        const data = await client.getWorkflowTrace(id, virtualKey);
        setWorkflowTrace(data);
      }
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Failed to fetch trace", 500, "Unknown Error");
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (traceIdInput.trim()) {
      fetchTrace(traceIdInput.trim(), traceType);
    }
  };

  const handleSelectRecent = (trace: RecentTrace) => {
    setTraceType(trace.type);
    setTraceIdInput(trace.id);
    fetchTrace(trace.id, trace.type);
  };

  const loadSample = (type: TraceType) => {
    const id = SAMPLE_TRACE_IDS[type];
    setTraceType(type);
    setTraceIdInput(id);
    fetchTrace(id, type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan" />
            <span>Execution Trace Inspector</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Audit single-turn attempts, bounded repair iterations, tool durations, and workflow step progressions.
          </p>
        </div>

        {/* Trace Type Toggle */}
        <div className="flex items-center p-1 rounded-12 bg-surface border border-border self-start sm:self-auto">
          <button
            onClick={() => setTraceType("task")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-10 text-xs font-semibold transition-all",
              traceType === "task"
                ? "bg-violet/20 text-text border border-violet/40 shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                : "text-muted hover:text-text"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>Task Trace</span>
          </button>

          <button
            onClick={() => setTraceType("workflow")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-10 text-xs font-semibold transition-all",
              traceType === "workflow"
                ? "bg-violet/20 text-text border border-violet/40 shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                : "text-muted hover:text-text"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-violet" />
            <span>Workflow Trace</span>
          </button>
        </div>
      </div>

      {/* Trace Search Input Bar */}
      <GlassCard className="p-0" innerClassName="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Enter ${traceType.toUpperCase()} Trace ID (e.g. ${
                traceType === "task" ? "7d91e3bf-..." : "f3a0984c-..."
              })`}
              value={traceIdInput}
              onChange={(e) => setTraceIdInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-12 bg-bg/90 border border-border focus:border-cyan text-xs font-mono text-text outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              disabled={!traceIdInput.trim() || isLoading}
              className="text-xs"
            >
              Fetch Trace
            </Button>

            <button
              type="button"
              onClick={() => loadSample(traceType)}
              className="px-3 py-2 rounded-10 bg-surface border border-border text-muted hover:text-text hover:bg-surface-hover text-xs font-mono transition-colors"
              title="Load standard sample trace"
            >
              Sample Trace
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Main Grid: History Drawer (4 cols) & Trace Timeline (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: LocalStorage History Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-0" innerClassName="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-violet" />
                <h3 className="font-heading font-semibold text-text text-xs uppercase tracking-wider">
                  Recent History
                </h3>
              </div>

              {recentTraces.length > 0 && (
                <button
                  onClick={clearRecentTraces}
                  className="text-[11px] font-mono text-muted hover:text-danger flex items-center gap-1 transition-colors"
                  title="Clear localStorage history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="p-2 rounded-8 bg-surface/40 border border-border/80 text-[11px] text-muted leading-relaxed">
              <span className="font-semibold text-text/90">Note:</span> Orchestrix backend is stateless and has no trace list endpoint. IDs are safely recorded in your browser&apos;s <strong className="text-cyan">localStorage</strong> upon execution.
            </div>

            {/* List of Recent Traces */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {recentTraces.length === 0 ? (
                <div className="text-center py-8 text-muted text-xs">
                  <p>No recent executions in browser history.</p>
                  <p className="text-[11px] text-muted/60 mt-1">
                    Execute a skill in the Playground or load a sample trace above.
                  </p>
                </div>
              ) : (
                recentTraces.map((item) => {
                  const isSelected = activeTraceId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecent(item)}
                      className={cn(
                        "p-3 rounded-12 border text-left cursor-pointer transition-all space-y-1.5 group relative",
                        isSelected
                          ? "bg-violet/15 border-violet/40 text-text shadow-[0_0_12px_rgba(124,92,255,0.15)]"
                          : "bg-surface border-border text-muted hover:text-text hover:bg-surface-hover"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-text text-xs truncate">
                          {item.name}
                        </span>
                        <Pill
                          variant={item.type === "workflow" ? "violet" : "cyan"}
                          size="sm"
                          className="text-[9px] uppercase tracking-wider font-mono py-0 px-1.5"
                        >
                          {item.type}
                        </Pill>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                        <span className="truncate max-w-[150px]">
                          {item.id.slice(0, 14)}...
                        </span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right: Trace Detail & Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="p-0 min-h-[500px] flex flex-col" innerClassName="p-5 flex flex-col h-full space-y-5">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-text text-sm">
                  {traceType === "task" ? "Task Trace Analysis" : "Workflow Trace Pipeline"}
                </h3>

                {isMock && <DemoDataPill />}

                {(taskTrace || workflowTrace) && (
                  <Pill
                    variant={
                      (taskTrace?.status || workflowTrace?.status) === "completed"
                        ? "mint"
                        : "danger"
                    }
                    size="sm"
                    dot
                  >
                    {taskTrace?.status || workflowTrace?.status}
                  </Pill>
                )}
              </div>

              {(taskTrace || workflowTrace) && (
                <div className="flex items-center p-0.5 rounded-8 bg-surface border border-border">
                  <button
                    onClick={() => setActiveViewTab("timeline")}
                    className={cn(
                      "px-2.5 py-1 rounded-6 text-xs font-medium transition-colors",
                      activeViewTab === "timeline"
                        ? "bg-violet/20 text-cyan border border-cyan/30"
                        : "text-muted hover:text-text"
                    )}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveViewTab("raw")}
                    className={cn(
                      "px-2.5 py-1 rounded-6 text-xs font-medium transition-colors",
                      activeViewTab === "raw"
                        ? "bg-violet/20 text-cyan border border-cyan/30"
                        : "text-muted hover:text-text"
                    )}
                  >
                    Raw Trace JSON
                  </button>
                </div>
              )}
            </div>

            {/* Trace Body */}
            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-cyan animate-spin" />
                  <p className="text-xs font-mono text-muted">
                    Retrieving execution trace from Orchestrix...
                  </p>
                </div>
              ) : error ? (
                <ErrorCard
                  error={error}
                  onRetry={() => fetchTrace(traceIdInput, traceType)}
                  className="my-auto"
                />
              ) : taskTrace ? (
                activeViewTab === "raw" ? (
                  <JsonViewer data={taskTrace} title="Task Trace JSON" className="flex-1" />
                ) : (
                  <div className="space-y-6">
                    {/* Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-12 bg-surface/50 border border-border text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Skill</span>
                        <div className="font-semibold text-cyan font-mono mt-0.5">
                          {taskTrace.skill}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Provider</span>
                        <div className="font-semibold text-text font-mono mt-0.5">
                          {taskTrace.provider || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Total Attempts</span>
                        <div className="font-semibold text-violet font-mono mt-0.5">
                          {taskTrace.attempts}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Total Tokens</span>
                        <div className="font-semibold text-mint font-mono mt-0.5">
                          {(taskTrace.usage?.prompt_tokens ?? 0) + (taskTrace.usage?.completion_tokens ?? 0)}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Attempt History */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-heading font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-cyan" />
                        <span>Execution Attempts ({taskTrace.attempt_history?.length || 0})</span>
                      </h4>

                      <div className="space-y-2.5">
                        {taskTrace.attempt_history?.map((attempt) => (
                          <div
                            key={attempt.attempt_number}
                            className="p-4 rounded-12 bg-bg/80 border border-border space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-violet/20 text-cyan flex items-center justify-center font-mono font-bold text-xs">
                                  #{attempt.attempt_number}
                                </span>
                                <div>
                                  <span className="font-semibold text-text text-xs">
                                    Attempt Type: <span className="font-mono text-violet">{attempt.attempt_type}</span>
                                  </span>
                                  <span className="text-[11px] font-mono text-muted ml-2">
                                    via <strong className="text-text">{attempt.provider}</strong>
                                  </span>
                                </div>
                              </div>

                              <Pill
                                variant={
                                  attempt.status === "completed"
                                    ? "mint"
                                    : "warn"
                                }
                                size="sm"
                              >
                                {attempt.status}
                              </Pill>
                            </div>

                            {/* Validation or Provider Error info if any */}
                            {attempt.validation_error_category && (
                              <div className="p-2 rounded-8 bg-warn/10 border border-warn/30 text-xs text-warn flex items-center gap-2 font-mono">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Validation Error Category: {attempt.validation_error_category}</span>
                              </div>
                            )}

                            {attempt.provider_error_category && (
                              <div className="p-2 rounded-8 bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2 font-mono">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Provider Error: {attempt.provider_error_category}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1 border-t border-border/60">
                              <span>Tokens: {attempt.usage?.prompt_tokens ?? 0} in / {attempt.usage?.completion_tokens ?? 0} out</span>
                              <span>{new Date(attempt.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tool Executions */}
                    {taskTrace.tool_history && taskTrace.tool_history.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-heading font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-mint" />
                          <span>Tool Executions ({taskTrace.tool_history.length})</span>
                        </h4>

                        <div className="space-y-2">
                          {taskTrace.tool_history.map((tool) => (
                            <div
                              key={tool.tool_number}
                              className="p-3 rounded-10 bg-bg/80 border border-border flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <Wrench className="w-4 h-4 text-mint flex-shrink-0" />
                                <div>
                                  <span className="font-mono font-semibold text-text">
                                    {tool.tool_name}
                                  </span>
                                  <span className="text-[11px] text-muted ml-2 font-mono">
                                    Duration: <strong className="text-cyan">{tool.duration_ms}ms</strong>
                                  </span>
                                </div>
                              </div>

                              <Pill variant={tool.status === "completed" ? "mint" : "danger"} size="sm">
                                {tool.status}
                              </Pill>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : workflowTrace ? (
                activeViewTab === "raw" ? (
                  <JsonViewer data={workflowTrace} title="Workflow Trace JSON" className="flex-1" />
                ) : (
                  <div className="space-y-6">
                    {/* Workflow Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-12 bg-surface/50 border border-border text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Workflow</span>
                        <div className="font-semibold text-violet font-mono mt-0.5">
                          {workflowTrace.workflow}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Steps Completed</span>
                        <div className="font-semibold text-text font-mono mt-0.5">
                          {workflowTrace.completed_steps} / {workflowTrace.step_count}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Total Attempts</span>
                        <div className="font-semibold text-cyan font-mono mt-0.5">
                          {workflowTrace.attempts}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Tools Invoked</span>
                        <div className="font-semibold text-mint font-mono mt-0.5">
                          {workflowTrace.tool_count}
                        </div>
                      </div>
                    </div>

                    {/* Step Progression Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-heading font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-violet" />
                        <span>Workflow Pipeline Steps</span>
                      </h4>

                      <div className="space-y-2.5">
                        {workflowTrace.steps?.map((step) => (
                          <div
                            key={step.step_order}
                            className="p-4 rounded-12 bg-bg/80 border border-border space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-violet/20 text-cyan flex items-center justify-center font-mono font-bold text-xs">
                                  {step.step_order}
                                </div>
                                <div>
                                  <p className="font-semibold text-text text-xs">{step.name}</p>
                                  <p className="text-[11px] font-mono text-muted">
                                    Skill: <span className="text-text">{step.skill}</span> • Provider:{" "}
                                    <span className="text-cyan">{step.provider || "N/A"}</span> • {step.attempts} attempt(s)
                                  </p>
                                </div>
                              </div>

                              <Pill
                                variant={
                                  step.status === "completed"
                                    ? "mint"
                                    : step.status === "running"
                                    ? "cyan"
                                    : "warn"
                                }
                                size="sm"
                              >
                                {step.status}
                              </Pill>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1 border-t border-border/60">
                              <span>Tokens: {step.usage?.prompt_tokens ?? 0} in / {step.usage?.completion_tokens ?? 0} out</span>
                              <span>Tools used: {step.tool_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted border border-dashed border-border/80 rounded-16 bg-surface/10 space-y-3">
                  <div className="p-3 rounded-full bg-surface border border-border text-muted">
                    <Activity className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">No Trace Loaded</p>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Enter a Task or Workflow Trace ID above, pick from Recent History, or click{" "}
                      <strong className="text-cyan">Sample Trace</strong> to inspect an execution graph.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function TracesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-cyan animate-spin" />
        </div>
      }
    >
      <TracesContent />
    </Suspense>
  );
}
