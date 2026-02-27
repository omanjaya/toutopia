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
    { key: "summary" as const, label: "Ringkasan", icon: BarChart3 },
    { key: "mastery" as const, label: "Penguasaan Materi", icon: BookOpen },
    { key: "progress" as const, label: "Progres", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
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
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && <AnalyticsSummary />}
      {activeTab === "mastery" && <SubjectMastery />}
      {activeTab === "progress" && <ProgressTab />}
    </div>
  );
}
