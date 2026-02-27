import { Metadata } from "next";
import { LiveEventsContent } from "./live-events-content";

export const metadata: Metadata = {
    title: "Tryout Bersama | Toutopia",
    description: "Ikuti tryout bersama secara live, bersaing dengan peserta lain secara realtime!",
};

export default function LiveEventsPage() {
    return <LiveEventsContent />;
}
