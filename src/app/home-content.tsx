"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
    BookOpenCheck,
    Shield,
    BarChart3,
    CalendarDays,
    Users,
    Zap,
    ChevronRight,
    GraduationCap,
    Landmark,
    Building2,
    FileCheck,
    ArrowRight,
    Sparkles,
    Quote,
    Award,
    Clock,
    Headphones,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useGSAPAnimation } from "@/shared/hooks/use-gsap-animation";

const examCategories = [
    {
        title: "UTBK-SNBT",
        description: "Simulasi tes masuk PTN dengan standar nasional",
        icon: GraduationCap,
        href: "/tryout-utbk",
        color: "text-blue-600",
        bg: "bg-blue-50/50",
    },
    {
        title: "CPNS",
        description: "Latihan CAT lengkap: TWK, TIU, dan TKP",
        icon: Landmark,
        href: "/tryout-cpns",
        color: "text-emerald-600",
        bg: "bg-emerald-50/50",
    },
    {
        title: "BUMN",
        description: "Persiapan Rekrutmen Bersama dengan materi terkini",
        icon: Building2,
        href: "/tryout-bumn",
        color: "text-amber-600",
        bg: "bg-amber-50/50",
    },
    {
        title: "Kedinasan",
        description: "Masuk STAN, STIS, IPDN, dan lainnya",
        icon: Shield,
        href: "/tryout-kedinasan",
        color: "text-violet-600",
        bg: "bg-violet-50/50",
    },
    {
        title: "PPPK",
        description: "Kompetensi teknis dan manajerial",
        icon: FileCheck,
        href: "/tryout-pppk",
        color: "text-rose-600",
        bg: "bg-rose-50/50",
    },
];

const features = [
    {
        title: "Simulasi Realistis",
        description: "Timer, navigasi soal, dan format ujian persis seperti aslinya.",
        icon: BookOpenCheck,
    },
    {
        title: "Anti Curang",
        description: "Mode fullscreen dan deteksi perpindahan tab untuk hasil yang jujur.",
        icon: Shield,
    },
    {
        title: "Analitik Mendalam",
        description: "Ketahui kelemahan per topik, tren skor, dan ranking peserta.",
        icon: BarChart3,
    },
    {
        title: "Study Planner",
        description: "Atur jadwal belajar dan terima reminder agar konsisten.",
        icon: CalendarDays,
    },
    {
        title: "Leaderboard",
        description: "Bersaing dengan ribuan peserta dan pantau posisimu.",
        icon: Users,
    },
    {
        title: "Pembahasan",
        description: "Setiap soal dilengkapi pembahasan detail agar benar-benar paham.",
        icon: Zap,
    },
];

const testimonials = [
    {
        name: "Aisyah Putri",
        role: "Mahasiswi UI, lolos UTBK 2025",
        content:
            "Toutopia benar-benar membantu saya fokus belajar. Fitur analitik dan pembahasan soalnya sangat detail. Skor saya naik 200 poin dalam 3 bulan!",
        score: "785/1000",
    },
    {
        name: "Rizki Pratama",
        role: "PNS, lolos CPNS 2025",
        content:
            "Simulasi CAT-nya persis seperti ujian asli. Timer, navigasi soal, semuanya sama. Saya jadi tidak kaget saat ujian sebenarnya.",
        score: "Passing Grade TWK, TIU, TKP",
    },
    {
        name: "Dina Maharani",
        role: "Karyawan BUMN, lolos Rekrutmen 2025",
        content:
            "Materi AKHLAK dan TKD-nya lengkap banget. Soal-soalnya juga berkualitas, mirip dengan yang keluar di tes sebenarnya.",
        score: "Top 5% Peserta",
    },
];

const trustBadges = [
    { icon: Shield, label: "Data Terenkripsi" },
    { icon: Award, label: "Soal Terverifikasi" },
    { icon: Clock, label: "Akses 24/7" },
    { icon: Headphones, label: "Dukungan Cepat" },
];

interface PlatformStats {
    users: number;
    attempts: number;
    questions: number;
    packages: number;
}

function formatStatValue(value: number, suffix: string = "+"): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k${suffix}`;
    }
    return `${value}${suffix}`;
}

export function HomeContent() {
    const { scope, animateIn, animateStagger, animateHoverEnter, animateHoverLeave } =
        useGSAPAnimation();

    const [stats, setStats] = useState<
        { value: string; label: string }[]
    >([
        { value: "50+", label: "Paket Try Out" },
        { value: "10k+", label: "Soal Premium" },
        { value: "5", label: "Kategori Ujian" },
    ]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/stats");
            const result = await response.json();
            if (result.success) {
                const data = result.data as PlatformStats;
                setStats([
                    { value: formatStatValue(data.users), label: "Pengguna Aktif" },
                    { value: formatStatValue(data.questions), label: "Soal Premium" },
                    { value: formatStatValue(data.attempts), label: "Ujian Diselesaikan" },
                    { value: `${data.packages}+`, label: "Paket Try Out" },
                ]);
            }
        } catch {
            // Keep default static stats on error
        }
    }, []);

    useEffect(() => {
        animateIn(".hero-item", 0.1, 0.08);
        animateStagger(".category-card", 0.5);
        animateIn(".feature-item", 0.8, 0.06);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div ref={scope} className="flex-1">
            {/* Hero Section */}
            <section className="relative overflow-hidden px-6 py-32 sm:py-40 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a78bfa] to-[#60a5fa] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                    />
                </div>

                <div className="mx-auto max-w-4xl text-center">
                    <div className="hero-item mb-8 flex justify-center">
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
                        >
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            Daftar sekarang, dapatkan 2 paket gratis
                        </Badge>
                    </div>

                    <h1 className="hero-item text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
                        Ujian Masa Depan.{" "}
                        <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                            Mulai Hari Ini.
                        </span>
                    </h1>

                    <p className="hero-item mx-auto mt-8 max-w-2xl text-xl leading-8 text-muted-foreground/90">
                        Platform try out online dengan standar premium. Simulasi UTBK, CPNS, dan BUMN yang
                        realistis, akurat, dan mendalam.
                    </p>

                    <div className="hero-item mt-12 flex items-center justify-center gap-x-6">
                        <Button
                            size="lg"
                            className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
                            asChild
                        >
                            <Link href="/register">Mulai Gratis</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="h-12 rounded-full px-8 text-base text-muted-foreground hover:bg-muted/50"
                            asChild
                        >
                            <Link href="/packages">
                                Lihat Paket <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            Pilih Jalur Suksesmu
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Materi terupdate sesuai kisi-kisi terbaru 2026.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {examCategories.map((category) => (
                            <div key={category.href} className="group relative">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/20 blur transition duration-500 group-hover:opacity-100" />
                                <Link
                                    href={category.href}
                                    className="category-card relative block h-full"
                                    onMouseEnter={(e) => animateHoverEnter(e.currentTarget)}
                                    onMouseLeave={(e) => animateHoverLeave(e.currentTarget)}
                                >
                                    <Card className="h-full border-0 bg-card/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
                                        <CardContent className="flex flex-col items-start p-8">
                                            <div className={`mb-6 inline-flex rounded-2xl p-3 ${category.bg}`}>
                                                <category.icon className={`h-6 w-6 ${category.color}`} />
                                            </div>
                                            <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                                                {category.title}
                                            </h3>
                                            <p className="mt-2 text-muted-foreground">{category.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        ))}

                        {/* Stats Card */}
                        <div className="category-card flex flex-col justify-between rounded-3xl bg-muted/50 p-8 dark:bg-muted/10">
                            <h3 className="text-lg font-medium text-foreground">Statistik Platform</h3>
                            <div className="mt-6 space-y-6">
                                {stats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-3xl font-bold tracking-tight text-foreground">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-muted/30 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            Didesain untuk Fokus
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Fitur lengkap tanpa gangguan, membantu kamu mencapai potensi maksimal.
                        </p>
                    </div>

                    <dl className="mx-auto mt-16 grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="feature-item flex flex-col items-center text-center"
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                                    <feature.icon className="h-7 w-7 text-foreground/80" />
                                </div>
                                <dt className="text-lg font-semibold leading-7 text-foreground">
                                    {feature.title}
                                </dt>
                                <dd className="mt-1 text-base leading-7 text-muted-foreground">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            Kata Mereka yang Sudah Berhasil
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Ribuan peserta telah membuktikan kualitas latihan di Toutopia.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <Card
                                key={testimonial.name}
                                className="feature-item border-0 bg-card shadow-sm"
                            >
                                <CardContent className="flex flex-col p-8">
                                    <Quote className="mb-4 h-8 w-8 text-primary/20" />
                                    <p className="flex-1 text-base leading-7 text-muted-foreground">
                                        {testimonial.content}
                                    </p>
                                    <hr className="my-6 border-border/60" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 text-xs font-medium"
                                        >
                                            {testimonial.score}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="border-y border-border/40 bg-muted/20 py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {trustBadges.map((badge) => (
                            <div
                                key={badge.label}
                                className="feature-item flex items-center gap-3 text-muted-foreground"
                            >
                                <badge.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Teacher CTA */}
            <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Jadilah Kontributor
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                        Bagikan ilmu dan dapatkan penghasilan pasif. Royalti seumur hidup untuk setiap soal
                        berkualitas yang Anda buat.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 rounded-full px-8 hover:bg-muted/50"
                            asChild
                        >
                            <Link href="/register?role=teacher">
                                Daftar Pengajar <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
