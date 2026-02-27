"use client";

import { useTheme } from "next-themes";
import { THEME_MAP, DEFAULT_THEME } from "@/config/theme.config";
import type { Theme } from "@prisma/client";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentTheme = (theme as Theme) ?? DEFAULT_THEME;
  const themeConfig = THEME_MAP[currentTheme] ?? THEME_MAP[DEFAULT_THEME];

  const applyTheme = async (newTheme: Theme): Promise<void> => {
    setTheme(newTheme);
    try {
      await fetch("/api/user/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch {
      // Theme is already applied client-side, DB save failure is non-critical
    }
  };

  return {
    currentTheme,
    themeConfig,
    applyTheme,
    resolvedTheme,
  };
}
