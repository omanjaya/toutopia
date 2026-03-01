export interface Jabatan {
  id: string
  nama: string
  kategori: "Teknis" | "Fungsional" | "Struktural" | "Kesehatan" | "Pendidikan"
  jenjang: "Pertama" | "Muda" | "Madya" | "Utama" | "Ahli Pertama" | "Ahli Muda" | "Ahli Madya" | "Ahli Utama" | "Terampil" | "Mahir" | "Penyelia"
}

export const JABATAN_LIST: Jabatan[] = [
  // IT / Komputer
  { id: "pranata-komputer-ahli-pertama", nama: "Pranata Komputer Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "pranata-komputer-ahli-muda", nama: "Pranata Komputer Ahli Muda", kategori: "Fungsional", jenjang: "Ahli Muda" },
  { id: "pranata-komputer-terampil", nama: "Pranata Komputer Terampil", kategori: "Fungsional", jenjang: "Terampil" },
  { id: "analis-sistem-informasi", nama: "Analis Sistem Informasi", kategori: "Fungsional", jenjang: "Ahli Pertama" },

  // Analis
  { id: "analis-kebijakan-pertama", nama: "Analis Kebijakan Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "analis-kebijakan-muda", nama: "Analis Kebijakan Ahli Muda", kategori: "Fungsional", jenjang: "Ahli Muda" },
  { id: "analis-anggaran", nama: "Analis Anggaran", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "analis-sdm-aparatur", nama: "Analis SDM Aparatur", kategori: "Fungsional", jenjang: "Ahli Pertama" },

  // Kesehatan
  { id: "dokter-pertama", nama: "Dokter Ahli Pertama", kategori: "Kesehatan", jenjang: "Ahli Pertama" },
  { id: "dokter-muda", nama: "Dokter Ahli Muda", kategori: "Kesehatan", jenjang: "Ahli Muda" },
  { id: "dokter-gigi-pertama", nama: "Dokter Gigi Ahli Pertama", kategori: "Kesehatan", jenjang: "Ahli Pertama" },
  { id: "perawat-terampil", nama: "Perawat Terampil", kategori: "Kesehatan", jenjang: "Terampil" },
  { id: "perawat-ahli-pertama", nama: "Perawat Ahli Pertama", kategori: "Kesehatan", jenjang: "Ahli Pertama" },
  { id: "bidan-terampil", nama: "Bidan Terampil", kategori: "Kesehatan", jenjang: "Terampil" },
  { id: "apoteker-pertama", nama: "Apoteker Ahli Pertama", kategori: "Kesehatan", jenjang: "Ahli Pertama" },
  { id: "nutrisionis-terampil", nama: "Nutrisionis Terampil", kategori: "Kesehatan", jenjang: "Terampil" },
  { id: "sanitarian-terampil", nama: "Sanitarian Terampil", kategori: "Kesehatan", jenjang: "Terampil" },
  { id: "radiografer-terampil", nama: "Radiografer Terampil", kategori: "Kesehatan", jenjang: "Terampil" },

  // Pendidikan
  { id: "guru-kelas", nama: "Guru Kelas SD", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-pai", nama: "Guru Pendidikan Agama Islam", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-matematika", nama: "Guru Matematika", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-bahasa-indonesia", nama: "Guru Bahasa Indonesia", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-bahasa-inggris", nama: "Guru Bahasa Inggris", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-ipa", nama: "Guru IPA", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-ips", nama: "Guru IPS", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-bk", nama: "Guru Bimbingan dan Konseling", kategori: "Pendidikan", jenjang: "Ahli Pertama" },
  { id: "guru-penjaskes", nama: "Guru Pendidikan Jasmani", kategori: "Pendidikan", jenjang: "Ahli Pertama" },

  // Hukum
  { id: "perancang-peruu", nama: "Perancang Peraturan Perundang-undangan", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "jaksa", nama: "Jaksa Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "hakim", nama: "Hakim Pertama", kategori: "Fungsional", jenjang: "Pertama" },

  // Keuangan
  { id: "auditor-pertama", nama: "Auditor Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "pemeriksa-pajak", nama: "Pemeriksa Pajak", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "penilai-pajak", nama: "Penilai Pajak", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "pemeriksa-bea-cukai", nama: "Pemeriksa Bea dan Cukai", kategori: "Fungsional", jenjang: "Terampil" },

  // Teknik
  { id: "insinyur-pertama", nama: "Insinyur Ahli Pertama", kategori: "Teknis", jenjang: "Ahli Pertama" },
  { id: "pengawas-teknik-jalan", nama: "Pengawas Teknik Jalan", kategori: "Teknis", jenjang: "Terampil" },
  { id: "teknik-pengairan", nama: "Pengawas Teknik Pengairan", kategori: "Teknis", jenjang: "Terampil" },

  // Statistik
  { id: "statistisi-pertama", nama: "Statistisi Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },

  // Peneliti
  { id: "peneliti-pertama", nama: "Peneliti Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "perekayasa-pertama", nama: "Perekayasa Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },

  // Lainnya
  { id: "arsiparis-terampil", nama: "Arsiparis Terampil", kategori: "Fungsional", jenjang: "Terampil" },
  { id: "pustakawan-terampil", nama: "Pustakawan Terampil", kategori: "Fungsional", jenjang: "Terampil" },
  { id: "penyuluh-pertanian", nama: "Penyuluh Pertanian Ahli Pertama", kategori: "Fungsional", jenjang: "Ahli Pertama" },
  { id: "pengendali-hama", nama: "Pengendali Organisme Pengganggu Tumbuhan", kategori: "Fungsional", jenjang: "Terampil" },
]

export const JABATAN_KATEGORI = ["Teknis", "Fungsional", "Struktural", "Kesehatan", "Pendidikan"] as const
