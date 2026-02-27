"use client";

import { Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ThemePicker } from "@/shared/components/theme/theme-picker";

export function ThemeSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tema Tampilan
        </CardTitle>
        <CardDescription>
          Pilih tema yang sesuai dengan gaya belajar kamu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ThemePicker />
      </CardContent>
    </Card>
  );
}
