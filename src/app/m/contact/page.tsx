import type { Metadata } from "next";
import Link from "next/link";
import { MobileLayout } from "@/app/m/mobile-layout";
import { Button } from "@/shared/components/ui/button";
import { Mail, MessageCircle, Clock, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim Toutopia untuk pertanyaan, masukan, atau kerja sama.",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface ContactItem {
  icon: React.ElementType;
  title: string;
  description: string;
  value: string;
  href: string | null;
  iconColor: string;
  iconBg: string;
}

const contacts: ContactItem[] = [
  {
    icon: Mail,
    title: "Email",
    description: "Untuk pertanyaan umum dan dukungan teknis",
    value: "support@toutopia.id",
    href: "mailto:support@toutopia.id",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Chat langsung dengan tim kami",
    value: "Kirim Pesan",
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    description: "Senin — Jumat",
    value: "09.00 — 17.00 WIB",
    href: null,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
  },
];

export default function MobileContactPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-6 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Hubungi Kami</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Punya pertanyaan, masukan, atau ingin kerja sama? Kami siap
            membantu.
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.title} className={cardCls}>
              <div className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}
                >
                  <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {c.value}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold">{c.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ suggestion */}
        <div className={`${cardCls} mt-4 bg-muted/30`}>
          <div className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Cek FAQ terlebih dahulu</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mungkin pertanyaanmu sudah terjawab di halaman FAQ kami.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 rounded-full"
              >
                <Link href="/m/faq">
                  Lihat FAQ
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
