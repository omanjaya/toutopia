"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Users, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

const notificationTypes = [
  { value: "SYSTEM", label: "System" },
  { value: "PAYMENT_SUCCESS", label: "Payment Success" },
  { value: "SCORE_UPDATE", label: "Score Update" },
  { value: "PACKAGE_NEW", label: "Paket Baru" },
  { value: "STUDY_REMINDER", label: "Study Reminder" },
  { value: "EXAM_DEADLINE", label: "Exam Deadline" },
  { value: "QUESTION_STATUS", label: "Question Status" },
] as const;

const broadcastSchema = z.discriminatedUnion("target", [
  z.object({
    target: z.literal("all"),
    title: z.string().min(1, "Judul wajib diisi").max(100, "Maks 100 karakter"),
    message: z.string().min(1, "Pesan wajib diisi").max(500, "Maks 500 karakter"),
    type: z.enum([
      "SYSTEM",
      "PAYMENT_SUCCESS",
      "SCORE_UPDATE",
      "PACKAGE_NEW",
      "STUDY_REMINDER",
      "EXAM_DEADLINE",
      "QUESTION_STATUS",
    ]),
    link: z.string().url("URL tidak valid").optional().or(z.literal("")),
    userEmail: z.string().optional(),
  }),
  z.object({
    target: z.literal("specific"),
    title: z.string().min(1, "Judul wajib diisi").max(100, "Maks 100 karakter"),
    message: z.string().min(1, "Pesan wajib diisi").max(500, "Maks 500 karakter"),
    type: z.enum([
      "SYSTEM",
      "PAYMENT_SUCCESS",
      "SCORE_UPDATE",
      "PACKAGE_NEW",
      "STUDY_REMINDER",
      "EXAM_DEADLINE",
      "QUESTION_STATUS",
    ]),
    link: z.string().url("URL tidak valid").optional().or(z.literal("")),
    userEmail: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  }),
]);

type BroadcastFormData = z.infer<typeof broadcastSchema>;

interface UserLookupResult {
  id: string;
  name: string;
  email: string;
}

export function BroadcastDialog(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [foundUser, setFoundUser] = useState<UserLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      target: "all",
      title: "",
      message: "",
      type: "SYSTEM",
      link: "",
      userEmail: "",
    },
  });

  const target = watch("target");
  const userEmail = watch("userEmail");

  async function handleLookupUser(): Promise<void> {
    if (!userEmail) return;

    setIsLookingUp(true);
    setFoundUser(null);
    setLookupError(null);

    try {
      const res = await fetch(
        `/api/admin/users?q=${encodeURIComponent(userEmail)}&limit=1`
      );
      const json: unknown = await res.json();

      if (
        json &&
        typeof json === "object" &&
        "success" in json &&
        json.success === true &&
        "data" in json &&
        Array.isArray(json.data) &&
        json.data.length > 0
      ) {
        const first = json.data[0] as UserLookupResult;
        if (first.email.toLowerCase() === userEmail.toLowerCase()) {
          setFoundUser(first);
        } else {
          setLookupError("Pengguna dengan email tersebut tidak ditemukan");
        }
      } else {
        setLookupError("Pengguna dengan email tersebut tidak ditemukan");
      }
    } catch {
      setLookupError("Gagal mencari pengguna");
    } finally {
      setIsLookingUp(false);
    }
  }

  async function onSubmit(formData: BroadcastFormData): Promise<void> {
    if (formData.target === "specific" && !foundUser) {
      setLookupError("Cari pengguna terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        userId: formData.target === "specific" && foundUser ? foundUser.id : null,
        link: formData.link || null,
      };

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: unknown = await res.json();

      if (
        json &&
        typeof json === "object" &&
        "success" in json &&
        json.success === true &&
        "data" in json &&
        json.data !== null &&
        typeof json.data === "object" &&
        "created" in json.data
      ) {
        const created = (json.data as { created: number }).created;
        toast.success(`${created} notifikasi berhasil dikirim`);
        reset();
        setFoundUser(null);
        setLookupError(null);
        setOpen(false);
        router.refresh();
      } else {
        const msg =
          json &&
          typeof json === "object" &&
          "error" in json &&
          json.error !== null &&
          typeof json.error === "object" &&
          "message" in json.error
            ? String((json.error as { message: string }).message)
            : "Gagal mengirim notifikasi";
        toast.error(msg);
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(value: boolean): void {
    setOpen(value);
    if (!value) {
      reset();
      setFoundUser(null);
      setLookupError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Kirim Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Kirim Notifikasi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Target */}
          <div className="space-y-2">
            <Label>Target</Label>
            <RadioGroup
              value={target}
              onValueChange={(val) => {
                setValue("target", val as "all" | "specific");
                setFoundUser(null);
                setLookupError(null);
              }}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="target-all" />
                <Label htmlFor="target-all" className="flex cursor-pointer items-center gap-1.5 font-normal">
                  <Users className="h-4 w-4" />
                  Semua Pengguna
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="specific" id="target-specific" />
                <Label htmlFor="target-specific" className="flex cursor-pointer items-center gap-1.5 font-normal">
                  <User className="h-4 w-4" />
                  Pengguna Tertentu
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* User email lookup */}
          {target === "specific" && (
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Pengguna</Label>
              <div className="flex gap-2">
                <Input
                  id="userEmail"
                  placeholder="email@contoh.com"
                  {...register("userEmail")}
                  onChange={(e) => {
                    register("userEmail").onChange(e);
                    setFoundUser(null);
                    setLookupError(null);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLookingUp || !userEmail}
                  onClick={handleLookupUser}
                  className="shrink-0"
                >
                  {isLookingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Cari"
                  )}
                </Button>
              </div>
              {errors.userEmail && (
                <p className="text-xs text-destructive">{errors.userEmail.message}</p>
              )}
              {lookupError && (
                <p className="text-xs text-destructive">{lookupError}</p>
              )}
              {foundUser && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <p className="font-medium text-emerald-800">{foundUser.name}</p>
                  <p className="text-emerald-700">{foundUser.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul notifikasi"
              maxLength={100}
              {...register("title")}
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Pesan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Masukkan isi pesan notifikasi"
              rows={4}
              maxLength={500}
              {...register("message")}
              className={cn(errors.message && "border-destructive")}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Tipe <span className="text-destructive">*</span>
            </Label>
            <Select
              defaultValue="SYSTEM"
              onValueChange={(val: string) => {
                setValue(
                  "type",
                  val as BroadcastFormData["type"]
                );
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Pilih tipe notifikasi" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link (opsional)</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              {...register("link")}
              className={cn(errors.link && "border-destructive")}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Notifikasi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
