"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  History,
  Loader2,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getInitials } from "@/shared/lib/utils";
import { GrantCreditDialog } from "./grant-credit-dialog";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 30;

interface CreditRow {
  id: string;
  userId: string;
  balance: number;
  freeCredits: number;
  updatedAt: string | Date;
  historyCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface CreditsTableProps {
  initialData: CreditRow[];
  initialTotal: number;
  initialPage: number;
}

interface DialogState {
  open: boolean;
  userId: string;
  userName: string;
  currentBalance: number;
}

export function CreditsTable({
  initialData,
  initialTotal,
  initialPage,
}: CreditsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<CreditRow[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isLoading, startTransition] = useTransition();

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    userId: "",
    userName: "",
    currentBalance: 0,
  });

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "balance_desc";

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchData = useCallback(
    (newQ: string, newSort: string, newPage: number) => {
      startTransition(async () => {
        const params = new URLSearchParams();
        if (newQ) params.set("q", newQ);
        if (newSort !== "balance_desc") params.set("sort", newSort);
        if (newPage > 1) params.set("page", String(newPage));

        // Update URL
        const urlParams = new URLSearchParams(params);
        router.push(`${pathname}?${urlParams.toString()}`, { scroll: false });

        // Fetch from API
        const apiParams = new URLSearchParams();
        if (newQ) apiParams.set("q", newQ);
        apiParams.set("sort", newSort);
        apiParams.set("page", String(newPage));

        const res = await fetch(`/api/admin/credits?${apiParams.toString()}`);
        const result = (await res.json()) as {
          success: boolean;
          data?: CreditRow[];
          meta?: { total: number; page: number };
        };

        if (result.success && result.data) {
          setData(result.data);
          setTotal(result.meta?.total ?? 0);
          setPage(result.meta?.page ?? newPage);
        }
      });
    },
    [router, pathname]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQ = (formData.get("q") as string) ?? "";
    fetchData(newQ, sort, 1);
  }

  function handleSort(newSort: string) {
    fetchData(q, newSort, 1);
  }

  function handlePage(newPage: number) {
    fetchData(q, sort, newPage);
  }

  function openDialog(row: CreditRow) {
    setDialog({
      open: true,
      userId: row.userId,
      userName: row.user.name ?? row.user.email,
      currentBalance: row.balance,
    });
  }

  function handleDialogSuccess() {
    // Refresh current data
    fetchData(q, sort, page);
  }

  const sortOptions = [
    { value: "balance_desc", label: "Saldo Tertinggi" },
    { value: "balance_asc", label: "Saldo Terendah" },
    { value: "newest", label: "Terbaru" },
  ];

  return (
    <>
      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama atau email..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="sm">
              Cari
            </Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          {/* Sort */}
          <div className="flex gap-1 rounded-lg border p-1">
            {sortOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSort(s.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === s.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {(q || sort !== "balance_desc") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground"
              onClick={() => fetchData("", "balance_desc", 1)}
            >
              Reset Filter
            </Button>
          )}

          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Pengguna</TableHead>
              <TableHead>Saldo Kredit</TableHead>
              <TableHead>Kredit Gratis</TableHead>
              <TableHead>Riwayat</TableHead>
              <TableHead>Diperbarui</TableHead>
              <TableHead className="w-[100px] pr-5 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/40">
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={row.user.avatar ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(row.user.name ?? row.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {row.user.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.user.email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`tabular-nums font-semibold ${
                      row.balance > 0
                        ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
                        : "border-slate-200 bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {row.balance.toLocaleString("id-ID")}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {row.freeCredits.toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <History className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{row.historyCount}</span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(row.updatedAt), "d MMM yyyy", { locale: localeId })}
                </TableCell>

                <TableCell className="pr-5 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => openDialog(row)}
                  >
                    <Gift className="h-3.5 w-3.5" />
                    Sesuaikan
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Gift className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-muted-foreground">
                      {q ? "Tidak ada pengguna yang sesuai pencarian" : "Belum ada data kredit"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span>{" "}
            pengguna
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePage(page - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
            <span className="min-w-[60px] text-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePage(page + 1)}
            >
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog */}
      <GrantCreditDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        userId={dialog.userId}
        userName={dialog.userName}
        currentBalance={dialog.currentBalance}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
