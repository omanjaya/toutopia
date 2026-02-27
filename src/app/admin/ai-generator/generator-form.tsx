"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Upload,
  Loader2,
  Save,
  Trash2,
  Check,
  AlertCircle,
  FileJson,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Copy,
  CheckCircle2,
  XCircle,
  Settings2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SegmentedControl } from "@/shared/components/ui/segmented-control";
import { Switch } from "@/shared/components/ui/switch";

/* ── Constants ── */

const PROVIDER_MODELS: Record<string, { id: string; name: string; free?: boolean }[]> = {
  gemini: [
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", free: true },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)" },
  ],
  groq: [
    { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B", free: true },
    { id: "qwen/qwen3-32b", name: "Qwen 3 32B", free: true },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek V3" },
    { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoning)" },
  ],
  mistral: [
    { id: "mistral-small-latest", name: "Mistral Small 3.2", free: true },
    { id: "mistral-medium-latest", name: "Mistral Medium 3" },
    { id: "mistral-large-latest", name: "Mistral Large 3" },
  ],
  openai: [
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "gpt-4.1", name: "GPT-4.1" },
  ],
};

const PROVIDER_NAMES: Record<string, string> = {
  gemini: "Google Gemini",
  groq: "Groq",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  openai: "OpenAI",
};

const EXAM_TYPES = ["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"] as const;
const EXAM_LABELS: Record<string, string> = { UTBK: "UTBK-SNBT", CPNS: "CPNS", BUMN: "BUMN", PPPK: "PPPK", KEDINASAN: "Kedinasan" };

const DIFFICULTIES = [
  { value: "MIXED", label: "Campuran" },
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
] as const;

const DIFF_COLORS: Record<string, string> = {
  VERY_EASY: "bg-green-100 text-green-700", EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-yellow-100 text-yellow-700", HARD: "bg-orange-100 text-orange-700",
  VERY_HARD: "bg-red-100 text-red-700", MIXED: "bg-gray-100 text-gray-700",
};

/* ── Types ── */

interface Category { id: string; name: string; subCategories: { id: string; name: string; subjects: { id: string; name: string; topics: { id: string; name: string }[] }[] }[] }
interface ActiveProvider { provider: string; model: string }
interface GenQuestion { content: string; explanation: string; difficulty: string; type: string; options: { label: string; content: string; isCorrect: boolean; order: number; score?: number }[]; selected?: boolean }
interface ValResult { index: number; valid: boolean; issues: string[]; suggestions: string }

/* ── Helpers ── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}</Label>
      {children}
    </div>
  );
}

function TopicCascade({ categories, ids, setIds }: {
  categories: Category[];
  ids: { cat: string; sub: string; subj: string; topic: string };
  setIds: (v: { cat: string; sub: string; subj: string; topic: string }) => void;
}) {
  const cat = categories.find((c) => c.id === ids.cat);
  const sub = cat?.subCategories.find((s) => s.id === ids.sub);
  const subj = sub?.subjects.find((s) => s.id === ids.subj);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select value={ids.cat} onValueChange={(v) => setIds({ cat: v, sub: "", subj: "", topic: "" })}>
        <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
        <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={ids.sub} onValueChange={(v) => setIds({ ...ids, sub: v, subj: "", topic: "" })} disabled={!ids.cat}>
        <SelectTrigger><SelectValue placeholder="Sub Kategori" /></SelectTrigger>
        <SelectContent>{(cat?.subCategories ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={ids.subj} onValueChange={(v) => setIds({ ...ids, subj: v, topic: "" })} disabled={!ids.sub}>
        <SelectTrigger><SelectValue placeholder="Mata Pelajaran" /></SelectTrigger>
        <SelectContent>{(sub?.subjects ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={ids.topic} onValueChange={(v) => setIds({ ...ids, topic: v })} disabled={!ids.subj}>
        <SelectTrigger><SelectValue placeholder="Topik" /></SelectTrigger>
        <SelectContent>{(subj?.topics ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

/* ═════════════════════════════════
   MAIN EXPORT
   ═════════════════════════════════ */

export function GeneratorForm({ categories, activeProviders }: { categories: Category[]; activeProviders: ActiveProvider[] }) {
  const [activeTab, setActiveTab] = useState("generate");
  return (
    <div className="space-y-6">
      <SegmentedControl
        options={[
          { value: "generate", label: "AI Generate", icon: <Sparkles className="h-3.5 w-3.5" /> },
          { value: "import", label: "Import File", icon: <Upload className="h-3.5 w-3.5" /> },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />
      {activeTab === "generate"
        ? <GenerateTab categories={categories} activeProviders={activeProviders} />
        : <ImportTab categories={categories} />}
    </div>
  );
}

/* ═════════════════════════════════
   GENERATE TAB
   ═════════════════════════════════ */

function GenerateTab({ categories, activeProviders }: { categories: Category[]; activeProviders: ActiveProvider[] }) {
  const [provider, setProvider] = useState(activeProviders[0]?.provider ?? "");
  const [model, setModel] = useState(activeProviders[0]?.model ?? "");
  const [examType, setExamType] = useState("UTBK");
  const [ids, setIds] = useState({ cat: "", sub: "", subj: "", topic: "" });
  const [difficulty, setDifficulty] = useState("MIXED");
  const [type, setType] = useState("SINGLE_CHOICE");
  const [count, setCount] = useState("5");
  const [customInstruction, setCustomInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [validation, setValidation] = useState<ValResult[] | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [enableValidation, setEnableValidation] = useState(false);
  const [validatorProvider, setValidatorProvider] = useState(activeProviders[0]?.provider ?? "");
  const [validatorModel, setValidatorModel] = useState(activeProviders[0]?.model ?? "");
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const topicId = ids.topic;

  const onProviderChange = useCallback((v: string) => {
    setProvider(v);
    setModel(activeProviders.find((p) => p.provider === v)?.model ?? PROVIDER_MODELS[v]?.[0]?.id ?? "");
  }, [activeProviders]);

  const onValProviderChange = useCallback((v: string) => {
    setValidatorProvider(v);
    setValidatorModel(activeProviders.find((p) => p.provider === v)?.model ?? PROVIDER_MODELS[v]?.[0]?.id ?? "");
  }, [activeProviders]);

  async function onPreview() {
    if (!topicId) { toast.error("Pilih topik terlebih dahulu"); return; }
    setLoadingPrompt(true);
    try {
      const r = await fetch("/api/admin/ai/generate", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicId, count: +count, difficulty, type, examType, customInstruction: customInstruction || undefined }) });
      const j = (await r.json()) as { success: boolean; data: { prompt?: string; error?: string } };
      if (j.success && j.data.prompt) { setPrompt(j.data.prompt); setShowPrompt(true); }
      else toast.error(j.data.error ?? "Gagal memuat prompt");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setLoadingPrompt(false); }
  }

  async function onGenerate() {
    if (!topicId) { toast.error("Pilih topik terlebih dahulu"); return; }
    if (!provider) { toast.error("Pilih AI provider"); return; }
    setGenerating(true); setQuestions([]); setValidation(null);
    try {
      const r = await fetch("/api/admin/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, model, topicId, count: +count, difficulty, type, examType, customInstruction: customInstruction || undefined, enableValidation, validatorProvider: enableValidation ? validatorProvider : undefined, validatorModel: enableValidation ? validatorModel : undefined }) });
      const j = (await r.json()) as { success: boolean; data: { questions?: GenQuestion[]; validation?: ValResult[] | null; error?: string; meta?: { generated: number; requested: number; validated: boolean } } };
      if (!j.success || j.data.error) { toast.error(j.data.error ?? "Gagal generate soal"); return; }
      const qs = (j.data.questions ?? []).map((q) => ({ ...q, selected: true }));
      setQuestions(qs); setValidation(j.data.validation ?? null);
      toast.success(`${j.data.meta?.generated ?? qs.length} soal berhasil di-generate${j.data.meta?.validated ? " dan divalidasi" : ""}`);
    } catch { toast.error("Terjadi kesalahan saat generate soal"); }
    finally { setGenerating(false); }
  }

  async function onSave() {
    const sel = questions.filter((q) => q.selected);
    if (!sel.length) { toast.error("Pilih minimal 1 soal"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/admin/ai/generate/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicId, source: `AI Generated (${PROVIDER_NAMES[provider] ?? provider})`, questions: sel.map((q) => ({ content: q.content, explanation: q.explanation, difficulty: q.difficulty, type: q.type, options: q.options })) }) });
      const j = (await r.json()) as { success: boolean; data: { saved?: number; error?: string } };
      if (j.success && j.data.saved) { toast.success(`${j.data.saved} soal disimpan`); setQuestions([]); setValidation(null); }
      else toast.error(j.data.error ?? "Gagal menyimpan");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  }

  const selCount = questions.filter((q) => q.selected).length;

  /* Empty state */
  if (!activeProviders.length) {
    return (
      <div className={`${cardCls} py-16 text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Belum Ada Provider Aktif</h3>
        <p className="mt-1 text-sm text-muted-foreground">Konfigurasi API key terlebih dahulu.</p>
        <div className="mt-6"><Button asChild variant="outline"><a href="/admin/settings"><Settings2 className="mr-2 h-4 w-4" />Buka Pengaturan</a></Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Config Card ── */}
      <div className={cardCls}>
        <div className="px-6 pt-5 pb-4 border-b border-border/40">
          <h3 className="text-[15px] font-semibold">Konfigurasi Generate</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Atur provider, tipe ujian, dan detail soal</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Provider + Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AI Provider">
              <Select value={provider} onValueChange={onProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih provider" />
                </SelectTrigger>
                <SelectContent>
                  {activeProviders.map((p) => (
                    <SelectItem key={p.provider} value={p.provider}>
                      <span className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                        {PROVIDER_NAMES[p.provider] ?? p.provider}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Model">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih model" />
                </SelectTrigger>
                <SelectContent>
                  {(PROVIDER_MODELS[provider] ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        {m.name}
                        {m.free && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">FREE</span>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Exam type */}
          <Field label="Tipe Ujian">
            <div className="flex flex-wrap gap-1.5">
              {EXAM_TYPES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExamType(key)}
                  className={`h-8 rounded-lg border px-3.5 text-[13px] font-medium transition-all ${
                    examType === key
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {EXAM_LABELS[key]}
                </button>
              ))}
            </div>
          </Field>

          {/* Topic */}
          <Field label="Topik Soal">
            <TopicCascade categories={categories} ids={ids} setIds={setIds} />
          </Field>

          {/* Difficulty + Type + Count */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kesulitan">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tipe Soal">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Pilihan Ganda</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Pilihan Majemuk</SelectItem>
                  <SelectItem value="TRUE_FALSE">Benar / Salah</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Jumlah Soal">
              <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(e.target.value)} />
            </Field>
          </div>

          {/* Custom instruction */}
          <Field label="Instruksi Tambahan" hint="(opsional)">
            <Textarea placeholder="Contoh: Fokus pada penalaran deduktif, gunakan konteks kehidupan sehari-hari..." value={customInstruction} onChange={(e) => setCustomInstruction(e.target.value)} rows={2} className="resize-none" />
          </Field>

          {/* Validator */}
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-inset ring-blue-200">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium leading-tight">AI Validator</p>
                <p className="text-[12px] text-muted-foreground">Validasi kualitas soal otomatis</p>
              </div>
            </div>
            <Switch checked={enableValidation} onCheckedChange={setEnableValidation} />
          </div>

          {enableValidation && (
            <div className="grid gap-4 sm:grid-cols-2 ml-11">
              <Field label="Validator Provider">
                <Select value={validatorProvider} onValueChange={onValProviderChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{activeProviders.map((p) => <SelectItem key={p.provider} value={p.provider}>{PROVIDER_NAMES[p.provider] ?? p.provider}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Validator Model">
                <Select value={validatorModel} onValueChange={setValidatorModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(PROVIDER_MODELS[validatorProvider] ?? []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-border/40 px-6 py-4">
          <Button onClick={onGenerate} disabled={generating || !topicId}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? (enableValidation ? "Generating & Validating..." : "Generating...") : "Generate Soal"}
          </Button>
          <Button variant="outline" onClick={onPreview} disabled={loadingPrompt || !topicId}>
            {loadingPrompt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Lihat Prompt
          </Button>
        </div>
      </div>

      {/* ── Prompt Preview ── */}
      {showPrompt && prompt && (
        <div className={cardCls}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
            <span className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-blue-500" />Prompt Preview</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => { navigator.clipboard.writeText(prompt); toast.success("Disalin"); }}><Copy className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowPrompt(false)}><EyeOff className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className="p-6">
            <pre className="max-h-[500px] overflow-auto rounded-xl bg-muted/50 border border-border/40 p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground/80">{prompt}</pre>
          </div>
        </div>
      )}

      {/* ── Generated Results ── */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className={`${cardCls} flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">{questions.length} soal di-generate</p>
                <p className="text-xs text-muted-foreground">{selCount} dipilih</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setQuestions((p) => p.map((q) => ({ ...q, selected: true })))}>Pilih Semua</Button>
              <Button size="sm" variant="ghost" onClick={() => setQuestions((p) => p.map((q) => ({ ...q, selected: false })))}>Batal</Button>
              <div className="mx-0.5 h-4 w-px bg-border" />
              <Button size="sm" variant="outline" onClick={() => { setQuestions([]); setValidation(null); }}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Hapus</Button>
              <Button size="sm" onClick={onSave} disabled={saving || !selCount}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Simpan ({selCount})
              </Button>
            </div>
          </div>

          {/* Question cards */}
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const val = validation?.find((v) => v.index === idx);
              const dc = DIFF_COLORS[q.difficulty] ?? "bg-gray-100 text-gray-700";
              const dl = DIFFICULTIES.find((d) => d.value === q.difficulty)?.label ?? q.difficulty;
              return (
                <div key={idx} className={`${cardCls} transition-opacity duration-200 ${q.selected ? "" : "opacity-40"}`}>
                  <div className="flex gap-4 p-5">
                    {/* Check */}
                    <button type="button" onClick={() => setQuestions((p) => p.map((x, i) => i === idx ? { ...x, selected: !x.selected } : x))}
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${q.selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-muted-foreground/50"}`}>
                      {q.selected && <Check className="h-3 w-3" />}
                    </button>
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 text-[11px] font-bold text-primary">{idx + 1}</span>
                        <Badge className={`${dc} border-0 text-[11px] font-medium h-[22px]`}>{dl}</Badge>
                        {val && (val.valid
                          ? <Badge className="bg-green-50 text-green-700 border-0 text-[11px] h-[22px] ring-1 ring-inset ring-green-200"><CheckCircle2 className="mr-1 h-3 w-3" />Valid</Badge>
                          : <Badge className="bg-amber-50 text-amber-700 border-0 text-[11px] h-[22px] ring-1 ring-inset ring-amber-200"><AlertTriangle className="mr-1 h-3 w-3" />Issue</Badge>)}
                      </div>
                      <p className="text-[13.5px] leading-[1.65] whitespace-pre-wrap">{q.content}</p>
                      <div className="space-y-1.5">
                        {q.options.map((o) => (
                          <div key={o.label} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-[13px] ${o.isCorrect ? "bg-green-50 ring-1 ring-inset ring-green-200" : "bg-muted/40"}`}>
                            <span className={`mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${o.isCorrect ? "bg-green-600 text-white" : "bg-background text-muted-foreground ring-1 ring-inset ring-border"}`}>{o.label}</span>
                            <span className={`flex-1 leading-relaxed ${o.isCorrect ? "text-green-800 font-medium" : ""}`}>{o.content}</span>
                            {o.score !== undefined && <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5">Skor: {o.score}</Badge>}
                            {o.isCorrect && <Check className="shrink-0 h-4 w-4 text-green-600 mt-0.5" />}
                          </div>
                        ))}
                      </div>
                      {/* Pembahasan */}
                      <div className="rounded-lg border border-border/60 overflow-hidden">
                        <button type="button" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                          {expandedIdx === idx ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          Pembahasan
                          {!q.explanation && <span className="rounded bg-red-50 px-1 py-0.5 text-[10px] text-red-500 ring-1 ring-inset ring-red-200">Kosong</span>}
                        </button>
                        {expandedIdx === idx && (
                          <div className="border-t border-border/40 px-3 py-2.5">
                            <p className="text-[13px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.explanation || "Tidak tersedia."}</p>
                          </div>
                        )}
                      </div>
                      {/* Val issues */}
                      {val && !val.valid && val.issues.length > 0 && (
                        <div className="rounded-lg bg-amber-50 ring-1 ring-inset ring-amber-200 p-3 space-y-1.5">
                          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Catatan Validator</p>
                          <ul className="space-y-0.5 pl-5">{val.issues.map((s, i) => <li key={i} className="text-xs text-amber-700 list-disc">{s}</li>)}</ul>
                          {val.suggestions && <p className="text-xs text-amber-600 border-t border-amber-200 pt-1.5">Saran: {val.suggestions}</p>}
                        </div>
                      )}
                    </div>
                    {/* Delete */}
                    <button type="button" onClick={() => setQuestions((p) => p.filter((_, i) => i !== idx))}
                      className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors" title="Hapus">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom save */}
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving || !selCount}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan {selCount} Soal ke Database
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════
   IMPORT TAB
   ═════════════════════════════════ */

function ImportTab({ categories }: { categories: Category[] }) {
  const [ids, setIds] = useState({ cat: "", sub: "", subj: "", topic: "" });
  const [file, setFile] = useState<File | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ questions: GenQuestion[]; errors: { index: number; message: string }[] } | null>(null);

  async function onPreview() {
    if (!file || !ids.topic) { toast.error("Pilih file dan topik"); return; }
    setPreviewing(true); setPreview(null);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("topicId", ids.topic); fd.append("action", "preview");
      const r = await fetch("/api/admin/questions/import", { method: "POST", body: fd });
      const j = (await r.json()) as { success: boolean; data: { questions: GenQuestion[]; errors: { index: number; message: string }[]; error?: string } };
      if (!j.success || j.data.error) { toast.error(j.data.error ?? "Gagal"); return; }
      setPreview({ questions: j.data.questions, errors: j.data.errors });
      toast.success(`${j.data.questions.length} soal valid, ${j.data.errors.length} error`);
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setPreviewing(false); }
  }

  async function onSave() {
    if (!file || !ids.topic) return; setSaving(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("topicId", ids.topic); fd.append("action", "save"); fd.append("source", `Import: ${file.name}`);
      const r = await fetch("/api/admin/questions/import", { method: "POST", body: fd });
      const j = (await r.json()) as { success: boolean; data: { saved?: number; error?: string } };
      if (j.success && j.data.saved) { toast.success(`${j.data.saved} soal diimport`); setFile(null); setPreview(null); }
      else toast.error(j.data.error ?? "Gagal");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-border/40">
          <Upload className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-[15px] font-semibold">Import Soal dari File</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Upload file JSON atau Markdown</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Tujuan Topik">
            <TopicCascade categories={categories} ids={ids} setIds={setIds} />
          </Field>
          <Field label="File Soal">
            <label htmlFor="import-file" className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5">
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">{file.name.endsWith(".json") ? <FileJson className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-green-500" />}</div>
                  <div className="text-left"><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p></div>
                </div>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted"><Upload className="h-5 w-5 text-muted-foreground" /></div>
                  <div><p className="text-sm font-medium">Klik atau drag file ke sini</p><p className="text-xs text-muted-foreground mt-0.5">Format: .json atau .md</p></div>
                </>
              )}
              <input id="import-file" type="file" accept=".json,.md,.markdown,.txt" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }} />
            </label>
          </Field>
        </div>
        <div className="flex items-center gap-3 border-t border-border/40 px-6 py-4">
          <Button onClick={onPreview} disabled={previewing || !file || !ids.topic}>
            {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}Preview
          </Button>
          {preview && preview.questions.length > 0 && (
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Import {preview.questions.length} Soal
            </Button>
          )}
        </div>
      </div>

      {preview && (
        <div className="space-y-3">
          {preview.errors.length > 0 && (
            <div className="rounded-xl bg-red-50 ring-1 ring-inset ring-red-200 p-4">
              <div className="flex items-center gap-2 mb-2"><XCircle className="h-4 w-4 text-red-500" /><span className="font-semibold text-sm text-red-700">{preview.errors.length} Error</span></div>
              <ul className="space-y-0.5 pl-6">{preview.errors.map((e, i) => <li key={i} className="text-xs text-red-600 list-disc">{e.message}</li>)}</ul>
            </div>
          )}
          {preview.questions.map((q, idx) => (
            <div key={idx} className={`${cardCls} p-5`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-md bg-primary/10 px-1.5 text-[11px] font-bold text-primary">{idx + 1}</span>
                  <Badge variant="secondary" className="text-[11px] h-[22px]">{q.difficulty}</Badge>
                </div>
                <p className="text-[13.5px] whitespace-pre-wrap leading-[1.65]">{q.content}</p>
                <div className="space-y-1.5">
                  {q.options.map((o) => (
                    <div key={o.label} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-[13px] ${o.isCorrect ? "bg-green-50 ring-1 ring-inset ring-green-200" : "bg-muted/40"}`}>
                      <span className={`mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${o.isCorrect ? "bg-green-600 text-white" : "bg-background text-muted-foreground ring-1 ring-inset ring-border"}`}>{o.label}</span>
                      <span className={`flex-1 leading-relaxed ${o.isCorrect ? "text-green-800 font-medium" : ""}`}>{o.content}</span>
                      {o.isCorrect && <Check className="shrink-0 h-4 w-4 text-green-600 mt-0.5" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Pembahasan</p>
                    <p className="text-[13px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
