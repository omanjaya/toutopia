"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Play, ArrowRight } from "lucide-react";
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
  );
}
