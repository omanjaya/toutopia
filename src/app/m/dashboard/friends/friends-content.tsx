"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Loader2,
  Mail,
  Check,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface Friend {
  id: string;
  name: string;
  avatar: string | null;
}

interface ComparisonItem {
  friendId: string;
  friend: Friend;
  myAvgScore: number;
  friendAvgScore: number;
  commonPackages: number;
  myTotalAttempts: number;
  friendTotalAttempts: number;
}

interface PendingInvite {
  id: string;
  inviteCode: string;
  user: Friend;
}

interface FriendsData {
  comparisons: ComparisonItem[];
  pendingInvites: PendingInvite[];
}

export function MobileFriendsContent() {
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(): Promise<void> {
    try {
      const res = await fetch("/api/friends");
      const result = await res.json();
      if (result.success) {
        setData(result.data as FriendsData);
      }
    } catch {
      toast.error("Gagal memuat data teman");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(): Promise<void> {
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: email }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan terkirim!");
        setEmail("");
        await fetchData();
      } else {
        toast.error(result.error?.message ?? "Gagal mengirim undangan");
      }
    } catch {
      toast.error("Gagal mengirim undangan");
    } finally {
      setInviting(false);
    }
  }

  async function handleAccept(inviteCode: string): Promise<void> {
    setAccepting(inviteCode);
    try {
      const res = await fetch("/api/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan diterima!");
        await fetchData();
      }
    } catch {
      toast.error("Gagal menerima undangan");
    } finally {
      setAccepting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Bandingkan dengan Teman
          </h1>
          <p className="text-xs text-muted-foreground">
            Lihat siapa yang lebih jago!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Invite Friend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-primary" />
              Undang Teman
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
                  placeholder="Email teman..."
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvite();
                  }}
                />
              </div>
              <Button
                onClick={handleInvite}
                disabled={inviting || !email.trim()}
                className="gap-1 min-h-[44px]"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Undang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {data?.pendingInvites && data.pendingInvites.length > 0 && (
          <Card className="border-2 border-amber-200/60 bg-amber-50/30 shadow-sm dark:border-amber-800/30 dark:bg-amber-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Undangan Masuk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-background p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {invite.user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {invite.user.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invite.inviteCode)}
                    disabled={accepting === invite.inviteCode}
                    className="gap-1 min-h-[40px]"
                  >
                    {accepting === invite.inviteCode ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Terima
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Comparison Cards */}
        {data?.comparisons && data.comparisons.length > 0 ? (
          <div className="space-y-3">
            {data.comparisons.map((comp) => {
              const isWinning = comp.myAvgScore > comp.friendAvgScore;
              const isTied = comp.myAvgScore === comp.friendAvgScore;

              return (
                <Card key={comp.friendId} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {comp.friend.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {comp.friend.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comp.commonPackages} paket sama ·{" "}
                            {comp.friendTotalAttempts} percobaan
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          isWinning
                            ? "default"
                            : isTied
                              ? "secondary"
                              : "destructive"
                        }
                        className="shrink-0 ml-2"
                      >
                        {isWinning
                          ? "Kamu Unggul"
                          : isTied
                            ? "Seri"
                            : "Tertinggal"}
                      </Badge>
                    </div>

                    {/* Score Comparison Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-primary">
                          Kamu: {comp.myAvgScore}
                        </span>
                        <span className="font-medium text-muted-foreground">
                          {comp.friend.name}: {comp.friendAvgScore}
                        </span>
                      </div>
                      <div className="flex h-3 gap-1 overflow-hidden rounded-full">
                        <div
                          className="rounded-l-full bg-primary transition-all"
                          style={{
                            width: `${(comp.myAvgScore / (comp.myAvgScore + comp.friendAvgScore)) * 100}%`,
                          }}
                        />
                        <div
                          className="rounded-r-full bg-muted-foreground/30 transition-all"
                          style={{
                            width: `${(comp.friendAvgScore / (comp.myAvgScore + comp.friendAvgScore)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Undang teman untuk mulai membandingkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
