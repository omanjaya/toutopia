import type { Metadata } from "next";
import { MobileFriendsContent } from "./friends-content";

export const metadata: Metadata = {
  title: "Bandingkan dengan Teman | Toutopia",
  description: "Bandingkan hasil tryout-mu dengan teman",
};

export default function MobileFriendsPage() {
  return <MobileFriendsContent />;
}
