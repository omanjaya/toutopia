import { Metadata } from "next";
import { DailyChallengeContent } from "./daily-challenge-content";

export const metadata: Metadata = {
    title: "Daily Challenge | Toutopia",
    description: "Kerjakan 1 soal setiap hari, jaga streak-mu!",
};

export default function DailyChallengePage() {
    return <DailyChallengeContent />;
}
