"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_OPTIONS } from "@/config/theme.config";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

const themeValues: Record<string, string> = {};
for (const theme of THEME_OPTIONS) {
  themeValues[theme.id] = theme.className || "theme-default";
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render children without provider on server to avoid radix ID mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme ?? "DEFAULT"}
      themes={THEME_OPTIONS.map((t) => t.id)}
      value={themeValues}
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="toutopia-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
