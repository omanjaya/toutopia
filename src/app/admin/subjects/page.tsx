import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { BookOpen, FolderOpen, Layers, Hash } from "lucide-react";
import { SubjectsTree } from "./subjects-tree";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mata Pelajaran & Kategori",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default async function AdminSubjectsPage() {
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      subCategories: {
        orderBy: { order: "asc" },
        include: {
          subjects: {
            orderBy: { order: "asc" },
            include: {
              _count: { select: { topics: true } },
            },
          },
        },
      },
    },
  });

  const totalCategories = categories.length;
  const totalSubCategories = categories.reduce(
    (acc, cat) => acc + cat.subCategories.length,
    0
  );
  const totalSubjects = categories.reduce(
    (acc, cat) =>
      acc + cat.subCategories.reduce((a, sub) => a + sub.subjects.length, 0),
    0
  );
  const totalTopics = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subCategories.reduce(
        (a, sub) =>
          a + sub.subjects.reduce((s, subj) => s + subj._count.topics, 0),
        0
      ),
    0
  );

  const statCards = [
    {
      title: "Total Kategori",
      value: totalCategories,
      icon: FolderOpen,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Sub-Kategori",
      value: totalSubCategories,
      icon: Layers,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Mata Pelajaran",
      value: totalSubjects,
      icon: BookOpen,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Total Topik",
      value: totalTopics,
      icon: Hash,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Mata Pelajaran
          </h2>
          <p className="text-sm text-muted-foreground">
            Kelola kategori, sub-kategori, dan mata pelajaran ujian
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tree View */}
      <SubjectsTree categories={categories} />
    </div>
  );
}
