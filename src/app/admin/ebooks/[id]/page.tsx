"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileUp, BookOpen, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import Link from "next/link";

const CATEGORIES = ["UTBK", "CPNS", "BUMN", "Kedinasan", "PPPK", "Umum"];

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const dynamic = "force-dynamic";

export default function EditEbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [contentType, setContentType] = useState<"PDF" | "HTML">("PDF");
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEbook() {
      try {
        const res = await fetch(`/api/admin/ebooks/${id}`);
        const result = await res.json();
        if (res.ok) {
          const e = result.data;
          setTitle(e.title);
          setSlug(e.slug);
          setDescription(e.description ?? "");
          setCoverImage(e.coverImage ?? "");
          setCategory(e.category ?? "");
          setPageCount(e.pageCount ? String(e.pageCount) : "");
          setTags(e.tags?.join(", ") ?? "");
          setStatus(e.status);
          setContentType(e.contentType ?? "PDF");
          setHtmlContent(e.htmlContent ?? "");
          setPdfUrl(e.pdfUrl ?? "");
          setFileSize(e.fileSize ?? null);
        }
      } catch {
        toast.error("Gagal memuat ebook");
      } finally {
        setLoading(false);
      }
    }

    fetchEbook();
  }, [id]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/ebooks/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mengupload file");
        return;
      }

      setPdfUrl(result.url);
      setFileSize(result.fileSize);
      toast.success("File berhasil diupload");
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ebooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          coverImage: coverImage || null,
          category: category || null,
          pageCount: pageCount ? Number(pageCount) : null,
          tags: tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          status,
          contentType,
          htmlContent: contentType === "HTML" ? htmlContent : null,
          pdfUrl: contentType === "PDF" ? pdfUrl : null,
          fileSize: contentType === "PDF" ? fileSize : null,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal menyimpan");
        return;
      }

      toast.success("Ebook berhasil diperbarui");
      router.push("/admin/ebooks");
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/ebooks">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit Ebook</h2>
          <p className="text-sm text-muted-foreground">Perbarui informasi ebook</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cardCls}>
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Detail Ebook</p>
              <p className="text-xs text-muted-foreground">Informasi dasar ebook</p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Halaman</Label>
                <Input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (pisahkan dengan koma)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Konten</p>
              <p className="text-xs text-muted-foreground">File PDF atau konten HTML</p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label>Tipe Konten</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={contentType === "PDF" ? "default" : "outline"}
                  onClick={() => setContentType("PDF")}
                >
                  PDF
                </Button>
                <Button
                  type="button"
                  variant={contentType === "HTML" ? "default" : "outline"}
                  onClick={() => setContentType("HTML")}
                >
                  HTML
                </Button>
              </div>
            </div>

            {contentType === "PDF" ? (
              <div className="space-y-2">
                <Label>Upload File PDF</Label>
                {pdfUrl && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileUp className="h-4 w-4" />
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      PDF saat ini
                    </a>
                    {fileSize && (
                      <span>({(fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Konten HTML</Label>
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  required={contentType === "HTML"}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/ebooks">Batal</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
