"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

interface ExportPdfButtonProps {
  contentSelector: string;
  filename: string;
}

export function ExportPdfButton({ contentSelector, filename }: ExportPdfButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const element = document.querySelector(contentSelector) as HTMLElement | null;
      if (!element) {
        toast.error("Konten tidak ditemukan");
        return;
      }

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal mengekspor PDF");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
      {exporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {exporting ? "Mengekspor..." : "Download PDF"}
    </Button>
  );
}
