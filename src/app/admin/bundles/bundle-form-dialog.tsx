"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Layers } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";

interface BundleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle?: {
    id: string;
    name: string;
    description: string | null;
    monthlyPrice: number;
    quarterlyPrice: number | null;
    yearlyPrice: number | null;
    isActive: boolean;
  } | null;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function BundleFormDialog({ open, onOpenChange, bundle }: BundleFormDialogProps) {
  const router = useRouter();
  const isEdit = !!bundle;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [quarterlyPrice, setQuarterlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(bundle?.name ?? "");
      setSlug(bundle ? toSlug(bundle.name) : "");
      setDescription(bundle?.description ?? "");
      setMonthlyPrice(bundle ? String(bundle.monthlyPrice) : "");
      setQuarterlyPrice(bundle?.quarterlyPrice ? String(bundle.quarterlyPrice) : "");
      setYearlyPrice(bundle?.yearlyPrice ? String(bundle.yearlyPrice) : "");
      setIsActive(bundle?.isActive ?? true);
    }
  }, [open, bundle]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name || !monthlyPrice) return;
    setSaving(true);
    try {
      const payload = {
        name, slug, description: description || null,
        monthlyPrice: parseInt(monthlyPrice),
        quarterlyPrice: quarterlyPrice ? parseInt(quarterlyPrice) : null,
        yearlyPrice: yearlyPrice ? parseInt(yearlyPrice) : null,
        isActive,
      };
      const url = isEdit ? `/api/admin/bundles/${bundle.id}` : "/api/admin/bundles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json() as { error?: { message?: string } };
      if (!res.ok) { toast.error(result.error?.message ?? "Gagal menyimpan"); return; }
      toast.success(isEdit ? "Bundle diperbarui" : "Bundle berhasil dibuat");
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            {isEdit ? "Edit Bundle" : "Buat Bundle Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Bundle *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(toSlug(e.target.value)); }}
              placeholder="UTBK All-in-One"
              required
            />
          </div>
          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="utbk-all-in-one" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Akses semua paket UTBK..." rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="monthly">Harga Bulanan *</Label>
              <Input id="monthly" type="number" min="0" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} placeholder="99000" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quarterly">Harga 3 Bulan</Label>
              <Input id="quarterly" type="number" min="0" value={quarterlyPrice} onChange={(e) => setQuarterlyPrice(e.target.value)} placeholder="249000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="yearly">Harga Tahunan</Label>
              <Input id="yearly" type="number" min="0" value={yearlyPrice} onChange={(e) => setYearlyPrice(e.target.value)} placeholder="799000" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Aktif</p>
              <p className="text-xs text-muted-foreground">Bundle tersedia untuk dibeli user</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan" : "Buat Bundle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
