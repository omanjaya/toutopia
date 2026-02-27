import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { Button } from "@/shared/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { DarkModeToggle } from "./dark-mode-toggle";
import { publicNav } from "@/config/navigation.config";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Toutopia</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {session?.user ? (
            <UserMenu user={{ ...session.user, avatar: session.user.image ?? null }} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button size="sm" className="h-9 rounded-full px-5 text-sm" asChild>
                <Link href="/register">Daftar sekarang</Link>
              </Button>
            </div>
          )}
          <MobileNav isLoggedIn={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
