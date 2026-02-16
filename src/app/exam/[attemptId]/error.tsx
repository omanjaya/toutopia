"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ExamError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-xl font-bold">Terjadi Kesalahan pada Ujian</h2>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        Maaf, terjadi kesalahan. Jawaban Anda tetap tersimpan. Silakan coba lagi.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Coba Lagi</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tryout">Kembali ke Tryout</Link>
        </Button>
      </div>
    </div>
  );
}
