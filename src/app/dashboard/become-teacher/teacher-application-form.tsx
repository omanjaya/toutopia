"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  teacherApplicationSchema,
  type TeacherApplicationInput,
} from "@/shared/lib/validators/teacher.validators";

const educationOptions = [
  "S1 / Sarjana",
  "S2 / Magister",
  "S3 / Doktor",
  "D3 / Diploma",
  "Lainnya",
];

const specializationOptions = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Ekonomi",
  "Sosiologi",
  "Sejarah",
  "Geografi",
  "TWK",
  "TIU",
  "TKP",
  "Penalaran Umum",
  "Pengetahuan Kuantitatif",
];

export function TeacherApplicationForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeacherApplicationInput>({
    resolver: zodResolver(teacherApplicationSchema),
    defaultValues: {
      education: "",
      specialization: [],
      institution: null,
      bio: "",
      bankName: "",
      bankAccount: "",
      bankHolder: "",
    },
  });

  const selectedSpecs = watch("specialization");

  function toggleSpecialization(spec: string) {
    const current = selectedSpecs ?? [];
    if (current.includes(spec)) {
      setValue(
        "specialization",
        current.filter((s) => s !== spec)
      );
    } else {
      setValue("specialization", [...current, spec]);
    }
  }

  async function onSubmit(data: TeacherApplicationInput) {
    const response = await fetch("/api/teacher/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error?.message ?? "Gagal mendaftar");
      return;
    }

    toast.success("Pendaftaran berhasil! Menunggu verifikasi admin.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pendidikan Terakhir</Label>
            <Select
              value={watch("education")}
              onValueChange={(v) => setValue("education", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih pendidikan" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.education && (
              <p className="text-sm text-destructive">
                {errors.education.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Institusi (opsional)</Label>
            <Input
              placeholder="Nama universitas atau sekolah"
              {...register("institution")}
            />
          </div>

          <div className="space-y-2">
            <Label>Spesialisasi</Label>
            <div className="flex flex-wrap gap-2">
              {specializationOptions.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedSpecs?.includes(spec)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
            {errors.specialization && (
              <p className="text-sm text-destructive">
                {errors.specialization.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bio / Pengalaman</Label>
            <Textarea
              placeholder="Ceritakan pengalaman mengajar Anda, minimal 20 karakter..."
              rows={4}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Rekening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Digunakan untuk transfer penghasilan dari kontribusi soal.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input placeholder="BCA" {...register("bankName")} />
              {errors.bankName && (
                <p className="text-sm text-destructive">
                  {errors.bankName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input placeholder="1234567890" {...register("bankAccount")} />
              {errors.bankAccount && (
                <p className="text-sm text-destructive">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input placeholder="Nama sesuai buku tabungan" {...register("bankHolder")} />
              {errors.bankHolder && (
                <p className="text-sm text-destructive">
                  {errors.bankHolder.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Daftar Sebagai Pengajar
      </Button>
    </form>
  );
}
