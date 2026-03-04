import { prisma } from "@/shared/lib/prisma";

export interface BookmarkQuestionSelect {
  id: true;
  content: true;
  explanation: true;
  imageUrl: true;
  difficulty: true;
  type: true;
  options: {
    orderBy: { order: "asc" };
    select: {
      id: true;
      content: true;
      imageUrl: true;
      isCorrect: true;
    };
  };
  topic: {
    select: {
      name: true;
      subject: {
        select: {
          name: true;
        };
      };
    };
  };
}

// The Prisma-inferred shape returned when using the question select above.
export interface BookmarkQuestionData {
  id: string;
  content: string;
  explanation: string | null;
  imageUrl: string | null;
  difficulty: string;
  type: string;
  options: {
    id: string;
    content: string;
    imageUrl: string | null;
    isCorrect: boolean;
  }[];
  topic: {
    name: string;
    subject: {
      name: string;
    };
  };
}

export interface BookmarkRow {
  id: string;
  createdAt: Date;
  question: BookmarkQuestionData;
}

// The select object used consistently by both mobile and desktop bookmark queries.
const BOOKMARK_QUESTION_SELECT = {
  id: true,
  content: true,
  explanation: true,
  imageUrl: true,
  difficulty: true,
  type: true,
  options: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      isCorrect: true,
    },
  },
  topic: {
    select: {
      name: true,
      subject: {
        select: {
          name: true,
        },
      },
    },
  },
} as const;

/**
 * Fetches a paginated list of bookmarks for a user.
 * Used by both desktop and mobile bookmark pages.
 */
export async function getBookmarks(
  userId: string,
  page: number,
  limit: number,
): Promise<BookmarkRow[]> {
  return prisma.questionBookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      question: {
        select: BOOKMARK_QUESTION_SELECT,
      },
    },
  });
}

/**
 * Counts the total number of bookmarks for a user.
 * Used by both desktop and mobile bookmark pages.
 */
export async function countBookmarks(userId: string): Promise<number> {
  return prisma.questionBookmark.count({ where: { userId } });
}
