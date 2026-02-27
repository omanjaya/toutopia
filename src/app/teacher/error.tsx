"use client";

import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function TeacherError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-xl font-bold">Terjadi Kesalahan</h2>
      <p className="mt-2 text-muted-foreground">
        Gagal memuat halaman. Silakan coba lagi.
      </p>
      <Button className="mt-6" onClick={reset}>
        Coba Lagi
      </Button>
    </div>
  );
}
