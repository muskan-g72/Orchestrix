"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OrchestrixClient } from "@/lib/api/client";

export type VirtualKeyType = "vk_open" | "vk_tiny" | "vk_edge" | string;

export interface RecentTrace {
  id: string;
  type: "task" | "workflow";
  name: string;
  status: "completed" | "failed" | "running";
  provider?: string;
  attempts?: number;
  timestamp: number;
}

export type HealthStatus = "checking" | "ready" | "waking" | "offline";

interface DashboardContextType {
  virtualKey: VirtualKeyType;
  setVirtualKey: (key: VirtualKeyType) => void;
  isMock: boolean;
  setIsMock: (mock: boolean) => void;
  toggleMock: () => void;
  healthStatus: HealthStatus;
  healthLatencyMs: number | null;
  checkHealth: () => Promise<void>;
  recentTraces: RecentTrace[];
  addRecentTrace: (trace: Omit<RecentTrace, "timestamp">) => void;
  removeRecentTrace: (id: string) => void;
  clearRecentTraces: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  client: OrchestrixClient;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEYS = {
  VIRTUAL_KEY: "orchestrix_virtual_key",
  IS_MOCK: "orchestrix_is_mock",
  RECENT_TRACES: "orchestrix_recent_traces",
  SIDEBAR_COLLAPSED: "orchestrix_sidebar_collapsed",
};

export function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [virtualKey, setVirtualKeyState] = useState<VirtualKeyType>("vk_open");
  const [isMock, setIsMockState] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");
  const [healthLatencyMs, setHealthLatencyMs] = useState<number | null>(null);
  const [recentTraces, setRecentTraces] = useState<RecentTrace[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(false);

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(LOCAL_STORAGE_KEYS.VIRTUAL_KEY);
      if (savedKey) setVirtualKeyState(savedKey);

      const savedMock = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_MOCK);
      if (savedMock !== null) {
        setIsMockState(savedMock === "true");
      }

      const savedCollapsed = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED
      );
      if (savedCollapsed !== null) {
        setIsSidebarCollapsedState(savedCollapsed === "true");
      }

      const savedTraces = localStorage.getItem(
        LOCAL_STORAGE_KEYS.RECENT_TRACES
      );
      if (savedTraces) {
        const parsed = JSON.parse(savedTraces);
        if (Array.isArray(parsed)) {
          setRecentTraces(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const setVirtualKey = useCallback((key: VirtualKeyType) => {
    setVirtualKeyState(key);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VIRTUAL_KEY, key);
    } catch {}
  }, []);

  const setIsMock = useCallback((mock: boolean) => {
    setIsMockState(mock);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.IS_MOCK, String(mock));
    } catch {}
  }, []);

  const toggleMock = useCallback(() => {
    setIsMockState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.IS_MOCK, String(next));
      } catch {}
      return next;
    });
  }, []);

  const setIsSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED,
        String(collapsed)
      );
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED,
          String(next)
        );
      } catch {}
      return next;
    });
  }, []);

  const addRecentTrace = useCallback(
    (trace: Omit<RecentTrace, "timestamp">) => {
      setRecentTraces((prev) => {
        const filtered = prev.filter((t) => t.id !== trace.id);
        const updated = [
          { ...trace, timestamp: Date.now() },
          ...filtered,
        ].slice(0, 20); // Keep max 20 recent traces
        try {
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.RECENT_TRACES,
            JSON.stringify(updated)
          );
        } catch {}
        return updated;
      });
    },
    []
  );

  const removeRecentTrace = useCallback((id: string) => {
    setRecentTraces((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.RECENT_TRACES,
          JSON.stringify(updated)
        );
      } catch {}
      return updated;
    });
  }, []);

  const clearRecentTraces = useCallback(() => {
    setRecentTraces([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.RECENT_TRACES);
    } catch {}
  }, []);

  // Healthcheck function
  const checkHealth = useCallback(async () => {
    if (isMock) {
      setHealthStatus("ready");
      setHealthLatencyMs(20);
      return;
    }

    setHealthStatus("checking");
    const startTime = performance.now();

    // Setup waking detection timer
    const wakingTimer = setTimeout(() => {
      setHealthStatus((current) => (current === "checking" ? "waking" : current));
    }, 2500);

    try {
      const tempClient = new OrchestrixClient({
        mock: false,
        useProxy: true,
      });
      const res = await tempClient.getHealth();
      clearTimeout(wakingTimer);
      const latency = Math.round(performance.now() - startTime);
      setHealthLatencyMs(latency);

      if (res && res.status === "ok") {
        setHealthStatus("ready");
      } else {
        setHealthStatus("ready");
      }
    } catch {
      clearTimeout(wakingTimer);
      setHealthLatencyMs(null);
      setHealthStatus("offline");
    }
  }, [isMock]);

  // Initial health check on mount
  useEffect(() => {
    checkHealth();
    // Poll health every 45s
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Keyboard shortcut for Command Palette: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Construct client instance whenever key or mock mode changes
  const client = useMemo(() => {
    return new OrchestrixClient({
      mock: isMock,
      defaultVirtualKey: virtualKey,
      useProxy: true,
    });
  }, [isMock, virtualKey]);

  return (
    <DashboardContext.Provider
      value={{
        virtualKey,
        setVirtualKey,
        isMock,
        setIsMock,
        toggleMock,
        healthStatus,
        healthLatencyMs,
        checkHealth,
        recentTraces,
        addRecentTrace,
        removeRecentTrace,
        clearRecentTraces,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        client,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
