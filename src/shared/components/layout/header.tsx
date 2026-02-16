import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { Button } from "@/shared/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { publicNav } from "@/config/navigation.config";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Toutopia</span>
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

        <div className="flex items-center gap-4">
          {session?.user ? (
            <UserMenu user={{ ...session.user, avatar: session.user.image ?? null }} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Daftar Gratis</Link>
              </Button>
            </div>
          )}
          <MobileNav isLoggedIn={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
