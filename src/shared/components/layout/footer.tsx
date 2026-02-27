import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { siteConfig } from "@/config/site.config";

const footerLinks = {
  platform: [
    { title: "Paket Try Out", href: "/packages" },
    { title: "Harga", href: "/pricing" },
    { title: "Leaderboard", href: "/leaderboard" },
    { title: "Blog", href: "/blog" },
  ],
  kategori: [
    { title: "UTBK-SNBT", href: "/tryout-utbk" },
    { title: "CPNS", href: "/tryout-cpns" },
    { title: "BUMN", href: "/tryout-bumn" },
    { title: "Kedinasan", href: "/tryout-kedinasan" },
    { title: "PPPK", href: "/tryout-pppk" },
  ],
  perusahaan: [
    { title: "Tentang Kami", href: "/about" },
    { title: "FAQ", href: "/faq" },
    { title: "Gabung Pengajar", href: "/register?role=teacher" },
    { title: "Kontak", href: "/contact" },
  ],
  legal: [
    { title: "Kebijakan Privasi", href: "/privacy" },
    { title: "Syarat & Ketentuan", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Platform simulasi ujian online terdepan dengan standar premium untuk masa depan yang lebih cerah.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 md:mt-0 xl:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Platform</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.platform.map((item) => (
                  <li key={item.title}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Kategori</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.kategori.map((item) => (
                  <li key={item.title}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.perusahaan.map((item) => (
                  <li key={item.title}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.legal.map((item) => (
                  <li key={item.title}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Designed with precision in Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
