import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Bookmark, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BookmarkItem, type BookmarkData } from "./bookmark-item";
import { BookmarkFilters } from "./bookmark-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookmark Soal",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ subject?: string; q?: string; page?: string }>;
}

export default async function BookmarksPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const { subject, q, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const currentSubject = subject ?? "";
  const currentQ = q ?? "";

  // Fetch all bookmarks to derive unique subject list (no filter yet)
  const allBookmarks = await prisma.questionBookmark.findMany({
    where: { userId },
    select: {
      question: {
        select: {
          topic: {
            select: { subject: { select: { name: true } } },
          },
        },
      },
    },
  });

  const subjectSet = new Set<string>();
  for (const bm of allBookmarks) {
    subjectSet.add(bm.question.topic.subject.name);
  }
  const subjects = Array.from(subjectSet).sort((a, b) => a.localeCompare(b, "id"));

  // Build filtered where clause — merge both question filters under one key
  const questionFilter: Prisma.QuestionWhereInput = {};
  if (currentSubject) {
    questionFilter.topic = { subject: { name: currentSubject } };
  }
  if (currentQ) {
    questionFilter.content = { contains: currentQ, mode: "insensitive" };
  }

  const where: Prisma.QuestionBookmarkWhereInput = {
    userId,
    ...(Object.keys(questionFilter).length > 0 ? { question: questionFilter } : {}),
  };

  const totalCount = await prisma.questionBookmark.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const bookmarks = await prisma.questionBookmark.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      question: {
        select: {
          id: true,
          content: true,
          explanation: true,
          imageUrl: true,
          difficulty: true,
          type: true,
          options: {
            orderBy: { order: "asc" },
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
              subject: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const serialized = JSON.parse(JSON.stringify(bookmarks)) as BookmarkData[];
  const grandTotal = allBookmarks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            Bookmark Soal
          </h2>
          <p className="text-muted-foreground">
            Soal-soal yang sudah kamu tandai untuk dipelajari ulang
          </p>
        </div>
        {grandTotal > 0 && (
          <Badge className="bg-muted text-foreground text-sm">
            {grandTotal} soal
          </Badge>
        )}
      </div>

      {grandTotal === 0 ? (
        <div className={`${cardCls} border-dashed`}>
          <div className="flex flex-col items-center py-16 text-center p-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Bookmark className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">Belum ada bookmark</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Tandai soal saat mengerjakan try out untuk menyimpannya di sini dan pelajari ulang nanti.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/dashboard/tryout">
                Mulai Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters — needs Suspense because it uses useSearchParams inside */}
          <Suspense fallback={null}>
            <BookmarkFilters
              subjects={subjects}
              currentSubject={currentSubject}
              currentQ={currentQ}
              totalCount={grandTotal}
              filteredCount={totalCount}
            />
          </Suspense>

          {/* Bookmark list */}
          {serialized.length === 0 ? (
            <div className={cardCls}>
              <div className="py-12 text-center text-muted-foreground p-6">
                Tidak ada soal yang cocok dengan filter ini.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {serialized.map((bm) => (
                <BookmarkItem key={bm.id} bookmark={bm} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <PaginationButton
                href={buildHref(currentSubject, currentQ, safePage - 1)}
                disabled={safePage <= 1}
                label="Sebelumnya"
                icon="prev"
              />
              <span className="px-3 text-sm text-muted-foreground">
                Halaman <span className="font-medium text-foreground">{safePage}</span> dari{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <PaginationButton
                href={buildHref(currentSubject, currentQ, safePage + 1)}
                disabled={safePage >= totalPages}
                label="Berikutnya"
                icon="next"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function buildHref(subject: string, q: string, page: number): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/dashboard/bookmarks${qs ? `?${qs}` : ""}`;
}

function PaginationButton({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: "prev" | "next";
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {icon === "prev" && <ChevronLeft className="mr-1 h-4 w-4" />}
        {label}
        {icon === "next" && <ChevronRight className="ml-1 h-4 w-4" />}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>
        {icon === "prev" && <ChevronLeft className="mr-1 h-4 w-4" />}
        {label}
        {icon === "next" && <ChevronRight className="ml-1 h-4 w-4" />}
      </Link>
    </Button>
  );
}
