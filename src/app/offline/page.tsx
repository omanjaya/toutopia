"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <WifiOff className="mb-6 h-16 w-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-semibold">Tidak Ada Koneksi</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Sepertinya kamu sedang offline. Pastikan koneksi internet aktif dan coba lagi.
      </p>
      <Button
        className="mt-6"
        onClick={() => window.location.reload()}
      >
        Coba Lagi
      </Button>
    </div>
  );
}
