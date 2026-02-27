import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Mail, MessageCircle, Clock, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak — Toutopia",
  description: "Hubungi tim Toutopia untuk pertanyaan, masukan, atau kerja sama.",
};

const contacts = [
  {
    icon: Mail,
    title: "Email",
    description: "Untuk pertanyaan umum dan dukungan teknis",
    value: "support@toutopia.id",
    href: "mailto:support@toutopia.id",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Chat langsung dengan tim kami",
    value: "Kirim Pesan",
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    description: "Senin — Jumat",
    value: "09.00 — 17.00 WIB",
    href: null,
    color: "bg-amber-500/10 text-amber-600",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent" />
          <div className="absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Hubungi Kami
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Punya pertanyaan, masukan, atau ingin kerja sama? Kami siap
                membantu.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {contacts.map((c) => (
                <Card key={c.title} className="group transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="pt-6 text-center">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${c.color}`}>
                      <c.icon className="h-7 w-7" />
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
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-10 bg-gradient-to-r from-muted/50 to-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center py-8 text-center sm:flex-row sm:gap-6 sm:text-left">
                <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mb-0">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Cek FAQ terlebih dahulu</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Mungkin pertanyaanmu sudah terjawab di halaman FAQ kami.
                  </p>
                </div>
                <Button asChild variant="outline" className="mt-4 sm:mt-0">
                  <Link href="/faq">
                    Lihat FAQ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
