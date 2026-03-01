"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import {
  RotateCcw,
  Loader2,
  CreditCard,
  User,
  Package,
  Calendar,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

const statusBadgeClass: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-200",
  FAILED: "bg-red-500/10 text-red-700 border-red-200",
  EXPIRED: "bg-slate-500/10 text-slate-700 border-slate-200",
  REFUNDED: "bg-violet-500/10 text-violet-700 border-violet-200",
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

const paymentMethodLabel: Record<string, string> = {
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
  CREDIT_CARD: "Kartu Kredit",
};

interface TransactionDetail {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  midtransId: string | null;
  midtransUrl: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown> | null;
  user: { id: string; name: string; email: string };
  package: { id: string; title: string } | null;
  ebook: { id: string; title: string } | null;
}

interface FetchDetailResponse {
  success: boolean;
  data?: TransactionDetail;
}

interface RefundResponse {
  success: boolean;
  error?: { message: string };
}

interface TransactionDetailSheetProps {
  transactionId: string | null;
  onClose: () => void;
  onRefunded: () => void;
}

export function TransactionDetailSheet({
  transactionId,
  onClose,
  onRefunded,
}: TransactionDetailSheetProps) {
  const [data, setData] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!transactionId) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/transactions/${transactionId}`)
      .then((r) => r.json())
      .then((json: FetchDetailResponse) => {
        if (json.success && json.data) setData(json.data);
      })
      .catch(() => toast.error("Gagal memuat detail transaksi"))
      .finally(() => setLoading(false));
  }, [transactionId]);

  function handleRefund(): void {
    if (!transactionId) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/transactions/${transactionId}/refund`, {
          method: "POST",
        });
        const json = (await res.json()) as RefundResponse;
        if (!res.ok || !json.success) {
          toast.error(json.error?.message ?? "Gagal memproses refund");
          return;
        }
        toast.success("Transaksi berhasil direfund");
        onRefunded();
        onClose();
      } catch {
        toast.error("Terjadi kesalahan");
      }
    });
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Sheet
      open={!!transactionId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Detail Transaksi
          </SheetTitle>
          <SheetDescription>{data?.id ?? "Memuat..."}</SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && data && (
          <div className="mt-6 space-y-6">
            {/* Status + Amount */}
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold tabular-nums">{formatCurrency(data.amount)}</p>
              <div className="mt-2 flex justify-center">
                <Badge
                  variant="outline"
                  className={statusBadgeClass[data.status] ?? ""}
                >
                  {statusLabel[data.status] ?? data.status}
                </Badge>
              </div>
            </div>

            {/* User */}
            <section>
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <User className="h-3.5 w-3.5" /> Pengguna
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{data.user.name}</p>
                <p className="text-muted-foreground">{data.user.email}</p>
                <p className="font-mono text-xs text-muted-foreground/60">{data.user.id}</p>
              </div>
            </section>

            {/* Product */}
            {(data.package ?? data.ebook) && (
              <section>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Package className="h-3.5 w-3.5" /> Produk
                </h3>
                <p className="text-sm">{data.package?.title ?? data.ebook?.title}</p>
              </section>
            )}

            {/* Payment Info */}
            <section>
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> Info Pembayaran
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode</span>
                  <span>
                    {data.paymentMethod
                      ? (paymentMethodLabel[data.paymentMethod] ?? data.paymentMethod)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Midtrans ID</span>
                  <span className="font-mono text-xs">{data.midtransId ?? "—"}</span>
                </div>
                {data.midtransUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Snap URL</span>
                    <a
                      href={data.midtransUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary text-xs hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" /> Buka
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Dates */}
            <section>
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Waktu
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span>{formatDate(data.createdAt)}</span>
                </div>
                {data.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dibayar</span>
                    <span>{formatDate(data.paidAt)}</span>
                  </div>
                )}
                {data.expiredAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kedaluwarsa</span>
                    <span>{formatDate(data.expiredAt)}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Refund action */}
            {data.status === "PAID" && (
              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isPending}
                  onClick={handleRefund}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Proses Refund
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Status akan diubah menjadi REFUNDED
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
