import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { PackageDetail } from "./package-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Paket Ujian",
};

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pkg = await prisma.examPackage.findUnique({
    where: { id },
    include: {
      category: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          subject: { select: { id: true, name: true } },
          questions: {
            orderBy: { order: "asc" },
            include: {
              question: {
                select: {
                  id: true,
                  content: true,
                  type: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!pkg) notFound();

  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      subCategories: {
        orderBy: { order: "asc" },
        include: {
          subjects: {
            orderBy: { order: "asc" },
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return <PackageDetail pkg={pkg} categories={categories} />;
}
