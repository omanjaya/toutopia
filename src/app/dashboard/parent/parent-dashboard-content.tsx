"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Shield,
    UserPlus,
    Loader2,
    Trophy,
    Flame,
    BookOpen,
    Clock,
    Mail,
    Send,
    Award,
    TrendingUp,
    GraduationCap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ChildProfile {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    profile: {
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        targetExam: string | null;
        school: string | null;
    } | null;
}

interface ChildAttempt {
    packageTitle: string;
    category: string;
    score: number | null;
    totalCorrect: number | null;
    totalQuestions: number;
    finishedAt: string | null;
}

interface ChildBadge {
    name: string;
    icon: string;
    earnedAt: string;
}

interface ChildData {
    child: ChildProfile;
    stats: {
        totalAttempts: number;
        avgScore: number;
        lastActive: string | null;
    };
    recentAttempts: ChildAttempt[];
    badges: ChildBadge[];
}

interface PendingInvite {
    id: string;
    child: { name: string; email: string };
}

interface ParentData {
    children: ChildData[];
    pendingInvites: PendingInvite[];
}

export function ParentDashboardContent() {
    const [data, setData] = useState<ParentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [linking, setLinking] = useState(false);
    const [selectedChild, setSelectedChild] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData(): Promise<void> {
        try {
            const res = await fetch("/api/parent");
            const result = await res.json();
            if (result.success) {
                const parentData = result.data as ParentData;
                setData(parentData);
                if (parentData.children.length > 0 && !selectedChild) {
                    setSelectedChild(parentData.children[0].child.id);
                }
            }
        } catch {
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }

    async function handleLink(): Promise<void> {
        if (!email.trim()) return;
        setLinking(true);
        try {
            const res = await fetch("/api/parent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childEmail: email }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Undangan terkirim! Menunggu persetujuan anak.");
                setEmail("");
                await fetchData();
            } else {
                toast.error(result.error?.message ?? "Gagal menautkan");
            }
        } catch {
            toast.error("Gagal menautkan");
        } finally {
            setLinking(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeChild = data?.children.find((c) => c.child.id === selectedChild);

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Orang Tua</h1>
                    <p className="text-sm text-muted-foreground">Pantau progress belajar anak</p>
                </div>
            </div>

            {/* Link Child */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Tambahkan Anak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email akun anak..."
                                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleLink();
                                }}
                            />
                        </div>
                        <Button onClick={handleLink} disabled={linking || !email.trim()} className="gap-1">
                            {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Tautkan
                        </Button>
                    </div>
                    {data?.pendingInvites && data.pendingInvites.length > 0 && (
                        <div className="mt-3 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Menunggu persetujuan:</p>
                            {data.pendingInvites.map((inv) => (
                                <div key={inv.id} className="flex items-center gap-2 text-xs text-amber-600">
                                    <Clock className="h-3 w-3" />
                                    {inv.child.name} ({inv.child.email})
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Child Tabs */}
            {data?.children && data.children.length > 0 && (
                <>
                    {data.children.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {data.children.map((child) => (
                                <button
                                    key={child.child.id}
                                    onClick={() => setSelectedChild(child.child.id)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                                        selectedChild === child.child.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <GraduationCap className="h-4 w-4" />
                                    {child.child.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeChild && (
                        <div className="space-y-4">
                            {/* Child Profile Card */}
                            <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm dark:from-violet-950/20 dark:to-purple-950/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                                            {activeChild.child.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{activeChild.child.name}</h2>
                                            <p className="text-sm text-muted-foreground">
                                                {activeChild.child.profile?.school ?? "Belum diisi"} ·{" "}
                                                {activeChild.child.profile?.targetExam ?? "Belum ditentukan"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Terakhir aktif:{" "}
                                                {activeChild.stats.lastActive
                                                    ? new Date(activeChild.stats.lastActive).toLocaleDateString("id-ID")
                                                    : "Belum pernah"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <Card className="border-0 bg-card shadow-sm">
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Trophy className="mb-1 h-5 w-5 text-amber-500" />
                                        <p className="text-2xl font-bold tabular-nums">{activeChild.stats.avgScore}</p>
                                        <p className="text-xs text-muted-foreground">Rata-rata</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-card shadow-sm">
                                    <CardContent className="flex flex-col items-center p-4">
                                        <BookOpen className="mb-1 h-5 w-5 text-blue-500" />
                                        <p className="text-2xl font-bold tabular-nums">{activeChild.stats.totalAttempts}</p>
                                        <p className="text-xs text-muted-foreground">Percobaan</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-card shadow-sm">
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Flame className="mb-1 h-5 w-5 text-orange-500" />
                                        <p className="text-2xl font-bold tabular-nums">
                                            {activeChild.child.profile?.currentStreak ?? 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Streak</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 bg-card shadow-sm">
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Award className="mb-1 h-5 w-5 text-yellow-500" />
                                        <p className="text-2xl font-bold tabular-nums">{activeChild.badges.length}</p>
                                        <p className="text-xs text-muted-foreground">Badge</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Attempts */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Riwayat Terakhir
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {activeChild.recentAttempts.length > 0 ? (
                                        activeChild.recentAttempts.map((att, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="text-sm font-medium">{att.packageTitle}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {att.category} ·{" "}
                                                        {att.finishedAt ? new Date(att.finishedAt).toLocaleDateString("id-ID") : "-"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold tabular-nums">
                                                        {att.totalCorrect ?? 0}/{att.totalQuestions}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Skor: {att.score ?? 0}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Belum ada riwayat ujian
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Badges */}
                            {activeChild.badges.length > 0 && (
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Award className="h-5 w-5 text-amber-500" />
                                            Badge
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {activeChild.badges.map((badge, idx) => (
                                                <Badge key={idx} variant="outline" className="gap-1 px-3 py-1.5">
                                                    <span className="text-base">{badge.icon}</span>
                                                    {badge.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </>
            )}

            {(!data?.children || data.children.length === 0) && !data?.pendingInvites?.length && (
                <div className="py-12 text-center">
                    <GraduationCap className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                        Belum ada anak yang ditautkan. Masukkan email akun anak untuk mulai monitoring.
                    </p>
                </div>
            )}
        </div>
    );
}
