import type { Metadata } from "next";
import { MobileSubscriptionsContent } from "./subscriptions-content";

export const metadata: Metadata = {
  title: "Berlangganan | Toutopia",
  description: "Pilih paket berlangganan untuk akses semua tryout",
};

export default function MobileSubscriptionsPage() {
  return <MobileSubscriptionsContent />;
}
