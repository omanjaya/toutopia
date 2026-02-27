"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, Banknote, Wallet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const statusLabel: Record<string, string> = {
  COMPLETED: "Selesai",
  PROCESSING: "Diproses",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
};

export const dynamic = "force-dynamic";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPayout, setActionPayout] = useState<PayoutRequest | null>(null);
  const [actionType, setActionType] = useState<"PROCESSING" | "COMPLETED" | "REJECTED" | null>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
  const processingCount = payouts.filter((p) => p.status === "PROCESSING").length;
  const totalPaid = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat payout...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Menunggu Approval", value: pendingCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Sedang Diproses", value: processingCount.toString(), icon: Banknote, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Dicairkan", value: formatCurrency(totalPaid), icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Dalam Antrian", value: formatCurrency(totalPending), icon: Wallet, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Payout</h2>
        <p className="text-muted-foreground">
          Kelola permintaan pencairan dana pengajar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {payouts.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <Banknote className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Belum ada permintaan payout
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {payout.teacherProfile.user.name ?? payout.teacherProfile.user.email}
                  </p>
                  <Badge variant="outline" className={statusBadgeClass[payout.status] ?? ""}>
                    {statusLabel[payout.status] ?? payout.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {payout.bankName} - {payout.bankAccount} a.n. {payout.bankHolder}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(payout.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {payout.rejectionReason && (
                  <p className="text-xs text-destructive italic">
                    Alasan ditolak: {payout.rejectionReason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrency(payout.amount)}
                </p>

                {payout.status === "PENDING" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAction(payout, "PROCESSING")}
                    >
                      Proses
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openAction(payout, "REJECTED")}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Tolak
                    </Button>
                  </div>
                )}

                {payout.status === "PROCESSING" && (
                  <Button
                    size="sm"
                    onClick={() => openAction(payout, "COMPLETED")}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Selesai
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!actionPayout}
        onOpenChange={(open) => {
          if (!open) {
            setActionPayout(null);
            setActionType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "PROCESSING" && "Proses Payout"}
              {actionType === "COMPLETED" && "Selesaikan Payout"}
              {actionType === "REJECTED" && "Tolak Payout"}
            </DialogTitle>
          </DialogHeader>

          {actionPayout && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Pengajar:</span>{" "}
                  <span className="font-medium">{actionPayout.teacherProfile.user.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Jumlah:</span>{" "}
                  <span className="font-semibold">{formatCurrency(actionPayout.amount)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Rekening:</span>{" "}
                  {actionPayout.bankName} - {actionPayout.bankAccount} a.n.{" "}
                  {actionPayout.bankHolder}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  {actionType === "REJECTED" ? "Alasan Penolakan" : "Catatan (opsional)"}
                </Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={actionType === "REJECTED" ? "Alasan penolakan..." : "Tambahkan catatan..."}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionPayout(null);
                setActionType(null);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={actionType === "REJECTED" ? "destructive" : "default"}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "PROCESSING" && "Proses"}
              {actionType === "COMPLETED" && "Tandai Selesai"}
              {actionType === "REJECTED" && "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
