import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Bookmark } from "lucide-react";
import { BookmarkActions } from "./bookmark-actions";

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
          difficulty: true,
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          Bookmark Soal
        </h2>
        <p className="text-muted-foreground">
          Soal-soal yang sudah kamu tandai untuk dipelajari ulang
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Belum ada soal yang di-bookmark. Tandai soal saat mengerjakan try out untuk menyimpannya di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <Card key={bm.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">
                        {bm.question.topic.subject.name}
                      </Badge>
                      <Badge variant="secondary">
                        {bm.question.topic.name}
                      </Badge>
                      <Badge
                        variant={
                          bm.question.difficulty === "EASY" || bm.question.difficulty === "VERY_EASY"
                            ? "default"
                            : bm.question.difficulty === "MEDIUM"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {bm.question.difficulty === "VERY_EASY"
                          ? "Sangat Mudah"
                          : bm.question.difficulty === "EASY"
                          ? "Mudah"
                          : bm.question.difficulty === "MEDIUM"
                          ? "Sedang"
                          : bm.question.difficulty === "HARD"
                          ? "Sulit"
                          : "Sangat Sulit"}
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-line line-clamp-3">
                      {bm.question.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ditandai{" "}
                      {bm.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <BookmarkActions bookmarkId={bm.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
