"use client";

import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface DownloadButtonProps {
  slug: string;
  pdfUrl: string;
}

export function DownloadButton({ slug, pdfUrl }: DownloadButtonProps) {
  function handleDownload() {
    fetch(`/api/ebooks/${slug}/download`, { method: "POST" }).catch(() => {});
    window.open(pdfUrl, "_blank");
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  );
}
