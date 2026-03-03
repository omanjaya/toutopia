"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Wand2,
  Settings2,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Progress } from "@/shared/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type ExamType, getTemplateForExam } from "@/shared/lib/exam-templates";
import {
  EXAM_SPECIALIZATION_MAP,
  type Specialization,
} from "@/shared/lib/specialization-data";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface ActiveProvider {
  provider: string;
  name: string;
  model: string;
  models: { id: string; name: string }[];
  isActive: boolean;
}

interface AutoGenSectionState {
  title: string;
  status: "pending" | "processing" | "done" | "error";
  generated: number;
  total: number;
  error?: string;
}

interface AutoGenPackageState {
  packageId: string;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  sections: AutoGenSectionState[];
}

interface AutoGenJobState {
  status: "processing" | "done" | "error";
  progress: number;
  error?: string;
  packages: AutoGenPackageState[];
}

interface AutoGenerateFormProps {
  categories: {
    id: string;
    name: string;
    subCategories: {
      id: string;
      name: string;
      subjects: { id: string; name: string }[];
    }[];
  }[];
}

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string; color: string }[] = [
  {
    value: "UTBK",
    label: "UTBK / SNBT",
    color:
      "border-blue-300 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 data-[active=true]:border-blue-400 data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "CPNS",
    label: "CPNS SKD",
    color:
      "border-red-300 bg-red-500/10 text-red-700 hover:bg-red-500/20 data-[active=true]:border-red-400 data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "BUMN",
    label: "BUMN",
    color:
      "border-emerald-300 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 data-[active=true]:border-emerald-400 data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "PPPK",
    label: "PPPK",
    color:
      "border-orange-300 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 data-[active=true]:border-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "KEDINASAN",
    label: "Kedinasan",
    color:
      "border-violet-300 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 data-[active=true]:border-violet-400 data-[active=true]:bg-violet-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
];

const DIFFICULTIES = [
  { value: "MIXED", label: "Campuran" },
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
] as const;

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
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

function SectionStatusIcon({ status }: { status: AutoGenSectionState["status"] }) {
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

function SectionStatusBadge({ status }: { status: AutoGenSectionState["status"] }) {
  switch (status) {
    case "processing":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          Generating...
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

export function AutoGenerateForm({ categories }: AutoGenerateFormProps) {
  const router = useRouter();

  // Form state
  const [examType, setExamType] = useState<ExamType>("UTBK");
  const [specialization, setSpecialization] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [difficulty, setDifficulty] = useState("MIXED");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);

  // Provider state
  const [providers, setProviders] = useState<ActiveProvider[]>([]);
  const [fetchingProviders, setFetchingProviders] = useState(true);

  // Progress state
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<AutoGenJobState | null>(null);
  const [expandedPkgs, setExpandedPkgs] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const specConfig = EXAM_SPECIALIZATION_MAP[examType];
  const specOptions: Specialization[] = specConfig?.options ?? [];

  const currentProviderModels: { id: string; name: string }[] =
    providers.find((p) => p.provider === provider)?.models ?? [];

  const template = getTemplateForExam(examType, specialization || undefined);
  const totalQuestions = template.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalDuration = template.reduce((sum, s) => sum + s.durationMinutes, 0);

  const isDone = jobState?.status === "done" || jobState?.status === "error";

  const totalGenerated =
    jobState?.packages.reduce(
      (sum, p) => sum + p.sections.reduce((s, sec) => s + sec.generated, 0),
      0
    ) ?? 0;

  // Fetch providers
  useEffect(() => {
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
  }, []);

  // Reset specialization when exam type changes
  useEffect(() => {
    setSpecialization("");
  }, [examType]);

  // Polling
  const pollJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const r = await fetch(`/api/admin/packages/auto-generate/${jobId}`);
      const j = (await r.json()) as {
        success: boolean;
        data?: AutoGenJobState;
        error?: { message: string };
      };

      if (j.success && j.data) {
        setJobState(j.data);

        if (j.data.status === "done" || j.data.status === "error") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch {
      // Polling silently retries
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    intervalRef.current = setInterval(pollJob, 2500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, pollJob]);

  function handleProviderChange(value: string): void {
    setProvider(value);
    const found = providers.find((p) => p.provider === value);
    setModel(found?.model ?? "");
  }

  function togglePackage(idx: number): void {
    setExpandedPkgs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleStart(): Promise<void> {
    if (!provider || !model || !categoryId) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/packages/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          specialization: specialization || undefined,
          categoryId,
          provider,
          model,
          difficulty,
          quantity,
          price: isFree ? 0 : price,
          isFree,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        data?: { jobId: string };
        error?: { message: string };
      };

      if (!response.ok || !result.success) {
        toast.error(result.error?.message ?? "Gagal memulai auto-generate");
        return;
      }

      setJobId(result.data?.jobId ?? null);
      setStarted(true);

      // Expand first package by default
      setExpandedPkgs(new Set([0]));
    } catch {
      toast.error("Terjadi kesalahan saat memulai auto-generate");
    } finally {
      setLoading(false);
    }
  }

  const canStart = Boolean(
    provider && model && categoryId && !loading && !fetchingProviders
  );

  if (started) {
    return (
      <div className="space-y-6">
        {/* Overall progress */}
        <div className={cardCls}>
          <SectionHeader
            icon={Sparkles}
            title="Progress Auto-Generate"
            description={`Membuat ${quantity} paket ${examType}`}
          />
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress Keseluruhan</span>
                <span className="text-muted-foreground tabular-nums">
                  {jobState?.progress ?? 0}%
                </span>
              </div>
              <Progress value={jobState?.progress ?? 0} className="h-2" />
            </div>

            {/* Per-package progress */}
            <div className="space-y-3">
              {(jobState?.packages ?? []).map((pkg, pkgIdx) => {
                const isExpanded = expandedPkgs.has(pkgIdx);
                const pkgGenerated = pkg.sections.reduce(
                  (s, sec) => s + sec.generated,
                  0
                );
                const pkgTotal = pkg.sections.reduce(
                  (s, sec) => s + sec.total,
                  0
                );

                return (
                  <div
                    key={pkg.packageId}
                    className="rounded-xl ring-1 ring-black/[0.06] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => togglePackage(pkgIdx)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <SectionStatusIcon
                          status={
                            pkg.status === "processing"
                              ? "processing"
                              : pkg.status === "done"
                                ? "done"
                                : pkg.status === "error"
                                  ? "error"
                                  : "pending"
                          }
                        />
                        <div>
                          <p className="text-sm font-medium">{pkg.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {pkgGenerated}/{pkgTotal} soal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pkg.status === "done" && (
                          <Link
                            href={`/admin/packages/${pkg.packageId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            Lihat <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t divide-y">
                        {pkg.sections.map((sec, secIdx) => (
                          <div
                            key={secIdx}
                            className="flex items-center gap-3 px-4 py-2.5"
                          >
                            <SectionStatusIcon status={sec.status} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{sec.title}</p>
                              {sec.error && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {sec.error}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {(sec.status === "done" ||
                                sec.status === "processing") && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {sec.generated}/{sec.total}
                                </span>
                              )}
                              <SectionStatusBadge status={sec.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Done state */}
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
                    ? `Selesai! ${totalGenerated} soal berhasil digenerate di ${
                        jobState.packages.length
                      } paket`
                    : jobState?.error ?? "Terjadi kesalahan saat auto-generate"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/packages")}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Kembali ke Paket
              </Button>
              {isDone && (
                <Button
                  onClick={() => {
                    setStarted(false);
                    setJobId(null);
                    setJobState(null);
                  }}
                >
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  Generate Lagi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Tipe Ujian & Spesialisasi */}
      <div className={cardCls}>
        <SectionHeader
          icon={Wand2}
          title="Tipe Ujian & Spesialisasi"
          description="Pilih tipe ujian dan spesialisasi untuk soal yang akan digenerate"
        />
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Tipe Ujian</Label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-active={examType === opt.value}
                  onClick={() => setExamType(opt.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {specConfig && specOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                {specConfig.label}
                {(examType === "CPNS" || examType === "BUMN") && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    (opsional)
                  </span>
                )}
              </Label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder={specConfig.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {specOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Kategori Ujian</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Card 2: AI Provider */}
      <div className={cardCls}>
        <SectionHeader
          icon={Settings2}
          title="AI Provider"
          description="Provider dan model AI untuk generate soal"
        />
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Provider</Label>
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
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Model</Label>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Tingkat Kesulitan</Label>
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
          </div>
        </div>
      </div>

      {/* Card 3: Pengaturan Paket */}
      <div className={cardCls}>
        <SectionHeader
          icon={DollarSign}
          title="Pengaturan Paket"
          description="Jumlah paket dan harga"
        />
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Jumlah Paket</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
              }
            />
            <p className="text-xs text-muted-foreground">
              Setiap paket akan memiliki struktur section yang sama dengan soal yang berbeda
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Paket Gratis</p>
                <p className="text-xs text-muted-foreground">
                  Peserta tidak perlu membayar
                </p>
              </div>
              <Switch
                checked={isFree}
                onCheckedChange={(v) => {
                  setIsFree(v);
                  if (v) setPrice(0);
                }}
              />
            </div>
          </div>

          {!isFree && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Harga per Paket (Rp)</Label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                placeholder="25000"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Preview */}
      {template.length > 0 && (
        <div className={cardCls}>
          <SectionHeader
            icon={Eye}
            title="Preview Paket"
            description="Struktur section yang akan dibuat per paket"
          />
          <div className="p-5 space-y-4">
            <div className="rounded-xl ring-1 ring-black/[0.06] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 pl-4">#</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Soal</TableHead>
                    <TableHead className="text-right pr-4">Durasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {template.map((tpl, i) => (
                    <TableRow key={i} className="hover:bg-muted/40">
                      <TableCell className="pl-4 tabular-nums text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{tpl.title}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {tpl.totalQuestions}
                      </TableCell>
                      <TableCell className="text-right pr-4 tabular-nums text-muted-foreground">
                        {tpl.durationMinutes} menit
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-4 rounded-xl bg-muted/60 ring-1 ring-black/[0.04] p-3 text-sm">
              <div className="text-muted-foreground">
                Paket:{" "}
                <span className="font-semibold text-foreground">
                  {quantity}x
                </span>
              </div>
              <div className="text-muted-foreground">
                Total Soal:{" "}
                <span className="font-semibold text-foreground">
                  {totalQuestions * quantity}
                </span>
              </div>
              <div className="text-muted-foreground">
                Durasi/Paket:{" "}
                <span className="font-semibold text-foreground">
                  {totalDuration} menit
                </span>
              </div>
              <div className="text-muted-foreground">
                Section/Paket:{" "}
                <span className="font-semibold text-foreground">
                  {template.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/packages")}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Batal
        </Button>
        <Button onClick={handleStart} disabled={!canStart}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loading
            ? "Memulai..."
            : `Generate ${quantity} Paket (${totalQuestions * quantity} soal)`}
        </Button>
      </div>
    </div>
  );
}
