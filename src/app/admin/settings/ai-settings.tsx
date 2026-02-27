"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, Eye, EyeOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4" />
        <span>
          API keys dienkripsi dan disimpan di database. Hanya SUPER_ADMIN yang dapat mengakses halaman ini.
        </span>
      </div>

      {providers.map((provider) => (
        <Card key={provider.provider}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{provider.name}</CardTitle>
                {provider.isActive && provider.hasApiKey ? (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" /> Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary">Nonaktif</Badge>
                )}
              </div>
              <Switch
                checked={provider.isActive}
                onCheckedChange={(checked) =>
                  updateProvider(provider.provider, { isActive: checked })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>API Key</Label>
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
              </div>

              <div className="space-y-2">
                <Label>Model Default</Label>
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

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleSave(provider)}
                disabled={saving[provider.provider]}
              >
                {saving[provider.provider] ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-3.5 w-3.5" />
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
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-3.5 w-3.5" />
                )}
                Test Koneksi
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
