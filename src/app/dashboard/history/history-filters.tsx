"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "score_desc", label: "Skor Tertinggi" },
  { value: "score_asc", label: "Skor Terendah" },
] as const;

interface HistoryFiltersProps {
  defaultQ: string;
  defaultSort: string;
  defaultStatus: string;
}

export function HistoryFilters({
  defaultQ,
  defaultSort,
  defaultStatus,
}: HistoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const status = overrides.status ?? searchParams.get("status") ?? defaultStatus;
      const q = overrides.q ?? searchParams.get("q") ?? defaultQ;
      const sort = overrides.sort ?? searchParams.get("sort") ?? defaultSort;

      if (status && status !== "all") params.set("status", status);
      if (q) params.set("q", q);
      if (sort && sort !== "newest") params.set("sort", sort);

      const qs = params.toString();
      return `/dashboard/history${qs ? `?${qs}` : ""}`;
    },
    [searchParams, defaultQ, defaultSort, defaultStatus]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    startTransition(() => {
      router.push(buildUrl({ q, page: "1" }));
    });
  }

  function handleSort(sort: string) {
    startTransition(() => {
      router.push(buildUrl({ sort, page: "1" }));
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari nama paket..."
          defaultValue={defaultQ}
          onChange={handleSearch}
        />
      </div>
      <Select defaultValue={defaultSort} onValueChange={handleSort}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
