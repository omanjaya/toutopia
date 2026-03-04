"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface AiGenerateDialogProps {
  onUse: (data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
  }) => void;
}

const CATEGORIES = ["Tips Belajar", "Jadwal Ujian", "Strategi", "Pengumuman", "Lainnya"];
const TONES = [
  { value: "profesional", label: "Profesional" },
  { value: "santai", label: "Santai & Friendly" },
  { value: "akademis", label: "Akademis" },
  { value: "motivasi", label: "Motivasional" },
];
const PROVIDERS = [
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "openai", label: "OpenAI (GPT)" },
  { value: "gemini", label: "Google Gemini" },
  { value: "groq", label: "Groq" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "mistral", label: "Mistral" },
];

interface GeneratedResult {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
}

export function AiGenerateDialog({ onUse }: AiGenerateDialogProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("profesional");
  const [targetLength, setTargetLength] = useState(1500);
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("");

  async function handleGenerate(): Promise<void> {
    if (!topic.trim()) {
      toast.error("Topik wajib diisi");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          ...(model ? { model } : {}),
          topic: topic.trim(),
          ...(outline ? { outline } : {}),
          ...(category ? { category } : {}),
          tone,
          targetLength,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Gagal generate artikel");
        return;
      }

      setResult(json.data);
      toast.success("Artikel berhasil di-generate!");
    } catch {
      toast.error("Terjadi kesalahan saat menghubungi AI");
    } finally {
      setGenerating(false);
    }
  }

  function handleUse(): void {
    if (!result) return;
    onUse(result);
    setOpen(false);
    setResult(null);
    setTopic("");
    setOutline("");
    toast.success("Konten AI diterapkan ke form");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Generate dengan AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Artikel dengan AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Topik / Judul <span className="text-destructive">*</span></Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Tips mengerjakan soal TPS Penalaran Umum UTBK 2026"
            />
          </div>

          <div className="space-y-2">
            <Label>Outline (opsional)</Label>
            <Textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Garis besar poin-poin yang ingin dibahas..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model (opsional)</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Default provider"
              />
            </div>
            <div className="space-y-2">
              <Label>Target (kata)</Label>
              <Input
                type="number"
                value={targetLength}
                onChange={(e) => setTargetLength(parseInt(e.target.value) || 1500)}
                min={300}
                max={5000}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Artikel
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Judul</p>
                <p className="font-semibold">{result.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ringkasan</p>
                <p className="text-sm">{result.excerpt}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Preview Konten</p>
                <div
                  className="mt-1 max-h-48 overflow-y-auto rounded border bg-background p-3 text-sm prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: result.content.slice(0, 2000) }}
                />
              </div>
              <Button type="button" onClick={handleUse} className="w-full">
                Gunakan Konten Ini
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
