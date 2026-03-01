"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, Eye, EyeOff, Zap, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";

interface ProviderConfig {
  provider: string;
  name: string;
  description: string;
  models: { id: string; name: string }[];
  isActive: boolean;
  model: string;
  hasApiKey: boolean;
  maskedApiKey: string;
}

const PROVIDER_DOT: Record<string, string> = {
  gemini: "bg-blue-500",
  groq: "bg-purple-500",
  deepseek: "bg-teal-500",
  mistral: "bg-orange-500",
  openai: "bg-emerald-500",
  anthropic: "bg-rose-500",
  zhipu: "bg-amber-500",
  openrouter: "bg-violet-500",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function ProviderSkeleton() {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function AiSettings() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai/settings");
      const json = (await res.json()) as { success: boolean; data: ProviderConfig[] };
      if (json.success) {
        setProviders(json.data);
      }
    } catch {
      toast.error("Gagal memuat konfigurasi AI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  async function handleSave(provider: ProviderConfig) {
    setSaving((prev) => ({ ...prev, [provider.provider]: true }));

    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.provider,
          apiKey: apiKeys[provider.provider] || undefined,
          model: provider.model,
          isActive: provider.isActive,
        }),
      });

      const json = (await res.json()) as { success: boolean };
      if (json.success) {
        toast.success(`${provider.name} berhasil disimpan`);
        setApiKeys((prev) => ({ ...prev, [provider.provider]: "" }));
        fetchProviders();
      } else {
        toast.error("Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving((prev) => ({ ...prev, [provider.provider]: false }));
    }
  }

  async function handleTest(provider: ProviderConfig) {
    const key = apiKeys[provider.provider];
    if (!key && !provider.hasApiKey) {
      toast.error("Masukkan API key terlebih dahulu");
      return;
    }

    setTesting((prev) => ({ ...prev, [provider.provider]: true }));

    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.provider,
          apiKey: key || "use-saved",
          model: provider.model,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data: { success: boolean; message: string };
      };

      if (json.data.success) {
        toast.success(json.data.message);
      } else {
        toast.error(json.data.message);
      }
    } catch {
      toast.error("Gagal menguji koneksi");
    } finally {
      setTesting((prev) => ({ ...prev, [provider.provider]: false }));
    }
  }

  function updateProvider(providerId: string, updates: Partial<ProviderConfig>) {
    setProviders((prev) =>
      prev.map((p) =>
        p.provider === providerId ? { ...p, ...updates } : p
      )
    );
  }

  const activeCount = providers.filter((p) => p.isActive && p.hasApiKey).length;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Provider</p>
            <p className="text-xs text-muted-foreground">Konfigurasi penyedia model AI</p>
          </div>
        </div>
        {!loading && (
          <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${activeCount > 0 ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            <span className="text-muted-foreground">
              {activeCount > 0 ? `${activeCount} provider aktif` : "Belum ada provider aktif"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground ring-1 ring-black/[0.05]">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span>
          API keys dienkripsi dan disimpan di database. Hanya SUPER_ADMIN yang dapat mengakses halaman ini.
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <ProviderSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => {
            const dotColor = PROVIDER_DOT[provider.provider] ?? "bg-muted-foreground";
            const isActive = provider.isActive && provider.hasApiKey;

            return (
              <div key={provider.provider} className={`${cardCls} overflow-hidden`}>
                {/* Card header */}
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted`}>
                      <span className={`h-3 w-3 rounded-full ${dotColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{provider.name}</p>
                        {isActive ? (
                          <Badge
                            variant="outline"
                            className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 leading-5"
                          >
                            <Check className="h-2.5 w-2.5" /> Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-5 text-muted-foreground">
                            Nonaktif
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={provider.isActive}
                    onCheckedChange={(checked) =>
                      updateProvider(provider.provider, { isActive: checked })
                    }
                  />
                </div>

                {/* Card body */}
                <div className="space-y-4 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">API Key</Label>
                      <div className="relative">
                        <Input
                          type={showKeys[provider.provider] ? "text" : "password"}
                          placeholder={
                            provider.hasApiKey
                              ? provider.maskedApiKey
                              : "Masukkan API key..."
                          }
                          value={apiKeys[provider.provider] ?? ""}
                          onChange={(e) =>
                            setApiKeys((prev) => ({
                              ...prev,
                              [provider.provider]: e.target.value,
                            }))
                          }
                          className="pr-9"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKeys((prev) => ({
                              ...prev,
                              [provider.provider]: !prev[provider.provider],
                            }))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKeys[provider.provider] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {provider.hasApiKey && (
                        <p className="text-[11px] text-muted-foreground">
                          API key tersimpan. Isi untuk mengganti.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Model Default</Label>
                      <Select
                        value={provider.model}
                        onValueChange={(value) =>
                          updateProvider(provider.provider, { model: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {provider.models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border/60 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleSave(provider)}
                      disabled={saving[provider.provider]}
                    >
                      {saving[provider.provider] ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Simpan
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(provider)}
                      disabled={
                        testing[provider.provider] ||
                        (!apiKeys[provider.provider] && !provider.hasApiKey)
                      }
                    >
                      {testing[provider.provider] ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Zap className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Test Koneksi
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
