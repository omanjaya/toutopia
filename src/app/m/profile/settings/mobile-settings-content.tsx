"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bell,
  Loader2,
  Palette,
  Save,
  Trash2,
  UserCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { ThemePicker } from "@/shared/components/theme/theme-picker";

interface MobileSettingsContentProps {
  hasPassword: boolean;
}

interface ProfileData {
  name: string;
  phone: string | null;
  school: string | null;
  city: string | null;
  targetExam: string | null;
  bio: string | null;
}

interface NotifPrefs {
  notifyExamResult: boolean;
  notifyPayment: boolean;
  notifyPromo: boolean;
  notifyPush: boolean;
}

const prefItems: {
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

export function MobileSettingsContent({
  hasPassword,
}: MobileSettingsContentProps) {
  const router = useRouter();

  // Profile state
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

  // Notification state
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [updatingNotif, setUpdatingNotif] = useState<string | null>(null);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  async function handleDeleteAccount(): Promise<void> {
    if (deleteConfirmation !== "HAPUS AKUN SAYA") {
      toast.error('Ketik "HAPUS AKUN SAYA" untuk konfirmasi');
      return;
    }

    if (hasPassword && !deletePassword) {
      toast.error("Masukkan password untuk konfirmasi");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: hasPassword ? deletePassword : undefined,
          confirmation: deleteConfirmation,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Akun berhasil dihapus");
        await signOut({ redirect: false });
        router.push("/m");
      } else {
        toast.error(data.error?.message ?? "Gagal menghapus akun");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Pengaturan</h1>
      </div>

      <div className="space-y-4 px-4 pb-24 pt-4">
        {/* Profile Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi profil kamu yang ditampilkan di platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="m-name">Nama</Label>
                  <Input
                    id="m-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama lengkap"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-phone">No. Telepon</Label>
                  <Input
                    id="m-phone"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="h-12 rounded-xl text-base"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-school">Sekolah / Kampus</Label>
                  <Input
                    id="m-school"
                    value={form.school ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, school: e.target.value })
                    }
                    placeholder="Nama sekolah atau kampus"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-city">Kota</Label>
                  <Input
                    id="m-city"
                    value={form.city ?? ""}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Kota domisili"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-targetExam">Target Ujian</Label>
                  <Input
                    id="m-targetExam"
                    value={form.targetExam ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, targetExam: e.target.value })
                    }
                    placeholder="Contoh: UTBK 2026, CPNS 2026"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-bio">Bio</Label>
                  <Textarea
                    id="m-bio"
                    value={form.bio ?? ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={3}
                    className="rounded-xl text-base"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="h-12 w-full rounded-xl text-base"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  Simpan Profil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-5 w-5" />
              Tema Tampilan
            </CardTitle>
            <CardDescription className="text-xs">
              Pilih tema yang sesuai dengan gaya belajar kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePicker />
          </CardContent>
        </Card>

        {/* Notification Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Preferensi Notifikasi
            </CardTitle>
            <CardDescription className="text-xs">
              Atur jenis notifikasi yang ingin kamu terima
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {prefItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="space-y-0.5 pr-3">
                      <Label className="text-sm font-medium">
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={notifPrefs?.[item.key] ?? true}
                      onCheckedChange={() => handleToggleNotif(item.key)}
                      disabled={updatingNotif === item.key}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <div className="rounded-2xl border border-destructive/30 p-4">
          <h3 className="text-base font-semibold text-destructive">
            Hapus Akun
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Tindakan ini tidak dapat dibatalkan. Semua data akun kamu akan
            dihapus secara permanen.
          </p>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="mt-4 h-12 w-full rounded-xl text-base"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Hapus Akun
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
                <DialogDescription>
                  Semua data termasuk riwayat tryout dan transaksi akan dihapus.
                  Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {hasPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="m-delete-password">Password</Label>
                    <Input
                      id="m-delete-password"
                      type="password"
                      placeholder="Masukkan password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="h-12 rounded-xl text-base"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="m-delete-confirmation">
                    Ketik{" "}
                    <span className="font-bold">HAPUS AKUN SAYA</span>{" "}
                    untuk konfirmasi
                  </Label>
                  <Input
                    id="m-delete-confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="HAPUS AKUN SAYA"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteLoading ||
                    deleteConfirmation !== "HAPUS AKUN SAYA"
                  }
                  className="h-12 w-full rounded-xl text-base"
                >
                  {deleteLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Hapus Akun Permanen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteLoading}
                  className="h-12 w-full rounded-xl text-base"
                >
                  Batal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
