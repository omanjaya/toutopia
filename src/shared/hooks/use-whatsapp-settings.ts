"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface WaSubscription {
  id: string;
  phoneNumber: string;
  isActive: boolean;
  remindSchedule: boolean;
  remindResult: boolean;
  remindEvent: boolean;
}

type WaToggleField = keyof Pick<
  WaSubscription,
  "remindSchedule" | "remindResult" | "remindEvent"
>;

interface UseWhatsappSettingsReturn {
  subscription: WaSubscription | null;
  loading: boolean;
  phone: string;
  saving: boolean;
  deleting: boolean;
  setPhone: (phone: string) => void;
  handleSave: () => Promise<void>;
  handleToggle: (field: WaToggleField) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useWhatsappSettings(): UseWhatsappSettingsReturn {
  const [subscription, setSubscription] = useState<WaSubscription | null>(null);
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
          subscription ? "Pengaturan diperbarui" : "Notifikasi WhatsApp aktif!",
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

  async function handleToggle(field: WaToggleField): Promise<void> {
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

  return {
    subscription,
    loading,
    phone,
    saving,
    deleting,
    setPhone,
    handleSave,
    handleToggle,
    handleDelete,
  };
}
