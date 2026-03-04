"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface ProfileData {
  name: string;
  phone: string | null;
  school: string | null;
  city: string | null;
  targetExam: string | null;
  bio: string | null;
}

export interface NotifPrefs {
  notifyExamResult: boolean;
  notifyPayment: boolean;
  notifyPromo: boolean;
  notifyPush: boolean;
}

export const NOTIF_PREF_ITEMS: {
  key: keyof NotifPrefs;
  label: string;
  description: string;
}[] = [
  {
    key: "notifyExamResult",
    label: "Hasil Ujian",
    description: "Notifikasi saat hasil ujian tersedia",
  },
  {
    key: "notifyPayment",
    label: "Pembayaran",
    description: "Notifikasi konfirmasi pembayaran",
  },
  {
    key: "notifyPromo",
    label: "Promo & Pengumuman",
    description: "Info promo dan pengumuman terbaru",
  },
  {
    key: "notifyPush",
    label: "Push Notification",
    description: "Terima push notification di browser",
  },
];

interface UseProfileSettingsReturn {
  form: ProfileData;
  profileLoading: boolean;
  saving: boolean;
  notifPrefs: NotifPrefs | null;
  notifLoading: boolean;
  updatingNotif: string | null;
  setForm: (data: ProfileData) => void;
  handleSaveProfile: () => Promise<void>;
  handleToggleNotif: (key: keyof NotifPrefs) => Promise<void>;
}

export function useProfileSettings(): UseProfileSettingsReturn {
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    phone: null,
    school: null,
    city: null,
    targetExam: null,
    bio: null,
  });

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [updatingNotif, setUpdatingNotif] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      try {
        const res = await fetch("/api/user/profile");
        const result = await res.json();
        if (res.ok) {
          setForm({
            name: result.data.name ?? "",
            phone: result.data.phone ?? null,
            school: result.data.school ?? null,
            city: result.data.city ?? null,
            targetExam: result.data.targetExam ?? null,
            bio: result.data.bio ?? null,
          });
        }
      } finally {
        setProfileLoading(false);
      }
    }

    async function fetchNotifPrefs(): Promise<void> {
      try {
        const res = await fetch("/api/user/notification-preferences");
        const result = await res.json();
        if (result.success) setNotifPrefs(result.data);
      } finally {
        setNotifLoading(false);
      }
    }

    fetchProfile();
    fetchNotifPrefs();
  }, []);

  async function handleSaveProfile(): Promise<void> {
    if (!form.name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          school: form.school || null,
          city: form.city || null,
          targetExam: form.targetExam || null,
          bio: form.bio || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal menyimpan profil");
        return;
      }
      toast.success("Profil berhasil disimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleNotif(key: keyof NotifPrefs): Promise<void> {
    if (!notifPrefs) return;
    setUpdatingNotif(key);

    const newValue = !notifPrefs[key];
    setNotifPrefs({ ...notifPrefs, [key]: newValue });

    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      const data = await res.json();
      if (!data.success) {
        setNotifPrefs({ ...notifPrefs, [key]: !newValue });
        toast.error("Gagal mengubah preferensi");
      }
    } catch {
      setNotifPrefs({ ...notifPrefs, [key]: !newValue });
      toast.error("Gagal mengubah preferensi");
    } finally {
      setUpdatingNotif(null);
    }
  }

  return {
    form,
    profileLoading,
    saving,
    notifPrefs,
    notifLoading,
    updatingNotif,
    setForm,
    handleSaveProfile,
    handleToggleNotif,
  };
}
