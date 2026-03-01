"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Wand2, ChevronDown, ChevronUp, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { JABATAN_LIST } from "@/shared/lib/jabatan-data";

/* ── Types ── */

interface Topic {
  id: string;
  name: string;
}

interface ActiveProvider {
  provider: string;
  name: string;
  model: string;
  models: { id: string; name: string }[];
  isActive: boolean;
}

export interface GenerateSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  sectionId: string;
  sectionTitle: string;
  subjectId: string;
  needed: number;
  examType?: string;
  onSuccess: (result: { generated: number; remaining: number }) => void;
}

/* ── Constants ── */

const DIFFICULTIES = [
  { value: "MIXED", label: "Campuran" },
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
] as const;

/* ── Helper ── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}

/* ── Main Component ── */

export function GenerateSectionModal({
  open,
  onOpenChange,
  packageId,
  sectionId,
  sectionTitle,
  subjectId,
  needed,
  examType,
  onSuccess,
}: GenerateSectionModalProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [providers, setProviders] = useState<ActiveProvider[]>([]);
  const [topicId, setTopicId] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [difficulty, setDifficulty] = useState("MIXED");
  const [jabatan, setJabatan] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(false);

  const showJabatan = examType === "CPNS" || examType === "PPPK";
  const generateCount = Math.min(needed, 50);

  /* Fetch topics when modal opens */
  useEffect(() => {
    if (!open || !subjectId) return;

    setTopics([]);
    setTopicId("");
    setFetchingTopics(true);

    fetch(`/api/admin/subjects/${subjectId}/topics`)
      .then((r) => r.json())
      .then((j: { success: boolean; data: { topics: Topic[] } }) => {
        if (j.success) {
          setTopics(j.data.topics);
        }
      })
      .catch(() => {
        toast.error("Gagal memuat topik");
      })
      .finally(() => {
        setFetchingTopics(false);
      });
  }, [open, subjectId]);

  /* Fetch active providers when modal opens */
  useEffect(() => {
    if (!open) return;

    setProviders([]);
    setProvider("");
    setModel("");
    setFetchingProviders(true);

    fetch("/api/admin/ai/settings")
      .then((r) => r.json())
      .then((j: { success: boolean; data: ActiveProvider[] }) => {
        if (j.success) {
          const active = j.data.filter((p) => p.isActive);
          setProviders(active);
          if (active.length > 0) {
            setProvider(active[0].provider);
            setModel(active[0].model);
          }
        }
      })
      .catch(() => {
        toast.error("Gagal memuat provider AI");
      })
      .finally(() => {
        setFetchingProviders(false);
      });
  }, [open]);

  /* Update model when provider changes */
  function handleProviderChange(value: string) {
    setProvider(value);
    const found = providers.find((p) => p.provider === value);
    setModel(found?.model ?? "");
  }

  const currentProviderModels: { id: string; name: string }[] =
    providers.find((p) => p.provider === provider)?.models ?? [];

  async function handleSubmit() {
    if (!topicId || !provider || !model) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/packages/${packageId}/sections/${sectionId}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            model,
            topicId,
            difficulty,
            examType: examType ?? "",
            jabatan: jabatan || undefined,
            customInstruction: customInstruction || undefined,
          }),
        }
      );

      const result = (await response.json()) as {
        success: boolean;
        data?: { generated: number; remaining: number };
        error?: { message: string };
      };

      if (!response.ok || !result.success) {
        toast.error(result.error?.message ?? "Gagal generate soal");
        return;
      }

      onSuccess({
        generated: result.data?.generated ?? 0,
        remaining: result.data?.remaining ?? 0,
      });
    } catch {
      toast.error("Terjadi kesalahan saat generate soal");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = Boolean(topicId && provider && model && !loading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Soal - {sectionTitle}</DialogTitle>
          <DialogDescription>
            Butuh {needed} soal lagi untuk seksi ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Topic */}
          <Field label="Topik Soal">
            {fetchingTopics ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat topik...
              </div>
            ) : topics.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Tidak ada topik untuk subject ini
              </div>
            ) : (
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih topik" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {/* Provider + Model */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="AI Provider">
              {fetchingProviders ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat...
                </div>
              ) : (
                <Select
                  value={provider}
                  onValueChange={handleProviderChange}
                  disabled={providers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.provider} value={p.provider}>
                        <span className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-yellow-500" />
                          {p.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label="Model">
              <Select
                value={model}
                onValueChange={setModel}
                disabled={!provider || currentProviderModels.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProviderModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Difficulty */}
          <Field label="Tingkat Kesulitan">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Jabatan — only for CPNS/PPPK */}
          {showJabatan && (
            <Field label="Jabatan" hint="(opsional)">
              <Select value={jabatan} onValueChange={setJabatan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_LIST.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Custom instruction — collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowCustom((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCustom ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              Instruksi Tambahan (opsional)
            </button>
            {showCustom && (
              <div className="mt-2">
                <Textarea
                  placeholder="Contoh: Fokus pada penalaran logis, gunakan konteks soal CPNS..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 space-y-1">
            <p className="font-medium">
              Akan generate {generateCount} soal untuk seksi ini
            </p>
            {needed > 50 && (
              <p className="text-blue-600 text-xs">
                Seksi butuh {needed} soal, akan di-generate dalam beberapa tahap
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate Soal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
