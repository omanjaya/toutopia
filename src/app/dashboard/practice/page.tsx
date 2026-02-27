import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { PracticeSetup } from "./practice-setup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mode Latihan",
  description: "Latihan soal tanpa timer, bisa diulang sepuasnya",
};

interface CategoryData {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    subjects: {
      id: string;
      name: string;
      topics: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

async function getCategories(): Promise<CategoryData[]> {
  return prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      subCategories: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          subjects: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              topics: {
                orderBy: { order: "asc" },
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });
}

export default async function PracticePage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Mode Latihan</h2>
        <p className="text-muted-foreground">
          Latihan soal tanpa timer dan batas waktu. Jawaban langsung
          ditampilkan.
        </p>
      </div>
      <PracticeSetup categories={categories} />
    </div>
  );
}
