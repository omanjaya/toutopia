import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Button } from "@/shared/components/ui/button";
import { Mail, MessageCircle, Clock, HelpCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak — Toutopia",
  description: "Hubungi tim Toutopia untuk pertanyaan, masukan, atau kerja sama.",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-14 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent" />
          <div className="absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Hubungi Kami
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
                Punya pertanyaan, masukan, atau ingin kerja sama? Kami siap
                membantu.
              </p>
            </div>

            {/* Mobile: horizontal card list */}
            <div className="mt-8 space-y-3 sm:hidden">
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

            {/* Desktop: centered card grid */}
            <div className="mt-14 hidden gap-4 sm:grid sm:grid-cols-3">
              {contacts.map((c) => (
                <div key={c.title} className={`${cardCls} group transition-all hover:shadow-md hover:-translate-y-0.5`}>
                  <div className="pt-6 text-center px-6 pb-6">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${c.iconBg}`}>
                      <c.icon className={`h-7 w-7 ${c.iconColor}`} />
                    </div>
                    <h3 className="text-base font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        {c.value}
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm font-semibold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`${cardCls} mt-6 bg-gradient-to-r from-muted/50 to-muted/30 sm:mt-10 sm:border-dashed`}>
              <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Cek FAQ terlebih dahulu</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Mungkin pertanyaanmu sudah terjawab di halaman FAQ kami.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full sm:rounded-md sm:size-auto">
                  <Link href="/faq">
                    Lihat FAQ
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
