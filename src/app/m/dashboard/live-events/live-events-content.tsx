"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Radio,
  Calendar,
  Users,
  Clock,
  Trophy,
  Loader2,
  ChevronRight,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface LiveEventPackage {
  id: string;
  title: string;
  slug: string;
  totalQuestions: number;
  durationMinutes: number;
  category: { name: string; slug: string };
}

interface LiveEventItem {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  endAt: string | null;
  status: string;
  maxParticipants: number | null;
  package: LiveEventPackage;
  _count: { registrations: number };
}

type TabType = "upcoming" | "past";

export function MobileLiveEventsContent() {
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/live-events?status=${activeTab}`);
      const result = await res.json();
      if (result.success) {
        setEvents(result.data as LiveEventItem[]);
      }
    } catch {
      toast.error("Gagal memuat jadwal event");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleRegister(eventId: string): Promise<void> {
    setRegistering(eventId);
    try {
      const res = await fetch(`/api/live-events/${eventId}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        toast.success(
          "Berhasil mendaftar! Kamu akan diingatkan sebelum event dimulai.",
        );
        await fetchEvents();
      } else {
        toast.error(result.error?.message ?? "Gagal mendaftar");
      }
    } catch {
      toast.error("Gagal mendaftar");
    } finally {
      setRegistering(null);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string): string {
    return (
      new Date(dateStr).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  }

  function getStatusBadge(
    event: LiveEventItem,
  ): { label: string; variant: "default" | "destructive" | "secondary" | "outline" } {
    const now = new Date();
    const scheduled = new Date(event.scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (event.status === "LIVE")
      return { label: "LIVE", variant: "destructive" };
    if (diffHours < 1 && diffHours > 0)
      return { label: "Segera Dimulai", variant: "default" };
    if (event.status === "ENDED")
      return { label: "Selesai", variant: "secondary" };
    return { label: "Terjadwal", variant: "outline" };
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Tryout Bersama
          </h1>
          <p className="text-xs text-muted-foreground">
            Kerjakan tryout secara live, bersaing realtime!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-muted/60 p-1">
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px]",
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "upcoming" ? "Akan Datang" : "Sudah Selesai"}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Radio className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            {activeTab === "upcoming"
              ? "Belum ada event terjadwal"
              : "Belum ada event yang selesai"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const statusBadge = getStatusBadge(event);
            const isFull = event.maxParticipants
              ? event._count.registrations >= event.maxParticipants
              : false;

            return (
              <Card
                key={event.id}
                className="border-0 shadow-sm"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={statusBadge.variant}
                      className="text-xs"
                    >
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {event.package.category.name}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-semibold">{event.title}</h3>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(event.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(event.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event._count.registrations}
                      {event.maxParticipants &&
                        `/${event.maxParticipants}`}{" "}
                      peserta
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {event.package.totalQuestions} soal ·{" "}
                      {event.package.durationMinutes} menit
                    </span>
                  </div>

                  {/* Action Button */}
                  {activeTab === "upcoming" && (
                    <Button
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull || registering === event.id}
                      className="w-full min-h-11 gap-1"
                    >
                      {registering === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFull ? (
                        "Penuh"
                      ) : (
                        <>
                          Daftar
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}

                  {activeTab === "past" && (
                    <Button
                      variant="outline"
                      className="w-full min-h-11 gap-1"
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
