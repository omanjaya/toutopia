"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

interface ParsedQuestion {
  content: string;
  type: string;
  difficulty: string;
  explanation?: string;
  options: { label: string; content: string; isCorrect: boolean; order: number }[];
}

interface PreviewResult {
  questions: ParsedQuestion[];
  errors: string[];
  totalParsed: number;
  totalErrors: number;
}

export default function ImportQuestionsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [topicId, setTopicId] = useState("");
  const [source, setSource] = useState("");
  const [topics, setTopics] = useState<{ id: string; name: string; subject: string }[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  async function loadTopics() {
    if (topicsLoaded) return;
    try {
      const res = await fetch("/api/admin/topics");
      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch {
      toast.error("Gagal memuat daftar topik");
    }
    setTopicsLoaded(true);
  }

  async function handlePreview() {
    if (!file || !topicId) {
      toast.error("Pilih file dan topik terlebih dahulu");
      return;
    }

    setLoading(true);
    setPreview(null);
    setSavedCount(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topicId", topicId);
      formData.append("action", "preview");

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setPreview(data.data);
      } else {
        toast.error(data.data?.error ?? data.error?.message ?? "Gagal parsing file");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!file || !topicId || !preview || preview.questions.length === 0) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topicId", topicId);
      formData.append("action", "save");
      if (source) formData.append("source", source);

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data.saved) {
        setSavedCount(data.data.saved);
        toast.success(`${data.data.saved} soal berhasil diimport`);
      } else {
        toast.error(data.data?.error ?? data.error?.message ?? "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/questions">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Import Soal</h2>
          <p className="text-sm text-muted-foreground">
            Upload file JSON atau Markdown untuk import soal secara massal
          </p>
        </div>
      </div>

      {savedCount !== null ? (
        <div className={`${cardCls} p-8 text-center space-y-4`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold">{savedCount} Soal Berhasil Diimport</h3>
          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/questions">Kembali ke Daftar Soal</Link>
            </Button>
            <Button onClick={() => { setFile(null); setPreview(null); setSavedCount(null); }}>
              Import Lagi
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={cardCls}>
            <SectionHeader
              icon={SlidersHorizontal}
              title="Konfigurasi Import"
              description="Pilih file dan topik tujuan import"
            />
            <div className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>File (JSON / Markdown)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileRef}
                      type="file"
                      accept=".json,.md,.markdown,.txt"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        setPreview(null);
                      }}
                    />
                  </div>
                  {file && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Topik</Label>
                  <Select value={topicId} onValueChange={setTopicId} onOpenChange={() => loadTopics()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih topik..." />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.subject} — {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sumber (opsional)</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Contoh: UTBK 2025, Buku Fisika Kelas 12"
                />
              </div>

              <Button onClick={handlePreview} disabled={!file || !topicId || loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Preview Import
              </Button>
            </div>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge>{preview.totalParsed} soal valid</Badge>
                {preview.totalErrors > 0 && (
                  <Badge className="bg-red-500/10 text-red-700 border-red-200">{preview.totalErrors} error</Badge>
                )}
              </div>

              {preview.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                  {preview.errors.map((err, i) => (
                    <p key={i} className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {preview.questions.length > 0 && (
                <>
                  <div className="rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Soal</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Kesulitan</TableHead>
                          <TableHead>Opsi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.questions.slice(0, 20).map((q, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="text-sm max-w-md truncate">
                              {q.content.replace(/<[^>]*>/g, "").substring(0, 80)}
                            </TableCell>
                            <TableCell className="text-sm">{q.type}</TableCell>
                            <TableCell className="text-sm">{q.difficulty}</TableCell>
                            <TableCell className="text-sm">{q.options.length} opsi</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {preview.questions.length > 20 && (
                    <p className="text-sm text-muted-foreground">
                      Menampilkan 20 dari {preview.questions.length} soal
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Simpan {preview.questions.length} Soal
                    </Button>
                    <Button variant="outline" onClick={() => setPreview(null)}>
                      Batal
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
