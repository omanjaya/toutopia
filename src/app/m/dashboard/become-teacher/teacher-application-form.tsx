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
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
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

export function MobileTeacherApplicationForm(): React.ReactElement {
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

  function toggleSpecialization(spec: string): void {
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

  async function onSubmit(data: TeacherApplicationInput): Promise<void> {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Personal Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <p className="text-sm font-semibold">Informasi Pribadi</p>

          <div className="space-y-2">
            <Label>Pendidikan Terakhir</Label>
            <Select
              value={watch("education")}
              onValueChange={(v) => setValue("education", v)}
            >
              <SelectTrigger className="min-h-[44px]">
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
              <p className="text-xs text-destructive">
                {errors.education.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Institusi (opsional)</Label>
            <Input
              placeholder="Nama universitas atau sekolah"
              className="min-h-[44px]"
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
                  className={cn(
                    "min-h-[36px] rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedSpecs?.includes(spec)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground active:border-primary"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>
            {errors.specialization && (
              <p className="text-xs text-destructive">
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
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <p className="text-sm font-semibold">Informasi Rekening</p>
          <p className="text-xs text-muted-foreground">
            Digunakan untuk transfer penghasilan dari kontribusi soal.
          </p>

          <div className="space-y-2">
            <Label>Nama Bank</Label>
            <Input
              placeholder="BCA"
              className="min-h-[44px]"
              {...register("bankName")}
            />
            {errors.bankName && (
              <p className="text-xs text-destructive">
                {errors.bankName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nomor Rekening</Label>
            <Input
              placeholder="1234567890"
              className="min-h-[44px]"
              {...register("bankAccount")}
            />
            {errors.bankAccount && (
              <p className="text-xs text-destructive">
                {errors.bankAccount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nama Pemilik Rekening</Label>
            <Input
              placeholder="Nama sesuai buku tabungan"
              className="min-h-[44px]"
              {...register("bankHolder")}
            />
            {errors.bankHolder && (
              <p className="text-xs text-destructive">
                {errors.bankHolder.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="min-h-[48px] w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Daftar Sebagai Pengajar
      </Button>
    </form>
  );
}
