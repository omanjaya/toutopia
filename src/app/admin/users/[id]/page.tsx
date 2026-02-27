import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { UserDetail, type UserData } from "./user-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Pengguna",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, packages, attemptCount, transactionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        role: true,
        status: true,
        referralCode: true,
        referredById: true,
        referredBy: { select: { name: true } },
        lastLoginAt: true,
        createdAt: true,
        credits: {
          select: { balance: true, freeCredits: true },
        },
        creditHistory: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        attempts: {
          orderBy: { startedAt: "desc" },
          take: 50,
          select: {
            id: true,
            status: true,
            score: true,
            startedAt: true,
            finishedAt: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
        packageAccesses: {
          orderBy: { grantedAt: "desc" },
          select: {
            id: true,
            grantedBy: true,
            grantedAt: true,
            expiresAt: true,
            reason: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
    prisma.examPackage.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.examAttempt.count({ where: { userId: id } }),
    prisma.transaction.count({ where: { userId: id } }),
  ]);

  if (!user) notFound();

  // Serialize Date objects to strings for the client component
  const serializedUser = JSON.parse(JSON.stringify(user)) as UserData;

  return (
    <UserDetail
      user={serializedUser}
      packages={packages}
      attemptCount={attemptCount}
      transactionCount={transactionCount}
    />
  );
}
