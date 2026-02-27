import type { Metadata } from "next";
import { MobileDailyChallengeContent } from "./daily-challenge-content";

export const metadata: Metadata = {
  title: "Daily Challenge | Toutopia",
  description: "Kerjakan 1 soal setiap hari, jaga streak-mu!",
};

export default function MobileDailyChallengePage() {
  return <MobileDailyChallengeContent />;
}
