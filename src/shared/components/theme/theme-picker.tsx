"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { THEME_OPTIONS } from "@/config/theme.config";
import { useAppTheme } from "@/shared/hooks/use-app-theme";
import type { Theme } from "@prisma/client";

interface ThemePickerProps {
  onSelect?: (theme: Theme) => void;
  previewOnly?: boolean;
}

export function ThemePicker({ onSelect, previewOnly = false }: ThemePickerProps) {
  const { currentTheme, applyTheme } = useAppTheme();
  const { setTheme } = useTheme();
  const [selected, setSelected] = useState<Theme>(currentTheme);

  const handleSelect = (themeId: Theme) => {
    setSelected(themeId);
    if (previewOnly) {
      setTheme(themeId);
    } else {
      applyTheme(themeId);
    }
    onSelect?.(themeId);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {THEME_OPTIONS.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => handleSelect(theme.id)}
          className={cn(
            "group relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all hover:shadow-sm",
            selected === theme.id
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border hover:border-primary/40"
          )}
        >
          <div className="flex gap-1.5">
            {Object.values(theme.previewColors).map((color, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border border-border/50 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <span className="text-sm font-medium">{theme.name}</span>
          <span className="text-[11px] text-muted-foreground text-center leading-tight">
            {theme.description}
          </span>

          {selected === theme.id && (
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check className="h-3.5 w-3.5" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
