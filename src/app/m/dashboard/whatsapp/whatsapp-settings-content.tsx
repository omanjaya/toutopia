"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MessageCircle,
  Phone,
  Bell,
  Calendar,
  Trophy,
  Radio,
  Loader2,
  Check,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface WaSubscription {
  id: string;
  phoneNumber: string;
  isActive: boolean;
  remindSchedule: boolean;
  remindResult: boolean;
  remindEvent: boolean;
}

export function MobileWhatsappSettingsContent() {
  const [subscription, setSubscription] = useState<WaSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const res = await fetch("/api/whatsapp");
        const result = await res.json();
        if (result.success && result.data) {
          setSubscription(result.data as WaSubscription);
          setPhone(result.data.phoneNumber);
        }
      } catch {
        // No subscription yet
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave(): Promise<void> {
    if (!phone.trim()) {
      toast.error("Masukkan nomor WhatsApp");
      return;
    }

    setSaving(true);
    try {
      const method = subscription ? "PUT" : "POST";
      const body = subscription ? { isActive: true } : { phoneNumber: phone };

      const res = await fetch("/api/whatsapp", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setSubscription(result.data as WaSubscription);
        toast.success(
          subscription
            ? "Pengaturan diperbarui"
            : "Notifikasi WhatsApp aktif!",
        );
      } else {
        toast.error(result.error?.message ?? "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(
    field: keyof Pick<
      WaSubscription,
      "remindSchedule" | "remindResult" | "remindEvent"
    >,
  ): Promise<void> {
    if (!subscription) return;
    try {
      const res = await fetch("/api/whatsapp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !subscription[field] }),
      });
      const result = await res.json();
      if (result.success) {
        setSubscription(result.data as WaSubscription);
      }
    } catch {
      toast.error("Gagal memperbarui");
    }
  }

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await fetch("/api/whatsapp", { method: "DELETE" });
      setSubscription(null);
      setPhone("");
      toast.success("Notifikasi WhatsApp dinonaktifkan");
    } catch {
      toast.error("Gagal menonaktifkan");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
            Notifikasi WhatsApp
          </h1>
          <p className="text-xs text-muted-foreground">
            Terima pengingat langsung di WhatsApp-mu
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Phone Input */}
        {!subscription && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aktifkan Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan nomor WhatsApp aktif. Format: 08xxx atau 628xxx
              </p>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full gap-2 min-h-12"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Aktifkan Notifikasi WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings (when active) */}
        {subscription && (
          <>
            <Card className="border-2 border-green-200/60 bg-green-50/30 shadow-sm dark:border-green-800/30 dark:bg-green-950/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Check className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Notifikasi Aktif
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Nomor: {subscription.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="shrink-0 min-h-[40px] min-w-[40px]"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5" />
                  Preferensi Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  {
                    key: "remindSchedule" as const,
                    icon: Calendar,
                    label: "Pengingat Jadwal Belajar",
                    desc: "Notifikasi untuk study planner",
                  },
                  {
                    key: "remindResult" as const,
                    icon: Trophy,
                    label: "Hasil Tryout",
                    desc: "Notifikasi saat hasil ujian keluar",
                  },
                  {
                    key: "remindEvent" as const,
                    icon: Radio,
                    label: "Event Live",
                    desc: "Notifikasi untuk tryout bersama",
                  },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => handleToggle(key)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-4 transition-colors hover:bg-muted/30 min-h-[56px]"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-7 w-12 items-center rounded-full px-0.5 transition-colors shrink-0 ml-3",
                        subscription[key] ? "bg-green-500" : "bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                          subscription[key]
                            ? "translate-x-5"
                            : "translate-x-0",
                        )}
                      />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
