"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  teacherApplicationSchema,
  type TeacherApplicationInput,
} from "@/shared/lib/validators/teacher.validators";

const SPECIALIZATION_OPTIONS = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Ekonomi",
  "Sosiologi",
  "Geografi",
  "Sejarah",
  "TIU",
  "TWK",
  "TKP",
];

interface TeacherProfile {
  id: string;
  education: string;
  specialization: string[];
  institution: string | null;
  bio: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  status: string;
  totalEarnings: number;
  createdAt: string;
}

export const dynamic = "force-dynamic";

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeacherApplicationInput>({
    resolver: zodResolver(teacherApplicationSchema),
  });

  const selectedSpecs = watch("specialization") ?? [];

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/teacher/profile");
        const result = await res.json();
        if (res.ok) {
          setProfile(result.data);
          reset({
            education: result.data.education,
            specialization: result.data.specialization,
            institution: result.data.institution ?? "",
            bio: result.data.bio,
            bankName: result.data.bankName,
            bankAccount: result.data.bankAccount,
            bankHolder: result.data.bankHolder,
          });
        }
      } catch {
        toast.error("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [reset]);

  function toggleSpec(spec: string) {
    const current = selectedSpecs;
    if (current.includes(spec)) {
      setValue(
        "specialization",
        current.filter((s) => s !== spec),
        { shouldValidate: true }
      );
    } else {
      setValue("specialization", [...current, spec], { shouldValidate: true });
    }
  }

  async function onSubmit(data: TeacherApplicationInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal menyimpan");
        return;
      }

      toast.success("Profil berhasil diperbarui");
      setProfile(result.data);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profil Pengajar</h2>
        <p className="text-muted-foreground">
          Kelola informasi profil dan rekening bank Anda
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akademik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pendidikan Terakhir</Label>
              <Input {...register("education")} placeholder="S1 Pendidikan Matematika" />
              {errors.education && (
                <p className="text-sm text-destructive">{errors.education.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Institusi</Label>
              <Input
                {...register("institution")}
                placeholder="Universitas Indonesia (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Spesialisasi</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <Badge
                    key={spec}
                    variant={selectedSpecs.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpec(spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
              {errors.specialization && (
                <p className="text-sm text-destructive">
                  {errors.specialization.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                {...register("bio")}
                placeholder="Ceritakan pengalaman mengajar Anda..."
                rows={4}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Rekening Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input {...register("bankName")} placeholder="BCA" />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input {...register("bankAccount")} placeholder="1234567890" />
              {errors.bankAccount && (
                <p className="text-sm text-destructive">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input {...register("bankHolder")} placeholder="Nama sesuai buku tabungan" />
              {errors.bankHolder && (
                <p className="text-sm text-destructive">
                  {errors.bankHolder.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </form>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Status Akun</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={profile.status === "VERIFIED" ? "default" : "secondary"}
              >
                {profile.status === "VERIFIED" ? "Terverifikasi" : profile.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bergabung Sejak</p>
              <p className="text-sm">
                {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
