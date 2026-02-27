import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { generatePlanSchema } from "@/shared/lib/validators/planner.validators";

interface SubjectWithTopics {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

interface GeneratedTask {
  title: string;
  description: string | null;
  date: Date;
  startTime: string | null;
  duration: number;
  priority: number;
  phase: string;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  return date.toISOString().substring(0, 10);
}

function generateStudyTasks(
  subjects: SubjectWithTopics[],
  startDate: Date,
  targetDate: Date,
  hoursPerDay: number
): GeneratedTask[] {
  const totalDays = Math.floor(
    (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (totalDays < 7) return [];

  const phase1Days = Math.floor(totalDays * 0.6);
  const phase2Days = Math.floor(totalDays * 0.25);
  // phase3Days is the remainder

  const minutesPerDay = hoursPerDay * 60;
  const tasks: GeneratedTask[] = [];

  // Flatten all topics from all subjects
  const allTopics: { subjectName: string; topicName: string }[] = [];
  for (const subject of subjects) {
    if (subject.topics.length === 0) {
      allTopics.push({ subjectName: subject.name, topicName: subject.name });
    } else {
      for (const topic of subject.topics) {
        allTopics.push({ subjectName: subject.name, topicName: topic.name });
      }
    }
  }

  // If no topics at all, create generic tasks per subject
  if (allTopics.length === 0 && subjects.length === 0) {
    return [];
  }

  let topicIndex = 0;
  let subjectIndex = 0;

  // === PHASE 1: Materi Baru ===
  for (let d = 0; d < phase1Days; d++) {
    const date = addDays(startDate, d);
    const weekend = isWeekend(date);
    const dayMinutes = weekend ? Math.floor(minutesPerDay * 0.7) : minutesPerDay;

    if (allTopics.length > 0) {
      // Session 1: main topic study
      const topic = allTopics[topicIndex % allTopics.length];
      const session1Duration = Math.min(Math.floor(dayMinutes * 0.6), 90);
      tasks.push({
        title: `Pelajari ${topic.subjectName}: ${topic.topicName}`,
        description: `Fase Materi — Pelajari dan pahami konsep ${topic.topicName} pada ${topic.subjectName}`,
        date,
        startTime: "08:00",
        duration: session1Duration,
        priority: 3,
        phase: "materi",
      });
      topicIndex++;

      // Session 2: practice on the topic (if enough time)
      const remainingMinutes = dayMinutes - session1Duration;
      if (remainingMinutes >= 30) {
        const nextTopic = allTopics[topicIndex % allTopics.length];
        tasks.push({
          title: `Latihan Soal ${nextTopic.subjectName}: ${nextTopic.topicName}`,
          description: `Fase Materi — Kerjakan latihan soal untuk memperkuat pemahaman`,
          date,
          startTime: session1Duration <= 60 ? "09:30" : "10:00",
          duration: Math.min(remainingMinutes, 60),
          priority: 2,
          phase: "materi",
        });
      }
    } else {
      // Fallback: use subjects directly
      const subject = subjects[subjectIndex % subjects.length];
      tasks.push({
        title: `Pelajari ${subject.name}`,
        description: `Fase Materi — Pelajari materi ${subject.name}`,
        date,
        startTime: "08:00",
        duration: dayMinutes,
        priority: 3,
        phase: "materi",
      });
      subjectIndex++;
    }
  }

  // === PHASE 2: Latihan & Review ===
  const phase2Start = phase1Days;
  for (let d = 0; d < phase2Days; d++) {
    const date = addDays(startDate, phase2Start + d);
    const weekend = isWeekend(date);
    const dayMinutes = weekend ? Math.floor(minutesPerDay * 0.7) : minutesPerDay;

    if (d % 3 === 0) {
      // Try out mini
      const subject = subjects[d % subjects.length];
      tasks.push({
        title: `Try Out Mini: ${subject?.name ?? "Campuran"}`,
        description: `Fase Latihan — Simulasi try out untuk mengukur pemahaman`,
        date,
        startTime: "08:00",
        duration: Math.min(dayMinutes, 90),
        priority: 3,
        phase: "latihan",
      });

      const remaining = dayMinutes - Math.min(dayMinutes, 90);
      if (remaining >= 30) {
        tasks.push({
          title: `Review Hasil Try Out`,
          description: `Fase Latihan — Analisis jawaban dan perbaiki pemahaman`,
          date,
          startTime: "10:00",
          duration: Math.min(remaining, 60),
          priority: 2,
          phase: "latihan",
        });
      }
    } else {
      // Review difficult topics
      const subject = subjects[(subjectIndex++) % subjects.length];
      const session1Duration = Math.floor(dayMinutes * 0.55);
      tasks.push({
        title: `Review ${subject?.name ?? "Materi"}`,
        description: `Fase Latihan — Review dan pendalaman materi yang sudah dipelajari`,
        date,
        startTime: "08:00",
        duration: Math.min(session1Duration, 75),
        priority: 2,
        phase: "latihan",
      });

      const remaining = dayMinutes - session1Duration;
      if (remaining >= 30) {
        const nextSubject = subjects[(subjectIndex) % subjects.length];
        tasks.push({
          title: `Latihan Soal ${nextSubject?.name ?? "Campuran"}`,
          description: `Fase Latihan — Kerjakan soal-soal latihan untuk memantapkan pemahaman`,
          date,
          startTime: "10:00",
          duration: Math.min(remaining, 60),
          priority: 2,
          phase: "latihan",
        });
      }
    }
  }

  // === PHASE 3: Persiapan Akhir ===
  const phase3Start = phase1Days + phase2Days;
  const phase3Days = totalDays - phase3Start;
  for (let d = 0; d < phase3Days; d++) {
    const date = addDays(startDate, phase3Start + d);
    const isLastDay = d === phase3Days - 1;

    if (isLastDay) {
      // H-1: rest day
      tasks.push({
        title: "Istirahat & Persiapan Mental",
        description: "H-1 Ujian — Istirahat yang cukup, review ringan jika perlu, dan siapkan mental",
        date,
        startTime: "09:00",
        duration: 30,
        priority: 1,
        phase: "review",
      });
    } else {
      // Light review
      const subject = subjects[d % subjects.length];
      tasks.push({
        title: `Review Ringan: ${subject?.name ?? "Materi"}`,
        description: `Fase Persiapan Akhir — Review ringkasan dan poin-poin penting`,
        date,
        startTime: "08:00",
        duration: Math.min(Math.floor(minutesPerDay * 0.5), 60),
        priority: 2,
        phase: "review",
      });

      if (minutesPerDay >= 60) {
        tasks.push({
          title: `Latihan Cepat: Soal-soal Penting`,
          description: `Fase Persiapan Akhir — Kerjakan soal-soal kunci untuk menjaga kesiapan`,
          date,
          startTime: "09:30",
          duration: Math.min(Math.floor(minutesPerDay * 0.4), 45),
          priority: 1,
          phase: "review",
        });
      }
    }
  }

  return tasks;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`planner-generate:${ip}`, { maxRequests: 5, windowMs: 300000 });
    if (!rl.success) {
      return errorResponse("RATE_LIMITED", "Terlalu banyak permintaan", 429);
    }

    const user = await requireAuth();
    const body = await request.json();
    const data = generatePlanSchema.parse(body);

    // Validate target date is at least 7 days from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const targetDate = new Date(data.targetDate);
    targetDate.setHours(23, 59, 59, 999);

    const diffDays = Math.floor(
      (targetDate.getTime() - tomorrow.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 7) {
      return errorResponse(
        "INVALID_TARGET_DATE",
        "Tanggal ujian harus minimal 7 hari dari sekarang",
        400
      );
    }

    // Fetch category with subjects and topics
    const category = await prisma.examCategory.findUnique({
      where: { id: data.categoryId, isActive: true },
      select: {
        id: true,
        name: true,
        subCategories: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            subjects: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                name: true,
                topics: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "Kategori ujian tidak ditemukan", 404);
    }

    // Flatten subjects across all subcategories
    const subjects: SubjectWithTopics[] = [];
    for (const subCat of category.subCategories) {
      for (const subject of subCat.subjects) {
        subjects.push({
          id: subject.id,
          name: subject.name,
          topics: subject.topics,
        });
      }
    }

    if (subjects.length === 0) {
      return errorResponse(
        "NO_SUBJECTS",
        "Kategori ini belum memiliki materi/subjek yang bisa dijadwalkan",
        400
      );
    }

    // Generate tasks
    const generatedTasks = generateStudyTasks(
      subjects,
      tomorrow,
      targetDate,
      data.hoursPerDay
    );

    if (generatedTasks.length === 0) {
      return errorResponse(
        "INSUFFICIENT_DAYS",
        "Waktu tidak cukup untuk membuat jadwal belajar",
        400
      );
    }

    // Create plan and tasks in a transaction
    const plan = await prisma.$transaction(async (tx) => {
      const studyPlan = await tx.studyPlan.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          title: `Persiapan ${category.name}`,
          description: `Jadwal belajar otomatis untuk ${category.name}. ${subjects.length} subjek, ${data.hoursPerDay} jam/hari.`,
          targetDate,
          isActive: true,
        },
      });

      await tx.studyTask.createMany({
        data: generatedTasks.map((task) => ({
          planId: studyPlan.id,
          title: task.title,
          description: task.description,
          date: task.date,
          startTime: task.startTime,
          duration: task.duration,
          priority: task.priority,
        })),
      });

      return studyPlan;
    });

    return successResponse(
      {
        planId: plan.id,
        title: plan.title,
        targetDate: plan.targetDate?.toISOString() ?? null,
        totalTasks: generatedTasks.length,
        totalDays: diffDays,
        phases: {
          materi: generatedTasks.filter((t) => t.phase === "materi").length,
          latihan: generatedTasks.filter((t) => t.phase === "latihan").length,
          review: generatedTasks.filter((t) => t.phase === "review").length,
        },
      },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
