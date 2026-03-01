"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye, UserCheck, UserX, ShieldOff, Loader2, CheckSquare, Square,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import { getInitials } from "@/shared/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const roleBadgeClass: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700 border-red-200",
  ADMIN: "bg-red-500/10 text-red-700 border-red-200",
  TEACHER: "bg-blue-500/10 text-blue-700 border-blue-200",
  STUDENT: "bg-slate-500/10 text-slate-700 border-slate-200",
};

const statusBadgeClass: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  SUSPENDED: "bg-amber-500/10 text-amber-700 border-amber-200",
  BANNED: "bg-red-500/10 text-red-700 border-red-200",
  DELETED: "bg-slate-500/10 text-slate-700 border-slate-200",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  credits: { balance: number; freeCredits: number } | null;
  packageAccesses: { package: { title: string; isFree: boolean } }[];
}

interface UsersTableProps {
  users: UserRow[];
  hasFilter?: boolean;
}

export function UsersTable({ users, hasFilter = false }: UsersTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = users.length > 0 && selected.size === users.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulk(action: "ACTIVATE" | "SUSPEND" | "BAN") {
    const ids = Array.from(selected);
    const label = action === "ACTIVATE" ? "aktifkan" : action === "SUSPEND" ? "suspend" : "ban";
    if (!confirm(`Yakin ingin ${label} ${ids.length} pengguna terpilih?\n(Admin dan Super Admin tidak akan terpengaruh)`)) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error?.message ?? "Gagal"); return; }
      const affected = result.data?.affected ?? 0;
      toast.success(`${affected} pengguna berhasil di-${label}`);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="relative">
      {/* Floating bulk bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
            <span className="text-sm font-medium text-background">{selected.size} pengguna dipilih</span>
            <div className="h-4 w-px bg-white/20" />
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-emerald-400 hover:bg-white/10 hover:text-emerald-300" onClick={() => handleBulk("ACTIVATE")} disabled={isPending}>
              <UserCheck className="h-3.5 w-3.5" /> Aktifkan
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-amber-400 hover:bg-white/10 hover:text-amber-300" onClick={() => handleBulk("SUSPEND")} disabled={isPending}>
              <UserX className="h-3.5 w-3.5" /> Suspend
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-red-400 hover:bg-white/10 hover:text-red-300" onClick={() => handleBulk("BAN")} disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />} Ban
            </Button>
            <div className="h-4 w-px bg-white/20" />
            <button onClick={() => setSelected(new Set())} className="text-xs text-white/50 hover:text-white/80 transition-colors">Batal</button>
          </div>
        </div>
      )}

      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5 w-10">
                <button onClick={toggleAll} className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : someSelected ? <CheckSquare className="h-4 w-4 text-primary/60" /> : <Square className="h-4 w-4" />}
                </button>
              </TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead>Kredit</TableHead>
              <TableHead>Paket Aktif</TableHead>
              <TableHead className="w-[52px] pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelected = selected.has(user.id);
              const totalCredits = (user.credits?.balance ?? 0) + (user.credits?.freeCredits ?? 0);
              const activePkgs = user.packageAccesses;
              return (
                <TableRow key={user.id} className={`hover:bg-muted/40 ${isSelected ? "bg-primary/5" : ""}`}>
                  <TableCell className="pl-5">
                    <button onClick={() => toggleOne(user.id)} className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      {isSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(user.name ?? user.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${roleBadgeClass[user.role] ?? ""}`}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusBadgeClass[user.status] ?? ""}`}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "d MMM yyyy", { locale: localeId })}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{totalCredits.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    {activePkgs.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        <Badge className="text-xs bg-muted text-foreground border-0">{activePkgs[0].package.title}</Badge>
                        {activePkgs.length > 1 && <Badge className="text-xs bg-muted text-foreground border-0">+{activePkgs.length - 1}</Badge>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-5">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/users/${user.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Eye className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-muted-foreground">
                      {hasFilter ? "Tidak ada pengguna yang sesuai filter" : "Belum ada pengguna"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
