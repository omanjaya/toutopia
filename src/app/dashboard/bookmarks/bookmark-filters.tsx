"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface BookmarkFiltersProps {
  subjects: string[];
  currentSubject: string;
  currentQ: string;
  totalCount: number;
  filteredCount: number;
}

export function BookmarkFilters({
  subjects,
  currentSubject,
  currentQ,
  totalCount,
  filteredCount,
}: BookmarkFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 on filter change
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  function handleSubjectChange(subject: string) {
    startTransition(() => {
      const qs = createQueryString({ subject: subject === "all" ? null : subject });
      router.push(`${pathname}?${qs}`);
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    startTransition(() => {
      const qs = createQueryString({ q: q || null });
      router.push(`${pathname}?${qs}`);
    });
  }

  function handleClearSearch() {
    startTransition(() => {
      const qs = createQueryString({ q: null });
      router.push(`${pathname}?${qs}`);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={currentQ}
            placeholder="Cari isi soal..."
            className="h-11 pl-9 pr-9 text-base sm:h-10 sm:text-sm"
          />
          {currentQ && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={isPending} className="h-11 sm:h-10">
          Cari
        </Button>
      </form>

      {/* Subject tabs — horizontal scroll on mobile, wrap on desktop */}
      {subjects.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-2 pb-1 sm:flex-wrap sm:pb-0">
            <button
              onClick={() => handleSubjectChange("all")}
              className={cn(
                "shrink-0 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[36px] sm:min-h-0 sm:px-3 sm:py-1",
                !currentSubject
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
              disabled={isPending}
            >
              Semua
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className={cn(
                  "shrink-0 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[36px] sm:min-h-0 sm:px-3 sm:py-1",
                  currentSubject === subject
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
                disabled={isPending}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        Menampilkan{" "}
        <span className="font-medium text-foreground">{filteredCount}</span> dari{" "}
        <span className="font-medium text-foreground">{totalCount}</span> soal
        {isPending && <span className="ml-2 opacity-60">Memuat...</span>}
      </p>
    </div>
  );
}
