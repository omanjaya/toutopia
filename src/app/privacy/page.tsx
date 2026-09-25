import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Shield, Database, Eye, Users, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Toutopia",
  description: "Kebijakan privasi dan perlindungan data pengguna Toutopia.",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const sections = [
  {
    icon: Database,
    title: "1. Informasi yang Kami Kumpulkan",
    content: "Saat mendaftar dan menggunakan Toutopia, kami mengumpulkan informasi berikut:",
    items: [
      { bold: "Data akun:", text: "Nama, alamat email, dan kata sandi terenkripsi" },
      { bold: "Data profil:", text: "Nomor telepon, sekolah/kampus, kota, dan target ujian (opsional)" },
      { bold: "Data ujian:", text: "Jawaban, skor, waktu pengerjaan, dan riwayat percobaan" },
      { bold: "Data pembayaran:", text: "Riwayat transaksi (data kartu diproses oleh penyedia pembayaran pihak ketiga)" },
      { bold: "Data teknis:", text: "Alamat IP, jenis browser, dan data aktivitas terkait sistem anti-cheat" },
    ],
  },
  {
    icon: Eye,
    title: "2. Penggunaan Informasi",
    content: "Informasi yang kami kumpulkan digunakan untuk:",
    items: [
      { text: "Menyediakan dan mengelola layanan try out online" },
      { text: "Menghitung skor, peringkat, dan analitik performa" },
      { text: "Memproses pembayaran dan mengelola kredit akun" },
      { text: "Mengirim notifikasi terkait ujian dan akun" },
      { text: "Meningkatkan kualitas platform dan pengalaman pengguna" },
      { text: "Menjaga keamanan dan integritas ujian melalui sistem anti-cheat" },
    ],
  },
  {
    icon: Shield,
    title: "3. Penyimpanan dan Keamanan Data",
    content: "Data disimpan di server yang aman dengan enkripsi. Kata sandi di-hash menggunakan algoritma bcrypt dan tidak pernah disimpan dalam bentuk teks biasa. Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data pengguna.",
  },
  {
    icon: Users,
    title: "4. Berbagi Data dengan Pihak Ketiga",
    content: "Kami tidak menjual data pribadi pengguna. Data hanya dibagikan kepada:",
    items: [
      { bold: "Midtrans:", text: "Pemrosesan pembayaran" },
      { bold: "Google:", text: "Autentikasi OAuth (jika login via Google)" },
      { bold: "Pihak berwenang:", text: "Jika diwajibkan oleh hukum yang berlaku" },
    ],
  },
  {
    icon: UserCheck,
    title: "5. Hak Pengguna",
    content: "Kamu memiliki hak untuk:",
    items: [
      { text: "Mengakses dan memperbarui data profil kapan saja" },
      { text: "Meminta salinan data pribadi yang kami simpan" },
      { text: "Meminta penghapusan akun dan data terkait dengan menghubungi support@toutopia.id" },
    ],
  },
  {
    icon: Cookie,
    title: "6. Cookie",
    content: "Kami menggunakan cookie untuk menyimpan sesi login dan preferensi pengguna. Cookie bersifat httpOnly dan secure untuk menjaga keamanan.",
  },
  {
    icon: RefreshCw,
    title: "7. Perubahan Kebijakan",
    content: "Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diumumkan melalui notifikasi di platform. Penggunaan berkelanjutan setelah perubahan berarti persetujuan terhadap kebijakan yang diperbarui.",
  },
  {
    icon: Mail,
    title: "8. Kontak",
    isContact: true,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-12 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:mb-5 sm:h-14 sm:w-14">
              <Shield className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Kebijakan Privasi
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
              Terakhir diperbarui: 18 Februari 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:pb-20 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {sections.map((section) => (
              <div key={section.title} className={cardCls}>
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-10 sm:w-10 sm:rounded-xl">
                      <section.icon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                      <h2 className="text-sm font-semibold leading-snug sm:text-base">{section.title}</h2>
                      {section.isContact ? (
                        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          Untuk pertanyaan terkait privasi, hubungi kami di{" "}
                          <a
                            href="mailto:support@toutopia.id"
                            className="font-medium text-primary hover:underline"
                          >
                            support@toutopia.id
                          </a>
                          .
                        </p>
                      ) : (
                        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {section.content}
                        </p>
                      )}
                      {section.items && (
                        <ul className="space-y-1.5 text-xs text-muted-foreground sm:text-sm">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                              <span>
                                {"bold" in item && (
                                  <strong className="text-foreground">{item.bold}</strong>
                                )}{" "}
                                {item.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
