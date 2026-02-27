import type { Metadata } from "next";
import { MobileParentDashboardContent } from "./parent-dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard Orang Tua | Toutopia",
  description: "Pantau progress belajar anak",
};

export default function MobileParentDashboardPage() {
  return <MobileParentDashboardContent />;
}
