"use client";

import { Button } from "@/shared/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export function ExportButton({ q, status, from, to, sort }: ExportButtonProps) {
  function handleExport(): void {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sort && sort !== "newest") params.set("sort", sort);
    window.open(`/api/admin/transactions/export?${params.toString()}`, "_blank");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
