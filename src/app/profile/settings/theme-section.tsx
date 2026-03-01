"use client";

import { Palette } from "lucide-react";
import { ThemePicker } from "@/shared/components/theme/theme-picker";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function ThemeSection() {
  return (
    <div className={cardCls}>
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tema Tampilan
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih tema yang sesuai dengan gaya belajar kamu
        </p>
      </div>
      <div className="p-6">
        <ThemePicker />
      </div>
    </div>
  );
}
