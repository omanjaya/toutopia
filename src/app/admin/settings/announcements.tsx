"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Megaphone, Plus, Trash2, Loader2 } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  type: string;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  info: "Info",
  warning: "Peringatan",
  success: "Sukses",
  promo: "Promo",
};

const typeBadgeCls: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-700 border-blue-200",
  warning: "bg-amber-500/10 text-amber-700 border-amber-200",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  promo: "bg-violet-500/10 text-violet-700 border-violet-200",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function AnnouncementSettings() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  async function fetchAnnouncements() {
    const res = await fetch("/api/admin/announcements");
    const data = await res.json();
    if (data.success) setAnnouncements(data.data);
    setLoading(false);
  }

  useEffect(() => { fetchAnnouncements(); }, []);

  async function handleCreate() {
    if (!message.trim()) return;
    setCreating(true);

    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        type,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (data.success) {
      toast.success("Announcement dibuat");
      setMessage("");
      setLinkUrl("");
      setLinkText("");
      fetchAnnouncements();
    } else {
      toast.error(data.error?.message ?? "Gagal membuat announcement");
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await res.json();
    if (data.success) {
      fetchAnnouncements();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Announcement dihapus");
      fetchAnnouncements();
    }
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Announcement Banner</p>
          <p className="text-xs text-muted-foreground">Tampilkan pengumuman di halaman utama</p>
        </div>
      </div>

      {/* Create form card */}
      <div className={`${cardCls} p-5`}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Buat Announcement Baru
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pesan</Label>
            <Input
              placeholder="Tulis pesan announcement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tipe</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Peringatan</SelectItem>
                  <SelectItem value="success">Sukses</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Link URL (opsional)</Label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Link Text (opsional)</Label>
              <Input
                placeholder="Lihat detail"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={creating || !message.trim()}
          >
            {creating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-3.5 w-3.5" />
            )}
            Buat Announcement
          </Button>
        </div>
      </div>

      {/* Announcement list */}
      <div className={cardCls}>
        {loading ? (
          <div className="divide-y">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Megaphone className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Belum ada announcement</p>
            <p className="text-xs text-muted-foreground/60">
              Buat announcement untuk ditampilkan kepada pengguna
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{a.message}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 leading-5 ${typeBadgeCls[a.type] ?? ""}`}
                    >
                      {typeLabels[a.type] ?? a.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 leading-5 ${
                        a.isActive
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                          : "text-muted-foreground"
                      }`}
                    >
                      {a.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => handleToggle(a.id, a.isActive)}
                >
                  {a.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
