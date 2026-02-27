import { Metadata } from "next";
import { ParentDashboardContent } from "./parent-dashboard-content";

export const metadata: Metadata = {
    title: "Dashboard Orang Tua | Toutopia",
    description: "Pantau progress belajar anak",
};

export default function ParentDashboardPage() {
    return <ParentDashboardContent />;
}
