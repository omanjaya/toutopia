"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Gift, Copy, Check, Users, Share2 } from "lucide-react";
import { toast } from "sonner";

export function ReferralCard() {
  const [data, setData] = useState<{ referralCode: string; totalReferrals: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const referralUrl = `${origin}/register?ref=${data.referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Link referral disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Daftar di Toutopia",
        text: `Daftar di Toutopia pakai kode referral saya dan dapatkan kredit gratis! Kode: ${data!.referralCode}`,
        url: referralUrl,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="px-6 pt-6 pb-3">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Ajak Teman, Dapat Kredit!
        </h3>
      </div>
      <div className="px-6 pb-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Bagikan kode referralmu. Setiap teman yang mendaftar, kamu dapat <strong className="text-foreground">5 kredit gratis</strong>.
        </p>

        <div className="flex gap-2">
          <Input
            readOnly
            value={data.referralCode}
            className="font-mono font-bold tracking-wider text-center bg-background"
          />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{data.totalReferrals} orang sudah bergabung</span>
        </div>
      </div>
    </div>
  );
}
