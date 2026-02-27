import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    const attempts = await prisma.examAttempt.findMany({
      where: { userId: user.id, status: "COMPLETED", score: { not: null } },
      orderBy: { finishedAt: "asc" },
      take: 100,
      select: {
        score: true,
        totalCorrect: true,
        totalIncorrect: true,
        finishedAt: true,
        package: {
          select: {
            title: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    // Group by week
    const weeklyMap = new Map<string, { scores: number[]; attempts: number; categories: Set<string> }>();

    for (const attempt of attempts) {
      if (!attempt.finishedAt || attempt.score === null) continue;
      const date = new Date(attempt.finishedAt);
      // Get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().slice(0, 10);

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { scores: [], attempts: 0, categories: new Set() });
      }
      const week = weeklyMap.get(weekKey)!;
      week.scores.push(attempt.score);
      week.attempts++;
      week.categories.add(attempt.package.category.name);
    }

    const weeklyProgress = Array.from(weeklyMap.entries()).map(([week, data]) => ({
      week,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      maxScore: Math.round(Math.max(...data.scores)),
      attempts: data.attempts,
      categories: Array.from(data.categories),
    }));

    // Milestones
    const milestones: { type: string; label: string; achieved: boolean }[] = [];
    const totalAttempts = attempts.length;
    if (totalAttempts >= 1) milestones.push({ type: "first_exam", label: "Ujian Pertama", achieved: true });
    if (totalAttempts >= 5) milestones.push({ type: "five_exams", label: "5 Ujian Selesai", achieved: true });
    if (totalAttempts >= 10) milestones.push({ type: "ten_exams", label: "10 Ujian Selesai", achieved: true });
    if (totalAttempts >= 25) milestones.push({ type: "twentyfive_exams", label: "25 Ujian Selesai", achieved: true });

    const bestScore = attempts.reduce((max, a) => Math.max(max, a.score ?? 0), 0);
    if (bestScore >= 500) milestones.push({ type: "score_500", label: "Skor 500+", achieved: true });
    if (bestScore >= 700) milestones.push({ type: "score_700", label: "Skor 700+", achieved: true });
    if (bestScore >= 900) milestones.push({ type: "score_900", label: "Skor 900+", achieved: true });

    // Add next unachieved milestones
    if (totalAttempts < 5) milestones.push({ type: "five_exams", label: "5 Ujian Selesai", achieved: false });
    if (totalAttempts < 10 && totalAttempts >= 5) milestones.push({ type: "ten_exams", label: "10 Ujian Selesai", achieved: false });
    if (bestScore < 700) milestones.push({ type: "score_700", label: "Skor 700+", achieved: false });

    return successResponse({
      weeklyProgress,
      milestones,
      totalAttempts,
      bestScore: Math.round(bestScore),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
