import type { Metadata } from "next";
import { Radio, CalendarClock, Zap, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/shared/lib/prisma";
import { LiveEventsTable } from "./live-events-table";
import { CreateEventButton } from "./create-event-button";
import type { LiveEventRow } from "./live-events-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Event — Admin",
  description: "Kelola sesi tryout bersama secara langsung",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight = false }: StatCardProps) {
  return (
    <div className={`${cardCls} p-5 flex items-center gap-4`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          highlight ? "bg-emerald-500/10" : "bg-muted"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold">{value}</p>
          {highlight && value > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminLiveEventsPage() {
  const [total, scheduled, live, ended, recentEvents, packages] = await Promise.all([
    prisma.liveEvent.count(),
    prisma.liveEvent.count({ where: { status: "SCHEDULED" } }),
    prisma.liveEvent.count({ where: { status: "LIVE" } }),
    prisma.liveEvent.count({ where: { status: "ENDED" } }),
    prisma.liveEvent.findMany({
      include: {
        package: { select: { title: true, slug: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    }),
    prisma.examPackage.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Serialize dates to strings for client components
  const serializedEvents: LiveEventRow[] = recentEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    scheduledAt: e.scheduledAt.toISOString(),
    endAt: e.endAt ? e.endAt.toISOString() : null,
    status: e.status,
    maxParticipants: e.maxParticipants,
    package: e.package,
    _count: e._count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Radio className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Live Event</h2>
            <p className="text-sm text-muted-foreground">
              Kelola sesi tryout bersama secara langsung
            </p>
          </div>
        </div>
        <CreateEventButton packages={packages} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Radio className="h-5 w-5 text-muted-foreground" />}
          label="Total Event"
          value={total}
        />
        <StatCard
          icon={<CalendarClock className="h-5 w-5 text-amber-600" />}
          label="Dijadwalkan"
          value={scheduled}
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-emerald-600" />}
          label="Live Sekarang"
          value={live}
          highlight={live > 0}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-slate-500" />}
          label="Selesai"
          value={ended}
        />
      </div>

      {/* Events Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold">Daftar Event</h3>
          {live > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {live} event sedang live
            </div>
          )}
        </div>
        <LiveEventsTable events={serializedEvents} packages={packages} />
      </div>
    </div>
  );
}
