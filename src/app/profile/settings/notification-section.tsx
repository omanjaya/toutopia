"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface NotifPrefs {
  notifyExamResult: boolean;
  notifyPayment: boolean;
  notifyPromo: boolean;
  notifyPush: boolean;
}

const prefItems: { key: keyof NotifPrefs; label: string; description: string }[] = [
  { key: "notifyExamResult", label: "Hasil Ujian", description: "Notifikasi saat hasil ujian tersedia" },
  { key: "notifyPayment", label: "Pembayaran", description: "Notifikasi konfirmasi pembayaran" },
  { key: "notifyPromo", label: "Promo & Pengumuman", description: "Info promo dan pengumuman terbaru" },
  { key: "notifyPush", label: "Push Notification", description: "Terima push notification di browser" },
];

export function NotificationSection() {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/notification-preferences")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPrefs(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(key: keyof NotifPrefs) {
    if (!prefs) return;
    setUpdating(key);

    const newValue = !prefs[key];
    setPrefs({ ...prefs, [key]: newValue });

    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      const data = await res.json();
      if (!data.success) {
        setPrefs({ ...prefs, [key]: !newValue });
        toast.error("Gagal mengubah preferensi");
      }
    } catch {
      setPrefs({ ...prefs, [key]: !newValue });
      toast.error("Gagal mengubah preferensi");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferensi Notifikasi
        </CardTitle>
        <CardDescription>
          Atur jenis notifikasi yang ingin kamu terima
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {prefItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={prefs?.[item.key] ?? true}
                  onCheckedChange={() => handleToggle(item.key)}
                  disabled={updating === item.key}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
