import React from "react";
import { Metadata } from "next";
import { DashboardProvider } from "@/lib/dashboard-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ColdStartBanner } from "@/components/dashboard/ColdStartBanner";
import { CommandPalette } from "@/components/dashboard/CommandPalette";

export const metadata: Metadata = {
  title: "Dashboard | Orchestrix Execution Gateway",
  description:
    "Interactive console for testing skills, executing workflows, inspecting traces, and managing virtual keys.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-[#09090B] text-text overflow-hidden">
        {/* Collapsible Frosted Sidebar */}
        <Sidebar />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar with Virtual-Key Switcher & Controls */}
          <TopBar />

          {/* Gateway Cold-Start Detection Banner */}
          <ColdStartBanner />

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,92,255,0.08),rgba(255,255,255,0))]">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>

        {/* Global Command Palette (Cmd+K / Ctrl+K) */}
        <CommandPalette />
      </div>
    </DashboardProvider>
  );
}
