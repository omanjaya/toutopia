"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Play, ArrowRight } from "lucide-react";
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
  );
}
