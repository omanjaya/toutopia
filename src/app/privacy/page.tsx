import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Shield, Database, Eye, Users, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Toutopia",
  description: "Kebijakan privasi dan perlindungan data pengguna Toutopia.",
};

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
        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kebijakan Privasi
            </h1>
            <p className="mt-3 text-muted-foreground">
              Terakhir diperbarui: 18 Februari 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h2 className="text-base font-semibold">{section.title}</h2>
                      {section.isContact ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
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
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {section.content}
                        </p>
                      )}
                      {section.items && (
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
