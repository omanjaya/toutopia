"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function MarkAllReadButton(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkAllRead(): Promise<void> {
    setLoading(true);
    try {
      await fetch("/api/user/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkAllRead}
      disabled={loading}
    >
      <CheckCheck className="mr-2 h-4 w-4" />
      Tandai Semua Dibaca
    </Button>
  );
}
