"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Play, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface StartExamButtonMobileProps {
  packageId: string;
  inProgressAttemptId?: string;
  canStart: boolean;
  maxAttempts: number;
  attemptCount: number;
}

export function StartExamButtonMobile({
  packageId,
  inProgressAttemptId,
  canStart,
  maxAttempts,
  attemptCount,
}: StartExamButtonMobileProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);

  async function handleStart(): Promise<void> {
    setIsStarting(true);
    try {
      const response = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.code === "INSUFFICIENT_CREDITS") {
          setInsufficientCredits(true);
          return;
        }
        toast.error(result.error?.message ?? "Gagal memulai ujian");
        return;
      }

      router.push(`/m/exam/${result.data.attemptId}`);
    } finally {
      setIsStarting(false);
    }
  }

  if (inProgressAttemptId) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button
          className="h-12 w-full text-base"
          onClick={() => router.push(`/m/exam/${inProgressAttemptId}`)}
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          Lanjutkan Ujian
        </Button>
      </div>
    );
  }

  if (!canStart) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button className="h-12 w-full text-base" disabled>
          Batas percobaan tercapai ({attemptCount}/{maxAttempts})
        </Button>
      </div>
    );
  }

  return (
    <>
      {insufficientCredits && (
        <div className="mx-4 mb-20 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Kredit Tidak Cukup
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Anda memerlukan 1 kredit untuk memulai try out ini.
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm">
                  <Link href="/m/dashboard/payment">Beli Kredit</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/m/dashboard/payment?plan=monthly">Langganan</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button
          className="h-12 w-full text-base"
          onClick={handleStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Play className="mr-2 h-5 w-5" />
          )}
          Mulai Try Out
        </Button>
      </div>
    </>
  );
}
