import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import { truncate } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderasi Soal",
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  APPROVED: "default",
  PENDING_REVIEW: "outline",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

const statusLabel: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING_REVIEW: "Menunggu Review",
  DRAFT: "Draft",
  REJECTED: "Ditolak",
};

const difficultyLabel: Record<string, string> = {
  VERY_EASY: "Sangat Mudah",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  VERY_HARD: "Sangat Sulit",
};

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    take: 50,
    include: {
      topic: {
        include: {
          subject: {
            include: {
              subCategory: {
                include: { category: { select: { name: true } } },
              },
            },
          },
        },
      },
      options: true,
    },
  });

  const pendingCount = questions.filter(
    (q) => q.status === "PENDING_REVIEW"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Moderasi Soal</h2>
          <p className="text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} soal menunggu review`
              : "Semua soal telah ditinjau"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/questions/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Soal
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Soal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Kesulitan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="text-sm">
                  {truncate(q.content.replace(/<[^>]*>/g, ""), 80)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {q.topic.subject.subCategory.category.name}
                </TableCell>
                <TableCell className="text-sm">
                  {difficultyLabel[q.difficulty] ?? q.difficulty}
                </TableCell>
                <TableCell className="text-sm">
                  {q.type.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[q.status] ?? "secondary"}>
                    {statusLabel[q.status] ?? q.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/questions/${q.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {questions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Belum ada soal. Buat soal pertama atau tunggu kontribusi
                  pengajar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
