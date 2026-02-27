import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

// GET: Generate report data for PDF export (client-side PDF generation)
export async function GET(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") ?? "all"; // "week", "month", "all"

        let dateFilter: Date | undefined;
        const now = new Date();

        if (period === "week") {
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === "month") {
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const whereDate = dateFilter ? { finishedAt: { gte: dateFilter } } : {};

        // Get all completed attempts
        const attempts = await prisma.examAttempt.findMany({
            where: {
                userId: user.id,
                status: "COMPLETED",
                ...whereDate,
            },
            include: {
                package: {
                    select: {
                        title: true,
                        category: { select: { name: true } },
                        totalQuestions: true,
                        passingScore: true,
                    },
                },
                answers: {
                    select: { isCorrect: true, timeSpentSeconds: true },
                },
            },
            orderBy: { finishedAt: "desc" },
        });

        // Get user profile
        const profile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
            select: {
                currentStreak: true,
                longestStreak: true,
            },
        });

        // Get badges
        const badges = await prisma.userBadge.findMany({
            where: { userId: user.id },
            include: { badge: { select: { name: true, icon: true, category: true } } },
            orderBy: { earnedAt: "desc" },
        });

        // Calculate analytics
        const totalAttempts = attempts.length;
        const totalCorrect = attempts.reduce((sum, a) => sum + a.answers.filter((ans) => ans.isCorrect).length, 0);
        const totalQuestions = attempts.reduce((sum, a) => sum + a.answers.length, 0);
        const avgScore = totalAttempts > 0
            ? attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalAttempts
            : 0;
        const totalStudyTime = attempts.reduce(
            (sum, a) => sum + a.answers.reduce((s, ans) => s + ans.timeSpentSeconds, 0),
            0
        );

        // Category breakdown
        const categoryMap = new Map<string, { total: number; correct: number; attempts: number }>();
        for (const attempt of attempts) {
            const catName = attempt.package.category.name;
            const existing = categoryMap.get(catName) ?? { total: 0, correct: 0, attempts: 0 };
            existing.total += attempt.answers.length;
            existing.correct += attempt.answers.filter((a) => a.isCorrect).length;
            existing.attempts += 1;
            categoryMap.set(catName, existing);
        }

        const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({
            category: name,
            totalQuestions: data.total,
            correctAnswers: data.correct,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            attempts: data.attempts,
        }));

        // Score trend (last 10 attempts)
        const scoreTrend = attempts.slice(0, 10).reverse().map((a) => ({
            date: a.finishedAt?.toISOString() ?? "",
            score: a.score ?? 0,
            package: a.package.title,
        }));

        // Passing rate
        const passedAttempts = attempts.filter((a) => {
            const passingScore = a.package.passingScore;
            return passingScore ? (a.score ?? 0) >= passingScore : false;
        });

        return successResponse({
            user: {
                name: user.name,
                email: user.email,
            },
            period,
            generatedAt: new Date().toISOString(),
            summary: {
                totalAttempts,
                totalQuestions,
                totalCorrect,
                avgScore: Math.round(avgScore * 100) / 100,
                totalStudyTimeMinutes: Math.round(totalStudyTime / 60),
                passingRate: totalAttempts > 0 ? Math.round((passedAttempts.length / totalAttempts) * 100) : 0,
                currentStreak: profile?.currentStreak ?? 0,
                longestStreak: profile?.longestStreak ?? 0,
            },
            categoryBreakdown,
            scoreTrend,
            recentAttempts: attempts.slice(0, 10).map((a) => ({
                packageTitle: a.package.title,
                category: a.package.category.name,
                score: a.score,
                totalCorrect: a.answers.filter((ans) => ans.isCorrect).length,
                totalQuestions: a.answers.length,
                finishedAt: a.finishedAt?.toISOString() ?? null,
                passed: a.package.passingScore ? (a.score ?? 0) >= a.package.passingScore : null,
            })),
            badges: badges.map((b) => ({
                name: b.badge.name,
                icon: b.badge.icon,
                category: b.badge.category,
                earnedAt: b.earnedAt.toISOString(),
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
