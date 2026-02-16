import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Halaman yang Anda cari tidak ditemukan
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
