import type { Metadata } from "next";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Bundle Paket" };

export default function AdminBundlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bundle Paket</h2>
        <p className="text-muted-foreground">Kelola bundle paket ujian dan langganan</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">Fitur Sedang Dikembangkan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Halaman bundle paket akan segera tersedia.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/packages">Kembali ke Paket</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
