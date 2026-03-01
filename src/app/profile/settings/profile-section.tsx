"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Save, UserCircle, Camera, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";

interface ProfileData {
  name: string;
  phone: string | null;
  avatar: string | null;
  school: string | null;
  city: string | null;
  targetExam: string | null;
  bio: string | null;
}

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function ProfileSection() {
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    phone: null,
    avatar: null,
    school: null,
    city: null,
    targetExam: null,
    bio: null,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const result = await res.json();
        if (res.ok) {
          setForm({
            name: result.data.name ?? "",
            phone: result.data.phone ?? null,
            avatar: result.data.avatar ?? null,
            school: result.data.school ?? null,
            city: result.data.city ?? null,
            targetExam: result.data.targetExam ?? null,
            bio: result.data.bio ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Gagal memuat profil. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadResult.error?.message ?? "Gagal mengupload foto");
        return;
      }

      const avatarUrl = uploadResult.data.url as string;

      const saveRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUrl }),
      });
      if (!saveRes.ok) {
        toast.error("Gagal menyimpan foto profil");
        return;
      }

      setForm((prev) => ({ ...prev, avatar: avatarUrl }));
      try {
        await updateSession({ image: avatarUrl });
      } catch (error) {
        console.error("Failed to update session after avatar upload:", error);
      }
      toast.success("Foto profil berhasil diperbarui");
    } catch {
      toast.error("Gagal mengupload foto");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: null }),
      });
      if (!res.ok) {
        toast.error("Gagal menghapus foto profil");
        return;
      }
      setForm((prev) => ({ ...prev, avatar: null }));
      try {
        await updateSession({ image: null });
      } catch (error) {
        console.error("Failed to update session after avatar removal:", error);
      }
      toast.success("Foto profil dihapus");
    } catch {
      toast.error("Gagal menghapus foto profil");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
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

  if (loading) {
    return (
      <div className={cardCls}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Profil
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Informasi profil kamu yang ditampilkan di platform
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-full border-2 border-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                <UserCircle className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110 disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Foto Profil</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, atau WebP. Maks 5MB.
            </p>
            {form.avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
              >
                <X className="mr-1 h-3 w-3" />
                Hapus Foto
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">Sekolah / Kampus</Label>
            <Input
              id="school"
              value={form.school ?? ""}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              placeholder="Nama sekolah atau kampus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              value={form.city ?? ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Kota domisili"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="targetExam">Target Ujian</Label>
            <Input
              id="targetExam"
              value={form.targetExam ?? ""}
              onChange={(e) => setForm({ ...form, targetExam: e.target.value })}
              placeholder="Contoh: UTBK 2026, CPNS 2026"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio ?? ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Ceritakan sedikit tentang dirimu..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan Profil
          </Button>
        </div>
      </div>
    </div>
  );
}
