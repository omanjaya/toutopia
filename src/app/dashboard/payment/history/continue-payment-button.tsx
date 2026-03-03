"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ContinuePaymentButtonProps {
  snapToken: string;
  midtransUrl: string;
  midtransClientKey: string;
  isProduction: boolean;
  size?: "default" | "sm";
}

export function ContinuePaymentButton({
  snapToken,
  midtransUrl,
  midtransClientKey,
  isProduction,
  size = "default",
}: ContinuePaymentButtonProps): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  useEffect(() => {
    const scriptId = "midtrans-snap-script";
    if (document.getElementById(scriptId)) {
      setSnapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", midtransClientKey);
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
  }, [isProduction, midtransClientKey]);

  function handleClick(): void {
    const win = window as unknown as {
      snap?: {
        pay: (
          token: string,
          options: Record<string, unknown>
        ) => void;
      };
    };

    if (!snapReady || !win.snap) {
      window.location.href = midtransUrl;
      return;
    }

    setLoading(true);

    win.snap.pay(snapToken, {
      onSuccess: () => {
        toast.success("Pembayaran berhasil!");
        router.refresh();
      },
      onPending: () => {
        toast.info("Menunggu pembayaran...");
        router.refresh();
      },
      onError: () => {
        toast.error("Pembayaran gagal");
        setLoading(false);
      },
      onClose: () => {
        toast.info("Popup pembayaran ditutup");
        setLoading(false);
      },
    });
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      Lanjutkan Bayar
    </Button>
  );
}
