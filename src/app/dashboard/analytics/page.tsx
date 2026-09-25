"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const AnalyticsSummary = dynamic(() => import("./analytics-summary"), { ssr: false });
const SubjectMastery = dynamic(() => import("./subject-mastery"), { ssr: false });
const ProgressTab = dynamic(() => import("./progress-tab"), { ssr: false });

export default function StudentAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "mastery" | "progress">("summary");

  const tabs = [
    { key: "summary" as const, label: "Ringkasan", shortLabel: "Ringkasan", icon: BarChart3 },
    { key: "mastery" as const, label: "Penguasaan Materi", shortLabel: "Penguasaan", icon: BookOpen },
    { key: "progress" as const, label: "Progres", shortLabel: "Progres", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analitik</h2>
        <p className="text-muted-foreground">Pantau perkembangan belajar Anda</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:text-sm",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "summary" && <AnalyticsSummary />}
      {activeTab === "mastery" && <SubjectMastery />}
      {activeTab === "progress" && <ProgressTab />}
    </div>
  );
}
