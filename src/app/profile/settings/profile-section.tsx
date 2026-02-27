"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, UserCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ProfileData {
  name: string;
  phone: string | null;
  school: string | null;
  city: string | null;
  targetExam: string | null;
  bio: string | null;
}

export function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    phone: null,
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
            school: result.data.school ?? null,
            city: result.data.city ?? null,
            targetExam: result.data.targetExam ?? null,
            bio: result.data.bio ?? null,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Profil
        </CardTitle>
        <CardDescription>
          Informasi profil kamu yang ditampilkan di platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
