import type { Metadata } from "next";
import { AddUserForm } from "./add-user-form";
import Link from "next/link";
import { UserPlus, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
};

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tambah Pengguna</h2>
          <p className="text-sm text-muted-foreground">Buat akun pengguna baru</p>
        </div>
      </div>
      <AddUserForm />
    </div>
  );
}
