import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Tag, BookOpen, Hash } from "lucide-react";
import { TopicsManager } from "./topics-manager";

export const metadata: Metadata = { title: "Topik — Admin" };
export const dynamic = "force-dynamic";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default async function AdminTopicsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      subCategory: { include: { category: { select: { name: true } } } },
      topics: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  const totalSubjects = subjects.length;
  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const totalQuestions = subjects.reduce(
    (sum, s) =>
      sum + s.topics.reduce((ts, t) => ts + t._count.questions, 0),
    0
  );

  const statCards = [
    {
      title: "Mata Pelajaran",
      value: totalSubjects,
      icon: BookOpen,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Topik",
      value: totalTopics,
      icon: Tag,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Total Soal",
      value: totalQuestions,
      icon: Hash,
      color: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Topik</h2>
          <p className="text-sm text-muted-foreground">
            Kelola topik soal per mata pelajaran
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      <TopicsManager subjects={subjects} />
    </div>
  );
}
