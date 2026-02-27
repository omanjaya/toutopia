"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcement Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create form */}
        <div className="space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label>Pesan</Label>
            <Input
              placeholder="Tulis pesan announcement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipe</Label>
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
            <div className="space-y-2">
              <Label>Link URL (opsional)</Label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link Text (opsional)</Label>
              <Input
                placeholder="Lihat detail"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating || !message.trim()}>
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Buat Announcement
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada announcement.</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[a.type] ?? a.type}
                    </Badge>
                    <Badge variant={a.isActive ? "default" : "secondary"} className="text-xs">
                      {a.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(a.id, a.isActive)}
                >
                  {a.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
