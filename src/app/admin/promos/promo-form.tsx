"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Tag, Percent, Banknote, Calendar, ToggleRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";

interface PromoFormData {
  id?: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxUses: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface PromoFormProps {
  initialData?: PromoFormData;
  mode: "create" | "edit";
}

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function toDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(localString: string): string {
  if (!localString) return "";
  return new Date(localString).toISOString();
}

export function PromoForm({ initialData, mode }: PromoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    initialData?.discountType ?? "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData?.discountValue ?? 0
  );
  const [minPurchase, setMinPurchase] = useState(initialData?.minPurchase ?? 0);
  const [maxUses, setMaxUses] = useState<string>(
    initialData?.maxUses?.toString() ?? ""
  );
  const [validFrom, setValidFrom] = useState(
    initialData?.validFrom ? toDatetimeLocal(initialData.validFrom) : ""
  );
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? toDatetimeLocal(initialData.validUntil) : ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      code: code.toUpperCase(),
      description: description || undefined,
      discountType,
      discountValue,
      minPurchase,
      maxUses: maxUses ? Number(maxUses) : undefined,
      validFrom: validFrom ? fromDatetimeLocal(validFrom) : undefined,
      validUntil: validUntil ? fromDatetimeLocal(validUntil) : undefined,
      isActive,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/promos"
          : `/api/admin/promos/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal menyimpan promo");
        return;
      }

      toast.success(
        mode === "create" ? "Promo berhasil dibuat" : "Promo berhasil diperbarui"
      );
      router.push("/admin/promos");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informasi Promo */}
      <div className={cardCls}>
        <SectionHeader icon={Tag} title="Informasi Promo" description="Kode dan deskripsi promo" />
        <div className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-medium">Kode Promo</Label>
            <Input
              id="code"
              placeholder="DISKON50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Huruf kapital, angka, - dan _ saja. Min 3, max 20 karakter.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium">
              Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Promo spesial untuk pengguna baru..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Diskon */}
      <div className={cardCls}>
        <SectionHeader icon={Percent} title="Diskon" description="Tipe dan nilai potongan harga" />
        <div className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tipe Diskon</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  discountType === "PERCENTAGE"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Percent className="h-3.5 w-3.5" />
                Persentase (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  discountType === "FIXED"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Banknote className="h-3.5 w-3.5" />
                Nominal (Rp)
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="discountValue" className="text-xs font-medium">
                Nilai Diskon {discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={discountType === "PERCENTAGE" ? "50" : "25000"}
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                min={1}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
              />
              {discountType === "PERCENTAGE" && (
                <p className="text-xs text-muted-foreground">Maksimal 100%</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minPurchase" className="text-xs font-medium">Minimum Pembelian (Rp)</Label>
              <Input
                id="minPurchase"
                type="number"
                placeholder="0"
                value={minPurchase || ""}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Isi 0 jika tidak ada minimum
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxUses" className="text-xs font-medium">
              Maks Penggunaan <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="maxUses"
              type="number"
              placeholder="100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min={1}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">Kosongkan jika tidak dibatasi</p>
          </div>
        </div>
      </div>

      {/* Masa Berlaku & Status */}
      <div className={cardCls}>
        <SectionHeader icon={Calendar} title="Masa Berlaku & Status" description="Periode aktif dan toggle promo" />
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="validFrom" className="text-xs font-medium">
                Berlaku Dari <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="validFrom"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil" className="text-xs font-medium">
                Berlaku Sampai <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <ToggleRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Aktifkan promo</p>
              <p className="text-xs text-muted-foreground">Promo yang aktif dapat digunakan oleh pengguna</p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          {mode === "create" ? "Buat Promo" : "Simpan Perubahan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/promos")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
