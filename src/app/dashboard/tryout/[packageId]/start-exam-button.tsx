"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Play, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface StartExamButtonProps {
  packageId: string;
  inProgressAttemptId?: string;
  canStart: boolean;
  maxAttempts: number;
  attemptCount: number;
}

export function StartExamButton({
  packageId,
  inProgressAttemptId,
  canStart,
  maxAttempts,
  attemptCount,
}: StartExamButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);

  async function handleStart() {
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

      router.push(`/exam/${result.data.attemptId}`);
    } finally {
      setIsStarting(false);
    }
  }

  if (inProgressAttemptId) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push(`/exam/${inProgressAttemptId}`)}
      >
        <ArrowRight className="mr-2 h-5 w-5" />
        Lanjutkan Ujian
      </Button>
    );
  }

  if (!canStart) {
    return (
      <Button className="w-full" size="lg" disabled>
        Batas percobaan tercapai ({attemptCount}/{maxAttempts})
      </Button>
    );
  }

  return (
    <div>
      <Button
        className="w-full"
        size="lg"
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
      {insufficientCredits && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
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
                  <Link href="/dashboard/payment">Beli Kredit</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/payment?plan=monthly">Langganan</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
