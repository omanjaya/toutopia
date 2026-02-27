"use client";

import dynamic from "next/dynamic";

const AdminCharts = dynamic(
    () => import("./admin-charts").then((m) => ({ default: m.AdminCharts })),
    {
        loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted" />,
        ssr: false,
    }
);

export function AdminChartsWrapper() {
    return <AdminCharts />;
}
