"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Share2, Download, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface ScoreShareProps {
  attemptId: string;
  score: number;
  packageTitle: string;
}

export function ScoreShare({ attemptId, score, packageTitle }: ScoreShareProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = `${origin}/exam/${attemptId}/result`;
  const shareText = `Skor saya ${score}/1000 di ${packageTitle} di Toutopia! 🎯`;
  const imageUrl = `/api/exam/${attemptId}/share`;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toutopia-score-${attemptId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Score card berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh score card");
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank");
  }

  function handleShareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  }

  async function handleNativeShare() {
    if (!navigator.share) return;

    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "score-card.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Hasil Try Out Toutopia",
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } else {
        await navigator.share({
          title: "Hasil Try Out Toutopia",
          text: shareText,
          url: shareUrl,
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Gagal share");
      }
    }
  }

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Bagikan Hasil
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share...
            </button>
          )}
          <button
            onClick={handleShareWhatsApp}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={handleShareTwitter}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter / X
          </button>
          <button
            onClick={handleCopyLink}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Tersalin!" : "Salin Link"}
          </button>
          <div className="border-t my-1" />
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Mengunduh..." : "Unduh Score Card"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
