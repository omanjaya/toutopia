"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

interface ThemeSyncProps {
  serverTheme: string;
}

export function ThemeSync({ serverTheme }: ThemeSyncProps) {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (theme !== serverTheme) {
      setTheme(serverTheme);
    }
  }, [serverTheme, setTheme, theme]);

  return null;
}
