"use client";

import { useRef, useState } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mengupload gambar");
        return;
      }

      onChange(result.data.url);
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className={cn("relative inline-block", className)}>
        <img
          src={value}
          alt="Preview"
          className="h-24 w-auto rounded-lg border object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -right-2 -top-2 h-6 w-6"
          onClick={() => onChange(null)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Mengupload..." : "Upload Gambar"}
      </Button>
    </div>
  );
}
