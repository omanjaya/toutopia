"use client";

import { useRouter } from "next/navigation";

interface SortSelectProps {
  currentSort: string;
  currentStatus: string;
  currentQ: string;
}

const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "earnings", label: "Pendapatan Tertinggi" },
  { value: "name", label: "Nama A-Z" },
];

export function SortSelect({ currentSort, currentStatus, currentQ }: SortSelectProps) {
  const router = useRouter();

  function handleChange(value: string): void {
    const p = new URLSearchParams();
    if (currentQ) p.set("q", currentQ);
    if (currentStatus) p.set("status", currentStatus);
    p.set("sort", value);
    p.set("page", "1");
    router.push(`/admin/teachers?${p.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
