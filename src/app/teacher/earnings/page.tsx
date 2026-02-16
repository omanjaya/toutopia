"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Wallet, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency, truncate } from "@/shared/lib/utils";

interface EarningsData {
  totalEarnings: number;
  paidOut: number;
  pendingPayout: number;
  withdrawable: number;
  earnings: {
    id: string;
    questionPreview: string;
    amount: number;
    attemptCount: number;
    period: string;
    createdAt: string;
  }[];
}

interface Payout {
  id: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: string;
  createdAt: string;
}

const payoutStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  COMPLETED: "default",
  PROCESSING: "outline",
  PENDING: "secondary",
  REJECTED: "destructive",
};

const payoutStatusLabel: Record<string, string> = {
  COMPLETED: "Selesai",
  PROCESSING: "Diproses",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
};

export const dynamic = "force-dynamic";

export default function TeacherEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [earningsRes, payoutsRes] = await Promise.all([
          fetch("/api/teacher/earnings"),
          fetch("/api/teacher/payouts"),
        ]);

        const earningsResult = await earningsRes.json();
        const payoutsResult = await payoutsRes.json();

        if (earningsRes.ok) setData(earningsResult.data);
        if (payoutsRes.ok) setPayouts(payoutsResult.data);
      } catch {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleRequestPayout() {
    const amount = parseInt(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }

    setIsRequesting(true);
    try {
      const response = await fetch("/api/teacher/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal membuat permintaan");
        return;
      }

      toast.success("Permintaan payout berhasil dibuat");
      setPayoutAmount("");
      // Refresh data
      window.location.reload();
    } finally {
      setIsRequesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Penghasilan</h2>
        <p className="text-muted-foreground">
          Pantau penghasilan dari kontribusi soal Anda
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penghasilan
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.totalEarnings ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sudah Dicairkan
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.paidOut ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proses Pencairan
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.pendingPayout ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dapat Ditarik
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.withdrawable ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Tarik Dana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Minimal penarikan Rp 100.000. Dana akan ditransfer ke rekening
            bank yang terdaftar di profil Anda.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleRequestPayout}
                disabled={isRequesting || !payoutAmount}
              >
                {isRequesting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Tarik Dana
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      {payouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pencairan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.bankName} - {p.bankAccount}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={payoutStatusVariant[p.status] ?? "secondary"}>
                    {payoutStatusLabel[p.status] ?? p.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(p.createdAt).toLocaleDateString("id-ID", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Earnings Detail */}
      {data && data.earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Penghasilan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.earnings.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {truncate(e.questionPreview, 50)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.attemptCount} attempt &middot; Periode: {e.period}
                  </p>
                </div>
                <p className="font-semibold text-emerald-600">
                  +{formatCurrency(e.amount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
