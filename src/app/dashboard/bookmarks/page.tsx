import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Bookmark, ArrowRight, Search } from "lucide-react";
import { BookmarkActions } from "./bookmark-actions";
import { BookmarkItem, type BookmarkData } from "./bookmark-item";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookmark Soal",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const bookmarks = await prisma.questionBookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
  });

  const serialized = JSON.parse(JSON.stringify(bookmarks)) as BookmarkData[];

  return (
    <div className="space-y-6">
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
        {serialized.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {serialized.length} soal
          </Badge>
        )}
      </div>

      {serialized.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {serialized.map((bm) => (
            <BookmarkItem key={bm.id} bookmark={bm} />
          ))}
        </div>
      )}
    </div>
  );
}
