"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  Globe,
  Archive,
  Trash2,
  Loader2,
  CheckSquare,
  Square,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatCurrency } from "@/shared/lib/utils";

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200",
};

const statusDot: Record<string, string> = {
  PUBLISHED: "bg-emerald-500",
  DRAFT: "bg-slate-400",
  ARCHIVED: "bg-amber-500",
};

const statusLabel: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface PackageRow {
  id: string;
  title: string;
  status: string;
  price: number;
  isFree: boolean;
  totalQuestions: number;
  durationMinutes: number;
  category: { name: string };
  _count: { attempts: number };
}

interface PackagesTableProps {
  packages: PackageRow[];
  hasFilter?: boolean;
}

interface BulkDeleteResult {
  deleted: number;
  archived: number;
}

interface BulkAffectedResult {
  affected: number;
}

interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function PackagesTable({ packages, hasFilter }: PackagesTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = packages.length > 0 && selected.size === packages.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(packages.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulk(action: "publish" | "archive" | "delete") {
    const ids = Array.from(selected);
    const label =
      action === "publish" ? "publish" : action === "archive" ? "arsipkan" : "hapus";
    if (!confirm(`Yakin ingin ${label} ${ids.length} paket terpilih?`)) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/packages/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });

      if (action === "delete") {
        const result = (await res.json()) as ApiResult<BulkDeleteResult>;
        if (!res.ok || !result.success) {
          toast.error(
            !result.success ? result.error.message : "Gagal melakukan aksi"
          );
          return;
        }
        const { deleted, archived } = result.data;
        const parts: string[] = [];
        if (deleted > 0) parts.push(`${deleted} dihapus`);
        if (archived > 0) parts.push(`${archived} diarsipkan (ada peserta)`);
        toast.success(parts.join(", "));
      } else {
        const result = (await res.json()) as ApiResult<BulkAffectedResult>;
        if (!res.ok || !result.success) {
          toast.error(
            !result.success ? result.error.message : "Gagal melakukan aksi"
          );
          return;
        }
        toast.success(`${ids.length} paket berhasil di-${label}`);
      }

      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="relative">
      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
            <span className="text-sm font-medium text-background">
              {selected.size} paket dipilih
            </span>
            <div className="h-4 w-px bg-white/20" />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-emerald-400 hover:bg-white/10 hover:text-emerald-300"
              onClick={() => handleBulk("publish")}
              disabled={isPending}
            >
              <Globe className="h-3.5 w-3.5" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-amber-400 hover:bg-white/10 hover:text-amber-300"
              onClick={() => handleBulk("archive")}
              disabled={isPending}
            >
              <Archive className="h-3.5 w-3.5" />
              Arsip
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-red-400 hover:bg-white/10 hover:text-red-300"
              onClick={() => handleBulk("delete")}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Hapus
            </Button>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5 w-10">
                <button
                  onClick={toggleAll}
                  className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : someSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary/60" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Soal</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[52px] pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => {
              const isSelected = selected.has(pkg.id);
              return (
                <TableRow
                  key={pkg.id}
                  className={`hover:bg-muted/40 ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <TableCell className="pl-5">
                    <button
                      onClick={() => toggleOne(pkg.id)}
                      className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="pl-5">
                    <Link
                      href={`/admin/packages/${pkg.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {pkg.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pkg.category.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pkg.isFree ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-xs"
                      >
                        Gratis
                      </Badge>
                    ) : (
                      <span className="font-medium tabular-nums">
                        {formatCurrency(pkg.price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {pkg.totalQuestions}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {pkg.durationMinutes} mnt
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {pkg._count.attempts.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot[pkg.status] ?? "bg-muted-foreground"}`}
                      />
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusBadgeClass[pkg.status] ?? ""}`}
                      >
                        {statusLabel[pkg.status] ?? pkg.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="pr-5">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/packages/${pkg.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {packages.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Package className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {hasFilter
                          ? "Tidak ada paket yang sesuai filter"
                          : "Belum ada paket ujian"}
                      </p>
                      {!hasFilter && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/admin/packages/new">
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Buat Paket Pertama
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
