"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

interface GrantCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentBalance: number;
  onSuccess: () => void;
}

export function GrantCreditDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentBalance,
  onSuccess,
}: GrantCreditDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const parsedAmount = parseInt(amount, 10);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount !== 0;
  const resultingBalance = isValidAmount ? currentBalance + parsedAmount : currentBalance;
  const wouldGoNegative = isValidAmount && resultingBalance < 0;
  const isDeduction = isValidAmount && parsedAmount < 0;

  function handleClose() {
    if (isPending) return;
    setAmount("");
    setNote("");
    onOpenChange(false);
  }

  function handleSubmit() {
    if (!isValidAmount) {
      toast.error("Masukkan jumlah kredit yang valid (bukan 0)");
      return;
    }
    if (!note.trim()) {
      toast.error("Catatan wajib diisi");
      return;
    }
    if (wouldGoNegative) {
      toast.error(`Saldo tidak mencukupi. Saldo saat ini: ${currentBalance}`);
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/credits/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST",
          amount: parsedAmount,
          note: note.trim(),
        }),
      });

      const result = (await res.json()) as {
        success: boolean;
        data?: { balance: number };
        error?: { message: string };
      };

      if (!res.ok || !result.success) {
        toast.error(result.error?.message ?? "Gagal memproses kredit");
        return;
      }

      const action = parsedAmount > 0 ? "ditambahkan" : "dikurangi";
      toast.success(
        `${Math.abs(parsedAmount)} kredit berhasil ${action}. Saldo baru: ${result.data?.balance ?? resultingBalance}`
      );
      handleClose();
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan Kredit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User info */}
          <div className="rounded-xl bg-muted/50 px-4 py-3">
            <p className="text-sm font-medium">{userName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Saldo saat ini:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {currentBalance.toLocaleString("id-ID")} kredit
              </span>
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="credit-amount">
              Jumlah Kredit
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (negatif untuk kurangi)
              </span>
            </Label>
            <Input
              id="credit-amount"
              type="number"
              placeholder="Contoh: 100 atau -50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="tabular-nums"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="credit-note">
              Catatan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="credit-note"
              placeholder="Alasan penyesuaian kredit..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Preview */}
          {isValidAmount && (
            <div
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
                wouldGoNegative
                  ? "bg-destructive/10 text-destructive"
                  : isDeduction
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-emerald-500/10 text-emerald-700"
              }`}
            >
              {wouldGoNegative && (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                {wouldGoNegative ? (
                  <p>
                    Saldo tidak mencukupi. Pengurangan{" "}
                    <span className="font-medium">{Math.abs(parsedAmount)}</span> akan membuat
                    saldo menjadi <span className="font-medium">{resultingBalance}</span>.
                  </p>
                ) : (
                  <p>
                    Saldo akan menjadi{" "}
                    <span className="font-semibold tabular-nums">
                      {resultingBalance.toLocaleString("id-ID")} kredit
                    </span>{" "}
                    ({parsedAmount > 0 ? "+" : ""}
                    {parsedAmount.toLocaleString("id-ID")})
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isValidAmount || !note.trim() || wouldGoNegative}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
