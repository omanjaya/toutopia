import type { Metadata } from "next";
import { MobileLiveEventsContent } from "./live-events-content";

export const metadata: Metadata = {
  title: "Tryout Bersama | Toutopia",
  description:
    "Ikuti tryout bersama secara live, bersaing dengan peserta lain secara realtime!",
};

export default function MobileLiveEventsPage() {
  return <MobileLiveEventsContent />;
}
