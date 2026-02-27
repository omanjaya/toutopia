import { Metadata } from "next";
import { SubscriptionsContent } from "./subscriptions-content";

export const metadata: Metadata = {
    title: "Berlangganan | Toutopia",
    description: "Pilih paket berlangganan untuk akses semua tryout",
};

export default function SubscriptionsPage() {
    return <SubscriptionsContent />;
}
