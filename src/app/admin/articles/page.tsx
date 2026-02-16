"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

export const dynamic = "force-dynamic";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/admin/articles");
        const result = await res.json();
        if (res.ok) setArticles(result.data);
      } catch {
        toast.error("Gagal memuat artikel");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Hapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        toast.success("Artikel dihapus");
      }
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Artikel</h2>
          <p className="text-muted-foreground">Kelola artikel blog</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            Tulis Artikel
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada artikel</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Artikel ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={statusVariant[article.status] ?? "secondary"}>
                      {article.status}
                    </Badge>
                    {article.category && (
                      <span>{article.category}</span>
                    )}
                    <span>
                      <Eye className="mr-0.5 inline h-3 w-3" />
                      {article.viewCount}
                    </span>
                    <span>
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/admin/articles/${article.id}`)
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
