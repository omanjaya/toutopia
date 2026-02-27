"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Promo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Kode Promo</Label>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              placeholder="Promo spesial untuk pengguna baru..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diskon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discount Type */}
          <div className="space-y-2">
            <Label>Tipe Diskon</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  discountType === "PERCENTAGE"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Persentase (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  discountType === "FIXED"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Nominal (Rp)
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Nilai Diskon{" "}
              {discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
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
              <p className="text-xs text-muted-foreground">
                Maksimal 100%
              </p>
            )}
          </div>

          {/* Min Purchase */}
          <div className="space-y-2">
            <Label htmlFor="minPurchase">Minimum Pembelian (Rp)</Label>
            <Input
              id="minPurchase"
              type="number"
              placeholder="0"
              value={minPurchase || ""}
              onChange={(e) => setMinPurchase(Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan atau 0 jika tidak ada minimum pembelian
            </p>
          </div>

          {/* Max Uses */}
          <div className="space-y-2">
            <Label htmlFor="maxUses">Maks Penggunaan (opsional)</Label>
            <Input
              id="maxUses"
              type="number"
              placeholder="100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika tidak dibatasi
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Masa Berlaku</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Berlaku Dari (opsional)</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Berlaku Sampai (opsional)</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Aktifkan promo</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
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
