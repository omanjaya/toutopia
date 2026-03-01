"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";
import { CreditCard } from "lucide-react";
import { TransactionDetailSheet } from "./transaction-detail-sheet";

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

const statusDot: Record<string, string> = {
  PAID: "bg-emerald-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
  EXPIRED: "bg-slate-400",
  REFUNDED: "bg-violet-500",
};

const paymentMethodLabel: Record<string, string> = {
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
  CREDIT_CARD: "Kartu Kredit",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export interface TransactionRow {
  id: string;
  amount: number;
  paymentMethod: string | null;
  status: string;
  createdAt: Date;
  metadata: Record<string, string> | null;
  user: { name: string; email: string };
  package: { title: string } | null;
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  hasFilter: boolean;
}

export function TransactionsTable({ transactions, hasFilter }: TransactionsTableProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">User</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => setSelectedId(t.id)}
              >
                <TableCell className="pl-5">
                  <div>
                    <p className="text-sm font-medium">{t.user.name}</p>
                    <p className="text-xs text-muted-foreground">{t.user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                  <span className="line-clamp-1">
                    {t.package?.title ?? t.metadata?.description ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-semibold tabular-nums">
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.paymentMethod ? (
                    paymentMethodLabel[t.paymentMethod] ?? t.paymentMethod
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDot[t.status] ?? "bg-muted-foreground"}`}
                    />
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusBadgeClass[t.status] ?? ""}`}
                    >
                      {statusLabel[t.status] ?? t.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="pr-5 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <CreditCard className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {hasFilter
                          ? "Tidak ada transaksi yang sesuai filter"
                          : "Belum ada transaksi"}
                      </p>
                      {hasFilter && (
                        <p className="mt-1 text-xs text-muted-foreground/60">
                          Coba hapus filter atau ubah kata kunci
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailSheet
        transactionId={selectedId}
        onClose={() => setSelectedId(null)}
        onRefunded={() => router.refresh()}
      />
    </>
  );
}
