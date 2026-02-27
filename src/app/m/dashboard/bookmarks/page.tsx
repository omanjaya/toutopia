import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Bookmark,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MobileBookmarkItem, type MobileBookmarkData } from "./bookmark-item";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookmark Soal",
};

interface BookmarksPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MobileBookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 10;

  const [bookmarks, total] = await Promise.all([
    prisma.questionBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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
                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.questionBookmark.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const serialized = JSON.parse(JSON.stringify(bookmarks)) as MobileBookmarkData[];

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Bookmark Soal
          </h1>
        </div>
        {total > 0 && (
          <Badge variant="secondary" className="text-xs">
            {total} soal
          </Badge>
        )}
      </div>

      {/* Bookmark List */}
      {serialized.length > 0 ? (
        <div className="space-y-3">
          {serialized.map((bm) => (
            <MobileBookmarkItem key={bm.id} bookmark={bm} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bookmark className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">Belum ada bookmark</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Tandai soal saat mengerjakan try out untuk menyimpannya di sini
            dan pelajari ulang nanti.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/m/dashboard">
              Mulai Try Out
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/m/dashboard/bookmarks?page=${page - 1}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
          )}

          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/m/dashboard/bookmarks?page=${page + 1}`}>
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
