"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Download, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface ImportResult {
  imported: number;
  errors?: string[];
  total: number;
}

export default function ImportQuestionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File): void {
    if (!f.name.endsWith(".csv")) {
      toast.error("Hanya file CSV yang diterima");
      return;
    }
    setFile(f);
    setResult(null);
  }

  async function handleImport(): Promise<void> {
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/teacher/questions/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data.data);
        toast.success(`${data.data.imported} soal berhasil diimport!`);
      } else {
        toast.error(data.error?.message ?? "Gagal mengimport soal");
        if (data.error?.details?.errors) {
          setResult({ imported: 0, errors: data.error.details.errors as string[], total: 0 });
        }
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate(): void {
    const csv = "topicId,content,type,difficulty,explanation,optionA,optionB,optionC,optionD,optionE,correctOption\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-soal.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Import Soal</h2>
        <p className="text-muted-foreground">Upload file CSV untuk menambahkan soal secara massal</p>
      </div>

      {/* Template Download */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Template CSV</p>
              <p className="text-xs text-muted-foreground">
                Download template dengan format yang benar
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <Upload className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">{file ? file.name : "Drag & drop atau klik untuk pilih file"}</p>
            <p className="mt-1 text-xs text-muted-foreground">CSV, maksimal 5MB, maksimal 100 soal</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>

          {file && (
            <Button
              className="mt-4 w-full"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import {file.name}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Format Guide */}
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Format CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Kolom yang diperlukan:</p>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>topicId</strong> -- ID topik (wajib)</li>
            <li><strong>content</strong> -- Isi soal (wajib)</li>
            <li><strong>type</strong> -- SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE</li>
            <li><strong>difficulty</strong> -- VERY_EASY / EASY / MEDIUM / HARD / VERY_HARD</li>
            <li><strong>explanation</strong> -- Pembahasan soal</li>
            <li><strong>optionA</strong> - <strong>optionE</strong> -- Pilihan jawaban (minimal A dan B)</li>
            <li><strong>correctOption</strong> -- Jawaban benar: A, B, C, D, atau E</li>
          </ul>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-4 space-y-3">
            {result.imported > 0 && (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{result.imported} soal berhasil diimport</span>
              </div>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">{result.errors.length} error</span>
                </div>
                <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
