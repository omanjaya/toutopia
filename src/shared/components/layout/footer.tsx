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
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Kategori</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.kategori.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Perusahaan</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
