import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import {
  Plus,
  Upload,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Search,
  FileCheck,
  FileClock,
  FileText,
  FileX,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { QuestionsTable } from "./questions-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderasi Soal",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    difficulty?: string;
    page?: string;
  }>;
}

export default async function AdminQuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const statusFilter = params.status ?? "";
  const difficultyFilter = params.difficulty ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.QuestionWhereInput = {};
  if (q) where.content = { contains: q, mode: "insensitive" };
  if (statusFilter) where.status = statusFilter as Prisma.QuestionWhereInput["status"];
  if (difficultyFilter) where.difficulty = difficultyFilter as Prisma.QuestionWhereInput["difficulty"];

  const [questions, total, approvedCount, pendingCount, draftCount, rejectedCount] =
    await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
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
        },
      }),
      prisma.question.count({ where }),
      prisma.question.count({ where: { status: "APPROVED" } }),
      prisma.question.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.question.count({ where: { status: "DRAFT" } }),
      prisma.question.count({ where: { status: "REJECTED" } }),
    ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.status ?? statusFilter) p.set("status", overrides.status ?? statusFilter);
    if (overrides.difficulty ?? difficultyFilter) p.set("difficulty", overrides.difficulty ?? difficultyFilter);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/questions?${p.toString()}`;
  }

  const statCards = [
    { title: "Disetujui", value: approvedCount, icon: FileCheck, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Menunggu Review", value: pendingCount, icon: FileClock, color: "bg-amber-500/10 text-amber-600", urgent: pendingCount > 0 },
    { title: "Draft", value: draftCount, icon: FileText, color: "bg-slate-500/10 text-slate-600" },
    { title: "Ditolak", value: rejectedCount, icon: FileX, color: "bg-red-500/10 text-red-600" },
  ];

  const hasFilter = !!(q || statusFilter || difficultyFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Moderasi Soal</h2>
            <p className="text-sm text-muted-foreground">Kelola dan review soal dari pengajar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/questions/backup">
              <HardDrive className="mr-1.5 h-3.5 w-3.5" />Backup
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/questions/import">
              <Upload className="mr-1.5 h-3.5 w-3.5" />Import
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/questions/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />Buat Soal
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${cardCls} ${stat.urgent ? "ring-amber-300/60" : ""}`}
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.value.toLocaleString("id-ID")}
                </p>
                {stat.urgent && (
                  <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                    Perlu ditinjau
                  </p>
                )}
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <form method="GET" action="/admin/questions" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari isi soal..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {difficultyFilter && <input type="hidden" name="difficulty" value={difficultyFilter} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua Status" },
              { value: "PENDING_REVIEW", label: "Menunggu" },
              { value: "APPROVED", label: "Disetujui" },
              { value: "DRAFT", label: "Draft" },
              { value: "REJECTED", label: "Ditolak" },
            ].map((s) => (
              <Link
                key={s.value}
                href={buildUrl({ status: s.value, page: "1" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua Level" },
              { value: "EASY", label: "Mudah" },
              { value: "MEDIUM", label: "Sedang" },
              { value: "HARD", label: "Sulit" },
            ].map((d) => (
              <Link
                key={d.value}
                href={buildUrl({ difficulty: d.value, page: "1" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  difficultyFilter === d.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/questions">Reset</Link>
            </Button>
          )}
        </div>

        {hasFilter && (
          <p className="mt-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> soal
            {q && <> untuk &ldquo;{q}&rdquo;</>}
          </p>
        )}
      </div>

      <QuestionsTable
        questions={questions}
        hasActiveFilter={hasFilter}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> soal
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
              </Button>
            )}
            <span className="min-w-[60px] text-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
