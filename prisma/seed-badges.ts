import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const badges = [
  // Exam badges
  { slug: "first-exam", name: "Langkah Pertama", description: "Selesaikan ujian pertamamu", icon: "Rocket", category: "exam", requirement: { type: "exam_count", value: 1 }, xpReward: 50 },
  { slug: "five-exams", name: "Konsisten", description: "Selesaikan 5 ujian", icon: "Repeat", category: "exam", requirement: { type: "exam_count", value: 5 }, xpReward: 100 },
  { slug: "ten-exams", name: "Rajin Berlatih", description: "Selesaikan 10 ujian", icon: "Flame", category: "exam", requirement: { type: "exam_count", value: 10 }, xpReward: 200 },
  { slug: "twentyfive-exams", name: "Veteran", description: "Selesaikan 25 ujian", icon: "Medal", category: "exam", requirement: { type: "exam_count", value: 25 }, xpReward: 500 },
  { slug: "fifty-exams", name: "Legenda", description: "Selesaikan 50 ujian", icon: "Crown", category: "exam", requirement: { type: "exam_count", value: 50 }, xpReward: 1000 },

  // Score badges
  { slug: "score-500", name: "Melampaui Rata-rata", description: "Raih skor 500+", icon: "TrendingUp", category: "exam", requirement: { type: "best_score", value: 500 }, xpReward: 100 },
  { slug: "score-700", name: "Berprestasi", description: "Raih skor 700+", icon: "Star", category: "exam", requirement: { type: "best_score", value: 700 }, xpReward: 200 },
  { slug: "score-900", name: "Hampir Sempurna", description: "Raih skor 900+", icon: "Sparkles", category: "exam", requirement: { type: "best_score", value: 900 }, xpReward: 500 },
  { slug: "perfect-score", name: "Sempurna!", description: "Raih skor 1000", icon: "Trophy", category: "exam", requirement: { type: "best_score", value: 1000 }, xpReward: 1000 },

  // Streak badges
  { slug: "streak-3", name: "Tiga Hari Berturut", description: "Streak 3 hari", icon: "Zap", category: "streak", requirement: { type: "streak", value: 3 }, xpReward: 50 },
  { slug: "streak-7", name: "Seminggu Nonstop", description: "Streak 7 hari", icon: "Calendar", category: "streak", requirement: { type: "streak", value: 7 }, xpReward: 150 },
  { slug: "streak-30", name: "Sebulan Konsisten", description: "Streak 30 hari", icon: "CalendarCheck", category: "streak", requirement: { type: "streak", value: 30 }, xpReward: 500 },

  // Mastery badges
  { slug: "all-correct", name: "100% Akurat", description: "Jawab semua soal benar dalam satu ujian", icon: "CheckCircle2", category: "mastery", requirement: { type: "all_correct", value: 1 }, xpReward: 300 },
  { slug: "speed-demon", name: "Kilat", description: "Selesaikan ujian dalam kurang dari setengah waktu", icon: "Timer", category: "mastery", requirement: { type: "speed", value: 50 }, xpReward: 200 },
  { slug: "five-categories", name: "Multi Talenta", description: "Selesaikan ujian dari 5 kategori berbeda", icon: "Layers", category: "mastery", requirement: { type: "category_count", value: 5 }, xpReward: 300 },

  // Social badges
  { slug: "first-referral", name: "Pemandu", description: "Ajak 1 teman bergabung", icon: "UserPlus", category: "social", requirement: { type: "referral_count", value: 1 }, xpReward: 100 },
  { slug: "five-referrals", name: "Influencer", description: "Ajak 5 teman bergabung", icon: "Users", category: "social", requirement: { type: "referral_count", value: 5 }, xpReward: 300 },
];

async function main(): Promise<void> {
  console.log("Seeding badges...");
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement,
        xpReward: badge.xpReward,
      },
      create: badge,
    });
    console.log(`  ✓ ${badge.name}`);
  }
  console.log(`\nSeeded ${badges.length} badges.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
