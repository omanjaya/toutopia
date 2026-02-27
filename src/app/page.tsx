// Server Component — tidak ada "use client" di sini
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { HomeContent } from "./home-content";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <HomeContent />
      <Footer />
    </div>
  );
}
