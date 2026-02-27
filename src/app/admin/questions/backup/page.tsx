"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Topic {
  id: string;
  name: string;
  subject: string;
}

interface JobProgress {
  status: "processing" | "done" | "error";
  progress: number;
  total: number;
  processed: number;
  error?: string;
  result?: Record<string, unknown>;
}

interface RestorePreview {
  totalInFile: number;
  valid: number;
  duplicates: number;
  invalidTopics: number;
  errors: string[];
  perTopic: Record<string, number>;
}

function useJobPoller(
  jobId: string | null,
  endpoint: "backup" | "restore"
): JobProgress | null {
  const [progress, setProgress] = useState<JobProgress | null>(null);

  useEffect(() => {
    if (!jobId) {
      setProgress(null);
      return;
    }

    let active = true;

    async function poll(): Promise<void> {
      if (!active || !jobId) return;

      try {
        const res = await fetch(
          `/api/admin/questions/${endpoint}/${jobId}`
        );
        const data = await res.json();
        if (!active) return;

        if (data.success) {
          setProgress(data.data);
          if (
            data.data.status === "done" ||
            data.data.status === "error"
          ) {
            return;
          }
        }
      } catch {
        // retry
      }

      if (active) {
        setTimeout(poll, 1000);
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [jobId, endpoint]);

  return progress;
}

// ─── Export Section ───────────────────────────────────────────────

function ExportSection(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [topicsLoaded, setTopicsLoaded] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [starting, setStarting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const progress = useJobPoller(jobId, "backup");

  async function loadCategories(): Promise<void> {
    if (categoriesLoaded) return;
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch {
      toast.error("Gagal memuat kategori");
    }
    setCategoriesLoaded(true);
  }

  async function loadTopics(): Promise<void> {
    if (topicsLoaded) return;
    try {
      const res = await fetch("/api/admin/topics");
      const data = await res.json();
      if (data.success) setTopics(data.data);
    } catch {
      toast.error("Gagal memuat topik");
    }
    setTopicsLoaded(true);
  }

  async function startBackup(): Promise<void> {
    setStarting(true);
    try {
      const body: Record<string, string> = {};
      if (categoryId) body.categoryId = categoryId;
      if (topicId) body.topicId = topicId;
      if (status) body.status = status;
      if (difficulty) body.difficulty = difficulty;

      const res = await fetch("/api/admin/questions/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setJobId(data.data.jobId);
        toast.success("Backup dimulai...");
      } else {
        toast.error(data.error?.message ?? "Gagal memulai backup");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setStarting(false);
    }
  }

  function handleDownload(): void {
    if (!jobId) return;
    window.open(
      `/api/admin/questions/backup/${jobId}?download=true`,
      "_blank"
    );
  }

  function handleReset(): void {
    setJobId(null);
  }

  return (
    <div className="space-y-6">
      {!jobId && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Filter (opsional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                onOpenChange={() => loadCategories()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Topik</Label>
              <Select
                value={topicId}
                onValueChange={setTopicId}
                onOpenChange={() => loadTopics()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua topik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Topik</SelectItem>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.subject} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Menunggu Review</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kesulitan</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kesulitan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kesulitan</SelectItem>
                  <SelectItem value="VERY_EASY">Sangat Mudah</SelectItem>
                  <SelectItem value="EASY">Mudah</SelectItem>
                  <SelectItem value="MEDIUM">Sedang</SelectItem>
                  <SelectItem value="HARD">Sulit</SelectItem>
                  <SelectItem value="VERY_HARD">Sangat Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={startBackup} disabled={starting}>
            {starting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Mulai Backup
          </Button>
        </div>
      )}

      {jobId && progress && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          {progress.status === "processing" && (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Memproses backup...</span>
              </div>
              <Progress value={progress.progress} />
              <p className="text-sm text-muted-foreground">
                {progress.processed} / {progress.total} soal diproses
              </p>
            </>
          )}

          {progress.status === "done" && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Backup Selesai</h3>
              <p className="text-muted-foreground">
                {progress.total} soal berhasil di-export
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Backup Lagi
                </Button>
              </div>
            </div>
          )}

          {progress.status === "error" && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Backup Gagal</h3>
              <p className="text-sm text-muted-foreground">
                {progress.error ?? "Terjadi kesalahan saat memproses backup"}
              </p>
              <Button variant="outline" onClick={handleReset}>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Restore Section ──────────────────────────────────────────────

function RestoreSection(): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const progress = useJobPoller(jobId, "restore");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0] ?? null);
      setPreview(null);
      setJobId(null);
    },
    []
  );

  async function handlePreview(): Promise<void> {
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "preview");

      const res = await fetch("/api/admin/questions/restore", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setPreview(data.data);
      } else {
        toast.error(data.error?.message ?? "Gagal memproses file");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(): Promise<void> {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "restore");

      const res = await fetch("/api/admin/questions/restore", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setJobId(data.data.jobId);
        toast.success("Restore dimulai...");
      } else {
        toast.error(data.error?.message ?? "Gagal memulai restore");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  }

  function handleReset(): void {
    setFile(null);
    setPreview(null);
    setJobId(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const isDone = progress?.status === "done";
  const isError = progress?.status === "error";
  const isProcessing = progress?.status === "processing";

  return (
    <div className="space-y-6">
      {!jobId && (
        <>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>File Backup (JSON)</Label>
              <Input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <Button onClick={handlePreview} disabled={!file || loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Preview Restore
            </Button>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{preview.totalInFile} soal dalam file</Badge>
                <Badge variant="default">{preview.valid} siap diimport</Badge>
                {preview.duplicates > 0 && (
                  <Badge variant="secondary">
                    {preview.duplicates} duplikat (skip)
                  </Badge>
                )}
                {preview.invalidTopics > 0 && (
                  <Badge variant="destructive">
                    {preview.invalidTopics} topik tidak ditemukan
                  </Badge>
                )}
              </div>

              {Object.keys(preview.perTopic).length > 0 && (
                <div className="rounded-lg border bg-card p-4 space-y-2">
                  <h4 className="text-sm font-medium">Per Topik:</h4>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {Object.entries(preview.perTopic).map(([topic, count]) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{topic}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1 max-h-48 overflow-y-auto">
                  {preview.errors.map((err, i) => (
                    <p
                      key={i}
                      className="text-sm text-destructive flex items-center gap-2"
                    >
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {preview.valid > 0 && (
                <div className="flex gap-3">
                  <Button onClick={handleRestore}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mulai Restore ({preview.valid} soal)
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Batal
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {jobId && progress && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          {isProcessing && (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Memproses restore...</span>
              </div>
              <Progress value={progress.progress} />
              <p className="text-sm text-muted-foreground">
                {progress.processed} / {progress.total} soal diproses
              </p>
            </>
          )}

          {isDone && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Restore Selesai</h3>
              {progress.result && (
                <div className="flex justify-center gap-3">
                  <Badge variant="default">
                    {String(progress.result.imported ?? 0)} diimport
                  </Badge>
                  <Badge variant="secondary">
                    {String(progress.result.skipped ?? 0)} diskip
                  </Badge>
                </div>
              )}
              <div className="flex justify-center gap-3">
                <Button asChild>
                  <Link href="/admin/questions">Lihat Daftar Soal</Link>
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Restore Lagi
                </Button>
              </div>
            </div>
          )}

          {isError && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Restore Gagal</h3>
              <p className="text-sm text-muted-foreground">
                {progress.error ?? "Terjadi kesalahan saat memproses restore"}
              </p>
              <Button variant="outline" onClick={handleReset}>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function BackupRestorePage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/questions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Backup & Restore Soal
          </h2>
          <p className="text-muted-foreground">
            Export soal ke JSON atau restore dari file backup
          </p>
        </div>
      </div>

      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">
            <HardDrive className="mr-2 h-4 w-4" />
            Backup / Export
          </TabsTrigger>
          <TabsTrigger value="restore">
            <Upload className="mr-2 h-4 w-4" />
            Restore / Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-6">
          <ExportSection />
        </TabsContent>

        <TabsContent value="restore" className="mt-6">
          <RestoreSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
