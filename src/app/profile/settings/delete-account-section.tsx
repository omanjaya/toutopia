"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

interface DeleteAccountSectionProps {
  hasPassword: boolean;
}

export function DeleteAccountSection({ hasPassword }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirmation !== "HAPUS AKUN SAYA") {
      toast.error('Ketik "HAPUS AKUN SAYA" untuk konfirmasi');
      return;
    }

    if (hasPassword && !password) {
      toast.error("Masukkan password untuk konfirmasi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: hasPassword ? password : undefined,
          confirmation,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Akun berhasil dihapus");
        await signOut({ redirect: false });
        router.push("/");
      } else {
        toast.error(data.error?.message ?? "Gagal menghapus akun");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-6">
      <h3 className="text-lg font-semibold text-destructive">Hapus Akun</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tindakan ini tidak dapat dibatalkan. Semua data akun kamu akan dihapus secara permanen.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="mt-4">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Akun
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
            <DialogDescription>
              Semua data termasuk riwayat tryout dan transaksi akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="delete-password">Password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Ketik <span className="font-bold">HAPUS AKUN SAYA</span> untuk konfirmasi
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="HAPUS AKUN SAYA"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || confirmation !== "HAPUS AKUN SAYA"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Akun Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
