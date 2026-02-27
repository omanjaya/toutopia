"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, BarChart3, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const MobileAnalyticsSummary = dynamic(() => import("./analytics-summary"), {
  ssr: false,
});
const MobileSubjectMastery = dynamic(() => import("./subject-mastery"), {
  ssr: false,
});
const MobileProgressTab = dynamic(() => import("./progress-tab"), {
  ssr: false,
});

export default function MobileAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "mastery" | "progress">("summary");

  const tabs = [
    { key: "summary" as const, label: "Ringkasan", icon: BarChart3 },
    { key: "mastery" as const, label: "Penguasaan", icon: BookOpen },
    { key: "progress" as const, label: "Progres", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Analitik</h1>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-5 flex gap-1 rounded-xl bg-muted/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "summary" && <MobileAnalyticsSummary />}
      {activeTab === "mastery" && <MobileSubjectMastery />}
      {activeTab === "progress" && <MobileProgressTab />}
    </div>
  );
}
