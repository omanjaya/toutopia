"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Trash2, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { NotificationType } from "@prisma/client";

interface NotificationRow {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationsLogProps {
  notifications: NotificationRow[];
  total: number;
  page: number;
  totalPages: number;
  currentType: string;
  currentQ: string;
}

const TYPE_TABS: { label: string; value: string }[] = [
  { label: "Semua", value: "" },
  { label: "System", value: "SYSTEM" },
  { label: "Payment", value: "PAYMENT_SUCCESS" },
  { label: "Nilai", value: "SCORE_UPDATE" },
  { label: "Paket Baru", value: "PACKAGE_NEW" },
  { label: "Reminder", value: "STUDY_REMINDER" },
  { label: "Deadline", value: "EXAM_DEADLINE" },
];

const typeBadgeVariants: Record<NotificationType, string> = {
  SYSTEM: "bg-slate-100 text-slate-700",
  PAYMENT_SUCCESS: "bg-emerald-100 text-emerald-700",
  SCORE_UPDATE: "bg-blue-100 text-blue-700",
  PACKAGE_NEW: "bg-violet-100 text-violet-700",
  STUDY_REMINDER: "bg-amber-100 text-amber-700",
  EXAM_DEADLINE: "bg-orange-100 text-orange-700",
  QUESTION_STATUS: "bg-pink-100 text-pink-700",
};

const typeLabels: Record<NotificationType, string> = {
  SYSTEM: "System",
  PAYMENT_SUCCESS: "Payment",
  SCORE_UPDATE: "Nilai",
  PACKAGE_NEW: "Paket Baru",
  STUDY_REMINDER: "Reminder",
  EXAM_DEADLINE: "Deadline",
  QUESTION_STATUS: "Status Soal",
};

export function NotificationsLog({
  notifications,
  total,
  page,
  totalPages,
  currentType,
  currentQ,
}: NotificationsLogProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(currentQ);

  function buildUrl(updates: Record<string, string>): string {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    return `${pathname}?${params.toString()}`;
  }

  function handleTypeChange(value: string): void {
    startTransition(() => {
      router.push(buildUrl({ type: value, page: "1" }));
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl({ q: searchValue, page: "1" }));
    });
  }

  function handlePageChange(newPage: number): void {
    startTransition(() => {
      router.push(buildUrl({ page: String(newPage) }));
    });
  }

  async function handleDelete(id: string): Promise<void> {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      const json: unknown = await res.json();

      if (
        json &&
        typeof json === "object" &&
        "success" in json &&
        json.success === true
      ) {
        toast.success("Notifikasi berhasil dihapus");
        router.refresh();
      } else {
        const msg =
          json &&
          typeof json === "object" &&
          "error" in json &&
          json.error !== null &&
          typeof json.error === "object" &&
          "message" in json.error
            ? String((json.error as { message: string }).message)
            : "Gagal menghapus notifikasi";
        toast.error(msg);
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                currentType === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Cari judul atau pengguna..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 w-56 text-sm"
          />
          <Button type="submit" variant="outline" size="sm" className="h-8">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Table */}
      <div
        className={cn(
          "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]",
          isPending && "opacity-60"
        )}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <p className="text-sm">Tidak ada notifikasi ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pengguna</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Judul</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipe</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">{notif.user.name}</p>
                        <p className="text-xs text-muted-foreground">{notif.user.email}</p>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium leading-tight">{notif.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {notif.message}
                        </p>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          typeBadgeVariants[notif.type] ?? "bg-gray-100 text-gray-700"
                        )}
                      >
                        {typeLabels[notif.type] ?? notif.type}
                      </span>
                    </td>

                    {/* Read status */}
                    <td className="px-4 py-3">
                      {notif.isRead ? (
                        <Badge variant="secondary" className="text-xs">
                          Dibaca
                        </Badge>
                      ) : (
                        <Badge className="text-xs">
                          Belum Dibaca
                        </Badge>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        disabled={deletingId === notif.id}
                        onClick={() => handleDelete(notif.id)}
                      >
                        {deletingId === notif.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Menampilkan {notifications.length} dari {total.toLocaleString("id-ID")} notifikasi
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page <= 1 || isPending}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Sebelumnya</span>
            </Button>
            <span className="px-2 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages || isPending}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Berikutnya</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
