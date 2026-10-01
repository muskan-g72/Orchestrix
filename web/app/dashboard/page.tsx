"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  Play,
  RotateCcw,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  ArrowRight,
  FileText,
  ListOrdered,
  CheckSquare,
  Copy,
  Check,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { DemoDataPill } from "@/components/dashboard/DemoDataPill";
import { JsonViewer } from "@/components/dashboard/JsonViewer";
import { TaskResponse, WorkflowResponse } from "@/lib/api/types";
import { OrchestrixApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ExecutionMode = "skill" | "workflow";

const PRESET_DATA = {
  summarize: {
    title: "Orchestrix Gateway Architecture",
    text: `Orchestrix is a deterministic AI execution gateway built on FastAPI. Unlike autonomous agent frameworks that rely on uncontrolled loops and unbounded self-reflection, Orchestrix provides strict, predeclared execution paths. 

Key architectural components include:
1. Virtual Key Authentication & PostgreSQL Admission: Atomic reservation prevents concurrency race conditions and guarantees zero-budget overspending.
2. Dual-Provider Routing: Groq serves as the primary ultra-fast provider, with Gemini as the automatic operational fallback.
3. Schema Validation & Bounded Repair: Structured outputs are validated against Pydantic schemas. If validation fails, exactly one bounded repair attempt is made.
4. Auditable Tracing: Persistent traces capture attempt numbers, durations, tool execution logs, and error categories without leaking API secrets.`,
  },
  extract_action_items: {
    title: "Engineering Sprint Sync Meeting",
    text: `Sprint 42 Sync Notes - September 28:
- Sarah: Finalize OpenAPI security scheme and verify Swagger authorize button by Wednesday EOD.
- Alex: Migrate PostgreSQL virtual-key reservation queries to use FOR UPDATE lock to eliminate race conditions by Thursday.
- Jordan: Benchmark Groq primary provider response latency vs Gemini fallback under 500 concurrent requests before Friday release.
- Muskan: Connect Next.js 14 App Router dashboard with live and mock toggle switches.`,
  },
  article_processing: {
    title: "Deterministic AI Systems Whitepaper",
    text: `Modern production software demands predictability, latency SLAs, and verifiable guardrails. Generative LLMs are non-deterministic by nature, but AI execution gateways restore enterprise guarantees.

By constraining LLMs to single-turn schema validation, bounded repair policies, and explicit workflow graphs, engineers eliminate infinite token loops while maximizing throughput. Orchestrix proves that robust AI applications do not require unpredictable autonomous agents.`,
  },
};

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { client, virtualKey, isMock, addRecentTrace } = useDashboard();

  const [mode, setMode] = useState<ExecutionMode>("skill");
  const [selectedSkill, setSelectedSkill] = useState<string>("summarize");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("article_processing");
  const [inputText, setInputText] = useState<string>(PRESET_DATA.summarize.text);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [result, setResult] = useState<TaskResponse | WorkflowResponse | null>(null);
  const [error, setError] = useState<Error | OrchestrixApiError | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<"visual" | "json">("visual");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Sync with URL params if provided
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const nameParam = searchParams.get("name");

    if (tabParam === "workflow") {
      setMode("workflow");
      if (nameParam) setSelectedWorkflow(nameParam);
      setInputText(PRESET_DATA.article_processing.text);
    } else if (tabParam === "skill") {
      setMode("skill");
      if (nameParam === "extract_action_items") {
        setSelectedSkill("extract_action_items");
        setInputText(PRESET_DATA.extract_action_items.text);
      } else {
        setSelectedSkill("summarize");
        setInputText(PRESET_DATA.summarize.text);
      }
    }
  }, [searchParams]);

  // Handle switching mode
  const handleModeChange = (newMode: ExecutionMode) => {
    setMode(newMode);
    setError(null);
    setResult(null);
    if (newMode === "skill") {
      setInputText(
        selectedSkill === "extract_action_items"
          ? PRESET_DATA.extract_action_items.text
          : PRESET_DATA.summarize.text
      );
    } else {
      setInputText(PRESET_DATA.article_processing.text);
    }
  };

  const handleSkillChange = (skillName: string) => {
    setSelectedSkill(skillName);
    setError(null);
    if (skillName === "extract_action_items") {
      setInputText(PRESET_DATA.extract_action_items.text);
    } else {
      setInputText(PRESET_DATA.summarize.text);
    }
  };

  const loadPreset = (presetKey: keyof typeof PRESET_DATA) => {
    setInputText(PRESET_DATA[presetKey].text);
  };

  // Run execution
  const handleExecute = async () => {
    if (!inputText.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);
    setResult(null);
    setElapsedTimeMs(0);
    startTimeRef.current = performance.now();

    timerRef.current = setInterval(() => {
      setElapsedTimeMs(Math.round(performance.now() - startTimeRef.current));
    }, 50);

    try {
      if (mode === "skill") {
        const res = await client.executeTask(
          {
            skill: selectedSkill,
            input: { text: inputText },
          },
          virtualKey
        );

        const duration = Math.round(performance.now() - startTimeRef.current);
        setElapsedTimeMs(duration);
        setResult(res);

        // Record in recent traces
        addRecentTrace({
          id: res.task_id,
          type: "task",
          name: `Skill: ${res.skill}`,
          status: "completed",
          provider: res.provider,
          attempts: res.attempts,
        });
      } else {
        const res = await client.executeWorkflow(
          {
            workflow: selectedWorkflow,
            input: { text: inputText },
          },
          virtualKey
        );

        const duration = Math.round(performance.now() - startTimeRef.current);
        setElapsedTimeMs(duration);
        setResult(res);

        // Record in recent traces
        addRecentTrace({
          id: res.workflow_id,
          type: "workflow",
          name: `Workflow: ${res.workflow}`,
          status: "completed",
          attempts: res.steps.reduce((acc, s) => acc + s.attempts, 0),
        });
      }
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Execution failed", 500, "Unknown Error");
      setError(errorObj);
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const isWorkflow = mode === "workflow";
  const currentId = result
    ? "task_id" in result
      ? result.task_id
      : result.workflow_id
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan" />
            <span>Execution Playground</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Test skills and deterministic workflow graphs with schema validation and fallback routing.
          </p>
        </div>

        {/* Skill vs Workflow Selector Tabs */}
        <div className="flex items-center p-1 rounded-12 bg-surface border border-border self-start sm:self-auto">
          <button
            onClick={() => handleModeChange("skill")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-10 text-xs font-semibold transition-all",
              mode === "skill"
                ? "bg-violet/20 text-text border border-violet/40 shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                : "text-muted hover:text-text"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>Skills (Single Turn)</span>
          </button>

          <button
            onClick={() => handleModeChange("workflow")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-10 text-xs font-semibold transition-all",
              mode === "workflow"
                ? "bg-violet/20 text-text border border-violet/40 shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                : "text-muted hover:text-text"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-violet" />
            <span>Workflows (Pipeline)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form (Left) & Output Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-0" innerClassName="p-5 space-y-4">
            {/* Target Selector */}
            {mode === "skill" ? (
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between">
                  <span>Select Skill</span>
                  <span className="text-[11px] text-cyan font-mono lowercase">POST /v1/tasks/execute</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSkillChange("summarize")}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-10 border text-left transition-all text-xs",
                      selectedSkill === "summarize"
                        ? "bg-violet/15 border-violet/40 text-text shadow-[0_0_12px_rgba(124,92,255,0.15)]"
                        : "bg-surface border-border text-muted hover:text-text hover:bg-surface-hover"
                    )}
                  >
                    <FileText className="w-4 h-4 text-cyan flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-text">summarize</div>
                      <div className="text-[10px] text-muted">Key points & time</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSkillChange("extract_action_items")}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-10 border text-left transition-all text-xs",
                      selectedSkill === "extract_action_items"
                        ? "bg-violet/15 border-violet/40 text-text shadow-[0_0_12px_rgba(124,92,255,0.15)]"
                        : "bg-surface border-border text-muted hover:text-text hover:bg-surface-hover"
                    )}
                  >
                    <CheckSquare className="w-4 h-4 text-mint flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-text">extract_action_items</div>
                      <div className="text-[10px] text-muted">Tasks & assignees</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between">
                  <span>Select Workflow</span>
                  <span className="text-[11px] text-violet font-mono lowercase">POST /v1/workflows/execute</span>
                </label>
                <div className="p-3 rounded-10 border border-violet/40 bg-violet/10 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-violet" />
                      article_processing
                    </span>
                    <Pill variant="violet" size="sm">
                      3 Steps
                    </Pill>
                  </div>
                  <p className="text-[11px] text-muted">
                    Predeclared sequence: Summarize → Extract Action Items → Text Statistics
                  </p>
                </div>
              </div>
            )}

            {/* Input Textarea & Preset Loader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-mono uppercase tracking-wider text-muted">
                  Input Payload ({inputText.length} chars)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted/60">Presets:</span>
                  <button
                    onClick={() =>
                      loadPreset(
                        mode === "skill"
                          ? (selectedSkill as keyof typeof PRESET_DATA)
                          : "article_processing"
                      )
                    }
                    className="text-[11px] text-cyan hover:underline font-mono"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to process..."
                rows={10}
                className="w-full rounded-12 bg-bg/90 border border-border p-3 text-xs font-mono text-text placeholder:text-muted/40 focus:border-cyan focus:outline-none transition-colors resize-y leading-relaxed"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <kbd className="bg-surface px-1.5 py-0.5 rounded border border-border text-[10px]">
                  ⌘↵
                </kbd>
                <span>to execute</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExecute}
                  isLoading={isRunning}
                  disabled={!inputText.trim() || isRunning}
                  className="gap-2 text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isRunning ? `Running (${(elapsedTimeMs / 1000).toFixed(1)}s)...` : "Run Execution"}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Output & Execution Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-0 h-full flex flex-col" innerClassName="p-5 flex flex-col h-full space-y-4">
            {/* Header with Badges & Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-text text-sm">
                  Execution Output
                </h3>

                {isMock && <DemoDataPill />}

                {result && (
                  <>
                    <Pill variant="mint" size="sm" dot>
                      {result.status}
                    </Pill>

                    {"provider" in result && (
                      <Pill
                        variant={result.provider === "groq" ? "cyan" : "violet"}
                        size="sm"
                      >
                        <Cpu className="w-3 h-3 mr-1 inline" />
                        {result.provider}
                      </Pill>
                    )}

                    {"attempts" in result && (
                      <Pill
                        variant={result.attempts === 1 ? "default" : "warn"}
                        size="sm"
                      >
                        {result.attempts} {result.attempts === 1 ? "attempt" : "attempts (repair)"}
                      </Pill>
                    )}
                  </>
                )}
              </div>

              {/* Output Tab switcher */}
              {result && (
                <div className="flex items-center p-0.5 rounded-8 bg-surface border border-border">
                  <button
                    onClick={() => setActiveOutputTab("visual")}
                    className={cn(
                      "px-2.5 py-1 rounded-6 text-xs font-medium transition-colors",
                      activeOutputTab === "visual"
                        ? "bg-violet/20 text-cyan border border-cyan/30"
                        : "text-muted hover:text-text"
                    )}
                  >
                    Structured View
                  </button>
                  <button
                    onClick={() => setActiveOutputTab("json")}
                    className={cn(
                      "px-2.5 py-1 rounded-6 text-xs font-medium transition-colors",
                      activeOutputTab === "json"
                        ? "bg-violet/20 text-cyan border border-cyan/30"
                        : "text-muted hover:text-text"
                    )}
                  >
                    Raw JSON
                  </button>
                </div>
              )}
            </div>

            {/* Metrics Bar */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-12 bg-surface/50 border border-border text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-muted">Latency</span>
                  <div className="font-mono font-semibold text-text flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan" />
                    {elapsedTimeMs} ms
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-muted">Tokens In</span>
                  <div className="font-mono font-semibold text-text flex items-center gap-1">
                    <Coins className="w-3 h-3 text-violet" />
                    {result.usage?.prompt_tokens ?? 0}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-muted">Tokens Out</span>
                  <div className="font-mono font-semibold text-text flex items-center gap-1">
                    <Coins className="w-3 h-3 text-mint" />
                    {result.usage?.completion_tokens ?? 0}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-muted">Trace Link</span>
                  <div>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/traces?id=${currentId}&type=${mode}`
                        )
                      }
                      className="font-mono text-cyan hover:underline text-[11px] flex items-center gap-1"
                    >
                      <span>Inspect Trace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area: Loading / Error / Empty / Result */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              {isRunning ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-violet/20 border-t-cyan animate-spin" />
                    <Sparkles className="w-5 h-5 text-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-text text-sm">
                      Executing on Orchestrix Gateway...
                    </p>
                    <p className="text-xs text-muted font-mono mt-1">
                      Elapsed: {(elapsedTimeMs / 1000).toFixed(2)}s • Key: {virtualKey}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <ErrorCard error={error} onRetry={handleExecute} className="my-auto" />
              ) : result ? (
                activeOutputTab === "json" ? (
                  <JsonViewer data={result} title="Full Gateway Response" className="flex-1" />
                ) : (
                  <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                    {/* Visual Rendering based on output */}
                    {"output" in result && (
                      <div className="space-y-4">
                        {/* If output has summary */}
                        {typeof result.output.summary === "string" && (
                          <div className="p-4 rounded-12 bg-bg/80 border border-border space-y-2">
                            <span className="text-xs font-mono uppercase tracking-wider text-cyan">
                              Executive Summary
                            </span>
                            <p className="text-xs sm:text-sm text-text leading-relaxed">
                              {result.output.summary}
                            </p>
                          </div>
                        )}

                        {/* If output has key_points */}
                        {Array.isArray(result.output.key_points) && (
                          <div className="p-4 rounded-12 bg-bg/80 border border-border space-y-2">
                            <span className="text-xs font-mono uppercase tracking-wider text-violet">
                              Key Points ({result.output.key_points.length})
                            </span>
                            <ul className="space-y-1.5 text-xs sm:text-sm">
                              {result.output.key_points.map((point: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-text/90">
                                  <CheckCircle2 className="w-4 h-4 text-mint mt-0.5 flex-shrink-0" />
                                  <span>{String(point)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* If output has action_items */}
                        {Array.isArray(result.output.action_items) && (
                          <div className="p-4 rounded-12 bg-bg/80 border border-border space-y-3">
                            <span className="text-xs font-mono uppercase tracking-wider text-mint">
                              Action Items ({result.output.action_items.length})
                            </span>
                            <div className="space-y-2">
                              {result.output.action_items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-10 bg-surface border border-border flex items-start justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-1">
                                    <p className="font-medium text-text">
                                      {item.task || item.description || JSON.stringify(item)}
                                    </p>
                                    {item.owner && (
                                      <p className="text-muted text-[11px]">
                                        Owner: <span className="text-cyan font-mono">{item.owner}</span>
                                      </p>
                                    )}
                                  </div>
                                  {item.deadline && (
                                    <Pill variant="default" size="sm">
                                      {item.deadline}
                                    </Pill>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* If workflow steps exist */}
                        {"steps" in result && Array.isArray(result.steps) && (
                          <div className="space-y-3">
                            <span className="text-xs font-mono uppercase tracking-wider text-violet">
                              Workflow Step Pipeline ({result.steps.length} Steps)
                            </span>
                            <div className="space-y-2">
                              {result.steps.map((step, idx) => (
                                <div
                                  key={step.step_id || idx}
                                  className="p-3.5 rounded-12 bg-bg/80 border border-border flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-violet/20 text-cyan flex items-center justify-center font-mono font-bold text-xs">
                                      {step.step_order}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-text">{step.name}</p>
                                      <p className="text-[11px] font-mono text-muted">
                                        Skill: <span className="text-text">{step.skill}</span> • Provider:{" "}
                                        <span className="text-cyan">{step.provider}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Pill variant="mint" size="sm">
                                      {step.status}
                                    </Pill>
                                    <span className="font-mono text-[11px] text-muted">
                                      {step.attempts} attempt(s)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Raw output object if other keys exist */}
                        <JsonViewer
                          data={result.output}
                          title="Validated Output Schema"
                          initialCollapsed={false}
                        />
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted border border-dashed border-border/80 rounded-16 bg-surface/10 space-y-3">
                  <div className="p-3 rounded-full bg-surface border border-border text-muted">
                    <Sparkles className="w-6 h-6 text-violet" />
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">Ready for Execution</p>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Choose a skill or workflow on the left, edit the input payload, and click{" "}
                      <strong className="text-cyan">Run Execution</strong>.
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

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-cyan animate-spin" />
        </div>
      }
    >
      <PlaygroundContent />
    </Suspense>
  );
}
