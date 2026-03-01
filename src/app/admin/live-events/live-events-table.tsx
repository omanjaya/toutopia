"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Pencil, Trash2, Radio, CheckCircle } from "lucide-react";
import { EventFormDialog } from "./event-form-dialog";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

export interface LiveEventRow {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  endAt: string | null;
  status: string;
  maxParticipants: number | null;
  package: { title: string; slug: string };
  _count: { registrations: number };
}

interface LiveEventsTableProps {
  events: LiveEventRow[];
  packages: { id: string; title: string }[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SCHEDULED") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-700 border-amber-200"
      >
        Dijadwalkan
      </Badge>
    );
  }
  if (status === "LIVE") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex items-center gap-1.5"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Live
      </Badge>
    );
  }
  if (status === "ENDED") {
    return (
      <Badge
        variant="outline"
        className="bg-slate-500/10 text-slate-700 border-slate-200"
      >
        Selesai
      </Badge>
    );
  }
  if (status === "CANCELLED") {
    return (
      <Badge
        variant="outline"
        className="bg-red-500/10 text-red-700 border-red-200"
      >
        Dibatalkan
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

function formatDateWIB(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  return { date, time };
}

function formatDuration(startStr: string, endStr: string): string {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  const diffMin = Math.round((end - start) / 60000);
  if (diffMin < 60) return `${diffMin} mnt`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
}

export function LiveEventsTable({ events, packages }: LiveEventsTableProps) {
  const router = useRouter();
  const [editEvent, setEditEvent] = useState<LiveEventRow | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setLoading(`${id}-${status}`);
    try {
      const res = await fetch(`/api/admin/live-events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) throw new Error(json.error?.message ?? "Gagal mengubah status");
      toast.success(
        status === "LIVE" ? "Event sekarang LIVE!" : "Event telah diselesaikan"
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus event "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setLoading(`${id}-delete`);
    try {
      const res = await fetch(`/api/admin/live-events/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) throw new Error(json.error?.message ?? "Gagal menghapus event");
      toast.success("Event berhasil dihapus");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  if (events.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Belum ada live event. Buat event pertama Anda.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Durasi</TableHead>
            <TableHead>Peserta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const { date, time } = formatDateWIB(event.scheduledAt);
            const isLive = event.status === "LIVE";
            const isScheduled = event.status === "SCHEDULED";
            const isEnded = event.status === "ENDED" || event.status === "CANCELLED";

            return (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{event.title}</p>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {event.package.title}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{date}</p>
                    <p className="text-muted-foreground">{time} WIB</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {event.endAt ? formatDuration(event.scheduledAt, event.endAt) : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{event._count.registrations}</span>
                  <span className="text-muted-foreground">
                    {" / "}
                    {event.maxParticipants != null ? event.maxParticipants : "∞"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={event.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {isScheduled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1.5"
                        disabled={loading === `${event.id}-LIVE`}
                        onClick={() => handleStatusChange(event.id, "LIVE")}
                      >
                        <Radio className="h-3.5 w-3.5" />
                        Go Live
                      </Button>
                    )}
                    {isLive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5"
                        disabled={loading === `${event.id}-ENDED`}
                        onClick={() => handleStatusChange(event.id, "ENDED")}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Selesai
                      </Button>
                    )}
                    {!isEnded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditEvent(event)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0",
                        isLive
                          ? "text-muted-foreground/40 cursor-not-allowed"
                          : "text-red-500 hover:text-red-600 hover:bg-red-50"
                      )}
                      disabled={isLive || loading === `${event.id}-delete`}
                      onClick={() => handleDelete(event.id, event.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {editEvent !== null && (
        <EventFormDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditEvent(null);
          }}
          event={editEvent}
          packages={packages}
          onSuccess={() => {
            setEditEvent(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
