import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    // Get all completed attempts with answers
    const answers = await prisma.examAnswer.findMany({
      where: {
        attempt: { userId: user.id, status: "COMPLETED" },
        isCorrect: { not: null },
      },
      take: 1000,
      select: {
        isCorrect: true,
        question: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                    subCategory: {
                      select: {
                        category: {
                          select: { id: true, name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Aggregate by subject
    const subjectMap = new Map<string, {
      id: string;
      name: string;
      categoryName: string;
      correct: number;
      total: number;
      topics: Map<string, { id: string; name: string; correct: number; total: number }>;
    }>();

    for (const answer of answers) {
      const subject = answer.question.topic.subject;
      const topic = answer.question.topic;
      const categoryName = subject.subCategory.category.name;

      if (!subjectMap.has(subject.id)) {
        subjectMap.set(subject.id, {
          id: subject.id,
          name: subject.name,
          categoryName,
          correct: 0,
          total: 0,
          topics: new Map(),
        });
      }

      const subj = subjectMap.get(subject.id)!;
      subj.total++;
      if (answer.isCorrect) subj.correct++;

      if (!subj.topics.has(topic.id)) {
        subj.topics.set(topic.id, {
          id: topic.id,
          name: topic.name,
          correct: 0,
          total: 0,
        });
      }

      const t = subj.topics.get(topic.id)!;
      t.total++;
      if (answer.isCorrect) t.correct++;
    }

    const subjects = Array.from(subjectMap.values()).map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: s.categoryName,
      mastery: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      correct: s.correct,
      total: s.total,
      topics: Array.from(s.topics.values())
        .map((t) => ({
          id: t.id,
          name: t.name,
          mastery: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
          correct: t.correct,
          total: t.total,
        }))
        .sort((a, b) => a.mastery - b.mastery),
    }));

    // Sort by mastery ascending (weakest first)
    subjects.sort((a, b) => a.mastery - b.mastery);

    // Calculate overall stats
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const overallMastery = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0;

    return successResponse({
      overallMastery,
      totalQuestions: answers.length,
      subjects,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
