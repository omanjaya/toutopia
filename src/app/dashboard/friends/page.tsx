import { Metadata } from "next";
import { FriendsContent } from "./friends-content";

export const metadata: Metadata = {
    title: "Bandingkan dengan Teman | Toutopia",
    description: "Bandingkan hasil tryout-mu dengan teman",
};

export default function FriendsPage() {
    return <FriendsContent />;
}
