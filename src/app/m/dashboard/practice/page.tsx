import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { MobilePracticeSetup } from "./practice-setup";

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

export default async function MobilePracticePage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categories = await getCategories();

  return <MobilePracticeSetup categories={categories} />;
}
