import type { Metadata } from "next";
import { MobileReportContent } from "./report-content";

export const metadata: Metadata = {
  title: "Rapor Belajar | Toutopia",
  description: "Download rapor belajar lengkap dalam format PDF",
};

export default function MobileReportPage() {
  return <MobileReportContent />;
}
