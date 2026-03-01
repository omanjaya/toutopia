"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Dialog,
  DialogContent,
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

interface ActiveProvider {
  provider: string;
  name: string;
  model: string;
  models: { id: string; name: string }[];
  isActive: boolean;
}

interface SectionInput {
  id: string;
  title: string;
  totalQuestions: number;
  currentCount: number;
}

interface SectionJobState {
  sectionId: string;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  generated: number;
  needed: number;
  error?: string;
}

interface BatchJobState {
  status: "processing" | "done" | "error";
  progress: number;
  sections: SectionJobState[];
  error?: string;
}

export interface BatchGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  examType?: string;
  sections: SectionInput[];
  onComplete: () => void;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SectionStatusIcon({ status }: { status: SectionJobState["status"] }) {
  switch (status) {
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />;
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function SectionStatusBadge({ status }: { status: SectionJobState["status"] }) {
  switch (status) {
    case "processing":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          Sedang generate...
        </Badge>
      );
    case "done":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
          Selesai
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
          Gagal
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Menunggu
        </Badge>
      );
  }
}

/* ── Main Component ── */

export function BatchGenerateDialog({
  open,
  onOpenChange,
  packageId,
  examType,
  sections,
  onComplete,
}: BatchGenerateDialogProps) {
  const [started, setStarted] = useState(false);
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [difficulty, setDifficulty] = useState("MIXED");
  const [jabatan, setJabatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<BatchJobState | null>(null);
  const [providers, setProviders] = useState<ActiveProvider[]>([]);
  const [fetchingProviders, setFetchingProviders] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showJabatan = examType === "CPNS" || examType === "PPPK";
  const sectionsNeedingGeneration = sections.filter(
    (s) => s.currentCount < s.totalQuestions
  );

  const currentProviderModels: { id: string; name: string }[] =
    providers.find((p) => p.provider === provider)?.models ?? [];

  const totalGenerated =
    jobState?.sections.reduce((sum, s) => sum + s.generated, 0) ?? 0;

  const isDone =
    jobState?.status === "done" || jobState?.status === "error";

  /* Reset state when dialog closes */
  useEffect(() => {
    if (!open) {
      setStarted(false);
      setJobId(null);
      setJobState(null);
      setLoading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [open]);

  /* Fetch active providers when dialog opens */
  useEffect(() => {
    if (!open) return;

    setProviders([]);
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

  /* Polling logic */
  useEffect(() => {
    if (!jobId) return;

    intervalRef.current = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/admin/packages/${packageId}/generate-all/${jobId}`
        );
        const j = (await r.json()) as {
          success: boolean;
          data?: BatchJobState;
          error?: { message: string };
        };

        if (j.success && j.data) {
          setJobState(j.data);

          if (j.data.status === "done" || j.data.status === "error") {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (j.data.status === "done") {
              onComplete();
            }
          }
        }
      } catch {
        // Polling errors are silently ignored — will retry next interval
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, packageId, onComplete]);

  function handleProviderChange(value: string) {
    setProvider(value);
    const found = providers.find((p) => p.provider === value);
    setModel(found?.model ?? "");
  }

  async function handleStart() {
    if (!provider || !model) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/packages/${packageId}/generate-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            model,
            difficulty,
            examType: examType ?? "",
            jabatan: jabatan || undefined,
          }),
        }
      );

      const result = (await response.json()) as {
        success: boolean;
        data?: { jobId: string };
        error?: { message: string };
      };

      if (!response.ok || !result.success) {
        toast.error(result.error?.message ?? "Gagal memulai generate");
        return;
      }

      setJobId(result.data?.jobId ?? null);
      setStarted(true);

      // Initialize job state from sections
      setJobState({
        status: "processing",
        progress: 0,
        sections: sectionsNeedingGeneration.map((s) => ({
          sectionId: s.id,
          title: s.title,
          status: "pending",
          generated: 0,
          needed: s.totalQuestions - s.currentCount,
        })),
      });
    } catch {
      toast.error("Terjadi kesalahan saat memulai generate");
    } finally {
      setLoading(false);
    }
  }

  const canStart = Boolean(provider && model && !loading && !fetchingProviders);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Semua Seksi
          </DialogTitle>
        </DialogHeader>

        {!started ? (
          /* ── Config view ── */
          <div className="space-y-4 py-2">
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
              <Field label="Jabatan (opsional)">
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

            {/* Summary table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 border-b">
                <p className="text-sm font-medium">Ringkasan Seksi</p>
              </div>
              <div className="divide-y">
                {sections.map((s) => {
                  const remaining = s.totalQuestions - s.currentCount;
                  const isFull = remaining <= 0;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className={isFull ? "text-muted-foreground" : ""}>
                        {s.title}
                      </span>
                      <div className="flex items-center gap-2">
                        {isFull ? (
                          <Badge variant="secondary" className="text-xs">
                            Sudah penuh
                          </Badge>
                        ) : (
                          <>
                            <span className="text-muted-foreground text-xs">
                              Butuh {remaining} soal
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Perlu generate
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {sectionsNeedingGeneration.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Semua seksi sudah penuh. Tidak perlu generate.
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={handleStart}
                disabled={!canStart || sectionsNeedingGeneration.length === 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {loading ? "Memulai..." : "Generate Semua"}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Progress view ── */
          <div className="space-y-4 py-2">
            {/* Overall progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress Keseluruhan</span>
                <span className="text-muted-foreground">
                  {jobState?.progress ?? 0}%
                </span>
              </div>
              <Progress value={jobState?.progress ?? 0} className="h-2" />
            </div>

            {/* Per-section status */}
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 border-b">
                <p className="text-sm font-medium">Status Per Seksi</p>
              </div>
              <div className="divide-y">
                {(jobState?.sections ?? []).map((s) => (
                  <div
                    key={s.sectionId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <SectionStatusIcon status={s.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      {s.error && (
                        <p className="text-xs text-red-500 mt-0.5">{s.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "done" && (
                        <span className="text-xs text-muted-foreground">
                          {s.generated} soal
                        </span>
                      )}
                      <SectionStatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done state message */}
            {isDone && (
              <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  jobState?.status === "done"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {jobState?.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <p className="text-sm font-medium">
                  {jobState?.status === "done"
                    ? `Selesai! ${totalGenerated} soal berhasil digenerate`
                    : jobState?.error ?? "Terjadi kesalahan saat generate"}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={!isDone}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
