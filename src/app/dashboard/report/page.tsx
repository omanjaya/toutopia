import { Metadata } from "next";
import { ReportContent } from "./report-content";

export const metadata: Metadata = {
    title: "Rapor Belajar | Toutopia",
    description: "Download rapor belajar lengkap dalam format PDF",
};

export default function ReportPage() {
    return <ReportContent />;
}
