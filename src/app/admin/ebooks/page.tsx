"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  BookText,
  FileEdit,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import Link from "next/link";

interface Ebook {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  status: string;
  category: string | null;
  viewCount: number;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200",
};

export const dynamic = "force-dynamic";

export default function AdminEbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchEbooks() {
      try {
        const res = await fetch("/api/admin/ebooks");
        const result = await res.json();
        if (res.ok) setEbooks(result.data);
      } catch {
        toast.error("Gagal memuat ebook");
      } finally {
        setLoading(false);
      }
    }

    fetchEbooks();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Hapus ebook ini?")) return;

    try {
      const res = await fetch(`/api/admin/ebooks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEbooks((prev) => prev.filter((e) => e.id !== id));
        toast.success("Ebook dihapus");
      }
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat ebook...</p>
        </div>
      </div>
    );
  }

  const publishedCount = ebooks.filter((e) => e.status === "PUBLISHED").length;
  const draftCount = ebooks.filter((e) => e.status === "DRAFT").length;
  const totalViews = ebooks.reduce((s, e) => s + e.viewCount, 0);
  const totalDownloads = ebooks.reduce((s, e) => s + e.downloadCount, 0);

  const statCards = [
    { title: "Published", value: publishedCount, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft", value: draftCount, icon: FileEdit, color: "bg-slate-500/10 text-slate-600" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Download", value: totalDownloads, icon: Download, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ebook</h2>
          <p className="text-muted-foreground">Kelola ebook dan materi belajar</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/ebooks/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Ebook
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {ebooks.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <BookText className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Belum ada ebook</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/ebooks/new">Buat Ebook Pertama</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{ebook.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={statusBadgeClass[ebook.status] ?? ""}>
                    {ebook.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ebook.contentType}
                  </Badge>
                  {ebook.category && (
                    <span className="rounded bg-muted px-1.5 py-0.5">{ebook.category}</span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {ebook.viewCount.toLocaleString("id-ID")}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Download className="h-3 w-3" />
                    {ebook.downloadCount.toLocaleString("id-ID")}
                  </span>
                  <span>
                    {new Date(ebook.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => router.push(`/admin/ebooks/${ebook.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(ebook.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
