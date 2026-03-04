import { prisma } from "@/shared/lib/prisma";
import type { PracticeCategory } from "@/shared/lib/practice.constants";

export type { PracticeCategory };
export type {
  PracticeTopic,
  PracticeSubject,
  PracticeSubCategory,
  PracticeOption,
  PracticeQuestion,
} from "@/shared/lib/practice.constants";
export { DIFFICULTY_OPTIONS, QUESTION_COUNTS } from "@/shared/lib/practice.constants";

/**
 * Fetches active exam categories with their full sub-category/subject/topic
 * hierarchy. Used by both desktop and mobile practice setup pages.
 */
export async function getPracticeCategories(): Promise<PracticeCategory[]> {
  return prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
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
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });
}
