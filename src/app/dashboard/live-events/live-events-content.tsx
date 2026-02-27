"use client";

import { useState, useEffect, useCallback } from "react";
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

export function LiveEventsContent() {
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
                toast.success("Berhasil mendaftar! Kamu akan diingatkan sebelum event dimulai.");
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
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function formatTime(dateStr: string): string {
        return new Date(dateStr).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }) + " WIB";
    }

    function getStatusBadge(event: LiveEventItem): { label: string; variant: "default" | "destructive" | "secondary" | "outline" } {
        const now = new Date();
        const scheduled = new Date(event.scheduledAt);
        const diffMs = scheduled.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (event.status === "LIVE") return { label: "🔴 LIVE", variant: "destructive" };
        if (diffHours < 1 && diffHours > 0) return { label: "Segera Dimulai", variant: "default" };
        if (event.status === "ENDED") return { label: "Selesai", variant: "secondary" };
        return { label: "Terjadwal", variant: "outline" };
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                        <Radio className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Tryout Bersama</h1>
                        <p className="text-sm text-muted-foreground">Kerjakan tryout secara live, bersaing realtime!</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
                {(["upcoming", "past"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            activeTab === tab
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
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
                <div className="py-12 text-center">
                    <Radio className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                        {activeTab === "upcoming" ? "Belum ada event terjadwal" : "Belum ada event yang selesai"}
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
                            <Card key={event.id} className="border-0 shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant={statusBadge.variant} className="text-xs">
                                                    {statusBadge.label}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {event.package.category.name}
                                                </Badge>
                                            </div>
                                            <h3 className="text-base font-semibold">{event.title}</h3>
                                            {event.description && (
                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                                                    {event.maxParticipants && `/${event.maxParticipants}`} peserta
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Zap className="h-3.5 w-3.5" />
                                                    {event.package.totalQuestions} soal · {event.package.durationMinutes} menit
                                                </span>
                                            </div>
                                        </div>

                                        {activeTab === "upcoming" && (
                                            <Button
                                                onClick={() => handleRegister(event.id)}
                                                disabled={isFull || registering === event.id}
                                                size="sm"
                                                className="shrink-0 gap-1"
                                            >
                                                {registering === event.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : isFull ? (
                                                    "Penuh"
                                                ) : (
                                                    <>
                                                        Daftar
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {activeTab === "past" && (
                                            <Button variant="outline" size="sm" className="shrink-0 gap-1">
                                                <Trophy className="h-3.5 w-3.5" />
                                                Leaderboard
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
