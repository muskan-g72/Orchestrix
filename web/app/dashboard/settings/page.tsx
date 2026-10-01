"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sliders,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  Code,
  FileJson,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { GlassCard } from "@/components/GlassCard";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { DemoDataPill } from "@/components/dashboard/DemoDataPill";
import { JsonViewer } from "@/components/dashboard/JsonViewer";
import { OrchestrixApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { client, virtualKey, isMock } = useDashboard();

  const [preferences, setPreferences] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | OrchestrixApiError | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Mode: GUI Form vs Raw JSON Editor
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [rawJsonString, setRawJsonString] = useState<string>("{}");
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  // New custom key-value field
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newType, setNewType] = useState<"string" | "number" | "boolean">("string");

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await client.getPreferences(virtualKey);
      const prefs = res.preferences || {};
      setPreferences(prefs);
      setRawJsonString(JSON.stringify(prefs, null, 2));
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Failed to fetch preferences", 500, "Unknown Error");
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [client, virtualKey]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update specific key in preferences state
  const handleUpdatePref = (key: string, value: unknown) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      setRawJsonString(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // Add custom key
  const handleAddCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    let parsedValue: unknown = newValue;
    if (newType === "number") {
      parsedValue = Number(newValue) || 0;
    } else if (newType === "boolean") {
      parsedValue = newValue.toLowerCase() === "true";
    }

    handleUpdatePref(newKey.trim(), parsedValue);
    setNewKey("");
    setNewValue("");
  };

  // Delete individual preference key (API call + local state update)
  const handleDeleteKey = async (key: string) => {
    try {
      await client.deletePreference(key, virtualKey);
      setPreferences((prev) => {
        const next = { ...prev };
        delete next[key];
        setRawJsonString(JSON.stringify(next, null, 2));
        return next;
      });
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Failed to delete preference", 500, "Unknown Error");
      setError(errorObj);
    }
  };

  // Save changes via PUT /v1/preferences
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    let payload = preferences;
    if (editMode === "json") {
      try {
        payload = JSON.parse(rawJsonString);
        setJsonParseError(null);
      } catch (err: unknown) {
        setJsonParseError("Invalid JSON syntax: " + (err instanceof Error ? err.message : "Parse Error"));
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await client.setPreferences({ preferences: payload }, virtualKey);
      const savedPrefs = res.preferences || {};
      setPreferences(savedPrefs);
      setRawJsonString(JSON.stringify(savedPrefs, null, 2));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new OrchestrixApiError("Failed to save preferences", 500, "Unknown Error");
      setError(errorObj);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaultPrefs = {
      language: "en",
      summary_depth: "concise",
      enforce_bullet_points: true,
      max_action_items: 5,
    };
    setPreferences(defaultPrefs);
    setRawJsonString(JSON.stringify(defaultPrefs, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-cyan" />
            <span>Gateway User Preferences</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Persist execution preferences and skill formatting defaults scoped to virtual key{" "}
            <span className="font-mono text-cyan">{virtualKey}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMock && <DemoDataPill />}

          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-10 bg-surface border border-border">
            <button
              onClick={() => setEditMode("form")}
              className={cn(
                "px-3 py-1.5 rounded-8 text-xs font-medium transition-colors",
                editMode === "form"
                  ? "bg-violet/20 text-cyan border border-cyan/30"
                  : "text-muted hover:text-text"
              )}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setEditMode("json")}
              className={cn(
                "px-3 py-1.5 rounded-8 text-xs font-medium transition-colors",
                editMode === "json"
                  ? "bg-violet/20 text-cyan border border-cyan/30"
                  : "text-muted hover:text-text"
              )}
            >
              JSON Editor
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorCard error={error} onRetry={fetchPreferences} />}

      {/* Main Settings Card */}
      <GlassCard className="p-0" innerClassName="p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="h-6 w-48 bg-surface rounded-8 animate-pulse" />
            <div className="h-24 bg-surface rounded-12 animate-pulse" />
            <div className="h-24 bg-surface rounded-12 animate-pulse" />
          </div>
        ) : editMode === "json" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-2">
                <Code className="w-4 h-4 text-violet" />
                Raw JSON Preferences Payload
              </label>
            </div>

            <textarea
              value={rawJsonString}
              onChange={(e) => {
                setRawJsonString(e.target.value);
                setJsonParseError(null);
              }}
              rows={12}
              className="w-full p-4 rounded-12 bg-bg/90 border border-border font-mono text-xs text-text focus:border-cyan outline-none leading-relaxed"
            />

            {jsonParseError && (
              <p className="text-xs text-danger font-mono bg-danger/10 p-2.5 rounded-8 border border-danger/30">
                {jsonParseError}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Standard Preference Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language */}
              <div className="p-4 rounded-12 bg-bg/70 border border-border space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted">
                  Default Language (<code className="text-cyan lowercase">language</code>)
                </label>
                <select
                  value={String(preferences.language || "en")}
                  onChange={(e) => handleUpdatePref("language", e.target.value)}
                  className="w-full px-3 py-2 rounded-8 bg-surface border border-border text-xs text-text focus:border-cyan outline-none"
                >
                  <option value="en">English (en)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="fr">French (fr)</option>
                  <option value="de">German (de)</option>
                  <option value="ja">Japanese (ja)</option>
                </select>
                <p className="text-[11px] text-muted">
                  Desired output language for skills and workflows.
                </p>
              </div>

              {/* Summary Depth */}
              <div className="p-4 rounded-12 bg-bg/70 border border-border space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted">
                  Summary Depth (<code className="text-violet lowercase">summary_depth</code>)
                </label>
                <select
                  value={String(preferences.summary_depth || "concise")}
                  onChange={(e) => handleUpdatePref("summary_depth", e.target.value)}
                  className="w-full px-3 py-2 rounded-8 bg-surface border border-border text-xs text-text focus:border-cyan outline-none"
                >
                  <option value="concise">Concise (Single paragraph)</option>
                  <option value="detailed">Detailed (Comprehensive overview)</option>
                  <option value="bullet_points">Bullet Points Only</option>
                </select>
                <p className="text-[11px] text-muted">
                  Controls conciseness for the <code className="font-mono">summarize</code> skill.
                </p>
              </div>

              {/* Enforce Bullet Points Switch */}
              <div className="p-4 rounded-12 bg-bg/70 border border-border flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">
                    Enforce Bullet Points (<code className="text-mint lowercase">enforce_bullet_points</code>)
                  </label>
                  <p className="text-[11px] text-muted mt-0.5">
                    Guarantees bullet point array formatting in response schema.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(preferences.enforce_bullet_points)}
                  onChange={(e) => handleUpdatePref("enforce_bullet_points", e.target.checked)}
                  className="w-5 h-5 accent-violet cursor-pointer rounded"
                />
              </div>

              {/* Max Action Items */}
              <div className="p-4 rounded-12 bg-bg/70 border border-border space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted">
                  Max Action Items (<code className="text-cyan lowercase">max_action_items</code>)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={Number(preferences.max_action_items) || 5}
                  onChange={(e) => handleUpdatePref("max_action_items", parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-8 bg-surface border border-border text-xs text-text focus:border-cyan outline-none"
                />
                <p className="text-[11px] text-muted">
                  Upper bound for extracted tasks in <code className="font-mono">extract_action_items</code>.
                </p>
              </div>
            </div>

            {/* Custom Preference Keys List */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-xs font-heading font-semibold text-text uppercase tracking-wider">
                All Active Preference Keys ({Object.keys(preferences).length})
              </h3>

              <div className="space-y-2">
                {Object.entries(preferences).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-10 bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-violet">{key}</span>
                      <span className="text-muted">:</span>
                      <span className="font-mono text-text truncate max-w-xs">
                        {JSON.stringify(val)}
                      </span>
                      <span className="text-[10px] font-mono text-muted/60">
                        ({typeof val})
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteKey(key)}
                      className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-6 transition-colors"
                      title={`Delete preference '${key}'`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Preference Form */}
              <form
                onSubmit={handleAddCustomKey}
                className="flex flex-col sm:flex-row gap-2 pt-2"
              >
                <input
                  type="text"
                  placeholder="Key name (e.g. custom_flag)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-8 bg-bg border border-border text-xs font-mono text-text outline-none focus:border-cyan"
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="px-2.5 py-2 rounded-8 bg-bg border border-border text-xs font-mono text-muted outline-none"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-8 bg-bg border border-border text-xs font-mono text-text outline-none focus:border-cyan"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  disabled={!newKey.trim()}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Key
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border flex-wrap gap-3">
          <button
            onClick={handleResetDefaults}
            className="text-xs font-mono text-muted hover:text-text transition-colors"
          >
            Reset to Recommended Defaults
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-mono text-mint flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                Preferences saved successfully
              </span>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              className="text-xs gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              Save Preferences (PUT)
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
