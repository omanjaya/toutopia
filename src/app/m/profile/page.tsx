import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  History,
  Bookmark,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Coins,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil",
};

interface ProfileStats {
  completedAttempts: number;
  avgScore: number | null;
  creditBalance: number;
  freeCredits: number;
}

async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [scoreAgg, credits] = await Promise.all([
    prisma.examAttempt.aggregate({
      where: { userId, status: "COMPLETED", score: { not: null } },
      _count: true,
      _avg: { score: true },
    }),
    prisma.userCredit.findUnique({
      where: { userId },
      select: { balance: true, freeCredits: true },
    }),
  ]);

  return {
    completedAttempts: scoreAgg._count,
    avgScore: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score) : null,
    creditBalance: credits?.balance ?? 0,
    freeCredits: credits?.freeCredits ?? 0,
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function MenuItem({ href, icon, label }: MenuItemProps) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 px-4 py-3 transition-colors active:bg-muted/50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

export default async function MobileProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const userId = (session.user as { id: string }).id;
  const stats = await getProfileStats(userId);
  const userName = session.user.name ?? "Pengguna";
  const userEmail = session.user.email ?? "";

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* User Info */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {getInitials(userName)}
        </div>
        <h1 className="text-lg font-semibold">{userName}</h1>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <BookOpen className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-bold tabular-nums">
            {stats.completedAttempts}
          </span>
          <span className="text-[10px] text-muted-foreground">Total ujian</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <TrendingUp className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-bold tabular-nums">
            {stats.avgScore ?? "-"}
          </span>
          <span className="text-[10px] text-muted-foreground">Skor rata-rata</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <Coins className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-bold tabular-nums">
            {stats.creditBalance + stats.freeCredits}
          </span>
          <span className="text-[10px] text-muted-foreground">Kredit sisa</span>
        </div>
      </div>

      {/* Menu Items */}
      <Card className="border-0 shadow-sm">
        <CardContent className="divide-y p-0">
          <MenuItem
            href="/m/dashboard/history"
            icon={<History className="h-4 w-4" />}
            label="Riwayat Ujian"
          />
          <MenuItem
            href="/m/dashboard/bookmarks"
            icon={<Bookmark className="h-4 w-4" />}
            label="Bookmark"
          />
          <MenuItem
            href="/m/profile/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Pengaturan"
          />
          <MenuItem
            href="/m/contact"
            icon={<HelpCircle className="h-4 w-4" />}
            label="Bantuan"
          />
        </CardContent>
      </Card>

      {/* Logout */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/m/login" });
        }}
        className="mt-4"
      >
        <button
          type="submit"
          className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-600 transition-colors active:bg-red-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="flex-1 text-left text-sm font-medium">Keluar</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
