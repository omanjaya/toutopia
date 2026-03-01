import type { Metadata } from "next";
import { Suspense } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import { AnalyticsDashboard } from "./analytics-dashboard";

export const metadata: Metadata = { title: "Analitik — Admin" };

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BarChart2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analitik</h2>
          <p className="text-sm text-muted-foreground">
            Pantau performa platform secara mendalam
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
