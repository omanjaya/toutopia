"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Wallet,
  Building2,
  CreditCard,
  User,
  Search,
  ListFilter,
  Square,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { formatCurrency } from "@/shared/lib/utils";

interface PayoutRequest {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  teacherProfile: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

const statusBadgeClass: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-blue-500/10 text-blue-700 border-blue-200",
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-200",
  REJECTED: "bg-red-500/10 text-red-700 border-red-200",
};

const statusDot: Record<string, string> = {
  COMPLETED: "bg-emerald-500",
  PROCESSING: "bg-blue-500",
  PENDING: "bg-amber-500",
  REJECTED: "bg-red-500",
};

const statusLabel: Record<string, string> = {
  COMPLETED: "Selesai",
  PROCESSING: "Diproses",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPayout, setActionPayout] = useState<PayoutRequest | null>(null);
  const [actionType, setActionType] = useState<"PROCESSING" | "COMPLETED" | "REJECTED" | null>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function fetchPayouts() {
    try {
      const res = await fetch("/api/admin/payouts");
      const result = await res.json();
      if (res.ok) setPayouts(result.data);
    } catch {
      toast.error("Gagal memuat data payout");
    } finally {
      setLoading(false);
    }
  }

  function openAction(payout: PayoutRequest, type: "PROCESSING" | "COMPLETED" | "REJECTED") {
    setActionPayout(payout);
    setActionType(type);
    setReason("");
  }

  async function handleAction() {
    if (!actionPayout || !actionType) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/payouts/${actionPayout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionType, rejectionReason: reason || null }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal memperbarui status");
        return;
      }
      toast.success(`Payout berhasil di-${statusLabel[actionType].toLowerCase()}`);
      setActionPayout(null);
      setActionType(null);
      fetchPayouts();
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkProcess() {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/payouts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PROCESSING" }),
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setBulkProcessing(false);
    setSelectedIds(new Set());

    if (successCount > 0) {
      toast.success(`${successCount} payout berhasil diproses`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} payout gagal diproses`);
    }

    fetchPayouts();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllPending() {
    const pendingIds = filtered
      .filter((p) => p.status === "PENDING")
      .map((p) => p.id);
    const allSelected = pendingIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
  const processingCount = payouts.filter((p) => p.status === "PROCESSING").length;
  const totalPaid = payouts.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((s, p) => s + p.amount, 0);

  const filtered = useMemo(() => {
    return payouts
      .filter((p) => {
        const matchSearch =
          !search ||
          p.teacherProfile.user.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.teacherProfile.user.email.toLowerCase().includes(search.toLowerCase()) ||
          p.bankAccount.includes(search);
        const matchStatus = !statusFilter || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const order = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"];
        return order.indexOf(a.status) - order.indexOf(b.status);
      });
  }, [payouts, search, statusFilter]);

  const filteredTotal = useMemo(
    () => filtered.reduce((s, p) => s + p.amount, 0),
    [filtered]
  );

  const selectedPendingCount = filtered.filter(
    (p) => p.status === "PENDING" && selectedIds.has(p.id)
  ).length;

  const visiblePendingIds = filtered
    .filter((p) => p.status === "PENDING")
    .map((p) => p.id);

  const allVisiblePendingSelected =
    visiblePendingIds.length > 0 &&
    visiblePendingIds.every((id) => selectedIds.has(id));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Menunggu Approval", value: pendingCount, icon: Clock, color: "bg-amber-500/10 text-amber-600", urgent: pendingCount > 0 },
    { title: "Sedang Diproses", value: processingCount, icon: Banknote, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Dicairkan", value: formatCurrency(totalPaid), icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600", isFormatted: true },
    { title: "Dalam Antrian", value: formatCurrency(totalPending), icon: Wallet, color: "bg-violet-500/10 text-violet-600", isFormatted: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Banknote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Manajemen Payout</h2>
          <p className="text-sm text-muted-foreground">Kelola permintaan pencairan dana pengajar</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`${cardCls} ${stat.urgent ? "ring-amber-300/60" : ""}`}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.isFormatted
                    ? stat.value
                    : typeof stat.value === "number"
                    ? stat.value.toLocaleString("id-ID")
                    : stat.value}
                </p>
                {stat.urgent && (
                  <p className="mt-0.5 text-[11px] font-medium text-amber-600">Perlu ditindaklanjuti</p>
                )}
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      {payouts.length > 0 && (
        <div className={`${cardCls} p-4`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama pengajar, email, atau nomor rekening..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="PROCESSING">Diproses</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary line */}
          <p className="mt-3 text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            payout
            {filtered.length !== payouts.length && (
              <> dari {payouts.length} total</>
            )}
            {filtered.length > 0 && (
              <>
                {" "}·{" "}
                Total{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(filteredTotal)}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Payout List */}
      {filtered.length === 0 ? (
        <div className={`${cardCls} py-16 text-center`}>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Banknote className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">
                {payouts.length === 0
                  ? "Belum ada permintaan payout"
                  : "Tidak ada hasil yang cocok"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                {payouts.length === 0
                  ? "Permintaan payout dari pengajar akan muncul di sini"
                  : "Coba ubah kata kunci atau filter status"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending section header with select-all */}
          {filtered.some((p) => p.status === "PENDING") && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Menunggu Persetujuan ({filtered.filter((p) => p.status === "PENDING").length})
                </p>
              </div>
              <button
                type="button"
                onClick={toggleSelectAllPending}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {allVisiblePendingSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                {allVisiblePendingSelected ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>
          )}

          {filtered.map((payout) => {
            const isSelected = selectedIds.has(payout.id);
            return (
              <div
                key={payout.id}
                className={`${cardCls} p-5 transition-shadow ${
                  isSelected ? "ring-2 ring-primary/40 shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Checkbox for PENDING */}
                  <div className="flex items-start gap-3">
                    {payout.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => toggleSelect(payout.id)}
                        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
                        aria-label={isSelected ? "Batalkan pilihan" : "Pilih payout ini"}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    {/* Left info */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[payout.status] ?? "bg-muted-foreground"}`} />
                          <Badge variant="outline" className={`text-xs ${statusBadgeClass[payout.status] ?? ""}`}>
                            {statusLabel[payout.status] ?? payout.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold">
                          {payout.teacherProfile.user.name ?? payout.teacherProfile.user.email}
                        </p>
                        <span className="text-muted-foreground/40">·</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payout.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span>{payout.teacherProfile.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{payout.bankName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          <span>{payout.bankAccount} a.n. {payout.bankHolder}</span>
                        </div>
                      </div>

                      {payout.rejectionReason && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
                          <span className="font-semibold">Alasan ditolak:</span> {payout.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold tabular-nums">
                      {formatCurrency(payout.amount)}
                    </p>

                    {payout.status === "PENDING" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openAction(payout, "PROCESSING")}>
                          Proses
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openAction(payout, "REJECTED")}>
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Tolak
                        </Button>
                      </div>
                    )}

                    {payout.status === "PROCESSING" && (
                      <Button size="sm" onClick={() => openAction(payout, "COMPLETED")}>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Tandai Selesai
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk action floating bar */}
      {selectedPendingCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 shadow-2xl ring-1 ring-white/10">
            <p className="text-sm font-medium text-background">
              {selectedPendingCount} payout dipilih
            </p>
            <div className="h-4 w-px bg-background/20" />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBulkProcess}
              disabled={bulkProcessing}
              className="h-8 bg-background text-foreground hover:bg-background/90"
            >
              {bulkProcessing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Proses Semua
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-1 text-xs text-background/60 underline-offset-2 hover:text-background hover:underline"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog
        open={!!actionPayout}
        onOpenChange={(open) => {
          if (!open) { setActionPayout(null); setActionType(null); }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "PROCESSING" && "Proses Payout"}
              {actionType === "COMPLETED" && "Selesaikan Payout"}
              {actionType === "REJECTED" && "Tolak Payout"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "PROCESSING" && "Konfirmasi bahwa Anda akan memproses pencairan dana ini."}
              {actionType === "COMPLETED" && "Konfirmasi bahwa dana telah berhasil ditransfer."}
              {actionType === "REJECTED" && "Berikan alasan penolakan kepada pengajar."}
            </DialogDescription>
          </DialogHeader>

          {actionPayout && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pengajar</span>
                  <span className="font-medium">{actionPayout.teacherProfile.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-bold text-base">{formatCurrency(actionPayout.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rekening</span>
                  <span className="text-right">{actionPayout.bankName} – {actionPayout.bankAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">A.n.</span>
                  <span>{actionPayout.bankHolder}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {actionType === "REJECTED" ? "Alasan Penolakan *" : "Catatan (opsional)"}
                </Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    actionType === "REJECTED"
                      ? "Jelaskan alasan penolakan..."
                      : "Tambahkan catatan transfer..."
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setActionPayout(null); setActionType(null); }}
            >
              Batal
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing || (actionType === "REJECTED" && !reason.trim())}
              variant={actionType === "REJECTED" ? "destructive" : "default"}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "PROCESSING" && "Proses"}
              {actionType === "COMPLETED" && "Tandai Selesai"}
              {actionType === "REJECTED" && "Tolak Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
