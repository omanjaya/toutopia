import type { Metadata } from "next";
import { AddUserForm } from "./add-user-form";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
};

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tambah Pengguna</h2>
        <p className="text-muted-foreground">Buat akun pengguna baru</p>
      </div>
      <AddUserForm />
    </div>
  );
}
