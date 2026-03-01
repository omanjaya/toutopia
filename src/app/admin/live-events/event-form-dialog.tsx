"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import type { LiveEventRow } from "./live-events-table";

const formSchema = z.object({
  packageId: z.string().min(1, "Pilih paket ujian"),
  title: z.string().min(1, "Judul wajib diisi").max(200),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Tanggal mulai wajib diisi"),
  endAt: z.string().optional(),
  maxParticipants: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: LiveEventRow;
  packages: { id: string; title: string }[];
  onSuccess: () => void;
}

function toDatetimeLocal(isoStr: string): string {
  return new Date(isoStr).toISOString().slice(0, 16);
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  packages,
  onSuccess,
}: EventFormDialogProps) {
  const isEdit = event !== undefined;

  const getDefaultValues = (): FormValues => ({
    packageId: event?.package
      ? (packages.find((p) => p.title === event.package.title)?.id ?? "")
      : "",
    title: event?.title ?? "",
    description: event?.description ?? "",
    scheduledAt: event?.scheduledAt ? toDatetimeLocal(event.scheduledAt) : "",
    endAt: event?.endAt ? toDatetimeLocal(event.endAt) : "",
    maxParticipants:
      event?.maxParticipants != null ? String(event.maxParticipants) : "",
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event]);

  function handlePackageChange(packageId: string) {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg && !getValues("title")) {
      setValue("title", pkg.title);
    }
  }

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      const payload = {
        packageId: values.packageId,
        title: values.title,
        description: values.description || undefined,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
        maxParticipants: values.maxParticipants
          ? parseInt(values.maxParticipants, 10)
          : undefined,
      };

      const url = isEdit
        ? `/api/admin/live-events?id=${event.id}`
        : "/api/admin/live-events";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!json.success) {
        throw new Error(json.error?.message ?? "Terjadi kesalahan");
      }

      toast.success(isEdit ? "Event berhasil diperbarui" : "Event berhasil dibuat");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Live Event" : "Buat Live Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Paket Ujian */}
          <div className="space-y-1.5">
            <Label htmlFor="packageId">Paket Ujian</Label>
            <Controller
              control={control}
              name="packageId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v: string) => {
                    field.onChange(v);
                    handlePackageChange(v);
                  }}
                  disabled={isEdit}
                >
                  <SelectTrigger id="packageId">
                    <SelectValue placeholder="Pilih paket ujian..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.packageId && (
              <p className="text-xs text-destructive">{errors.packageId.message}</p>
            )}
          </div>

          {/* Judul Event */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Event</Label>
            <Input
              id="title"
              placeholder="Contoh: UTBK Intensif Sesi 1"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Deskripsi{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang event ini..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Jadwal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Tanggal &amp; Waktu Mulai</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...register("scheduledAt")}
              />
              {errors.scheduledAt && (
                <p className="text-xs text-destructive">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endAt">
                Waktu Selesai{" "}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Input
                id="endAt"
                type="datetime-local"
                {...register("endAt")}
              />
            </div>
          </div>

          {/* Maks. Peserta */}
          <div className="space-y-1.5">
            <Label htmlFor="maxParticipants">
              Maks. Peserta{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min={1}
              placeholder="Tidak terbatas"
              {...register("maxParticipants")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Buat Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
