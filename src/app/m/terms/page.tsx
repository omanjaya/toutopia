import type { Metadata } from "next";
import { MobileLayout } from "@/app/m/mobile-layout";
import {
  FileText,
  UserCog,
  BookOpen,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Scale,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan platform try out online Toutopia.",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface Section {
  icon: React.ElementType;
  title: string;
  content?: string;
  items?: string[];
  isContact?: boolean;
}

const sections: Section[] = [
  {
    icon: FileText,
    title: "1. Ketentuan Umum",
    content:
      "Dengan mengakses dan menggunakan platform Toutopia, kamu menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, harap tidak menggunakan layanan kami.",
  },
  {
    icon: UserCog,
    title: "2. Akun Pengguna",
    items: [
      "Kamu bertanggung jawab menjaga kerahasiaan akun dan kata sandi",
      "Satu orang hanya boleh memiliki satu akun aktif",
      "Memberikan informasi palsu saat pendaftaran dapat mengakibatkan penangguhan akun",
      "Kamu harus berusia minimal 13 tahun untuk mendaftar",
    ],
  },
  {
    icon: BookOpen,
    title: "3. Layanan Try Out",
    items: [
      "Soal-soal try out disediakan untuk keperluan latihan dan simulasi ujian",
      "Kami tidak menjamin bahwa soal akan keluar persis sama di ujian sesungguhnya",
      "Waktu ujian dihitung oleh server — timer di sisi klien hanya sebagai tampilan",
      "Ujian yang sudah dimulai tidak dapat dibatalkan dan kredit tidak dapat dikembalikan",
    ],
  },
  {
    icon: CreditCard,
    title: "4. Sistem Kredit & Pembayaran",
    items: [
      "Kredit digunakan untuk mengakses paket try out berbayar",
      "Kredit yang sudah dibeli bersifat non-refundable kecuali terjadi kesalahan sistem yang diverifikasi",
      "Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya untuk pembelian baru",
      "Pembayaran diproses melalui Midtrans sesuai ketentuan penyedia pembayaran",
    ],
  },
  {
    icon: ShieldAlert,
    title: "5. Integritas Ujian & Anti-Cheat",
    items: [
      "Dilarang membagikan soal, jawaban, atau pembahasan ke pihak lain",
      "Dilarang menggunakan alat bantu, bot, atau program otomatis saat ujian",
      "Pelanggaran anti-cheat (perpindahan tab berlebihan, keluar fullscreen) dicatat dan dapat mengakibatkan pembatalan hasil",
      "Kecurangan yang terdeteksi dapat mengakibatkan penangguhan akun permanen tanpa pengembalian kredit",
    ],
  },
  {
    icon: GraduationCap,
    title: "6. Program Pengajar",
    items: [
      "Pengajar yang mendaftar harus menyertakan informasi valid tentang kualifikasi",
      "Soal yang disubmit menjadi milik Toutopia setelah disetujui dan dibayar",
      "Kompensasi pengajar dibayarkan sesuai ketentuan payout yang berlaku",
      "Toutopia berhak menolak atau menghapus soal yang tidak memenuhi standar kualitas",
    ],
  },
  {
    icon: Scale,
    title: "7. Konten dan Hak Kekayaan Intelektual",
    content:
      'Seluruh konten di platform (soal, pembahasan, desain, dan kode) adalah milik Toutopia atau pemberi lisensi. Pengguna tidak diperbolehkan menyalin, mendistribusikan, atau membuat karya turunan tanpa izin tertulis.',
  },
  {
    icon: AlertTriangle,
    title: "8. Batasan Tanggung Jawab",
    content:
      'Toutopia disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform, termasuk namun tidak terbatas pada hasil ujian, gangguan layanan, atau kehilangan data akibat force majeure.',
  },
  {
    icon: Ban,
    title: "9. Penangguhan dan Penghentian",
    content:
      "Kami berhak menangguhkan atau menghentikan akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya. Pengguna dapat menghapus akun kapan saja dengan menghubungi support@toutopia.id.",
  },
  {
    icon: RefreshCw,
    title: "10. Perubahan Ketentuan",
    content:
      "Kami dapat mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku sejak dipublikasikan di halaman ini. Penggunaan berkelanjutan setelah perubahan berarti persetujuan terhadap ketentuan yang diperbarui.",
  },
  {
    icon: Mail,
    title: "11. Kontak",
    isContact: true,
  },
];

export default function MobileTermsPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-6 pt-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Syarat & Ketentuan
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Terakhir diperbarui: 18 Februari 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.title} className={cardCls}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <h2 className="text-sm font-semibold leading-snug">
                      {section.title}
                    </h2>
                    {section.isContact ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Untuk pertanyaan terkait syarat dan ketentuan, hubungi
                        kami di{" "}
                        <a
                          href="mailto:support@toutopia.id"
                          className="font-medium text-primary hover:underline"
                        >
                          support@toutopia.id
                        </a>
                        .
                      </p>
                    ) : section.content ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {section.content}
                      </p>
                    ) : null}
                    {section.items && (
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                            <span>{item}</span>
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
      </div>
    </MobileLayout>
  );
}
