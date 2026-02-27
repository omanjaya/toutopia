/**
 * Auto-generated content seed — exported on 2026-02-27T05:54:51.343Z
 * Contains categories/topics hierarchy, articles, ebooks, and badges.
 *
 * Usage: npx tsx prisma/seed-content-exported.ts
 * This REPLACES seed.ts + seed-articles.ts + seed-ebooks.ts
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "argon2";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DATA = {
  "version": "1.0",
  "exportedAt": "2026-02-27T05:54:51.343Z",
  "categories": [
    {
      "name": "UTBK-SNBT",
      "slug": "utbk-snbt",
      "description": "Seleksi Nasional Berdasarkan Tes untuk masuk perguruan tinggi negeri",
      "icon": "GraduationCap",
      "order": 1,
      "isActive": true,
      "subCategories": [
        {
          "name": "TPS",
          "slug": "tps",
          "order": 1,
          "subjects": [
            {
              "name": "Penalaran Umum",
              "slug": "penalaran-umum",
              "order": 1,
              "topics": [
                {
                  "name": "Penalaran Analitik",
                  "slug": "penalaran-analitik",
                  "order": 1
                },
                {
                  "name": "Penalaran Deduktif",
                  "slug": "penalaran-deduktif",
                  "order": 2
                },
                {
                  "name": "Penalaran Induktif",
                  "slug": "penalaran-induktif",
                  "order": 3
                }
              ]
            },
            {
              "name": "Pengetahuan Kuantitatif",
              "slug": "pengetahuan-kuantitatif",
              "order": 2,
              "topics": [
                {
                  "name": "Aritmatika",
                  "slug": "aritmatika",
                  "order": 1
                },
                {
                  "name": "Aljabar",
                  "slug": "aljabar",
                  "order": 2
                },
                {
                  "name": "Geometri",
                  "slug": "geometri",
                  "order": 3
                },
                {
                  "name": "Statistika",
                  "slug": "statistika",
                  "order": 4
                }
              ]
            },
            {
              "name": "Penalaran Matematika",
              "slug": "penalaran-matematika",
              "order": 3,
              "topics": [
                {
                  "name": "Logika Matematika",
                  "slug": "logika-matematika",
                  "order": 1
                },
                {
                  "name": "Barisan dan Deret",
                  "slug": "barisan-dan-deret",
                  "order": 2
                },
                {
                  "name": "Peluang",
                  "slug": "peluang",
                  "order": 3
                },
                {
                  "name": "Fungsi",
                  "slug": "fungsi",
                  "order": 4
                }
              ]
            },
            {
              "name": "Literasi Bahasa Indonesia",
              "slug": "literasi-bahasa-indonesia",
              "order": 4,
              "topics": [
                {
                  "name": "Pemahaman Bacaan",
                  "slug": "pemahaman-bacaan",
                  "order": 1
                },
                {
                  "name": "Kalimat Efektif",
                  "slug": "kalimat-efektif",
                  "order": 2
                },
                {
                  "name": "Gagasan Pokok",
                  "slug": "gagasan-pokok",
                  "order": 3
                },
                {
                  "name": "Simpulan",
                  "slug": "simpulan",
                  "order": 4
                }
              ]
            },
            {
              "name": "Literasi Bahasa Inggris",
              "slug": "literasi-bahasa-inggris",
              "order": 5,
              "topics": [
                {
                  "name": "Reading Comprehension",
                  "slug": "reading-comprehension",
                  "order": 1
                },
                {
                  "name": "Vocabulary",
                  "slug": "vocabulary",
                  "order": 2
                },
                {
                  "name": "Grammar",
                  "slug": "grammar",
                  "order": 3
                },
                {
                  "name": "Inference",
                  "slug": "inference",
                  "order": 4
                }
              ]
            }
          ]
        },
        {
          "name": "TKA Saintek",
          "slug": "tka-saintek",
          "order": 2,
          "subjects": [
            {
              "name": "Matematika",
              "slug": "matematika-saintek",
              "order": 1,
              "topics": [
                {
                  "name": "Kalkulus",
                  "slug": "kalkulus",
                  "order": 1
                },
                {
                  "name": "Trigonometri",
                  "slug": "trigonometri",
                  "order": 2
                },
                {
                  "name": "Vektor",
                  "slug": "vektor",
                  "order": 3
                },
                {
                  "name": "Matriks",
                  "slug": "matriks",
                  "order": 4
                },
                {
                  "name": "Integral",
                  "slug": "integral",
                  "order": 5
                }
              ]
            },
            {
              "name": "Fisika",
              "slug": "fisika",
              "order": 2,
              "topics": [
                {
                  "name": "Mekanika",
                  "slug": "mekanika",
                  "order": 1
                },
                {
                  "name": "Termodinamika",
                  "slug": "termodinamika",
                  "order": 2
                },
                {
                  "name": "Gelombang",
                  "slug": "gelombang",
                  "order": 3
                },
                {
                  "name": "Listrik",
                  "slug": "listrik",
                  "order": 4
                },
                {
                  "name": "Optik",
                  "slug": "optik",
                  "order": 5
                }
              ]
            },
            {
              "name": "Kimia",
              "slug": "kimia",
              "order": 3,
              "topics": [
                {
                  "name": "Stoikiometri",
                  "slug": "stoikiometri",
                  "order": 1
                },
                {
                  "name": "Termokimia",
                  "slug": "termokimia",
                  "order": 2
                },
                {
                  "name": "Kesetimbangan",
                  "slug": "kesetimbangan",
                  "order": 3
                },
                {
                  "name": "Elektrokimia",
                  "slug": "elektrokimia",
                  "order": 4
                },
                {
                  "name": "Kimia Organik",
                  "slug": "kimia-organik",
                  "order": 5
                }
              ]
            },
            {
              "name": "Biologi",
              "slug": "biologi",
              "order": 4,
              "topics": [
                {
                  "name": "Sel",
                  "slug": "sel",
                  "order": 1
                },
                {
                  "name": "Genetika",
                  "slug": "genetika",
                  "order": 2
                },
                {
                  "name": "Evolusi",
                  "slug": "evolusi",
                  "order": 3
                },
                {
                  "name": "Ekologi",
                  "slug": "ekologi",
                  "order": 4
                },
                {
                  "name": "Fisiologi",
                  "slug": "fisiologi",
                  "order": 5
                }
              ]
            }
          ]
        },
        {
          "name": "TKA Soshum",
          "slug": "tka-soshum",
          "order": 3,
          "subjects": [
            {
              "name": "Sosiologi",
              "slug": "sosiologi",
              "order": 1,
              "topics": [
                {
                  "name": "Interaksi Sosial",
                  "slug": "interaksi-sosial",
                  "order": 1
                },
                {
                  "name": "Stratifikasi",
                  "slug": "stratifikasi",
                  "order": 2
                },
                {
                  "name": "Perubahan Sosial",
                  "slug": "perubahan-sosial",
                  "order": 3
                }
              ]
            },
            {
              "name": "Sejarah",
              "slug": "sejarah",
              "order": 2,
              "topics": [
                {
                  "name": "Sejarah Indonesia",
                  "slug": "sejarah-indonesia",
                  "order": 1
                },
                {
                  "name": "Sejarah Dunia",
                  "slug": "sejarah-dunia",
                  "order": 2
                },
                {
                  "name": "Historiografi",
                  "slug": "historiografi",
                  "order": 3
                }
              ]
            },
            {
              "name": "Ekonomi",
              "slug": "ekonomi",
              "order": 3,
              "topics": [
                {
                  "name": "Mikro Ekonomi",
                  "slug": "mikro-ekonomi",
                  "order": 1
                },
                {
                  "name": "Makro Ekonomi",
                  "slug": "makro-ekonomi",
                  "order": 2
                },
                {
                  "name": "Akuntansi",
                  "slug": "akuntansi",
                  "order": 3
                },
                {
                  "name": "Perdagangan",
                  "slug": "perdagangan",
                  "order": 4
                }
              ]
            },
            {
              "name": "Geografi",
              "slug": "geografi",
              "order": 4,
              "topics": [
                {
                  "name": "Geografi Fisik",
                  "slug": "geografi-fisik",
                  "order": 1
                },
                {
                  "name": "Geografi Manusia",
                  "slug": "geografi-manusia",
                  "order": 2
                },
                {
                  "name": "Kartografi",
                  "slug": "kartografi",
                  "order": 3
                },
                {
                  "name": "SIG",
                  "slug": "sig",
                  "order": 4
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "CPNS",
      "slug": "cpns",
      "description": "Tes seleksi Calon Pegawai Negeri Sipil",
      "icon": "Landmark",
      "order": 2,
      "isActive": true,
      "subCategories": [
        {
          "name": "SKD",
          "slug": "skd",
          "order": 1,
          "subjects": [
            {
              "name": "TWK",
              "slug": "twk",
              "order": 1,
              "topics": [
                {
                  "name": "Pancasila",
                  "slug": "pancasila",
                  "order": 1
                },
                {
                  "name": "UUD 1945",
                  "slug": "uud-1945",
                  "order": 2
                },
                {
                  "name": "NKRI",
                  "slug": "nkri",
                  "order": 3
                },
                {
                  "name": "Bhinneka Tunggal Ika",
                  "slug": "bhinneka-tunggal-ika",
                  "order": 4
                },
                {
                  "name": "Pilar Negara",
                  "slug": "pilar-negara",
                  "order": 5
                }
              ]
            },
            {
              "name": "TIU",
              "slug": "tiu",
              "order": 2,
              "topics": [
                {
                  "name": "Verbal",
                  "slug": "verbal",
                  "order": 1
                },
                {
                  "name": "Numerik",
                  "slug": "numerik",
                  "order": 2
                },
                {
                  "name": "Figural",
                  "slug": "figural",
                  "order": 3
                },
                {
                  "name": "Analitik",
                  "slug": "analitik",
                  "order": 4
                },
                {
                  "name": "Logika",
                  "slug": "logika",
                  "order": 5
                }
              ]
            },
            {
              "name": "TKP",
              "slug": "tkp",
              "order": 3,
              "topics": [
                {
                  "name": "Pelayanan Publik",
                  "slug": "pelayanan-publik",
                  "order": 1
                },
                {
                  "name": "Jejaring Kerja",
                  "slug": "jejaring-kerja",
                  "order": 2
                },
                {
                  "name": "Sosial Budaya",
                  "slug": "sosial-budaya",
                  "order": 3
                },
                {
                  "name": "TIK",
                  "slug": "tik",
                  "order": 4
                },
                {
                  "name": "Profesionalisme",
                  "slug": "profesionalisme",
                  "order": 5
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "BUMN",
      "slug": "bumn",
      "description": "Tes Rekrutmen Bersama BUMN",
      "icon": "Building2",
      "order": 3,
      "isActive": true,
      "subCategories": [
        {
          "name": "TKD BUMN",
          "slug": "tkd-bumn",
          "order": 1,
          "subjects": [
            {
              "name": "Tes Kemampuan Dasar",
              "slug": "tkd",
              "order": 1,
              "topics": [
                {
                  "name": "Verbal",
                  "slug": "verbal",
                  "order": 1
                },
                {
                  "name": "Numerikal",
                  "slug": "numerikal",
                  "order": 2
                },
                {
                  "name": "Figural",
                  "slug": "figural",
                  "order": 3
                },
                {
                  "name": "Logika",
                  "slug": "logika",
                  "order": 4
                }
              ]
            },
            {
              "name": "Core Values BUMN",
              "slug": "core-values",
              "order": 2,
              "topics": [
                {
                  "name": "AKHLAK",
                  "slug": "akhlak",
                  "order": 1
                },
                {
                  "name": "Amanah",
                  "slug": "amanah",
                  "order": 2
                },
                {
                  "name": "Kompeten",
                  "slug": "kompeten",
                  "order": 3
                },
                {
                  "name": "Harmonis",
                  "slug": "harmonis",
                  "order": 4
                },
                {
                  "name": "Loyal",
                  "slug": "loyal",
                  "order": 5
                },
                {
                  "name": "Adaptif",
                  "slug": "adaptif",
                  "order": 6
                },
                {
                  "name": "Kolaboratif",
                  "slug": "kolaboratif",
                  "order": 7
                }
              ]
            },
            {
              "name": "English",
              "slug": "english-bumn",
              "order": 3,
              "topics": [
                {
                  "name": "Reading",
                  "slug": "reading",
                  "order": 1
                },
                {
                  "name": "Grammar",
                  "slug": "grammar",
                  "order": 2
                },
                {
                  "name": "Vocabulary",
                  "slug": "vocabulary",
                  "order": 3
                },
                {
                  "name": "Business English",
                  "slug": "business-english",
                  "order": 4
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Kedinasan",
      "slug": "kedinasan",
      "description": "Tes masuk sekolah kedinasan (STAN, STIS, IPDN, dll)",
      "icon": "Shield",
      "order": 4,
      "isActive": true,
      "subCategories": [
        {
          "name": "PKN STAN",
          "slug": "pkn-stan",
          "order": 1,
          "subjects": [
            {
              "name": "TPA",
              "slug": "tpa-stan",
              "order": 1,
              "topics": [
                {
                  "name": "Verbal",
                  "slug": "verbal",
                  "order": 1
                },
                {
                  "name": "Numerik",
                  "slug": "numerik",
                  "order": 2
                },
                {
                  "name": "Figural",
                  "slug": "figural",
                  "order": 3
                }
              ]
            },
            {
              "name": "TBI",
              "slug": "tbi-stan",
              "order": 2,
              "topics": [
                {
                  "name": "Structure",
                  "slug": "structure",
                  "order": 1
                },
                {
                  "name": "Written Expression",
                  "slug": "written-expression",
                  "order": 2
                },
                {
                  "name": "Reading Comprehension",
                  "slug": "reading-comprehension",
                  "order": 3
                }
              ]
            }
          ]
        },
        {
          "name": "STIS",
          "slug": "stis",
          "order": 2,
          "subjects": [
            {
              "name": "Matematika STIS",
              "slug": "matematika-stis",
              "order": 1,
              "topics": [
                {
                  "name": "Aljabar",
                  "slug": "aljabar",
                  "order": 1
                },
                {
                  "name": "Kalkulus",
                  "slug": "kalkulus",
                  "order": 2
                },
                {
                  "name": "Statistika",
                  "slug": "statistika",
                  "order": 3
                },
                {
                  "name": "Logika Matematika",
                  "slug": "logika-matematika",
                  "order": 4
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "PPPK",
      "slug": "pppk",
      "description": "Tes Pegawai Pemerintah dengan Perjanjian Kerja",
      "icon": "FileCheck",
      "order": 5,
      "isActive": true,
      "subCategories": [
        {
          "name": "Kompetensi PPPK",
          "slug": "kompetensi-pppk",
          "order": 1,
          "subjects": [
            {
              "name": "Kompetensi Teknis",
              "slug": "kompetensi-teknis",
              "order": 1,
              "topics": [
                {
                  "name": "Pengetahuan Bidang",
                  "slug": "pengetahuan-bidang",
                  "order": 1
                },
                {
                  "name": "Keterampilan Teknis",
                  "slug": "keterampilan-teknis",
                  "order": 2
                }
              ]
            },
            {
              "name": "Kompetensi Manajerial",
              "slug": "kompetensi-manajerial",
              "order": 2,
              "topics": [
                {
                  "name": "Integritas",
                  "slug": "integritas",
                  "order": 1
                },
                {
                  "name": "Kerjasama",
                  "slug": "kerjasama",
                  "order": 2
                },
                {
                  "name": "Komunikasi",
                  "slug": "komunikasi",
                  "order": 3
                },
                {
                  "name": "Pengambilan Keputusan",
                  "slug": "pengambilan-keputusan",
                  "order": 4
                }
              ]
            },
            {
              "name": "Kompetensi Sosio-Kultural",
              "slug": "kompetensi-sosio-kultural",
              "order": 3,
              "topics": [
                {
                  "name": "Perekat Bangsa",
                  "slug": "perekat-bangsa",
                  "order": 1
                },
                {
                  "name": "Keragaman Budaya",
                  "slug": "keragaman-budaya",
                  "order": 2
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "articles": [
    {
      "title": "Panduan Lengkap UTBK-SNBT 2025: Struktur, Tips, dan Strategi",
      "slug": "panduan-lengkap-utbk-snbt-struktur-tips-strategi",
      "content": "<h2>Apa Itu UTBK-SNBT?</h2>\n<p>Ujian Tulis Berbasis Komputer - Seleksi Nasional Berdasarkan Tes (UTBK-SNBT) adalah jalur seleksi masuk perguruan tinggi negeri (PTN) yang diselenggarakan oleh Badan Pengelola Pendanaan Pendidikan (BPPP) Kemendikbudristek. UTBK-SNBT menjadi jalur utama bagi calon mahasiswa yang ingin diterima di PTN berdasarkan kemampuan akademik yang diukur melalui tes terstandar.</p>\n<p>Berbeda dengan jalur SNBP (Seleksi Nasional Berdasarkan Prestasi) yang menggunakan nilai rapor, UTBK-SNBT murni mengukur kemampuan berpikir dan bernalar peserta. Hal ini memberikan kesempatan yang lebih adil bagi seluruh peserta dari berbagai latar belakang pendidikan.</p>\n<p>Tujuan utama UTBK-SNBT adalah mengukur potensi kognitif dan kemampuan akademik calon mahasiswa secara objektif. Tes ini dirancang bukan untuk mengukur hafalan materi pelajaran, melainkan kemampuan berpikir kritis, penalaran logis, dan pemahaman konseptual yang menjadi prediktor keberhasilan di perguruan tinggi.</p>\n\n<h2>Struktur Tes UTBK-SNBT 2025</h2>\n<p>UTBK-SNBT terdiri dari tiga kelompok tes utama yang mengukur aspek kemampuan berbeda. Berikut rincian lengkapnya:</p>\n\n<h3>1. Tes Potensi Skolastik (TPS)</h3>\n<p>TPS mengukur kemampuan kognitif dasar yang dianggap penting untuk keberhasilan di perguruan tinggi. TPS terdiri dari empat subtes:</p>\n<table>\n<thead>\n<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>\n</thead>\n<tbody>\n<tr><td>Penalaran Umum</td><td>20 soal</td><td>25 menit</td><td>Kemampuan berpikir logis, induktif, dan deduktif</td></tr>\n<tr><td>Pengetahuan dan Pemahaman Umum (PPU)</td><td>20 soal</td><td>25 menit</td><td>Pemahaman bacaan, kosakata, dan pengetahuan umum</td></tr>\n<tr><td>Pemahaman Bacaan dan Menulis (PBM)</td><td>20 soal</td><td>25 menit</td><td>Analisis teks, koherensi, dan kaidah kebahasaan</td></tr>\n<tr><td>Pengetahuan Kuantitatif (PK)</td><td>15 soal</td><td>20 menit</td><td>Penalaran kuantitatif dasar dan interpretasi data</td></tr>\n</tbody>\n</table>\n\n<h3>2. Tes Literasi</h3>\n<p>Tes Literasi mengukur kemampuan memahami, menggunakan, dan merespons teks tertulis dalam bahasa Indonesia dan bahasa Inggris.</p>\n<table>\n<thead>\n<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>\n</thead>\n<tbody>\n<tr><td>Literasi Bahasa Indonesia</td><td>30 soal</td><td>35 menit</td><td>Pemahaman teks, analisis argumen, dan evaluasi informasi dalam bahasa Indonesia</td></tr>\n<tr><td>Literasi Bahasa Inggris</td><td>20 soal</td><td>25 menit</td><td>Reading comprehension, vocabulary in context, dan analisis teks bahasa Inggris</td></tr>\n</tbody>\n</table>\n\n<h3>3. Penalaran Matematika</h3>\n<table>\n<thead>\n<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>\n</thead>\n<tbody>\n<tr><td>Penalaran Matematika</td><td>20 soal</td><td>30 menit</td><td>Kemampuan berpikir matematis, pemecahan masalah, dan interpretasi data kuantitatif</td></tr>\n</tbody>\n</table>\n\n<h3>Ringkasan Keseluruhan</h3>\n<table>\n<thead>\n<tr><th>Komponen</th><th>Total Soal</th><th>Total Waktu</th></tr>\n</thead>\n<tbody>\n<tr><td>TPS (4 subtes)</td><td>75 soal</td><td>95 menit</td></tr>\n<tr><td>Literasi (2 subtes)</td><td>50 soal</td><td>60 menit</td></tr>\n<tr><td>Penalaran Matematika</td><td>20 soal</td><td>30 menit</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>145 soal</strong></td><td><strong>~195 menit</strong></td></tr>\n</tbody>\n</table>\n\n<h2>Sistem Scoring: Item Response Theory (IRT)</h2>\n<p>UTBK-SNBT menggunakan sistem penilaian Item Response Theory (IRT), bukan sistem penilaian konvensional. Ini berarti skor kamu tidak hanya bergantung pada jumlah jawaban benar, tetapi juga pada tingkat kesulitan soal yang berhasil kamu jawab.</p>\n<p>Beberapa hal penting tentang IRT:</p>\n<ul>\n<li><strong>Tidak ada pengurangan skor untuk jawaban salah.</strong> Jawablah semua soal meskipun kamu tidak yakin, karena tidak ada penalti.</li>\n<li><strong>Soal sulit yang dijawab benar memberikan skor lebih tinggi</strong> dibandingkan soal mudah yang dijawab benar.</li>\n<li><strong>Konsistensi jawaban diukur.</strong> Jika kamu menjawab soal sulit dengan benar tetapi gagal di soal mudah, sistem akan mendeteksi inkonsistensi ini.</li>\n<li><strong>Skor bersifat relatif terhadap kelompok peserta.</strong> Skor akhir mencerminkan posisi kemampuanmu dibandingkan peserta lain.</li>\n<li><strong>Rentang skor tiap subtes biasanya antara 200-800</strong>, dengan rata-rata sekitar 500.</li>\n</ul>\n<p>Implikasi praktis IRT: fokuslah menjawab soal-soal yang kamu yakin terlebih dahulu, lalu kembali ke soal yang lebih sulit. Pastikan kamu menjawab soal mudah dengan benar karena kesalahan di soal mudah sangat merugikan dalam sistem IRT.</p>\n\n<h2>Tips Per Subtes</h2>\n\n<h3>Penalaran Umum</h3>\n<ul>\n<li>Latih kemampuan mengenali pola dalam deret angka, huruf, dan gambar.</li>\n<li>Pelajari silogisme dan logika formal dasar (premis mayor, premis minor, kesimpulan).</li>\n<li>Biasakan membaca argumen dan mengidentifikasi asumsi tersembunyi.</li>\n<li>Gunakan teknik eliminasi untuk mempersempit pilihan jawaban.</li>\n<li>Jangan terpaku pada satu soal lebih dari 90 detik; tandai dan lanjutkan.</li>\n</ul>\n\n<h3>Pengetahuan dan Pemahaman Umum (PPU)</h3>\n<ul>\n<li>Perbanyak membaca artikel ilmiah populer, editorial, dan esai akademik.</li>\n<li>Latih kemampuan menentukan ide pokok, gagasan pendukung, dan kesimpulan teks.</li>\n<li>Perkaya kosakata dengan membaca dari berbagai genre dan disiplin ilmu.</li>\n<li>Perhatikan konteks kalimat untuk memahami makna kata yang belum kamu kenal.</li>\n</ul>\n\n<h3>Pemahaman Bacaan dan Menulis (PBM)</h3>\n<ul>\n<li>Pahami struktur paragraf yang baik: kalimat utama, penjelas, dan kesimpulan.</li>\n<li>Latih kemampuan mendeteksi kesalahan ejaan, tanda baca, dan tata bahasa.</li>\n<li>Pelajari konjungsi dan kata penghubung untuk memahami koherensi antar paragraf.</li>\n<li>Biasakan menulis ringkasan dari teks yang kamu baca untuk melatih pemahaman.</li>\n</ul>\n\n<h3>Pengetahuan Kuantitatif (PK)</h3>\n<ul>\n<li>Kuasai konsep dasar: pecahan, persentase, rasio, dan proporsi.</li>\n<li>Latih interpretasi tabel, grafik, dan diagram secara cepat.</li>\n<li>Pelajari konsep dasar statistik: mean, median, modus, dan standar deviasi.</li>\n<li>Biasakan menghitung tanpa kalkulator untuk meningkatkan kecepatan.</li>\n</ul>\n\n<h3>Literasi Bahasa Indonesia</h3>\n<ul>\n<li>Baca bacaan panjang dengan teknik skimming dan scanning untuk efisiensi waktu.</li>\n<li>Identifikasi jenis pertanyaan: tersurat (eksplisit) atau tersirat (implisit).</li>\n<li>Perhatikan kata kunci dalam pertanyaan yang mengarahkan ke jawaban.</li>\n<li>Latih kemampuan membedakan fakta dan opini dalam teks.</li>\n</ul>\n\n<h3>Literasi Bahasa Inggris</h3>\n<ul>\n<li>Perbanyak membaca teks akademik dalam bahasa Inggris secara rutin.</li>\n<li>Tingkatkan vocabulary dengan metode kontekstual, bukan sekadar menghafal daftar kata.</li>\n<li>Pelajari common English idioms dan phrasal verbs yang sering muncul.</li>\n<li>Latih kemampuan inference: menyimpulkan informasi yang tidak disebutkan secara eksplisit.</li>\n</ul>\n\n<h3>Penalaran Matematika</h3>\n<ul>\n<li>Kuasai aljabar dasar, geometri, dan aritmetika dengan baik.</li>\n<li>Fokus pada pemahaman konsep, bukan menghafal rumus.</li>\n<li>Latih soal cerita matematika yang membutuhkan pemodelan masalah.</li>\n<li>Biasakan mengecek jawaban dengan substitusi atau estimasi cepat.</li>\n<li>Pelajari cara membaca dan menginterpretasi data statistik dalam bentuk visual.</li>\n</ul>\n\n<h2>Strategi Manajemen Waktu</h2>\n<p>Dengan total 145 soal dalam ~195 menit, rata-rata kamu memiliki sekitar 1 menit 20 detik per soal. Namun distribusi waktu sebaiknya tidak merata:</p>\n<ol>\n<li><strong>Pertama, kerjakan soal yang kamu kuasai.</strong> Jangan kerjakan soal secara berurutan. Baca sekilas semua soal, kerjakan yang mudah dulu.</li>\n<li><strong>Tandai soal yang ragu.</strong> Gunakan fitur flag/mark pada aplikasi CAT untuk soal yang ingin kamu kembali ke sana nanti.</li>\n<li><strong>Alokasikan waktu review.</strong> Sisakan 5-10 menit di akhir setiap sesi untuk mengecek jawaban yang sudah kamu tandai.</li>\n<li><strong>Jangan biarkan soal kosong.</strong> Karena tidak ada penalti, isi semua jawaban meskipun hanya tebakan terpelajar (educated guess).</li>\n<li><strong>Gunakan timer pribadi.</strong> Latihan di rumah dengan timer untuk setiap subtes agar terbiasa dengan tekanan waktu.</li>\n</ol>\n\n<h2>Persiapan Mental dan Fisik</h2>\n<p>Keberhasilan di UTBK-SNBT tidak hanya tentang kemampuan akademik. Persiapan mental dan fisik juga sangat penting:</p>\n<ul>\n<li>Mulai persiapan setidaknya 3-6 bulan sebelum tes.</li>\n<li>Buat jadwal belajar yang konsisten dan realistis, misalnya 2-3 jam per hari.</li>\n<li>Lakukan simulasi tes secara berkala untuk mengukur kemajuan.</li>\n<li>Jaga pola tidur yang teratur, terutama seminggu sebelum tes.</li>\n<li>Makan makanan bergizi dan tetap aktif secara fisik untuk menjaga konsentrasi.</li>\n<li>Kelola stres dengan teknik relaksasi seperti deep breathing atau meditasi ringan.</li>\n</ul>\n\n<h2>Sumber Belajar Resmi</h2>\n<p>Manfaatkan sumber belajar resmi yang disediakan oleh pemerintah:</p>\n<ul>\n<li><strong>Simulasi Tes BPPP:</strong> Akses simulasi resmi di <strong>simulasi-tes.bppp.kemdikbud.go.id</strong> untuk merasakan format tes yang sebenarnya.</li>\n<li><strong>Framework SNPMB:</strong> Pelajari kerangka tes dan kisi-kisi di <strong>framework-snpmb.bppp.kemdikbud.go.id</strong> untuk memahami cakupan materi yang diujikan.</li>\n<li><strong>Portal SNPMB:</strong> Pantau informasi terbaru tentang jadwal, persyaratan, dan ketentuan di portal resmi SNPMB.</li>\n</ul>\n<p>Selain sumber resmi, kamu juga bisa memanfaatkan platform latihan soal seperti Toutopia untuk berlatih dengan soal-soal yang disusun sesuai format UTBK-SNBT terbaru. Latihan yang konsisten dan terarah adalah kunci keberhasilan di UTBK-SNBT.</p>\n\n<h2>Kesalahan Umum yang Harus Dihindari</h2>\n<ul>\n<li><strong>Terlalu fokus pada satu subtes.</strong> Semua subtes berkontribusi pada skor akhir, jadi persiapkan semuanya secara seimbang.</li>\n<li><strong>Mengandalkan hafalan.</strong> UTBK-SNBT mengukur kemampuan berpikir, bukan hafalan. Pahami konsep, jangan hanya menghafal.</li>\n<li><strong>Tidak melakukan simulasi.</strong> Latihan soal saja tidak cukup. Lakukan simulasi lengkap dengan timer untuk melatih manajemen waktu.</li>\n<li><strong>Panik saat menemui soal sulit.</strong> Ingat, tidak semua peserta bisa menjawab semua soal. Lewati soal sulit dan kembali nanti.</li>\n<li><strong>Kurang istirahat menjelang tes.</strong> Begadang belajar malam sebelum tes justru kontraproduktif. Istirahat cukup jauh lebih penting.</li>\n</ul>\n\n<h2>Penutup</h2>\n<p>UTBK-SNBT adalah tes yang menantang tetapi bisa dihadapi dengan persiapan yang tepat. Kunci keberhasilannya adalah konsistensi dalam belajar, pemahaman terhadap format tes, dan manajemen waktu yang baik. Mulailah persiapanmu dari sekarang, manfaatkan sumber belajar yang tersedia, dan jangan lupa menjaga kesehatan fisik serta mental. Semoga sukses!</p>",
      "excerpt": "Panduan komprehensif UTBK-SNBT 2025 meliputi struktur tes, sistem scoring IRT, tips per subtes, strategi manajemen waktu, dan sumber belajar resmi untuk memaksimalkan skor kamu.",
      "category": "Strategi",
      "tags": [
        "utbk",
        "snbt",
        "tips",
        "strategi"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-24T01:03:29.849Z",
      "coverImage": null
    },
    {
      "title": "Persiapan SKD CPNS: Passing Grade, Materi, dan Strategi Lulus",
      "slug": "persiapan-skd-cpns-passing-grade-materi-strategi",
      "content": "<h2>Apa Itu SKD CPNS?</h2>\n<p>Seleksi Kompetensi Dasar (SKD) adalah tahap pertama dan paling krusial dalam seleksi Calon Pegawai Negeri Sipil (CPNS). SKD dilaksanakan menggunakan sistem Computer Assisted Test (CAT) yang dikelola oleh Badan Kepegawaian Negara (BKN). Tes ini dirancang untuk mengukur kompetensi dasar yang diperlukan oleh setiap aparatur sipil negara.</p>\n<p>SKD menjadi tahap eliminasi utama dalam seleksi CPNS. Dari jutaan pelamar setiap tahunnya, hanya peserta yang memenuhi passing grade di ketiga subtes yang dapat melanjutkan ke tahap Seleksi Kompetensi Bidang (SKB). Oleh karena itu, memahami struktur dan strategi SKD adalah langkah pertama menuju keberhasilan.</p>\n\n<h2>Struktur SKD CPNS</h2>\n<p>SKD terdiri dari tiga subtes yang masing-masing memiliki passing grade tersendiri. Peserta harus memenuhi passing grade di <strong>ketiga subtes secara simultan</strong> untuk dinyatakan lulus SKD.</p>\n\n<table>\n<thead>\n<tr><th>Subtes</th><th>Jumlah Soal</th><th>Passing Grade</th><th>Skor Maksimal</th><th>Waktu</th></tr>\n</thead>\n<tbody>\n<tr><td>Tes Wawasan Kebangsaan (TWK)</td><td>30 soal</td><td>65</td><td>150</td><td rowspan=\"3\">100 menit (gabungan)</td></tr>\n<tr><td>Tes Intelegensi Umum (TIU)</td><td>35 soal</td><td>80</td><td>175</td></tr>\n<tr><td>Tes Karakteristik Pribadi (TKP)</td><td>45 soal</td><td>166</td><td>225</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>110 soal</strong></td><td><strong>311</strong></td><td><strong>550</strong></td><td><strong>100 menit</strong></td></tr>\n</tbody>\n</table>\n\n<p>Perlu ditekankan bahwa waktu 100 menit adalah waktu gabungan untuk ketiga subtes. Kamu bebas mengalokasikan waktu antar subtes, namun total waktu tidak boleh melebihi 100 menit.</p>\n\n<h2>Sistem Scoring SKD</h2>\n<p>Memahami sistem scoring sangat penting untuk menyusun strategi:</p>\n\n<h3>TWK dan TIU</h3>\n<ul>\n<li>Jawaban benar: <strong>+5 poin</strong></li>\n<li>Jawaban salah: <strong>0 poin</strong> (tidak ada pengurangan)</li>\n<li>Tidak menjawab: <strong>0 poin</strong></li>\n</ul>\n<p>Karena tidak ada penalti, <strong>jawablah semua soal TWK dan TIU</strong> tanpa meninggalkan soal kosong.</p>\n\n<h3>TKP</h3>\n<ul>\n<li>Setiap soal memiliki 5 pilihan jawaban dengan <strong>skor berjenjang: 1, 2, 3, 4, atau 5</strong>.</li>\n<li>Tidak ada jawaban yang bernilai 0. Setiap pilihan memberikan skor minimal 1.</li>\n<li>Jawaban paling ideal mendapat skor 5, paling tidak ideal mendapat skor 1.</li>\n</ul>\n<p>Implikasi: Untuk TKP, kamu akan selalu mendapat skor minimal 45 (45 soal x 1 poin) dan maksimal 225 (45 soal x 5 poin). Target minimal untuk lulus passing grade TKP (166) berarti kamu perlu rata-rata skor 3.69 per soal.</p>\n\n<h2>Materi Tes Wawasan Kebangsaan (TWK)</h2>\n<p>TWK mengukur penguasaan pengetahuan dan kemampuan implementasi nilai-nilai dasar kebangsaan. Materi TWK meliputi:</p>\n\n<h3>Pancasila</h3>\n<ul>\n<li>Sejarah perumusan Pancasila (sidang BPUPKI dan PPKI)</li>\n<li>Makna dan implementasi setiap sila</li>\n<li>Pancasila sebagai dasar negara, ideologi, dan pandangan hidup</li>\n<li>Pengamalan Pancasila dalam kehidupan sehari-hari</li>\n</ul>\n\n<h3>UUD 1945</h3>\n<ul>\n<li>Pembukaan UUD 1945 (hafal alinea 1-4)</li>\n<li>Pasal-pasal penting: Pasal 1, 27-34 (HAM dan kesejahteraan sosial), Pasal 18 (pemerintahan daerah)</li>\n<li>Amandemen UUD 1945 (I-IV) dan perubahannya</li>\n<li>Sistem ketatanegaraan: hubungan antar lembaga negara (MPR, DPR, DPD, Presiden, MA, MK, BPK)</li>\n</ul>\n\n<h3>NKRI dan Bhinneka Tunggal Ika</h3>\n<ul>\n<li>Konsep negara kesatuan dan desentralisasi</li>\n<li>Wawasan nusantara dan ketahanan nasional</li>\n<li>Keberagaman suku, agama, ras, dan budaya</li>\n<li>Toleransi dan harmoni dalam masyarakat majemuk</li>\n</ul>\n\n<h3>ASN dan Good Governance</h3>\n<ul>\n<li>UU ASN No. 20 Tahun 2023 (perubahan dari UU No. 5 Tahun 2014)</li>\n<li>Nilai dasar ASN: BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif)</li>\n<li>Kode etik dan kode perilaku ASN</li>\n<li>Anti-korupsi dan integritas</li>\n</ul>\n\n<h2>Materi Tes Intelegensi Umum (TIU)</h2>\n<p>TIU mengukur kemampuan verbal, numerik, dan logika. Materi TIU meliputi:</p>\n\n<h3>Kemampuan Verbal</h3>\n<ul>\n<li><strong>Sinonim dan antonim:</strong> Persamaan dan lawan kata dari kosakata baku dan tidak umum.</li>\n<li><strong>Analogi:</strong> Hubungan antar kata (sebab-akibat, bagian-keseluruhan, alat-fungsi, dll).</li>\n<li><strong>Pengelompokan kata:</strong> Menentukan kata yang tidak sekelompok.</li>\n<li><strong>Pemahaman wacana:</strong> Ide pokok, kesimpulan, dan inferensi dari teks pendek.</li>\n</ul>\n\n<h3>Kemampuan Numerik</h3>\n<ul>\n<li><strong>Deret angka:</strong> Menentukan pola dan melanjutkan deret (aritmetika, geometri, fibonacci, campuran).</li>\n<li><strong>Hitungan dasar:</strong> Pecahan, persentase, rasio, dan perbandingan.</li>\n<li><strong>Soal cerita aritmetika:</strong> Usia, kecepatan-jarak-waktu, untung-rugi, bunga, dan campuran.</li>\n<li><strong>Interpretasi data:</strong> Membaca tabel, grafik, dan diagram.</li>\n</ul>\n\n<h3>Kemampuan Logika</h3>\n<ul>\n<li><strong>Silogisme:</strong> Penarikan kesimpulan dari dua premis (semua, sebagian, tidak ada).</li>\n<li><strong>Logika proposisi:</strong> Implikasi, konjungsi, disjungsi, negasi, kontraposisi.</li>\n<li><strong>Logika analitis:</strong> Penempatan posisi, urutan, dan pengelompokan berdasarkan kondisi.</li>\n<li><strong>Pola gambar:</strong> Menentukan gambar selanjutnya dalam suatu pola visual.</li>\n</ul>\n\n<h2>Materi Tes Karakteristik Pribadi (TKP)</h2>\n<p>TKP mengukur karakteristik pribadi yang diperlukan untuk menjadi ASN yang profesional. Soal TKP berbentuk studi kasus situasional. Dimensi yang diukur meliputi:</p>\n<ul>\n<li><strong>Pelayanan publik:</strong> Sikap mendahulukan kepentingan masyarakat dan memberikan pelayanan prima.</li>\n<li><strong>Jejaring kerja (networking):</strong> Kemampuan membangun dan memelihara hubungan kerja yang produktif.</li>\n<li><strong>Sosial budaya:</strong> Kepekaan terhadap keberagaman dan kemampuan beradaptasi dalam lingkungan majemuk.</li>\n<li><strong>Teknologi informasi dan komunikasi:</strong> Keterbukaan terhadap perkembangan teknologi dan pemanfaatannya.</li>\n<li><strong>Profesionalisme:</strong> Integritas, disiplin, dan orientasi pada kualitas.</li>\n<li><strong>Anti-radikalisme:</strong> Sikap moderat dan mendukung nilai-nilai kebangsaan.</li>\n</ul>\n\n<h3>Prinsip Menjawab TKP</h3>\n<p>Berbeda dengan TWK dan TIU yang memiliki jawaban pasti benar/salah, TKP mengukur kecenderungan sikap. Prinsip utama menjawab TKP:</p>\n<ol>\n<li><strong>Pilih jawaban yang paling proaktif dan solutif.</strong> Jawaban yang menunjukkan inisiatif untuk menyelesaikan masalah mendapat skor tertinggi.</li>\n<li><strong>Hindari jawaban yang bersifat pasif atau menghindar.</strong> Jawaban seperti \"diam saja\", \"menyerahkan ke orang lain\", atau \"menunggu instruksi\" biasanya mendapat skor rendah.</li>\n<li><strong>Utamakan kepentingan organisasi dan publik</strong> di atas kepentingan pribadi atau kelompok.</li>\n<li><strong>Tunjukkan sikap inklusif dan menghargai perbedaan.</strong></li>\n<li><strong>Pilih pendekatan kolaboratif</strong> daripada individualistis.</li>\n</ol>\n\n<h2>Strategi Lulus SKD CPNS</h2>\n\n<h3>Strategi Umum: Prioritaskan TKP</h3>\n<p>Banyak peserta gagal karena tidak mencapai passing grade TKP (166/225). Padahal TKP memiliki potensi skor tertinggi dan tidak memerlukan hafalan. Strategi yang disarankan:</p>\n<ol>\n<li><strong>Kerjakan TKP terlebih dahulu</strong> selama 30-35 menit. Pastikan mendapat skor setinggi mungkin.</li>\n<li><strong>Lanjutkan dengan TIU</strong> selama 35-40 menit. TIU memiliki passing grade tertinggi secara proporsional.</li>\n<li><strong>Terakhir kerjakan TWK</strong> selama 20-25 menit. TWK memiliki passing grade terendah dan banyak soal yang bisa dijawab dengan pengetahuan umum.</li>\n</ol>\n\n<h3>Strategi TWK</h3>\n<ul>\n<li>Hafal Pembukaan UUD 1945 dan pasal-pasal kunci.</li>\n<li>Pahami konsep dasar Pancasila dan sejarah perumusannya.</li>\n<li>Pelajari nilai-nilai BerAKHLAK ASN secara mendalam.</li>\n<li>Baca UU ASN terbaru dan peraturan terkait.</li>\n<li>Target: minimal 13 soal benar (65 poin) dari 30 soal.</li>\n</ul>\n\n<h3>Strategi TIU</h3>\n<ul>\n<li>Latihan deret angka setiap hari minimal 20 soal.</li>\n<li>Hafal kosakata sinonim-antonim dari kumpulan soal tahun-tahun sebelumnya.</li>\n<li>Kuasai teknik silogisme dan diagram Venn.</li>\n<li>Latih kecepatan menghitung tanpa kalkulator.</li>\n<li>Target: minimal 16 soal benar (80 poin) dari 35 soal.</li>\n</ul>\n\n<h3>Strategi TKP</h3>\n<ul>\n<li>Baca banyak contoh soal untuk memahami pola jawaban ideal.</li>\n<li>Ingat prinsip: proaktif > reaktif > pasif.</li>\n<li>Selalu pilih jawaban yang berorientasi pada pelayanan dan kolaborasi.</li>\n<li>Jangan terburu-buru; baca semua opsi sebelum memilih.</li>\n<li>Target: rata-rata skor 3.7+ per soal (minimal 166 dari 225).</li>\n</ul>\n\n<h2>Simulasi dan Latihan</h2>\n<p>BKN menyediakan simulasi CAT resmi yang bisa diakses di <strong>cat.bkn.go.id/simulasi</strong>. Manfaatkan simulasi ini untuk:</p>\n<ul>\n<li>Membiasakan diri dengan antarmuka CAT BKN.</li>\n<li>Melatih manajemen waktu dalam kondisi yang mendekati tes sesungguhnya.</li>\n<li>Mengukur kemampuan awal dan memantau perkembangan.</li>\n</ul>\n<p>Selain simulasi resmi, gunakan platform latihan seperti Toutopia yang menyediakan bank soal SKD CPNS lengkap dengan pembahasan dan analisis skor per subtes.</p>\n\n<h2>Timeline Persiapan yang Disarankan</h2>\n<table>\n<thead>\n<tr><th>Periode</th><th>Fokus</th><th>Aktivitas</th></tr>\n</thead>\n<tbody>\n<tr><td>3-6 bulan sebelum</td><td>Fondasi</td><td>Pelajari materi dasar TWK, latihan TIU dasar, pahami konsep TKP</td></tr>\n<tr><td>2-3 bulan sebelum</td><td>Intensif</td><td>Latihan soal harian (50-100 soal/hari), simulasi mingguan</td></tr>\n<tr><td>1 bulan sebelum</td><td>Pemantapan</td><td>Simulasi penuh 2-3x/minggu, review soal-soal yang salah</td></tr>\n<tr><td>1 minggu sebelum</td><td>Relaksasi</td><td>Review ringan, jaga kesehatan, persiapan administrasi</td></tr>\n</tbody>\n</table>\n\n<h2>Tips Hari H Tes</h2>\n<ul>\n<li>Datang minimal 1 jam sebelum jadwal untuk menghindari kepanikan.</li>\n<li>Bawa dokumen yang diperlukan: KTP, kartu peserta, dan dokumen lain sesuai pengumuman.</li>\n<li>Sarapan yang cukup namun tidak terlalu berat.</li>\n<li>Bawa air minum jika diizinkan.</li>\n<li>Berdoa dan percaya pada persiapanmu.</li>\n<li>Saat mengerjakan, tenang dan fokus. Jangan terpengaruh oleh peserta lain.</li>\n</ul>\n\n<h2>Setelah SKD: Persiapan SKB</h2>\n<p>Jika kamu berhasil melewati passing grade SKD, langkah selanjutnya adalah Seleksi Kompetensi Bidang (SKB). SKB berbeda-beda tergantung instansi dan formasi yang dilamar. Mulailah mempersiapkan SKB segera setelah SKD, karena jarak waktu antara keduanya biasanya tidak terlalu lama.</p>\n<p>Ingat, persaingan di CPNS sangat ketat dengan rasio pelamar yang sangat tinggi. Namun dengan persiapan yang matang, strategi yang tepat, dan konsistensi dalam belajar, kamu bisa meraih impianmu menjadi ASN. Semangat!</p>",
      "excerpt": "Panduan lengkap Seleksi Kompetensi Dasar (SKD) CPNS meliputi struktur tes TWK, TIU, TKP, passing grade terbaru, materi yang diujikan, sistem scoring, dan strategi lulus untuk setiap subtes.",
      "category": "Strategi",
      "tags": [
        "cpns",
        "skd",
        "twk",
        "tiu",
        "tkp"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-24T01:03:29.849Z",
      "coverImage": null
    },
    {
      "title": "Rekrutmen BUMN: Panduan TKD, AKHLAK, dan English Test",
      "slug": "rekrutmen-bumn-panduan-tkd-akhlak-english-test",
      "content": "<h2>Rekrutmen Bersama BUMN</h2>\n<p>Rekrutmen Bersama BUMN adalah program seleksi terpadu untuk mengisi posisi di berbagai Badan Usaha Milik Negara di Indonesia. Program ini dikoordinasikan oleh Forum Human Capital Indonesia (FHCI) dan Kementerian BUMN, sehingga peserta cukup mendaftar satu kali untuk melamar ke berbagai perusahaan BUMN sekaligus.</p>\n<p>Seleksi BUMN menjadi salah satu yang paling diminati karena menawarkan stabilitas karir, jenjang karir yang jelas, benefit yang kompetitif, dan kesempatan berkontribusi langsung pada pembangunan nasional. Setiap tahun, ratusan ribu pelamar bersaing untuk ribuan posisi yang tersedia.</p>\n\n<h2>Tahapan Seleksi Rekrutmen BUMN</h2>\n<p>Seleksi BUMN terdiri dari beberapa tahap yang harus dilalui secara berurutan. Berikut penjelasan detail setiap tahap:</p>\n\n<h3>Tahap 1: Tes Online (Tes Tertulis)</h3>\n<p>Tahap pertama adalah tes online yang terdiri dari tiga komponen utama:</p>\n\n<table>\n<thead>\n<tr><th>Komponen</th><th>Jumlah Soal</th><th>Passing Grade</th><th>Waktu</th></tr>\n</thead>\n<tbody>\n<tr><td>Tes Kemampuan Dasar (TKD)</td><td>100 soal</td><td>58</td><td>50 menit</td></tr>\n<tr><td>Tes AKHLAK</td><td>~50 soal</td><td>65</td><td>30 menit</td></tr>\n<tr><td>Tes Wawasan Kebangsaan (TWK)</td><td>~50 soal</td><td>50</td><td>28 menit</td></tr>\n<tr><td><strong>Total Tahap 1</strong></td><td><strong>~200 soal</strong></td><td><strong>-</strong></td><td><strong>108 menit</strong></td></tr>\n</tbody>\n</table>\n\n<h3>Tahap 2: Tes Lanjutan</h3>\n<p>Peserta yang lolos Tahap 1 melanjutkan ke tes berikut:</p>\n\n<table>\n<thead>\n<tr><th>Komponen</th><th>Jumlah Soal</th><th>Waktu</th></tr>\n</thead>\n<tbody>\n<tr><td>English Test</td><td>100 soal</td><td>90 menit</td></tr>\n<tr><td>Learning Agility</td><td>50 soal</td><td>30 menit</td></tr>\n</tbody>\n</table>\n\n<h3>Tahap Selanjutnya</h3>\n<p>Setelah tes tertulis, peserta yang lolos masih harus menjalani tahap seleksi tambahan yang bervariasi antar BUMN, seperti wawancara, psikotes, tes kesehatan, dan asesmen lainnya.</p>\n\n<h2>Tes Kemampuan Dasar (TKD)</h2>\n<p>TKD BUMN menguji kemampuan dasar yang diperlukan untuk bekerja secara profesional. Dengan 100 soal dalam 50 menit, kamu hanya punya rata-rata 30 detik per soal, sehingga kecepatan dan ketepatan sangat krusial.</p>\n\n<h3>Materi TKD</h3>\n<ul>\n<li><strong>Penalaran verbal:</strong> Sinonim, antonim, analogi kata, dan pemahaman wacana singkat.</li>\n<li><strong>Penalaran numerik:</strong> Deret angka, operasi aritmetika, persentase, rasio, dan interpretasi data numerik.</li>\n<li><strong>Penalaran logis:</strong> Silogisme, logika formal, pola gambar, dan penalaran spasial.</li>\n<li><strong>Penalaran figural:</strong> Melanjutkan pola gambar, rotasi, dan refleksi bentuk.</li>\n</ul>\n\n<h3>Tips TKD</h3>\n<ol>\n<li>Kerjakan soal yang mudah terlebih dahulu. Dengan rata-rata 30 detik per soal, jangan habiskan waktu di soal yang sulit.</li>\n<li>Untuk deret angka, cari pola paling sederhana dahulu (aritmetika, geometri) sebelum mencoba pola kompleks.</li>\n<li>Untuk analogi, tentukan hubungan kata pertama sebelum melihat pilihan jawaban.</li>\n<li>Untuk penalaran figural, perhatikan rotasi, pencerminan, dan penambahan/pengurangan elemen.</li>\n<li>Latihan rutin minimal 100 soal TKD per hari selama masa persiapan.</li>\n</ol>\n\n<h2>Tes AKHLAK</h2>\n<p>Tes AKHLAK mengukur sejauh mana nilai-nilai inti (core values) BUMN telah terinternalisasi dalam diri peserta. AKHLAK adalah akronim dari enam nilai utama:</p>\n\n<h3>Core Values BUMN - AKHLAK</h3>\n<table>\n<thead>\n<tr><th>Nilai</th><th>Makna</th><th>Perilaku Utama</th></tr>\n</thead>\n<tbody>\n<tr><td><strong>A</strong>manah</td><td>Memegang teguh kepercayaan</td><td>Memenuhi janji, bertanggung jawab, jujur dan transparan</td></tr>\n<tr><td><strong>K</strong>ompeten</td><td>Terus belajar dan mengembangkan kapabilitas</td><td>Meningkatkan kompetensi, membantu orang lain belajar, menyelesaikan tugas dengan kualitas terbaik</td></tr>\n<tr><td><strong>H</strong>armonis</td><td>Saling peduli dan menghargai perbedaan</td><td>Menghargai perbedaan, tolong-menolong, membangun lingkungan kerja kondusif</td></tr>\n<tr><td><strong>L</strong>oyal</td><td>Berdedikasi dan mengutamakan kepentingan organisasi</td><td>Menjaga nama baik organisasi, rela berkorban, patuh pada peraturan</td></tr>\n<tr><td><strong>A</strong>daptif</td><td>Terus berinovasi dan antusias menghadapi perubahan</td><td>Cepat menyesuaikan diri, proaktif, terbuka pada ide baru</td></tr>\n<tr><td><strong>K</strong>olaboratif</td><td>Membangun kerja sama sinergis</td><td>Memberikan kesempatan pada semua pihak, terbuka pada masukan, menggerakkan pemanfaatan sumber daya</td></tr>\n</tbody>\n</table>\n\n<h3>Format Soal AKHLAK</h3>\n<p>Soal AKHLAK berbentuk situasional judgment test (SJT). Kamu diberikan sebuah skenario kerja dan diminta memilih respons yang paling sesuai dengan nilai-nilai AKHLAK. Soal ini mirip dengan TKP di SKD CPNS namun konteksnya lebih spesifik ke lingkungan korporasi BUMN.</p>\n\n<h3>Tips Menjawab Soal AKHLAK</h3>\n<ul>\n<li>Hafal dan pahami mendalam setiap nilai AKHLAK beserta perilaku utamanya.</li>\n<li>Pilih jawaban yang menunjukkan <strong>inisiatif dan tanggung jawab</strong>, bukan menunggu instruksi.</li>\n<li>Utamakan jawaban yang <strong>berorientasi pada kolaborasi tim</strong> daripada kerja individu.</li>\n<li>Jawaban yang menunjukkan <strong>keterbukaan terhadap perubahan dan inovasi</strong> cenderung mendapat skor tinggi.</li>\n<li>Hindari jawaban yang bersifat defensif, menyalahkan orang lain, atau menghindar dari tanggung jawab.</li>\n</ul>\n\n<h2>Tes Wawasan Kebangsaan (TWK) BUMN</h2>\n<p>TWK dalam seleksi BUMN mirip dengan TWK di SKD CPNS, namun dengan penekanan tambahan pada wawasan ekonomi dan peran BUMN dalam pembangunan. Materi yang diujikan meliputi:</p>\n<ul>\n<li>Pancasila dan UUD 1945</li>\n<li>NKRI dan Bhinneka Tunggal Ika</li>\n<li>Sejarah Indonesia dan pahlawan nasional</li>\n<li>Peran BUMN dalam pembangunan nasional</li>\n<li>Isu-isu terkini perekonomian Indonesia</li>\n<li>Regulasi terkait BUMN (UU BUMN, kebijakan Kementerian BUMN)</li>\n</ul>\n\n<h2>English Test</h2>\n<p>English Test pada seleksi BUMN mengadopsi format yang mirip dengan TOEFL ITP (Institutional Testing Program). Tes ini mengukur kemampuan bahasa Inggris pasif (membaca dan mendengarkan) yang relevan untuk lingkungan kerja profesional.</p>\n\n<h3>Struktur English Test</h3>\n<table>\n<thead>\n<tr><th>Section</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus</th></tr>\n</thead>\n<tbody>\n<tr><td>Structure & Written Expression</td><td>~40 soal</td><td>25 menit</td><td>Grammar, sentence completion, error identification</td></tr>\n<tr><td>Reading Comprehension</td><td>~50 soal</td><td>55 menit</td><td>Pemahaman teks akademik dan profesional</td></tr>\n<tr><td>Listening (jika ada)</td><td>~10 soal</td><td>10 menit</td><td>Pemahaman percakapan dan monolog</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>~100 soal</strong></td><td><strong>90 menit</strong></td><td></td></tr>\n</tbody>\n</table>\n\n<h3>Tips English Test</h3>\n<ul>\n<li><strong>Structure:</strong> Pelajari grammar rules yang sering diuji: subject-verb agreement, tenses, conditional sentences, relative clauses, parallelism, dan passive voice.</li>\n<li><strong>Written Expression:</strong> Latih kemampuan mengidentifikasi kesalahan grammar dalam kalimat. Perhatikan common errors: dangling modifiers, pronoun reference, dan word form.</li>\n<li><strong>Reading Comprehension:</strong> Baca pertanyaan terlebih dahulu sebelum membaca teks. Gunakan teknik skimming untuk main idea dan scanning untuk detail spesifik.</li>\n<li><strong>Vocabulary:</strong> Perbanyak kosakata akademik dan bisnis. Pelajari prefix dan suffix untuk menebak makna kata yang tidak dikenal.</li>\n</ul>\n\n<h2>Learning Agility Test</h2>\n<p>Learning Agility mengukur kemampuan seseorang untuk belajar dari pengalaman dan menerapkan pembelajaran tersebut dalam situasi baru. Tes ini relatif baru dalam seleksi BUMN dan semakin penting di era transformasi digital.</p>\n\n<h3>Dimensi Learning Agility</h3>\n<ul>\n<li><strong>Mental Agility:</strong> Kemampuan berpikir kritis, melihat masalah dari berbagai sudut pandang, dan menemukan solusi kreatif.</li>\n<li><strong>People Agility:</strong> Kemampuan memahami orang lain, berkomunikasi efektif, dan beradaptasi dengan berbagai tipe kepribadian.</li>\n<li><strong>Change Agility:</strong> Kenyamanan dengan ambiguitas, eksperimentasi, dan kemampuan memimpin perubahan.</li>\n<li><strong>Results Agility:</strong> Kemampuan menghasilkan kinerja tinggi dalam situasi yang menantang dan pertama kali dihadapi.</li>\n<li><strong>Self-Awareness:</strong> Pemahaman tentang kekuatan dan kelemahan diri sendiri serta komitmen untuk terus berkembang.</li>\n</ul>\n\n<h3>Tips Learning Agility</h3>\n<ul>\n<li>Jawab secara jujur dan konsisten. Tes ini memiliki validity check untuk mendeteksi jawaban yang tidak konsisten.</li>\n<li>Pilih jawaban yang menunjukkan keterbukaan terhadap pengalaman baru dan kemampuan belajar dari kesalahan.</li>\n<li>Tunjukkan bahwa kamu nyaman dengan ketidakpastian dan mampu beradaptasi.</li>\n<li>Hindari jawaban yang menunjukkan rigiditas atau ketakutan terhadap perubahan.</li>\n</ul>\n\n<h2>Strategi Keseluruhan Rekrutmen BUMN</h2>\n\n<h3>Persiapan Jangka Panjang (3-6 bulan)</h3>\n<ol>\n<li>Tingkatkan kemampuan bahasa Inggris secara konsisten. Baca artikel berbahasa Inggris setiap hari.</li>\n<li>Latihan soal TKD secara rutin untuk meningkatkan kecepatan dan akurasi.</li>\n<li>Pelajari dan internalisasi nilai-nilai AKHLAK.</li>\n<li>Perkuat wawasan kebangsaan dengan membaca berita dan regulasi terkini.</li>\n</ol>\n\n<h3>Persiapan Jangka Pendek (1-2 bulan)</h3>\n<ol>\n<li>Fokus pada latihan soal dengan timer untuk simulasi kondisi tes sesungguhnya.</li>\n<li>Lakukan simulasi penuh minimal seminggu sekali.</li>\n<li>Review dan analisis kesalahan dari setiap simulasi.</li>\n<li>Pelajari tips-tips spesifik untuk setiap jenis soal.</li>\n</ol>\n\n<h3>Prioritas Persiapan</h3>\n<table>\n<thead>\n<tr><th>Prioritas</th><th>Komponen</th><th>Alasan</th></tr>\n</thead>\n<tbody>\n<tr><td>1</td><td>TKD</td><td>Passing grade ketat, butuh latihan intensif untuk kecepatan</td></tr>\n<tr><td>2</td><td>English Test</td><td>Butuh waktu lama untuk meningkatkan kemampuan bahasa</td></tr>\n<tr><td>3</td><td>AKHLAK</td><td>Perlu pemahaman mendalam, bukan sekadar hafalan</td></tr>\n<tr><td>4</td><td>TWK</td><td>Materi overlap dengan CPNS, relatif mudah disiapkan</td></tr>\n<tr><td>5</td><td>Learning Agility</td><td>Sulit dipersiapkan secara spesifik, lebih ke karakter personal</td></tr>\n</tbody>\n</table>\n\n<h2>Perbedaan Seleksi BUMN dan CPNS</h2>\n<table>\n<thead>\n<tr><th>Aspek</th><th>BUMN</th><th>CPNS</th></tr>\n</thead>\n<tbody>\n<tr><td>Penyelenggara</td><td>FHCI / Kementerian BUMN</td><td>BKN / Kemenpan-RB</td></tr>\n<tr><td>Status</td><td>Pegawai BUMN (non-PNS)</td><td>PNS (Aparatur Sipil Negara)</td></tr>\n<tr><td>Gaji</td><td>Mengikuti standar korporasi</td><td>Mengikuti peraturan pemerintah</td></tr>\n<tr><td>English Test</td><td>Ada (wajib)</td><td>Tidak ada di SKD</td></tr>\n<tr><td>Tes Karakteristik</td><td>AKHLAK + Learning Agility</td><td>TKP</td></tr>\n<tr><td>Variasi seleksi</td><td>Lebih bervariasi antar perusahaan</td><td>Lebih terstandar</td></tr>\n</tbody>\n</table>\n\n<h2>Penutup</h2>\n<p>Rekrutmen BUMN adalah proses seleksi yang menuntut persiapan menyeluruh. Tidak hanya kemampuan akademik yang diuji, tetapi juga karakter, kemampuan berbahasa Inggris, dan kesiapan menghadapi perubahan. Kunci utamanya adalah memulai persiapan sedini mungkin, berlatih secara konsisten, dan memahami format serta ekspektasi dari setiap tahap seleksi.</p>\n<p>Gunakan platform latihan seperti Toutopia untuk berlatih soal-soal TKD, AKHLAK, dan TWK dengan format yang sesuai standar seleksi BUMN terbaru. Dengan persiapan yang matang, peluangmu untuk bergabung dengan BUMN akan semakin besar.</p>",
      "excerpt": "Panduan lengkap rekrutmen BUMN meliputi tahapan seleksi TKD, tes AKHLAK, TWK, English Test, Learning Agility, passing grade, dan strategi lulus untuk setiap tahap seleksi.",
      "category": "Tips Belajar",
      "tags": [
        "bumn",
        "tkd",
        "akhlak",
        "english",
        "learning-agility"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-24T01:03:29.849Z",
      "coverImage": null
    },
    {
      "title": "Seleksi Sekolah Kedinasan: STAN, STIS, IPDN, STIN",
      "slug": "seleksi-sekolah-kedinasan-stan-stis-ipdn-stin",
      "content": "<h2>Apa Itu Sekolah Kedinasan?</h2>\n<p>Sekolah kedinasan adalah perguruan tinggi yang diselenggarakan oleh kementerian atau lembaga pemerintah non-kementerian. Keunggulan utama sekolah kedinasan adalah mahasiswanya mendapatkan ikatan dinas, yang berarti setelah lulus akan langsung diangkat menjadi Aparatur Sipil Negara (ASN) atau pegawai di instansi terkait tanpa perlu mengikuti seleksi CPNS lagi.</p>\n<p>Selain ikatan dinas, banyak sekolah kedinasan yang membebaskan biaya pendidikan (gratis) dan bahkan memberikan uang saku bulanan kepada mahasiswanya. Hal ini menjadikan sekolah kedinasan sangat diminati, dengan rasio seleksi yang sangat ketat.</p>\n\n<h2>Tahapan Seleksi Umum</h2>\n<p>Sejak beberapa tahun terakhir, seleksi sekolah kedinasan menggunakan pola terpadu yang dikoordinasikan oleh BKN. Tahapan umumnya meliputi:</p>\n<ol>\n<li><strong>Pendaftaran online</strong> melalui portal resmi (dikdin.bkn.go.id)</li>\n<li><strong>Seleksi Kompetensi Dasar (SKD)</strong> menggunakan CAT BKN (sama seperti CPNS)</li>\n<li><strong>Seleksi lanjutan</strong> yang berbeda-beda setiap sekolah kedinasan</li>\n<li><strong>Tes kesehatan dan kesamaptaan</strong> (untuk sekolah tertentu)</li>\n<li><strong>Wawancara dan/atau psikotes</strong></li>\n</ol>\n\n<h2>PKN STAN (Politeknik Keuangan Negara STAN)</h2>\n\n<h3>Profil Singkat</h3>\n<p>PKN STAN adalah sekolah kedinasan di bawah Kementerian Keuangan yang mencetak ahli di bidang keuangan negara, perpajakan, akuntansi, bea cukai, dan penilai. Lulusan PKN STAN ditempatkan di lingkungan Kementerian Keuangan dan instansi terkait seperti Direktorat Jenderal Pajak, Bea Cukai, Perbendaharaan, dan BPKP.</p>\n\n<h3>Program Studi</h3>\n<ul>\n<li>D-III Akuntansi</li>\n<li>D-III Pajak</li>\n<li>D-III Kepabeanan dan Cukai</li>\n<li>D-III Kebendaharaan Negara</li>\n<li>D-III Manajemen Aset</li>\n<li>D-I Pajak</li>\n<li>D-I Kebendaharaan Negara</li>\n</ul>\n\n<h3>Struktur Seleksi PKN STAN</h3>\n<table>\n<thead>\n<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>\n</thead>\n<tbody>\n<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK (30 soal), TIU (35 soal), TKP (45 soal) - Passing grade sama dengan CPNS</td></tr>\n<tr><td>2a</td><td>Tes Potensi Akademik (TPA)</td><td>45 soal, ada penalti (jawaban salah mengurangi skor)</td></tr>\n<tr><td>2b</td><td>Tes Bahasa Inggris (TBI)</td><td>30 soal, ada penalti (jawaban salah mengurangi skor)</td></tr>\n<tr><td>3</td><td>Tes Kesehatan & Kebugaran</td><td>Untuk prodi Kepabeanan dan Cukai (ada tes fisik)</td></tr>\n</tbody>\n</table>\n\n<h3>Hal Penting PKN STAN</h3>\n<ul>\n<li><strong>Sistem penalti di TPA dan TBI:</strong> Berbeda dengan SKD, jawaban salah di TPA dan TBI akan mengurangi skor. Strategi: hanya jawab soal yang yakin benar, kosongkan soal yang benar-benar tidak tahu.</li>\n<li><strong>TPA menguji:</strong> Penalaran verbal, numerik, dan logis dengan tingkat kesulitan lebih tinggi dari TIU SKD.</li>\n<li><strong>TBI menguji:</strong> Grammar (structure), vocabulary, dan reading comprehension level menengah ke atas.</li>\n<li><strong>Persaingan ketat:</strong> Rasio penerimaan bisa mencapai 1:50 hingga 1:100.</li>\n</ul>\n\n<h3>Tips PKN STAN</h3>\n<ul>\n<li>Persiapkan SKD secara matang karena ini tahap eliminasi pertama.</li>\n<li>Untuk TPA, latih terutama deret angka dan logika karena bobotnya besar.</li>\n<li>Untuk TBI, fokus pada grammar rules dan reading comprehension. Level soal mendekati TOEFL PBT.</li>\n<li>Manajemen risiko: karena ada penalti, lebih baik menjawab 25 soal dengan benar daripada 30 soal tapi 10 di antaranya salah.</li>\n</ul>\n\n<h2>STIS (Politeknik Statistika STIS)</h2>\n\n<h3>Profil Singkat</h3>\n<p>STIS adalah sekolah kedinasan di bawah Badan Pusat Statistik (BPS) yang mencetak ahli statistik dan komputasi statistik. Lulusan STIS ditempatkan di BPS pusat dan daerah di seluruh Indonesia.</p>\n\n<h3>Program Studi</h3>\n<ul>\n<li>D-IV Statistika</li>\n<li>D-IV Komputasi Statistik</li>\n</ul>\n\n<h3>Struktur Seleksi STIS</h3>\n<table>\n<thead>\n<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>\n</thead>\n<tbody>\n<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK, TIU, TKP - Passing grade standar</td></tr>\n<tr><td>2</td><td>Tes Matematika</td><td>60 soal - Level SMA/MA kelas 10-12, tingkat kesulitan tinggi</td></tr>\n<tr><td>3</td><td>Tes Bahasa Inggris</td><td>60 soal - Lebih sulit dari PKN STAN</td></tr>\n<tr><td>4</td><td>Psikotes & Wawancara</td><td>Tes psikologi dan wawancara panel</td></tr>\n</tbody>\n</table>\n\n<h3>Hal Penting STIS</h3>\n<ul>\n<li><strong>Matematika level tinggi:</strong> Soal matematika STIS terkenal sulit, mencakup kalkulus dasar, statistika, probabilitas, aljabar linear, dan trigonometri.</li>\n<li><strong>Bahasa Inggris advanced:</strong> Level soal lebih tinggi dari PKN STAN, mencakup academic reading dan scientific English.</li>\n<li><strong>Cocok untuk:</strong> Siswa yang kuat di matematika dan memiliki minat pada data dan statistik.</li>\n</ul>\n\n<h3>Tips STIS</h3>\n<ul>\n<li>Kuasai matematika SMA secara mendalam, terutama kalkulus, statistika, dan probabilitas.</li>\n<li>Latih kemampuan berhitung cepat dan akurat tanpa kalkulator.</li>\n<li>Untuk bahasa Inggris, perbanyak baca jurnal ilmiah dan teks akademik.</li>\n<li>Jangan remehkan psikotes: latih tes krepelin, wartegg, dan tes kepribadian lainnya.</li>\n</ul>\n\n<h2>IPDN (Institut Pemerintahan Dalam Negeri)</h2>\n\n<h3>Profil Singkat</h3>\n<p>IPDN adalah sekolah kedinasan di bawah Kementerian Dalam Negeri yang mencetak kader pamong praja. Lulusan IPDN ditempatkan di pemerintah daerah (provinsi, kabupaten/kota) di seluruh Indonesia. IPDN menggunakan sistem semi-militer dengan pendidikan berasrama.</p>\n\n<h3>Struktur Seleksi IPDN</h3>\n<table>\n<thead>\n<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>\n</thead>\n<tbody>\n<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK passing grade lebih tinggi: 75 (vs 65 di CPNS), TIU 80, TKP 166</td></tr>\n<tr><td>2</td><td>Tes Kesehatan</td><td>Pemeriksaan kesehatan menyeluruh, termasuk mata, telinga, jantung</td></tr>\n<tr><td>3</td><td>Tes Kesamaptaan (Fisik)</td><td>Lari 12 menit, pull-up, push-up, sit-up, shuttle run, renang</td></tr>\n<tr><td>4</td><td>Psikotes</td><td>Tes psikologi tertulis dan wawancara psikolog</td></tr>\n<tr><td>5</td><td>Wawancara</td><td>Panel wawancara pejabat Kemendagri</td></tr>\n</tbody>\n</table>\n\n<h3>Hal Penting IPDN</h3>\n<ul>\n<li><strong>Passing grade TWK lebih tinggi (75):</strong> IPDN menuntut wawasan kebangsaan yang lebih kuat karena lulusannya akan menjadi pemimpin di pemerintahan daerah.</li>\n<li><strong>Tes fisik berat:</strong> Kesamaptaan adalah tahap yang mengeliminasi banyak peserta. Persiapan fisik harus dimulai jauh-jauh hari.</li>\n<li><strong>Sistem semi-militer:</strong> Kehidupan di kampus IPDN sangat disiplin. Pastikan kamu siap mental untuk lingkungan seperti ini.</li>\n<li><strong>Persyaratan fisik:</strong> Tinggi badan minimal (pria: 160 cm, wanita: 155 cm), tidak berkacamata (ketajaman mata tertentu).</li>\n</ul>\n\n<h3>Tips IPDN</h3>\n<ul>\n<li>Tingkatkan skor TWK di atas rata-rata. Hafal UUD 1945, sejarah Indonesia, dan pemerintahan daerah.</li>\n<li>Mulai latihan fisik 6 bulan sebelum seleksi: lari rutin, latihan kekuatan tubuh bagian atas.</li>\n<li>Latih renang jika belum bisa. Banyak peserta gugur di tes renang.</li>\n<li>Jaga postur dan penampilan tubuh. IPDN memperhatikan aspek fisik secara keseluruhan.</li>\n</ul>\n\n<h2>STIN (Sekolah Tinggi Intelijen Negara)</h2>\n\n<h3>Profil Singkat</h3>\n<p>STIN adalah sekolah kedinasan di bawah Badan Intelijen Negara (BIN) yang mencetak agen dan analis intelijen. STIN adalah sekolah kedinasan yang paling kompetitif dan selektif karena sifat pekerjaannya yang sensitif dan rahasia.</p>\n\n<h3>Struktur Seleksi STIN</h3>\n<table>\n<thead>\n<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>\n</thead>\n<tbody>\n<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK, TIU, TKP dengan passing grade standar</td></tr>\n<tr><td>2</td><td>Tes Kesehatan Tahap 1</td><td>Pemeriksaan kesehatan umum</td></tr>\n<tr><td>3</td><td>Tes Kesamaptaan</td><td>Tes fisik intensif (lebih berat dari IPDN)</td></tr>\n<tr><td>4</td><td>Psikotes Mendalam</td><td>Tes psikologi komprehensif dan berlapis</td></tr>\n<tr><td>5</td><td>Tes Kesehatan Tahap 2</td><td>Pemeriksaan kesehatan lanjutan (jiwa, narkoba)</td></tr>\n<tr><td>6</td><td>Wawancara</td><td>Wawancara oleh pejabat BIN</td></tr>\n<tr><td>7</td><td>Pantukhir</td><td>Penilaian akhir dan penetapan kelulusan</td></tr>\n</tbody>\n</table>\n\n<h3>Hal Penting STIN</h3>\n<ul>\n<li><strong>Seleksi paling kompetitif:</strong> Rasio penerimaan bisa mencapai 1:500 atau lebih.</li>\n<li><strong>Tes fisik paling berat:</strong> Standar kesamaptaan STIN lebih tinggi dari sekolah kedinasan lainnya.</li>\n<li><strong>Psikotes mendalam:</strong> Tes psikologi berlapis untuk memastikan stabilitas mental dan kesesuaian karakter.</li>\n<li><strong>Background check:</strong> Penelusuran latar belakang yang mendalam terhadap peserta dan keluarga.</li>\n<li><strong>Kerahasiaan:</strong> Banyak aspek seleksi dan pendidikan STIN yang bersifat rahasia.</li>\n</ul>\n\n<h3>Tips STIN</h3>\n<ul>\n<li>Persiapkan fisik secara ekstrem: lari jarak jauh, renang, dan latihan ketahanan.</li>\n<li>Jaga rekam jejak digital dan sosial media. STIN memeriksa profil online peserta.</li>\n<li>Pastikan tidak ada riwayat hukum yang bermasalah pada diri sendiri maupun keluarga inti.</li>\n<li>Kembangkan kemampuan analitis dan berpikir kritis.</li>\n<li>Kuasai minimal satu bahasa asing selain bahasa Inggris sebagai nilai tambah.</li>\n</ul>\n\n<h2>Tabel Perbandingan Sekolah Kedinasan</h2>\n<table>\n<thead>\n<tr><th>Aspek</th><th>PKN STAN</th><th>STIS</th><th>IPDN</th><th>STIN</th></tr>\n</thead>\n<tbody>\n<tr><td>Kementerian/Lembaga</td><td>Kemenkeu</td><td>BPS</td><td>Kemendagri</td><td>BIN</td></tr>\n<tr><td>Passing Grade TWK</td><td>65</td><td>65</td><td>75</td><td>65</td></tr>\n<tr><td>Passing Grade TIU</td><td>80</td><td>80</td><td>80</td><td>80</td></tr>\n<tr><td>Passing Grade TKP</td><td>166</td><td>166</td><td>166</td><td>166</td></tr>\n<tr><td>Tes Akademik Lanjutan</td><td>TPA (45, penalti) + TBI (30, penalti)</td><td>Matematika (60) + B. Inggris (60)</td><td>Tidak ada</td><td>Tidak ada</td></tr>\n<tr><td>Tes Fisik</td><td>Hanya Bea Cukai</td><td>Tidak ada</td><td>Ya (berat)</td><td>Ya (sangat berat)</td></tr>\n<tr><td>Biaya Pendidikan</td><td>Gratis</td><td>Gratis + uang saku</td><td>Gratis + uang saku</td><td>Gratis + uang saku</td></tr>\n<tr><td>Tingkat Kompetisi</td><td>Sangat tinggi</td><td>Tinggi</td><td>Tinggi</td><td>Paling tinggi</td></tr>\n<tr><td>Penempatan</td><td>Kemenkeu & instansi terkait</td><td>BPS seluruh Indonesia</td><td>Pemda seluruh Indonesia</td><td>BIN</td></tr>\n</tbody>\n</table>\n\n<h2>Strategi Umum untuk Semua Sekolah Kedinasan</h2>\n<ol>\n<li><strong>Persiapkan SKD sejak dini.</strong> SKD adalah tahap eliminasi pertama yang berlaku untuk semua sekolah kedinasan.</li>\n<li><strong>Pilih sekolah yang sesuai minat dan kemampuan.</strong> Jangan memilih hanya karena gengsi. Pertimbangkan karir setelah lulus.</li>\n<li><strong>Daftar di lebih dari satu sekolah</strong> jika memungkinkan, untuk memperbesar peluang diterima.</li>\n<li><strong>Jaga kesehatan fisik.</strong> Bahkan sekolah yang tidak memiliki tes fisik tetap mensyaratkan tes kesehatan.</li>\n<li><strong>Bangun mental yang kuat.</strong> Proses seleksi yang panjang membutuhkan ketahanan mental.</li>\n<li><strong>Manfaatkan sumber belajar yang tepat.</strong> Gunakan platform latihan soal seperti Toutopia untuk berlatih SKD dan tes akademik lainnya.</li>\n</ol>\n\n<h2>Penutup</h2>\n<p>Sekolah kedinasan menawarkan jalur karir yang menjanjikan dengan jaminan penempatan kerja setelah lulus. Namun, persaingannya sangat ketat dan membutuhkan persiapan yang serius dan komprehensif. Mulailah persiapanmu sedini mungkin, kenali kekuatan dan kelemahanmu, dan fokuskan upaya pada area yang perlu ditingkatkan. Dengan tekad dan kerja keras, impianmu untuk diterima di sekolah kedinasan pilihanmu bisa terwujud.</p>",
      "excerpt": "Panduan lengkap seleksi sekolah kedinasan populer: PKN STAN, STIS, IPDN, dan STIN. Meliputi persyaratan, tahapan seleksi, passing grade, struktur tes, dan tips persiapan untuk setiap sekolah.",
      "category": "Tips Belajar",
      "tags": [
        "kedinasan",
        "stan",
        "stis",
        "ipdn",
        "stin"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-24T01:03:29.849Z",
      "coverImage": null
    },
    {
      "title": "Panduan Seleksi PPPK: Kompetensi Teknis hingga Wawancara",
      "slug": "panduan-seleksi-pppk-kompetensi-teknis-wawancara",
      "content": "<h2>Apa Itu PPPK?</h2>\n<p>Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) adalah pegawai ASN yang diangkat berdasarkan perjanjian kerja untuk jangka waktu tertentu. PPPK diperkenalkan melalui UU ASN sebagai alternatif dari PNS, dengan tujuan mempercepat pemenuhan kebutuhan tenaga profesional di instansi pemerintah, terutama di bidang pendidikan dan kesehatan.</p>\n<p>Berbeda dengan PNS yang diangkat secara permanen, PPPK bekerja berdasarkan kontrak yang dapat diperpanjang sesuai kebutuhan dan kinerja. Meskipun demikian, PPPK mendapatkan hak-hak yang setara dengan PNS dalam banyak aspek, termasuk gaji, tunjangan, cuti, dan perlindungan sosial.</p>\n<p>Seleksi PPPK memiliki karakteristik unik yang berbeda dari CPNS. Pemahaman yang baik tentang struktur seleksi, sistem penilaian, dan strategi persiapan akan sangat membantu dalam meraih keberhasilan.</p>\n\n<h2>Struktur Seleksi PPPK</h2>\n<p>Seleksi PPPK terdiri dari empat komponen utama yang masing-masing memiliki bobot dan sistem penilaian berbeda:</p>\n\n<table>\n<thead>\n<tr><th>Komponen</th><th>Jumlah Soal</th><th>Sistem Skor</th><th>Skor Maks</th><th>Waktu</th></tr>\n</thead>\n<tbody>\n<tr><td>Kompetensi Teknis</td><td>90 soal</td><td>Benar = 5, Salah = 0</td><td>450</td><td>90 menit</td></tr>\n<tr><td>Kompetensi Manajerial</td><td>25 soal</td><td>Skor 1-4 per soal</td><td>100</td><td>25 menit</td></tr>\n<tr><td>Kompetensi Sosiokultural</td><td>20 soal</td><td>Skor 1-4 per soal</td><td>80</td><td>15 menit</td></tr>\n<tr><td>Wawancara</td><td>10 soal</td><td>Skor 1-4 per soal</td><td>40</td><td>10 menit (tertulis via CAT)</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>145 soal</strong></td><td></td><td><strong>670</strong></td><td><strong>~130 menit</strong></td></tr>\n</tbody>\n</table>\n\n<h3>Perbedaan Kunci dengan CPNS</h3>\n<ul>\n<li><strong>Tidak ada passing grade per komponen.</strong> PPPK menggunakan <strong>sistem peringkat</strong>, bukan ambang batas (passing grade).</li>\n<li><strong>Kompetisi berbasis ranking.</strong> Peserta dirangking berdasarkan total skor, dan yang diterima adalah peserta dengan ranking tertinggi sesuai jumlah formasi.</li>\n<li><strong>Bobot teknis dominan.</strong> Kompetensi Teknis memiliki bobot paling besar (450 dari 670 poin), sehingga menjadi penentu utama keberhasilan.</li>\n</ul>\n\n<h2>Kompetensi Teknis</h2>\n<p>Kompetensi Teknis adalah komponen terpenting dengan kontribusi 67% dari total skor. Materi yang diujikan sangat berbeda tergantung jenis formasi yang dilamar.</p>\n\n<h3>PPPK Guru</h3>\n<p>Seleksi kompetensi teknis untuk PPPK Guru menguji tiga aspek utama:</p>\n\n<h3>1. Kompetensi Pedagogik</h3>\n<ul>\n<li><strong>Teori belajar dan pembelajaran:</strong> Konstruktivisme, behaviorisme, kognitivisme, humanisme.</li>\n<li><strong>Kurikulum:</strong> Pemahaman Kurikulum Merdeka, profil pelajar Pancasila, asesmen diagnostik.</li>\n<li><strong>Perencanaan pembelajaran:</strong> Menyusun modul ajar, alur tujuan pembelajaran (ATP), dan capaian pembelajaran (CP).</li>\n<li><strong>Asesmen:</strong> Asesmen formatif dan sumatif, asesmen autentik, rubrik penilaian.</li>\n<li><strong>Pengelolaan kelas:</strong> Diferensiasi pembelajaran, pembelajaran inklusif, manajemen kelas.</li>\n</ul>\n\n<h3>2. Kompetensi Profesional</h3>\n<ul>\n<li>Penguasaan materi bidang studi sesuai jenjang dan mata pelajaran yang dilamar.</li>\n<li>Kemampuan menganalisis dan mengevaluasi konten pembelajaran.</li>\n<li>Pemahaman perkembangan terkini dalam bidang studi.</li>\n</ul>\n\n<h3>3. Pedagogical Content Knowledge (PCK)</h3>\n<ul>\n<li>Integrasi antara pengetahuan pedagogik dan konten mata pelajaran.</li>\n<li>Kemampuan menjelaskan konsep yang sulit dengan cara yang mudah dipahami siswa.</li>\n<li>Identifikasi miskonsepsi siswa dan strategi remedial.</li>\n<li>Pemilihan metode dan media pembelajaran yang tepat untuk materi tertentu.</li>\n</ul>\n\n<h3>PPPK Tenaga Teknis</h3>\n<p>Untuk formasi tenaga teknis (non-guru, non-kesehatan), materi kompetensi teknis disesuaikan dengan jabatan fungsional yang dilamar. Contoh:</p>\n<ul>\n<li><strong>Pranata Komputer:</strong> Pemrograman, database, jaringan, keamanan siber.</li>\n<li><strong>Analis Kebijakan:</strong> Analisis kebijakan publik, formulasi kebijakan, evaluasi program.</li>\n<li><strong>Perencana:</strong> Perencanaan pembangunan, RPJM, analisis data pembangunan.</li>\n<li><strong>Pustakawan:</strong> Ilmu perpustakaan, katalogisasi, manajemen koleksi, literasi informasi.</li>\n<li><strong>Arsiparis:</strong> Kearsipan, records management, preservasi dokumen.</li>\n</ul>\n\n<h3>PPPK Tenaga Kesehatan (Nakes)</h3>\n<p>Seleksi untuk PPPK Nakes memiliki karakteristik khusus dengan penggunaan soal vignette klinis:</p>\n<ul>\n<li><strong>Format vignette:</strong> Soal berbentuk kasus klinis lengkap (anamnesis, pemeriksaan fisik, data penunjang) yang harus dianalisis untuk menentukan diagnosis dan tatalaksana.</li>\n<li><strong>Bidang yang diuji:</strong> Sesuai profesi (dokter, perawat, bidan, apoteker, dll).</li>\n<li><strong>Standar kompetensi:</strong> Mengacu pada standar kompetensi profesi masing-masing yang ditetapkan oleh organisasi profesi.</li>\n<li><strong>Level soal:</strong> Setara dengan uji kompetensi profesi kesehatan.</li>\n</ul>\n\n<h2>Kompetensi Manajerial</h2>\n<p>Kompetensi Manajerial menguji kemampuan manajerial yang diperlukan dalam menjalankan tugas jabatan. Terdapat delapan dimensi manajerial yang diukur:</p>\n\n<h3>8 Dimensi Manajerial</h3>\n<ol>\n<li><strong>Integritas:</strong> Konsistensi antara perkataan dan perbuatan, kejujuran, dan kepatuhan pada norma dan etika.</li>\n<li><strong>Kerja Sama:</strong> Kemampuan bekerja dalam tim, menghargai kontribusi orang lain, dan membangun sinergi.</li>\n<li><strong>Komunikasi:</strong> Kemampuan menyampaikan dan menerima informasi secara efektif, baik lisan maupun tulisan.</li>\n<li><strong>Orientasi pada Hasil:</strong> Fokus pada pencapaian target dan peningkatan kualitas kerja secara berkelanjutan.</li>\n<li><strong>Pelayanan Publik:</strong> Komitmen memberikan pelayanan terbaik kepada masyarakat.</li>\n<li><strong>Pengembangan Diri dan Orang Lain:</strong> Kemauan untuk terus belajar dan membantu pengembangan rekan kerja.</li>\n<li><strong>Mengelola Perubahan:</strong> Kemampuan beradaptasi dan memimpin perubahan dalam organisasi.</li>\n<li><strong>Pengambilan Keputusan:</strong> Kemampuan mengambil keputusan yang tepat berdasarkan data dan analisis.</li>\n</ol>\n\n<h3>Format dan Tips Menjawab</h3>\n<p>Soal manajerial berbentuk situasional judgment test. Setiap soal menyajikan skenario dan kamu diminta memilih respons yang paling tepat. Skor 1-4 diberikan berdasarkan kualitas respons:</p>\n<ul>\n<li><strong>Skor 4:</strong> Respons paling proaktif, strategis, dan berorientasi pada hasil jangka panjang.</li>\n<li><strong>Skor 3:</strong> Respons yang tepat namun kurang strategis atau hanya berorientasi jangka pendek.</li>\n<li><strong>Skor 2:</strong> Respons yang netral atau pasif, menunggu instruksi.</li>\n<li><strong>Skor 1:</strong> Respons yang menghindari masalah, menyalahkan orang lain, atau kontraproduktif.</li>\n</ul>\n<p>Tips utama: Selalu pilih jawaban yang menunjukkan inisiatif, kepemimpinan, dan orientasi pada solusi. Jawaban yang proaktif hampir selalu mendapat skor tertinggi.</p>\n\n<h2>Kompetensi Sosiokultural</h2>\n<p>Kompetensi Sosiokultural mengukur kemampuan berinteraksi dalam masyarakat yang beragam dan kemampuan memahami konteks sosial budaya dalam menjalankan tugas pemerintahan.</p>\n\n<h3>Aspek yang Diukur</h3>\n<ul>\n<li><strong>Perekat Bangsa:</strong> Kemampuan mempromosikan dan menjaga persatuan dalam keberagaman.</li>\n<li><strong>Empati dan Kepekaan Sosial:</strong> Kemampuan memahami dan merespons kebutuhan masyarakat yang beragam.</li>\n<li><strong>Kolaborasi Lintas Budaya:</strong> Kemampuan bekerja efektif dengan orang dari latar belakang yang berbeda.</li>\n<li><strong>Nasionalisme:</strong> Cinta tanah air dan komitmen pada nilai-nilai kebangsaan.</li>\n</ul>\n\n<h3>Tips Menjawab Sosiokultural</h3>\n<ul>\n<li>Pilih jawaban yang menunjukkan penghargaan terhadap perbedaan dan keberagaman.</li>\n<li>Utamakan pendekatan inklusif yang melibatkan semua pihak.</li>\n<li>Hindari jawaban yang diskriminatif atau favoritisme terhadap kelompok tertentu.</li>\n<li>Tunjukkan kemampuan menjadi jembatan antar kelompok yang berbeda.</li>\n</ul>\n\n<h2>Wawancara (Tertulis via CAT)</h2>\n<p>Uniknya, wawancara dalam seleksi PPPK dilakukan secara tertulis melalui sistem CAT, bukan tatap muka. Format ini menyajikan pertanyaan situasional yang harus dijawab dengan memilih respons tertulis.</p>\n\n<h3>Topik Wawancara</h3>\n<ul>\n<li>Motivasi melamar jabatan dan komitmen terhadap pelayanan publik.</li>\n<li>Pengalaman relevan dan bagaimana menerapkannya dalam jabatan yang dilamar.</li>\n<li>Skenario penyelesaian masalah dalam konteks jabatan.</li>\n<li>Visi dan rencana pengembangan diri.</li>\n</ul>\n\n<h3>Tips Wawancara</h3>\n<ul>\n<li>Jawab dengan konsisten sesuai profil jabatan yang dilamar.</li>\n<li>Tunjukkan pemahaman tentang tugas dan tanggung jawab jabatan.</li>\n<li>Pilih jawaban yang menunjukkan motivasi intrinsik, bukan ekstrinsik (motivasi pelayanan, bukan gaji atau status).</li>\n</ul>\n\n<h2>Strategi Menyeluruh Seleksi PPPK</h2>\n\n<h3>Prioritas Persiapan</h3>\n<ol>\n<li><strong>Kompetensi Teknis (prioritas utama):</strong> Dengan bobot 67% dari total skor, teknis adalah penentu utama. Alokasikan 60-70% waktu persiapan untuk komponen ini.</li>\n<li><strong>Kompetensi Manajerial (prioritas kedua):</strong> Dengan 100 poin, manajerial adalah penentu kedua. Pahami 8 dimensi dan pola jawaban ideal.</li>\n<li><strong>Kompetensi Sosiokultural (prioritas ketiga):</strong> Dengan 80 poin, sosiokultural memiliki pola yang mirip dengan manajerial.</li>\n<li><strong>Wawancara (prioritas keempat):</strong> Dengan 40 poin, wawancara memiliki bobot terkecil namun tetap bisa menjadi pembeda.</li>\n</ol>\n\n<h3>Strategi untuk PPPK Guru</h3>\n<ul>\n<li><strong>Kuasai Kurikulum Merdeka:</strong> Pelajari capaian pembelajaran (CP), alur tujuan pembelajaran (ATP), modul ajar, dan asesmen.</li>\n<li><strong>Perdalam pedagogik:</strong> Fokus pada teori belajar, diferensiasi, dan asesmen formatif.</li>\n<li><strong>Update materi bidang studi:</strong> Pastikan penguasaan materi sesuai dengan jenjang dan mata pelajaran.</li>\n<li><strong>Latih PCK:</strong> Hubungkan pengetahuan pedagogik dengan konten mata pelajaran.</li>\n<li><strong>Pelajari profil pelajar Pancasila</strong> dan implementasinya dalam pembelajaran.</li>\n</ul>\n\n<h3>Strategi untuk PPPK Teknis</h3>\n<ul>\n<li>Pelajari standar kompetensi jabatan fungsional yang dilamar.</li>\n<li>Baca regulasi dan pedoman terkini yang relevan dengan jabatan.</li>\n<li>Latih soal-soal yang spesifik sesuai bidang jabatan.</li>\n<li>Pahami konteks penerapan kompetensi dalam instansi yang dituju.</li>\n</ul>\n\n<h3>Strategi untuk PPPK Nakes</h3>\n<ul>\n<li>Latih soal vignette klinis secara intensif.</li>\n<li>Review standar kompetensi profesi masing-masing.</li>\n<li>Pelajari pedoman klinis dan protokol terbaru.</li>\n<li>Latih kemampuan analisis kasus klinis secara sistematis.</li>\n</ul>\n\n<h2>Manajemen Waktu Saat Tes</h2>\n<table>\n<thead>\n<tr><th>Komponen</th><th>Waktu</th><th>Rata-rata per Soal</th><th>Strategi</th></tr>\n</thead>\n<tbody>\n<tr><td>Teknis</td><td>90 menit</td><td>60 detik</td><td>Jawab yang yakin dulu, tandai yang ragu</td></tr>\n<tr><td>Manajerial</td><td>25 menit</td><td>60 detik</td><td>Baca semua opsi, pilih yang paling proaktif</td></tr>\n<tr><td>Sosiokultural</td><td>15 menit</td><td>45 detik</td><td>Pilih yang inklusif dan kolaboratif</td></tr>\n<tr><td>Wawancara</td><td>10 menit</td><td>60 detik</td><td>Jawab konsisten dengan profil jabatan</td></tr>\n</tbody>\n</table>\n\n<h2>Kesalahan Umum yang Harus Dihindari</h2>\n<ul>\n<li><strong>Hanya fokus pada manajerial/sosiokultural.</strong> Banyak peserta menghabiskan waktu persiapan untuk soal manajerial karena mirip TKP CPNS, padahal bobotnya jauh lebih kecil dari teknis.</li>\n<li><strong>Mengabaikan update materi.</strong> Materi teknis, terutama untuk guru (Kurikulum Merdeka) dan nakes (protokol klinis), terus berubah. Gunakan sumber terbaru.</li>\n<li><strong>Tidak memahami sistem peringkat.</strong> Banyak peserta berpikir ada passing grade tertentu. Padahal yang menentukan adalah posisi ranking dibanding peserta lain di formasi yang sama.</li>\n<li><strong>Terlalu lama di satu soal teknis.</strong> Dengan 90 soal dalam 90 menit, setiap detik berharga. Lewati soal yang sulit dan kembali nanti.</li>\n</ul>\n\n<h2>Penutup</h2>\n<p>Seleksi PPPK memiliki karakteristik unik dengan dominasi kompetensi teknis dan sistem peringkat yang kompetitif. Kunci keberhasilannya adalah penguasaan materi teknis yang mendalam sesuai formasi yang dilamar, dipadukan dengan pemahaman yang baik tentang kompetensi manajerial dan sosiokultural. Mulailah persiapan sedini mungkin, fokus pada area yang memberikan dampak terbesar pada skor, dan manfaatkan platform latihan seperti Toutopia untuk mengasah kemampuanmu. Semoga berhasil dalam seleksi PPPK!</p>",
      "excerpt": "Panduan lengkap seleksi PPPK meliputi struktur tes kompetensi teknis, manajerial, sosiokultural, dan wawancara. Termasuk tips untuk PPPK Guru, Tenaga Teknis, dan Tenaga Kesehatan.",
      "category": "Strategi",
      "tags": [
        "pppk",
        "guru",
        "teknis",
        "manajerial",
        "sosiokultural"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-24T01:03:29.849Z",
      "coverImage": null
    },
    {
      "title": "Test",
      "slug": "panduan-lengkap-utbk-snbt",
      "content": "<p>test</p>",
      "excerpt": null,
      "category": null,
      "tags": [],
      "status": "DRAFT",
      "publishedAt": null,
      "coverImage": null
    }
  ],
  "ebooks": [
    {
      "title": "Kisi-kisi & Materi Lengkap UTBK-SNBT",
      "slug": "kisi-kisi-materi-lengkap-utbk-snbt",
      "description": "Panduan belajar komprehensif UTBK-SNBT mencakup TPS, Literasi, dan Penalaran Matematika. Dilengkapi contoh soal dan strategi pengerjaan per subtes.",
      "contentType": "HTML",
      "htmlContent": "\n<h2>Pendahuluan</h2>\n<p>Buku panduan ini disusun untuk membantu peserta UTBK-SNBT memahami secara menyeluruh struktur ujian, materi yang diujikan, serta strategi pengerjaan yang efektif. UTBK-SNBT yang diselenggarakan oleh BPPP Kemdikbud merupakan jalur seleksi masuk PTN berbasis tes yang mengukur kemampuan kognitif dan potensi akademik.</p>\n<p>Berbeda dengan ujian berbasis hafalan, UTBK-SNBT dirancang untuk mengukur kemampuan berpikir tingkat tinggi (Higher Order Thinking Skills/HOTS). Oleh karena itu, persiapan yang efektif bukan sekadar menghafal materi, melainkan melatih pola berpikir dan strategi pengerjaan.</p>\n\n<h2>BAB 1: Tes Potensi Skolastik (TPS)</h2>\n\n<h3>1.1 Penalaran Umum (PU) — 20 soal, 25 menit</h3>\n<p>Penalaran Umum mengukur kemampuan berpikir logis, baik secara induktif maupun deduktif. Subtes ini menjadi salah satu komponen terpenting karena menggambarkan kemampuan analisis peserta.</p>\n\n<h4>Tipe Soal Penalaran Umum:</h4>\n<ul>\n<li><strong>Silogisme</strong> — Menarik kesimpulan dari dua atau lebih premis. Contoh: \"Semua mahasiswa rajin. Andi mahasiswa. Maka...\"</li>\n<li><strong>Penalaran Analitis</strong> — Menentukan urutan, posisi, atau hubungan berdasarkan syarat-syarat yang diberikan</li>\n<li><strong>Penalaran Logis</strong> — Mengevaluasi argumen, mencari asumsi, mengidentifikasi kelemahan penalaran</li>\n<li><strong>Deret/Pola</strong> — Menentukan angka atau huruf berikutnya dalam suatu pola</li>\n</ul>\n\n<h4>Contoh Soal Silogisme:</h4>\n<blockquote>\n<p>Premis 1: Semua diplomat harus menguasai minimal 3 bahasa.<br>\nPremis 2: Sebagian diplomat yang menguasai lebih dari 4 bahasa ditempatkan di divisi khusus.<br>\nPremis 3: Kaelen adalah diplomat yang menguasai 5 bahasa.<br><br>\nManakah simpulan yang PASTI BENAR?<br>\nA. Kaelen pasti ditempatkan di divisi khusus<br>\nB. Semua diplomat menguasai 5 bahasa<br>\nC. Jika Kaelen di divisi khusus, ia menguasai lebih dari 4 bahasa<br>\nD. Kaelen adalah satu-satunya diplomat dengan 5 bahasa<br>\nE. Tidak ada diplomat yang menguasai kurang dari 3 bahasa</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Kaelen menguasai 5 > 4 bahasa. Kata \"sebagian\" berarti tidak semua yang menguasai >4 bahasa ditempatkan di divisi khusus. Namun jika ia di divisi khusus, syaratnya pasti terpenuhi (>4 bahasa). Jawaban E juga benar berdasarkan premis 1.</p>\n\n<h4>Contoh Soal Deret:</h4>\n<blockquote>\n<p>3, 5, 9, 15, 23, ...<br>\nA. 29 &nbsp; B. 31 &nbsp; C. 33 &nbsp; D. 35 &nbsp; E. 37</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Selisih: 2, 4, 6, 8 (bertambah 2). Selisih berikutnya = 10, sehingga 23 + 10 = 33.</p>\n\n<h4>Strategi PU:</h4>\n<ol>\n<li>Identifikasi tipe soal terlebih dahulu (silogisme, analitis, atau deret)</li>\n<li>Untuk silogisme: gambar diagram Venn untuk visualisasi hubungan</li>\n<li>Untuk deret: cari selisih tingkat pertama, jika tidak teratur cari selisih tingkat kedua</li>\n<li>Untuk penalaran analitis: buat tabel/matriks untuk memetakan informasi</li>\n</ol>\n\n<h3>1.2 Pengetahuan dan Pemahaman Umum (PPU) — 20 soal, 20 menit</h3>\n<p>PPU menguji kemampuan memahami, menganalisis, dan mengevaluasi teks bacaan serta data visual (grafik, tabel, infografis).</p>\n\n<h4>Tipe Soal PPU:</h4>\n<ul>\n<li><strong>Ide pokok</strong> — Menentukan gagasan utama paragraf atau keseluruhan teks</li>\n<li><strong>Inferensi</strong> — Menarik kesimpulan yang tidak dinyatakan eksplisit</li>\n<li><strong>Interpretasi grafik</strong> — Membaca dan menganalisis data dari grafik/tabel</li>\n<li><strong>Hubungan antaride</strong> — Menentukan hubungan sebab-akibat, perbandingan, atau kronologi</li>\n</ul>\n\n<h4>Strategi PPU:</h4>\n<ol>\n<li>Baca pertanyaan terlebih dahulu sebelum membaca teks</li>\n<li>Scan teks untuk menemukan informasi yang relevan dengan pertanyaan</li>\n<li>Untuk grafik: perhatikan judul, sumbu, legenda, dan tren data</li>\n<li>Jangan terjebak pada informasi yang tidak ditanyakan</li>\n</ol>\n\n<h3>1.3 Pemahaman Bacaan dan Menulis (PBM) — 20 soal, 25 menit</h3>\n<p>PBM mengukur kemampuan menulis argumentatif dan memahami teks secara kritis.</p>\n\n<h4>Tipe Soal PBM:</h4>\n<ul>\n<li><strong>Kalimat efektif</strong> — Memilih kalimat yang paling efektif dan sesuai konteks</li>\n<li><strong>Koherensi paragraf</strong> — Menentukan urutan kalimat yang logis</li>\n<li><strong>Penalaran penulis</strong> — Mengidentifikasi argumen, asumsi, dan bukti pendukung</li>\n<li><strong>Evaluasi teks</strong> — Menilai kekuatan dan kelemahan argumen</li>\n</ul>\n\n<h3>1.4 Pengetahuan Kuantitatif (PK) — 15 soal, 20 menit</h3>\n<p>PK mengukur kemampuan matematika dasar yang diperlukan untuk penalaran kuantitatif.</p>\n\n<h4>Materi PK:</h4>\n<ul>\n<li><strong>Aritmatika</strong> — Perbandingan, persentase, rata-rata, campuran</li>\n<li><strong>Aljabar</strong> — Persamaan linear, kuadrat, pertidaksamaan</li>\n<li><strong>Geometri</strong> — Luas, keliling, volume, sudut, kesebangunan</li>\n<li><strong>Probabilitas</strong> — Peluang kejadian, permutasi, kombinasi dasar</li>\n</ul>\n\n<h4>Contoh Soal PK:</h4>\n<blockquote>\n<p>Survei di kota fiktif menunjukkan: 60% penduduk menggunakan transportasi umum, 45% menggunakan kendaraan pribadi, 20% menggunakan keduanya. Berapa persen yang tidak menggunakan keduanya?<br>\nA. 5% &nbsp; B. 10% &nbsp; C. 15% &nbsp; D. 20% &nbsp; E. 25%</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> P(A∪B) = 60% + 45% - 20% = 85%. Tidak keduanya = 100% - 85% = 15%.</p>\n\n<h2>BAB 2: Literasi Bahasa Indonesia — 30 soal, 45 menit</h2>\n\n<h3>2.1 Tipe Teks yang Diujikan</h3>\n<ul>\n<li><strong>Teks Fiksi</strong> — Cerpen, kutipan novel, puisi. Soal menguji pemahaman makna, karakter, tema, dan gaya bahasa.</li>\n<li><strong>Teks Informasi</strong> — Artikel ilmiah, berita, laporan penelitian. Soal menguji pemahaman fakta, argumen, dan struktur teks.</li>\n<li><strong>Teks Persuasi</strong> — Editorial, opini, iklan. Soal menguji kemampuan mengevaluasi argumen dan mengidentifikasi bias.</li>\n</ul>\n\n<h3>2.2 Cognitive Levels</h3>\n<table>\n<thead><tr><th>Level</th><th>Deskripsi</th><th>Contoh Pertanyaan</th></tr></thead>\n<tbody>\n<tr><td>Menemukan Informasi</td><td>Mencari informasi tersurat dalam teks</td><td>\"Menurut teks, kapan peristiwa X terjadi?\"</td></tr>\n<tr><td>Memahami</td><td>Menafsirkan makna tersirat</td><td>\"Apa yang dimaksud penulis dengan...?\"</td></tr>\n<tr><td>Mengevaluasi & Merefleksi</td><td>Menilai kualitas teks dan menghubungkan dengan konteks</td><td>\"Apakah argumen penulis didukung bukti yang memadai?\"</td></tr>\n</tbody>\n</table>\n\n<h3>2.3 Strategi Literasi B. Indonesia:</h3>\n<ol>\n<li>Latih membaca cepat (skimming dan scanning) untuk efisiensi waktu</li>\n<li>Perhatikan kata penghubung (namun, akan tetapi, meskipun) yang sering menjadi kunci jawaban</li>\n<li>Untuk soal evaluasi: cari klaim utama penulis lalu evaluasi buktinya</li>\n</ol>\n\n<h2>BAB 3: Literasi Bahasa Inggris — 20 soal, 30 menit</h2>\n\n<h3>3.1 Level Kemampuan: CEFR B1-B2</h3>\n<p>Soal literasi bahasa Inggris setara CEFR B1-B2, yang berarti peserta diharapkan dapat:</p>\n<ul>\n<li>Memahami poin utama dari teks yang jelas tentang topik familiar</li>\n<li>Memahami deskripsi kejadian, perasaan, dan keinginan</li>\n<li>Memahami teks yang lebih kompleks, baik konkret maupun abstrak</li>\n</ul>\n\n<h3>3.2 Fokus Soal:</h3>\n<ul>\n<li><strong>Reading comprehension</strong> — Main idea, detail, inference, author's purpose</li>\n<li><strong>Vocabulary in context</strong> — Meaning of words based on surrounding text</li>\n<li><strong>Reference</strong> — Identifying what pronouns or phrases refer to</li>\n<li><strong>Tone and attitude</strong> — Understanding the author's perspective</li>\n</ul>\n\n<h3>3.3 Contoh Soal:</h3>\n<blockquote>\n<p>Read the passage:<br>\n\"The proliferation of social media has fundamentally altered how young people interact. While proponents argue it enhances connectivity, critics contend that it erodes genuine interpersonal skills.\"<br><br>\nThe word \"proliferation\" in the passage is closest in meaning to:<br>\nA. Decline &nbsp; B. Regulation &nbsp; C. Rapid spread &nbsp; D. Restriction &nbsp; E. Improvement</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Proliferation berarti penyebaran/pertumbuhan yang cepat.</p>\n\n<h2>BAB 4: Penalaran Matematika — 20 soal, 30 menit</h2>\n\n<h3>4.1 Domain Bilangan & Operasinya</h3>\n<p>Mencakup pecahan, rasio, persentase, FPB/KPK, dan operasi bilangan bulat. Soal sering dikontekstualisasi dalam masalah sehari-hari.</p>\n\n<h3>4.2 Domain Aljabar & Fungsi</h3>\n<p>Mencakup persamaan dan pertidaksamaan linear/kuadrat, fungsi, barisan dan deret (aritmatika, geometri), serta pola bilangan.</p>\n\n<h4>Contoh Soal Barisan:</h4>\n<blockquote>\n<p>Suku pertama barisan aritmatika adalah 5 dan suku ke-10 adalah 32. Berapakah jumlah 20 suku pertama?<br>\nA. 610 &nbsp; B. 670 &nbsp; C. 690 &nbsp; D. 710 &nbsp; E. 730</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> a=5, a10=5+9b=32, maka b=3. S20 = 20/2 × (2(5)+19(3)) = 10 × (10+57) = 10 × 67 = 670.</p>\n\n<h3>4.3 Domain Geometri & Pengukuran</h3>\n<p>Mencakup bangun datar (luas, keliling), bangun ruang (volume, luas permukaan), transformasi geometri (translasi, rotasi, refleksi), dan trigonometri dasar.</p>\n\n<h3>4.4 Domain Data, Statistika & Peluang</h3>\n<p>Mencakup mean, median, modus, kuartil, simpangan, interpretasi diagram/grafik, dan peluang kejadian.</p>\n\n<h4>Contoh Soal Statistika:</h4>\n<blockquote>\n<p>Data nilai: 6, 7, 7, 8, 8, 8, 9, 9, 10. Berapakah median dan modus?<br>\nA. Median 8, Modus 8 &nbsp; B. Median 7, Modus 8 &nbsp; C. Median 8, Modus 9 &nbsp; D. Median 9, Modus 7 &nbsp; E. Median 8, Modus 7</p>\n</blockquote>\n<p><strong>Jawaban: A.</strong> 9 data, median = data ke-5 = 8. Modus (paling sering muncul) = 8 (muncul 3 kali).</p>\n\n<h2>BAB 5: Tips & Strategi Pengerjaan</h2>\n\n<h3>5.1 Manajemen Waktu</h3>\n<table>\n<thead><tr><th>Subtes</th><th>Soal</th><th>Waktu</th><th>Rata-rata per Soal</th></tr></thead>\n<tbody>\n<tr><td>TPS - PU</td><td>20</td><td>25 menit</td><td>75 detik</td></tr>\n<tr><td>TPS - PPU</td><td>20</td><td>20 menit</td><td>60 detik</td></tr>\n<tr><td>TPS - PBM</td><td>20</td><td>25 menit</td><td>75 detik</td></tr>\n<tr><td>TPS - PK</td><td>15</td><td>20 menit</td><td>80 detik</td></tr>\n<tr><td>Literasi Indo</td><td>30</td><td>45 menit</td><td>90 detik</td></tr>\n<tr><td>Literasi Eng</td><td>20</td><td>30 menit</td><td>90 detik</td></tr>\n<tr><td>Penalaran Mat</td><td>20</td><td>30 menit</td><td>90 detik</td></tr>\n</tbody>\n</table>\n\n<h3>5.2 Strategi Umum</h3>\n<ol>\n<li><strong>Tidak ada penalti</strong> — Jawab semua soal, jangan ada yang kosong</li>\n<li><strong>Kerjakan yang mudah dulu</strong> — Scan soal, kerjakan yang familiar, tandai yang sulit</li>\n<li><strong>Eliminasi opsi</strong> — Biasanya 2 dari 5 opsi jelas tidak relevan</li>\n<li><strong>Jangan terpaku</strong> — Jika >2 menit di satu soal, tandai dan lanjut</li>\n<li><strong>Cek ulang</strong> — Gunakan sisa waktu untuk mengecek jawaban yang ditandai</li>\n</ol>\n\n<h3>5.3 Persiapan H-1</h3>\n<ul>\n<li>Tidur cukup (7-8 jam)</li>\n<li>Siapkan dokumen (KTP, kartu peserta)</li>\n<li>Datang 60 menit sebelum jadwal</li>\n<li>Jangan belajar materi baru, cukup review catatan ringkas</li>\n</ul>\n\n<h2>Sumber Belajar Resmi</h2>\n<ul>\n<li>Portal SNPMB: snpmb.bppp.kemdikbud.go.id</li>\n<li>Bank soal dan try out UTBK di platform Toutopia</li>\n</ul>\n    ",
      "pdfUrl": null,
      "coverImage": null,
      "category": "UTBK",
      "tags": [
        "utbk",
        "snbt",
        "tps",
        "literasi",
        "penmat"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-01-10T00:00:00.000Z",
      "pageCount": 45
    },
    {
      "title": "Panduan Materi SKD CPNS: TWK, TIU, TKP",
      "slug": "panduan-materi-skd-cpns-twk-tiu-tkp",
      "description": "Materi lengkap persiapan SKD CPNS meliputi TWK (Pancasila, UUD, NKRI), TIU (verbal, numerik, figural), dan TKP (6 dimensi). Dilengkapi contoh soal dan strategi skor maksimal.",
      "contentType": "HTML",
      "htmlContent": "\n<h2>Pendahuluan</h2>\n<p>Seleksi Kompetensi Dasar (SKD) adalah tahap krusial dalam seleksi CPNS yang menggunakan sistem Computer Assisted Test (CAT) dari BKN. Ebook ini menyajikan materi komprehensif untuk ketiga subtes SKD beserta contoh soal dan strategi pengerjaan.</p>\n\n<h2>BAB 1: Tes Wawasan Kebangsaan (TWK) — 30 soal</h2>\n<p>TWK bertujuan menilai penguasaan pengetahuan dan kemampuan mengimplementasikan nilai-nilai kebangsaan. Passing grade: <strong>65 dari 150</strong> (minimal 13 soal benar).</p>\n\n<h3>1.1 Pancasila</h3>\n<h4>Sejarah Perumusan:</h4>\n<ul>\n<li>BPUPKI bersidang 29 Mei – 1 Juni 1945</li>\n<li>Pidato Ir. Soekarno tentang dasar negara: 1 Juni 1945 (Hari Lahir Pancasila)</li>\n<li>Panitia Sembilan merumuskan Piagam Jakarta: 22 Juni 1945</li>\n<li>Perubahan \"Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya\" menjadi \"Ketuhanan Yang Maha Esa\": 18 Agustus 1945</li>\n</ul>\n\n<h4>5 Sila dan Butir Pengamalan (45 butir):</h4>\n<ol>\n<li><strong>Ketuhanan Yang Maha Esa</strong> (7 butir) — Percaya dan takwa kepada Tuhan YME, toleransi antarumat beragama, tidak memaksakan agama</li>\n<li><strong>Kemanusiaan yang Adil dan Beradab</strong> (10 butir) — Mengakui persamaan derajat, menjunjung nilai kemanusiaan, tenggang rasa</li>\n<li><strong>Persatuan Indonesia</strong> (7 butir) — Mengutamakan kepentingan bangsa, cinta tanah air, rela berkorban</li>\n<li><strong>Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan</strong> (10 butir) — Musyawarah mufakat, mengutamakan kepentingan bersama</li>\n<li><strong>Keadilan Sosial bagi Seluruh Rakyat Indonesia</strong> (11 butir) — Gotong royong, adil, tidak bermewah-mewahan</li>\n</ol>\n\n<h4>Contoh Soal Pancasila:</h4>\n<blockquote>\n<p>Sila Pancasila yang mengandung makna bahwa bangsa Indonesia mengakui persamaan derajat, hak, dan kewajiban setiap manusia adalah...<br>\nA. Sila ke-1 &nbsp; B. Sila ke-2 &nbsp; C. Sila ke-3 &nbsp; D. Sila ke-4 &nbsp; E. Sila ke-5</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Sila ke-2 (Kemanusiaan yang Adil dan Beradab).</p>\n\n<h3>1.2 UUD 1945</h3>\n<h4>Struktur UUD 1945:</h4>\n<ul>\n<li><strong>Pembukaan</strong> — 4 alinea (tidak dapat diubah karena mengandung Pancasila)</li>\n<li><strong>Batang Tubuh</strong> — 37 pasal (setelah amandemen: 73 pasal, 194 ayat, 3 pasal aturan peralihan, 2 pasal aturan tambahan)</li>\n</ul>\n\n<h4>Pasal-Pasal Kunci:</h4>\n<table>\n<thead><tr><th>Pasal</th><th>Isi</th></tr></thead>\n<tbody>\n<tr><td>Pasal 1</td><td>Bentuk negara kesatuan, republik, kedaulatan rakyat</td></tr>\n<tr><td>Pasal 27</td><td>Persamaan hak di depan hukum dan pemerintahan</td></tr>\n<tr><td>Pasal 28A-J</td><td>Hak Asasi Manusia (amandemen kedua)</td></tr>\n<tr><td>Pasal 29</td><td>Negara berdasar Ketuhanan YME, kebebasan beragama</td></tr>\n<tr><td>Pasal 31</td><td>Hak pendidikan, wajib belajar</td></tr>\n<tr><td>Pasal 33</td><td>Perekonomian nasional berdasar demokrasi ekonomi</td></tr>\n<tr><td>Pasal 34</td><td>Fakir miskin dipelihara negara</td></tr>\n</tbody>\n</table>\n\n<h3>1.3 NKRI & Bhinneka Tunggal Ika</h3>\n<ul>\n<li><strong>NKRI</strong> ditetapkan dalam Pasal 1 ayat 1 UUD 1945. Otonomi daerah diatur UU No. 23/2014.</li>\n<li><strong>Bhinneka Tunggal Ika</strong> berasal dari kitab Sutasoma karya Mpu Tantular. Bermakna \"Berbeda-beda tetapi tetap satu jua.\"</li>\n</ul>\n\n<h3>1.4 UU ASN (No. 20/2023)</h3>\n<p>Poin penting UU ASN yang sering ditanyakan:</p>\n<ul>\n<li>ASN terdiri dari PNS dan PPPK</li>\n<li>Nilai dasar ASN: BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif)</li>\n<li>Kode etik dan kode perilaku ASN</li>\n<li>Netralitas ASN dalam politik</li>\n<li>Manajemen talenta nasional</li>\n</ul>\n\n<h4>Contoh Soal UU ASN:</h4>\n<blockquote>\n<p>Berdasarkan UU ASN, nilai dasar seorang ASN yang mencerminkan sikap konsisten dalam perkataan dan perbuatan serta bertanggung jawab atas setiap tindakan adalah...<br>\nA. Kompeten &nbsp; B. Harmonis &nbsp; C. Akuntabel &nbsp; D. Loyal &nbsp; E. Adaptif</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Akuntabel = bertanggung jawab atas tindakan dan keputusan.</p>\n\n<h2>BAB 2: Tes Intelegensi Umum (TIU) — 35 soal</h2>\n<p>TIU mengukur kemampuan kognitif. Passing grade: <strong>80 dari 175</strong> (minimal 16 soal benar).</p>\n\n<h3>2.1 Verbal</h3>\n\n<h4>Sinonim (Persamaan Kata):</h4>\n<table>\n<thead><tr><th>Kata</th><th>Sinonim</th></tr></thead>\n<tbody>\n<tr><td>Absolut</td><td>Mutlak</td></tr>\n<tr><td>Ambigu</td><td>Bermakna ganda</td></tr>\n<tr><td>Anomali</td><td>Penyimpangan</td></tr>\n<tr><td>Deduksi</td><td>Penyimpulan dari umum ke khusus</td></tr>\n<tr><td>Eksplisit</td><td>Tersurat, gamblang</td></tr>\n<tr><td>Implisit</td><td>Tersirat</td></tr>\n<tr><td>Konvergensi</td><td>Pemusatan/penggabungan</td></tr>\n<tr><td>Paradoks</td><td>Pertentangan</td></tr>\n<tr><td>Pragmatis</td><td>Berdasarkan kenyataan</td></tr>\n<tr><td>Redundan</td><td>Berlebihan/mubazir</td></tr>\n</tbody>\n</table>\n\n<h4>Antonim (Lawan Kata):</h4>\n<table>\n<thead><tr><th>Kata</th><th>Antonim</th></tr></thead>\n<tbody>\n<tr><td>Abstrak</td><td>Konkret</td></tr>\n<tr><td>Homogen</td><td>Heterogen</td></tr>\n<tr><td>Mayor</td><td>Minor</td></tr>\n<tr><td>Optimis</td><td>Pesimis</td></tr>\n<tr><td>Statis</td><td>Dinamis</td></tr>\n</tbody>\n</table>\n\n<h4>Analogi:</h4>\n<p>Pola hubungan yang sering muncul: sinonim, antonim, bagian-keseluruhan, alat-fungsi, sebab-akibat, pelaku-hasil.</p>\n<blockquote>\n<p>Pilot : Pesawat = ... : ...<br>\nA. Nahkoda : Laut &nbsp; B. Masinis : Kereta &nbsp; C. Dokter : Rumah Sakit &nbsp; D. Guru : Murid &nbsp; E. Petani : Sawah</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Hubungan: operator - kendaraan yang dioperasikan.</p>\n\n<h3>2.2 Numerik</h3>\n\n<h4>Deret Angka — Pola Umum:</h4>\n<ul>\n<li><strong>Deret aritmatika</strong>: selisih tetap (2, 5, 8, 11, 14...)</li>\n<li><strong>Deret geometri</strong>: rasio tetap (3, 6, 12, 24...)</li>\n<li><strong>Deret bertingkat</strong>: selisih membentuk deret baru (1, 2, 4, 7, 11... → selisih: 1, 2, 3, 4...)</li>\n<li><strong>Deret Fibonacci</strong>: jumlah dua suku sebelumnya (1, 1, 2, 3, 5, 8...)</li>\n<li><strong>Deret campuran</strong>: kombinasi operasi berbeda</li>\n</ul>\n\n<h4>Contoh Soal Aritmatika:</h4>\n<blockquote>\n<p>Sebuah toko memberikan diskon 20% untuk pembelian pertama dan tambahan diskon 10% untuk total setelah diskon pertama. Jika harga barang Rp500.000, berapakah harga yang harus dibayar?<br>\nA. Rp350.000 &nbsp; B. Rp360.000 &nbsp; C. Rp375.000 &nbsp; D. Rp380.000 &nbsp; E. Rp400.000</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Diskon 20%: 500.000 × 0.8 = 400.000. Diskon 10%: 400.000 × 0.9 = 360.000.</p>\n\n<h3>2.3 Figural</h3>\n<p>Soal figural menguji kemampuan mengenali pola visual: rotasi, pencerminan, penambahan/pengurangan elemen, dan pengelompokan. Tips: perhatikan perubahan pada posisi, jumlah, ukuran, dan arah elemen dalam gambar.</p>\n\n<h3>2.4 Silogisme</h3>\n<blockquote>\n<p>Semua bunga mawar berduri. Sebagian tanaman hias adalah bunga mawar. Kesimpulan yang tepat adalah...<br>\nA. Semua tanaman hias berduri<br>\nB. Sebagian tanaman hias berduri<br>\nC. Tidak ada tanaman hias yang berduri<br>\nD. Semua yang berduri adalah tanaman hias<br>\nE. Sebagian bunga mawar bukan tanaman hias</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Sebagian tanaman hias = bunga mawar, dan semua bunga mawar berduri, maka sebagian tanaman hias berduri.</p>\n\n<h2>BAB 3: Tes Karakteristik Pribadi (TKP) — 45 soal</h2>\n<p>TKP menggunakan skor 1-5 per soal (bukan benar/salah). Passing grade: <strong>166 dari 225</strong>. Ini subtes yang paling mudah dimaksimalkan.</p>\n\n<h3>3.1 Enam Dimensi TKP</h3>\n\n<h4>1. Pelayanan Publik</h4>\n<p>Mengukur kemampuan melayani masyarakat dengan baik. Jawaban skor tinggi: proaktif, responsif, empati tinggi, memberikan solusi.</p>\n\n<h4>2. Jejaring Kerja</h4>\n<p>Mengukur kemampuan membangun dan memelihara hubungan kerja. Jawaban skor tinggi: inisiatif berkolaborasi, komunikatif, membangun trust.</p>\n\n<h4>3. Sosial Budaya</h4>\n<p>Mengukur kepekaan terhadap keberagaman. Jawaban skor tinggi: toleran, menghargai perbedaan, menjaga harmoni.</p>\n\n<h4>4. Teknologi Informasi dan Komunikasi</h4>\n<p>Mengukur keterbukaan terhadap teknologi. Jawaban skor tinggi: antusias belajar teknologi baru, memanfaatkan IT untuk efisiensi.</p>\n\n<h4>5. Profesionalisme</h4>\n<p>Mengukur dedikasi dan integritas. Jawaban skor tinggi: berintegritas, bertanggung jawab, disiplin, mengutamakan tugas.</p>\n\n<h4>6. Anti-Radikalisme</h4>\n<p>Mengukur sikap moderat dan nasionalis. Jawaban skor tinggi: menolak radikalisme, mendukung moderasi, bijak menggunakan media sosial.</p>\n\n<h3>3.2 Pola Jawaban Skor 5 (Tertinggi)</h3>\n<ul>\n<li>Menunjukkan <strong>inisiatif</strong> (bukan menunggu perintah)</li>\n<li>Mengutamakan <strong>kepentingan bersama/organisasi</strong></li>\n<li>Mencari <strong>win-win solution</strong></li>\n<li>Bersikap <strong>profesional dan etis</strong></li>\n<li><strong>Tidak konfrontatif</strong> — cari jalan tengah</li>\n</ul>\n\n<h4>Contoh Soal TKP:</h4>\n<blockquote>\n<p>Anda mendapati rekan kerja melakukan kesalahan prosedur yang berdampak pada pelayanan publik. Apa yang Anda lakukan?<br>\nA. Melaporkan langsung ke atasan tanpa memberitahu rekan<br>\nB. Mengingatkan rekan secara pribadi dan membantu memperbaiki<br>\nC. Membiarkan karena bukan tanggung jawab Anda<br>\nD. Membicarakan dengan rekan lain<br>\nE. Menunggu sampai ada dampak yang lebih besar</p>\n</blockquote>\n<p><strong>Jawaban skor 5: B.</strong> Menunjukkan kepedulian, inisiatif, dan pendekatan yang bijak.</p>\n\n<h2>BAB 4: Strategi Lulus SKD</h2>\n\n<h3>4.1 Target Skor Ideal</h3>\n<table>\n<thead><tr><th>Subtes</th><th>PG</th><th>Target Aman</th><th>Target Kompetitif</th></tr></thead>\n<tbody>\n<tr><td>TWK</td><td>65</td><td>100+</td><td>120+</td></tr>\n<tr><td>TIU</td><td>80</td><td>110+</td><td>130+</td></tr>\n<tr><td>TKP</td><td>166</td><td>180+</td><td>200+</td></tr>\n<tr><td><strong>Total</strong></td><td><strong>311</strong></td><td><strong>390+</strong></td><td><strong>450+</strong></td></tr>\n</tbody>\n</table>\n\n<h3>4.2 Urutan Prioritas Belajar</h3>\n<ol>\n<li><strong>TKP (paling mudah dimaksimalkan)</strong> — Pahami pola skor 5, latih 200+ soal</li>\n<li><strong>TWK (hafalan)</strong> — Fokus Pancasila, UUD, UU ASN</li>\n<li><strong>TIU (butuh latihan intensif)</strong> — Deret, aritmatika, silogisme setiap hari</li>\n</ol>\n\n<h3>4.3 Manajemen Waktu Ujian</h3>\n<p>Total 110 soal dalam 100 menit = ~55 detik per soal. Strategi: TKP cukup 30 detik/soal (paling cepat), gunakan sisa waktu untuk TIU.</p>\n    ",
      "pdfUrl": null,
      "coverImage": null,
      "category": "CPNS",
      "tags": [
        "cpns",
        "skd",
        "twk",
        "tiu",
        "tkp"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-01-15T00:00:00.000Z",
      "pageCount": 60
    },
    {
      "title": "Materi Rekrutmen BUMN: TKD, AKHLAK, & English",
      "slug": "materi-rekrutmen-bumn-tkd-akhlak-english",
      "description": "Panduan materi rekrutmen bersama BUMN meliputi TKD (verbal, numerik, logika), Core Values AKHLAK, TWK, English Test, dan Learning Agility.",
      "contentType": "HTML",
      "htmlContent": "\n<h2>Pendahuluan</h2>\n<p>Rekrutmen Bersama BUMN merupakan seleksi terpadu untuk mengisi posisi di berbagai Badan Usaha Milik Negara Indonesia. Dikoordinasikan oleh Forum Human Capital Indonesia (FHCI), seleksi ini memiliki format yang unik dan berbeda dari CPNS. Ebook ini menyajikan materi lengkap untuk setiap tahap seleksi.</p>\n\n<h2>BAB 1: TKD BUMN (Tes Kemampuan Dasar)</h2>\n<p>TKD BUMN menguji kemampuan dasar dengan konteks yang lebih mengarah pada dunia bisnis dan korporasi.</p>\n\n<h3>1.1 Verbal — 30 soal</h3>\n<p>Soal verbal BUMN memiliki keunikan: teks bacaan sering bertemakan ekonomi, bisnis, dan korporasi.</p>\n\n<h4>Tipe Soal:</h4>\n<ul>\n<li><strong>Sinonim/Antonim</strong> — Kosakata formal dan istilah bisnis</li>\n<li><strong>Analogi</strong> — Hubungan konseptual, sering konteks bisnis</li>\n<li><strong>Pemahaman Bacaan</strong> — Teks tentang ekonomi, manajemen, strategi bisnis</li>\n</ul>\n\n<h4>Kosakata Bisnis yang Sering Muncul:</h4>\n<table>\n<thead><tr><th>Kata</th><th>Arti</th></tr></thead>\n<tbody>\n<tr><td>Akuisisi</td><td>Pengambilalihan perusahaan</td></tr>\n<tr><td>Diversifikasi</td><td>Penganekaragaman produk/investasi</td></tr>\n<tr><td>Likuiditas</td><td>Kemampuan membayar kewajiban jangka pendek</td></tr>\n<tr><td>Merger</td><td>Penggabungan perusahaan</td></tr>\n<tr><td>Solvensi</td><td>Kemampuan membayar semua kewajiban</td></tr>\n<tr><td>Sinergi</td><td>Kerja sama yang menghasilkan output lebih besar</td></tr>\n<tr><td>Stakeholder</td><td>Pemangku kepentingan</td></tr>\n<tr><td>Sustainability</td><td>Keberlanjutan</td></tr>\n</tbody>\n</table>\n\n<h3>1.2 Numerik — 30 soal</h3>\n<p>Soal numerik BUMN sering menggunakan konteks keuangan dan bisnis.</p>\n\n<h4>Tipe Soal Numerik:</h4>\n<ul>\n<li><strong>Aritmatika bisnis</strong> — Margin keuntungan, break-even point, ROI sederhana</li>\n<li><strong>Persentase</strong> — Kenaikan/penurunan harga, diskon bertingkat</li>\n<li><strong>Rasio keuangan</strong> — Perbandingan sederhana antar komponen</li>\n<li><strong>Deret angka</strong> — Pola aritmatika, geometri, campuran</li>\n</ul>\n\n<h4>Contoh Soal:</h4>\n<blockquote>\n<p>Sebuah perusahaan memiliki pendapatan Rp2 miliar dan biaya operasional Rp1.4 miliar. Jika pajak 25% dari laba, berapakah laba bersih?<br>\nA. Rp350 juta &nbsp; B. Rp400 juta &nbsp; C. Rp450 juta &nbsp; D. Rp500 juta &nbsp; E. Rp600 juta</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Laba kotor = 2M - 1.4M = 600 juta. Pajak = 25% × 600 juta = 150 juta. Laba bersih = 600 - 150 = 450 juta.</p>\n\n<h3>1.3 Logika — 40 soal</h3>\n<ul>\n<li><strong>Penalaran analitis</strong> — Urutan, posisi, penjadwalan</li>\n<li><strong>Silogisme</strong> — Penarikan kesimpulan dari premis</li>\n<li><strong>Figural</strong> — Pola gambar, rotasi, cermin</li>\n<li><strong>Deret</strong> — Pola angka dan huruf</li>\n</ul>\n\n<h2>BAB 2: Core Values AKHLAK</h2>\n<p>AKHLAK adalah budaya kerja BUMN yang ditetapkan oleh Menteri BUMN. Soal AKHLAK berformat SJT (Situational Judgment Test).</p>\n\n<h3>2.1 Enam Nilai AKHLAK</h3>\n\n<h4>A — Amanah</h4>\n<p><strong>Definisi:</strong> Memegang teguh kepercayaan yang diberikan.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Memenuhi janji dan komitmen</li>\n<li>Bertanggung jawab atas tugas, keputusan, dan tindakan</li>\n<li>Berpegang teguh pada nilai moral dan etika</li>\n</ul>\n<p><strong>Contoh Situasi:</strong> Atasan menitipkan proyek penting saat cuti. Jawaban AKHLAK: menyelesaikan dengan penuh tanggung jawab dan melaporkan hasilnya.</p>\n\n<h4>K — Kompeten</h4>\n<p><strong>Definisi:</strong> Terus belajar dan mengembangkan kapabilitas.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Meningkatkan kompetensi diri secara mandiri</li>\n<li>Membantu orang lain belajar (sharing knowledge)</li>\n<li>Menyelesaikan tugas dengan kualitas terbaik</li>\n</ul>\n\n<h4>H — Harmonis</h4>\n<p><strong>Definisi:</strong> Saling peduli dan menghargai perbedaan.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Menghargai keberagaman</li>\n<li>Suka menolong dan memberikan dampak positif</li>\n<li>Membangun lingkungan kerja yang kondusif</li>\n</ul>\n\n<h4>L — Loyal</h4>\n<p><strong>Definisi:</strong> Berdedikasi dan mengutamakan kepentingan organisasi.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Menjaga nama baik organisasi</li>\n<li>Rela berkorban untuk kepentingan organisasi</li>\n<li>Patuh pada peraturan yang berlaku</li>\n</ul>\n\n<h4>A — Adaptif</h4>\n<p><strong>Definisi:</strong> Terus berinovasi dan antusias menghadapi perubahan.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Cepat menyesuaikan diri dengan perubahan</li>\n<li>Terus-menerus melakukan perbaikan</li>\n<li>Bertindak proaktif menghadapi tantangan</li>\n</ul>\n\n<h4>K — Kolaboratif</h4>\n<p><strong>Definisi:</strong> Membangun kerjasama yang sinergis.</p>\n<p><strong>Perilaku Utama:</strong></p>\n<ul>\n<li>Memberi kesempatan berbagai pihak untuk berkontribusi</li>\n<li>Terbuka dalam bekerja sama</li>\n<li>Menggerakkan pemanfaatan sumber daya bersama</li>\n</ul>\n\n<h4>Contoh Soal AKHLAK:</h4>\n<blockquote>\n<p>Tim Anda gagal memenuhi target kuartal. Sebagai team leader, Anda...<br>\nA. Menyalahkan anggota tim yang kinerjanya buruk<br>\nB. Menganalisis penyebab, menyusun action plan bersama tim, dan melaporkan ke atasan<br>\nC. Menunggu evaluasi dari atasan<br>\nD. Meminta penambahan anggota tim<br>\nE. Mengerjakan sendiri agar target tercapai</p>\n</blockquote>\n<p><strong>Jawaban skor tertinggi: B.</strong> Menunjukkan nilai Amanah (bertanggung jawab), Kompeten (menganalisis), dan Kolaboratif (bersama tim).</p>\n\n<h2>BAB 3: English Test</h2>\n<p>English test rekrutmen BUMN mengikuti format mirip TOEFL ITP.</p>\n\n<h3>3.1 Structure & Written Expression</h3>\n<p>Menguji penguasaan grammar bahasa Inggris. Tipe soal:</p>\n<ul>\n<li><strong>Sentence completion</strong> — Melengkapi kalimat dengan grammar yang benar</li>\n<li><strong>Error identification</strong> — Mengidentifikasi bagian kalimat yang salah secara grammar</li>\n</ul>\n\n<h4>Grammar yang sering diujikan:</h4>\n<ul>\n<li>Subject-verb agreement</li>\n<li>Tenses (present perfect vs simple past)</li>\n<li>Conditional sentences (if clauses)</li>\n<li>Relative clauses (who, which, that)</li>\n<li>Passive voice</li>\n<li>Gerund vs Infinitive</li>\n</ul>\n\n<h4>Contoh Soal:</h4>\n<blockquote>\n<p>Neither the manager nor the employees ___ aware of the policy change.<br>\nA. is &nbsp; B. are &nbsp; C. was &nbsp; D. has been &nbsp; E. have been</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Dengan \"neither...nor\", verb mengikuti subjek terdekat (employees = plural → are).</p>\n\n<h3>3.2 Reading Comprehension</h3>\n<p>Teks bacaan bertema bisnis, ekonomi, dan umum. Tipe pertanyaan: main idea, detail, inference, vocabulary in context.</p>\n\n<h3>3.3 Vocabulary</h3>\n<p>Kosakata dalam konteks kalimat. Fokus pada kata-kata yang sering muncul di lingkungan bisnis.</p>\n\n<h2>BAB 4: Learning Agility</h2>\n<p>Learning Agility mengukur kemampuan belajar dari pengalaman dan menerapkannya di situasi baru.</p>\n\n<h3>5 Aspek Learning Agility:</h3>\n<table>\n<thead><tr><th>Aspek</th><th>Deskripsi</th><th>Contoh Perilaku</th></tr></thead>\n<tbody>\n<tr><td>Mental Agility</td><td>Berpikir kritis dan menangani kompleksitas</td><td>Melihat masalah dari berbagai sudut pandang</td></tr>\n<tr><td>Change Agility</td><td>Keterbukaan terhadap perubahan</td><td>Mengusulkan cara baru yang lebih efisien</td></tr>\n<tr><td>People Agility</td><td>Keterampilan interpersonal</td><td>Memahami motivasi dan kebutuhan orang lain</td></tr>\n<tr><td>Results Agility</td><td>Berorientasi hasil dalam situasi baru</td><td>Tetap deliver hasil meski dalam situasi penuh tekanan</td></tr>\n<tr><td>Self-Awareness</td><td>Mengenali kekuatan dan kelemahan</td><td>Menerima feedback dan menggunakannya untuk berkembang</td></tr>\n</tbody>\n</table>\n\n<h2>BAB 5: Strategi Persiapan</h2>\n<ol>\n<li><strong>Pelajari profil BUMN target</strong> — Visi, misi, core business, annual report</li>\n<li><strong>Latih TKD dengan konteks bisnis</strong> — Gunakan soal-soal yang berkaitan dengan ekonomi dan keuangan</li>\n<li><strong>Hafalkan 6 nilai AKHLAK</strong> — Beserta definisi, perilaku utama, dan contoh penerapan</li>\n<li><strong>Tingkatkan English</strong> — Fokus grammar dan reading, target setara TOEFL 450+</li>\n<li><strong>Simulasi lengkap</strong> — Gunakan try out BUMN di Toutopia</li>\n</ol>\n    ",
      "pdfUrl": null,
      "coverImage": null,
      "category": "BUMN",
      "tags": [
        "bumn",
        "tkd",
        "akhlak",
        "english",
        "learning-agility"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-01-20T00:00:00.000Z",
      "pageCount": 50
    },
    {
      "title": "Panduan Seleksi Sekolah Kedinasan: STAN, STIS, IPDN, STIN",
      "slug": "panduan-seleksi-sekolah-kedinasan",
      "description": "Panduan lengkap seleksi masuk sekolah kedinasan populer meliputi PKN STAN, STIS, IPDN, dan STIN. Termasuk struktur tes, sistem penalti, contoh soal, dan strategi per sekolah.",
      "contentType": "HTML",
      "htmlContent": "\n<h2>Pendahuluan</h2>\n<p>Sekolah Kedinasan adalah lembaga pendidikan tinggi di bawah kementerian/lembaga pemerintah. Keunggulan utama: biaya pendidikan gratis (ditanggung negara), mendapat uang saku bulanan, dan jaminan penempatan kerja sebagai ASN setelah lulus. Kompetisi masuk sangat ketat — tingkat penerimaan hanya 1-5% dari total pendaftar.</p>\n\n<h2>BAB 1: PKN STAN (Politeknik Keuangan Negara STAN)</h2>\n\n<h3>1.1 Profil</h3>\n<p>Di bawah Kementerian Keuangan. Lulusan ditempatkan di unit kerja Kemenkeu: DJP (Direktorat Jenderal Pajak), DJBC (Bea Cukai), DJPB (Perbendaharaan), DJKN (Kekayaan Negara), BPK, dan lainnya.</p>\n\n<h3>1.2 Tahap Seleksi</h3>\n<ol>\n<li><strong>SKD (CAT BKN)</strong> — TWK, TIU, TKP dengan passing grade standar CPNS</li>\n<li><strong>TPA (Tes Potensi Akademik)</strong> — Soal khusus STAN</li>\n<li><strong>TBI (Tes Bahasa Inggris)</strong> — Grammar dan reading</li>\n</ol>\n\n<h3>1.3 TPA STAN — Format dan Materi</h3>\n<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>\n<p>Materi TPA STAN:</p>\n<ul>\n<li><strong>Sinonim/Antonim</strong> — Kosakata formal dan akademis</li>\n<li><strong>Analogi</strong> — Hubungan kata yang kompleks</li>\n<li><strong>Deret Angka</strong> — Pola aritmatika, geometri, Fibonacci, bertingkat</li>\n<li><strong>Geometri</strong> — Bangun datar, ruang, sudut, jaring-jaring</li>\n<li><strong>Logika</strong> — Penalaran deduktif, silogisme</li>\n</ul>\n\n<h4>Contoh Soal TPA STAN — Deret:</h4>\n<blockquote>\n<p>2, 3, 5, 8, 13, 21, ...<br>\nA. 29 &nbsp; B. 31 &nbsp; C. 34 &nbsp; D. 37 &nbsp; E. 42</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Pola Fibonacci: setiap angka = jumlah dua angka sebelumnya. 13 + 21 = 34.</p>\n\n<h4>Contoh Soal TPA STAN — Geometri:</h4>\n<blockquote>\n<p>Sebuah balok memiliki panjang 8 cm, lebar 6 cm, dan tinggi 4 cm. Berapakah panjang diagonal ruang balok?<br>\nA. √96 &nbsp; B. √100 &nbsp; C. √116 &nbsp; D. √120 &nbsp; E. √136</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Diagonal ruang = √(8²+6²+4²) = √(64+36+16) = √116.</p>\n\n<h3>1.4 TBI STAN — Format dan Materi</h3>\n<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>\n<ul>\n<li><strong>Grammar</strong> — Tenses, agreement, conditional, passive, relative clause</li>\n<li><strong>Reading</strong> — Teks pendek, vocabulary in context, main idea, detail</li>\n</ul>\n\n<h4>Contoh Soal TBI STAN:</h4>\n<blockquote>\n<p>If I ___ the answer, I would have told you.<br>\nA. know &nbsp; B. knew &nbsp; C. had known &nbsp; D. have known &nbsp; E. would know</p>\n</blockquote>\n<p><strong>Jawaban: C.</strong> Conditional type 3: If + past perfect, would have + past participle.</p>\n\n<h3>1.5 Strategi STAN (ada penalti)</h3>\n<ol>\n<li><strong>Jangan asal jawab!</strong> Karena salah -1, jawab hanya jika yakin atau bisa eliminasi minimal 2 opsi</li>\n<li>Jika bisa eliminasi 2 dari 5 opsi, probabilitas benar = 1/3. Expected value = (1/3)(+4) + (2/3)(-1) = +0.67 → JAWAB</li>\n<li>Jika hanya bisa eliminasi 1 opsi, expected value = (1/4)(+4) + (3/4)(-1) = +0.25 → masih layak dijawab</li>\n<li>Jika sama sekali tidak tahu (tebak murni): expected value = (1/5)(+4) + (4/5)(-1) = 0 → KOSONGKAN</li>\n</ol>\n\n<h2>BAB 2: STIS (Sekolah Tinggi Ilmu Statistik)</h2>\n\n<h3>2.1 Profil</h3>\n<p>Di bawah BPS (Badan Pusat Statistik). Program studi: Statistika, Komputasi Statistik. Lulusan ditempatkan di kantor BPS seluruh Indonesia.</p>\n\n<h3>2.2 Tahap Seleksi</h3>\n<ol>\n<li><strong>SKD (CAT BKN)</strong></li>\n<li><strong>Matematika</strong> — Lebih sulit dari TPA STAN</li>\n<li><strong>Bahasa Inggris</strong></li>\n</ol>\n\n<h3>2.3 Matematika STIS</h3>\n<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>\n<p>Materi:</p>\n<ul>\n<li><strong>Aljabar</strong> — Persamaan, pertidaksamaan, fungsi, logaritma</li>\n<li><strong>Statistika</strong> — Mean, median, modus, simpangan, distribusi frekuensi</li>\n<li><strong>Peluang</strong> — Peluang kejadian, permutasi, kombinasi, distribusi binomial</li>\n<li><strong>Kalkulus Dasar</strong> — Limit, turunan, integral sederhana</li>\n<li><strong>Program Linear</strong> — Fungsi objektif, kendala, daerah feasible, solusi optimal</li>\n</ul>\n\n<h4>Contoh Soal Matematika STIS — Peluang:</h4>\n<blockquote>\n<p>Dari 10 kartu bernomor 1-10, diambil 2 kartu sekaligus. Peluang keduanya bernomor genap adalah...<br>\nA. 1/9 &nbsp; B. 2/9 &nbsp; C. 1/3 &nbsp; D. 4/9 &nbsp; E. 5/9</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Kartu genap: 2,4,6,8,10 (5 buah). C(5,2)/C(10,2) = 10/45 = 2/9.</p>\n\n<h4>Contoh Soal Matematika STIS — Kalkulus:</h4>\n<blockquote>\n<p>Jika f(x) = 3x² - 4x + 1, maka f'(2) = ...<br>\nA. 6 &nbsp; B. 8 &nbsp; C. 10 &nbsp; D. 12 &nbsp; E. 14</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> f'(x) = 6x - 4. f'(2) = 12 - 4 = 8.</p>\n\n<h2>BAB 3: IPDN (Institut Pemerintahan Dalam Negeri)</h2>\n\n<h3>3.1 Profil</h3>\n<p>Di bawah Kemendagri. Pendidikan semi-militer. Lulusan menjadi Pamong Praja dan ditempatkan di pemerintah daerah seluruh Indonesia.</p>\n\n<h3>3.2 Tahap Seleksi</h3>\n<ol>\n<li><strong>SKD (CAT BKN)</strong> — PG TWK: 75 (lebih tinggi dari umum!), TIU: 80, TKP: 166</li>\n<li><strong>Tes Kesamaptaan</strong> (fisik)</li>\n<li><strong>Tes Kesehatan</strong></li>\n<li><strong>Tes Psikologi</strong></li>\n<li><strong>Wawancara</strong></li>\n</ol>\n\n<h3>3.3 Tes Kesamaptaan IPDN</h3>\n<table>\n<thead><tr><th>Tes</th><th>Standar Pria</th><th>Standar Wanita</th></tr></thead>\n<tbody>\n<tr><td>Lari 12 menit</td><td>Min 2400 meter</td><td>Min 1800 meter</td></tr>\n<tr><td>Pull-up</td><td>Min 8 kali</td><td>Min 15 detik (hang)</td></tr>\n<tr><td>Push-up (1 menit)</td><td>Min 30 kali</td><td>Min 20 kali</td></tr>\n<tr><td>Sit-up (1 menit)</td><td>Min 30 kali</td><td>Min 25 kali</td></tr>\n<tr><td>Shuttle run</td><td>Max 18 detik</td><td>Max 20 detik</td></tr>\n</tbody>\n</table>\n\n<h3>3.4 Persiapan Fisik IPDN</h3>\n<ol>\n<li>Mulai latihan fisik minimal 3 bulan sebelum seleksi</li>\n<li>Latihan lari: mulai dari 1 km, tambah 500m setiap minggu hingga bisa 3+ km</li>\n<li>Pull-up: mulai dengan negative pull-up, progress ke assisted, lalu full pull-up</li>\n<li>Latihan rutin 5 hari/minggu dengan 2 hari recovery</li>\n</ol>\n\n<h2>BAB 4: STIN (Sekolah Tinggi Intelijen Negara)</h2>\n\n<h3>4.1 Profil</h3>\n<p>Di bawah BIN (Badan Intelijen Negara). Paling selektif di antara semua sekolah kedinasan. Lulusan berkarir di bidang intelijen negara.</p>\n\n<h3>4.2 Tahap Seleksi</h3>\n<ol>\n<li>SKD (CAT BKN)</li>\n<li>Tes Akademik</li>\n<li>Tes Kesehatan (sangat ketat)</li>\n<li>Tes Kesamaptaan/Fisik (sangat ketat)</li>\n<li>Tes Psikologi (mendalam)</li>\n<li>Tes Wawancara</li>\n<li>Tes Penelusuran Rekam Jejak</li>\n</ol>\n\n<h3>4.3 Keunikan STIN</h3>\n<ul>\n<li>Seleksi paling panjang (bisa 6+ bulan dari pendaftaran hingga pengumuman)</li>\n<li>Tes fisik meliputi renang, lari, dan tes ketahanan</li>\n<li>Psikologi sangat mendalam — termasuk lie detector</li>\n<li>Penelusuran rekam jejak hingga keluarga</li>\n</ul>\n\n<h2>BAB 5: Tabel Perbandingan Lengkap</h2>\n<table>\n<thead><tr><th>Aspek</th><th>PKN STAN</th><th>STIS</th><th>IPDN</th><th>STIN</th></tr></thead>\n<tbody>\n<tr><td>Kementerian</td><td>Kemenkeu</td><td>BPS</td><td>Kemendagri</td><td>BIN</td></tr>\n<tr><td>Tes Khusus</td><td>TPA + TBI</td><td>Mat + Eng</td><td>Kesamaptaan</td><td>Fisik + Psikologi</td></tr>\n<tr><td>Penalti</td><td>Ya (+4/-1)</td><td>Ya (+4/-1)</td><td>Tidak</td><td>Tidak</td></tr>\n<tr><td>Tes Fisik</td><td>Tidak</td><td>Tidak</td><td>Ya (ketat)</td><td>Ya (sangat ketat)</td></tr>\n<tr><td>PG TWK</td><td>65</td><td>65</td><td>75</td><td>65</td></tr>\n<tr><td>Semi-Militer</td><td>Tidak</td><td>Tidak</td><td>Ya</td><td>Ya</td></tr>\n<tr><td>Ikatan Dinas</td><td>2× masa studi</td><td>2× masa studi</td><td>10 tahun</td><td>10 tahun</td></tr>\n<tr><td>Tingkat Seleksi</td><td>Ketat</td><td>Ketat</td><td>Sangat ketat</td><td>Paling ketat</td></tr>\n</tbody>\n</table>\n\n<h2>BAB 6: Strategi per Sekolah</h2>\n<h3>STAN:</h3>\n<p>Fokus utama TPA dan TBI. Latih deret angka dan grammar intensif. Pahami sistem penalti — jangan tebak murni.</p>\n<h3>STIS:</h3>\n<p>Kuasai kalkulus dasar dan statistika. Latih soal program linear. Kemampuan matematika harus kuat.</p>\n<h3>IPDN:</h3>\n<p>Selain SKD, persiapan fisik sangat penting. TWK passing grade lebih tinggi (75) — perbanyak hafalan.</p>\n<h3>STIN:</h3>\n<p>Persiapan menyeluruh: akademik + fisik + mental. Pastikan rekam jejak bersih. Paling membutuhkan persiapan komprehensif.</p>\n    ",
      "pdfUrl": null,
      "coverImage": null,
      "category": "Kedinasan",
      "tags": [
        "kedinasan",
        "stan",
        "stis",
        "ipdn",
        "stin",
        "tpa",
        "tbi"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-01-25T00:00:00.000Z",
      "pageCount": 55
    },
    {
      "title": "Materi Seleksi PPPK: Guru, Teknis, & Nakes",
      "slug": "materi-seleksi-pppk-guru-teknis-nakes",
      "description": "Materi lengkap seleksi PPPK mencakup kompetensi teknis (guru, teknis, nakes), manajerial, sosiokultural, dan wawancara. Dilengkapi contoh soal dan strategi per formasi.",
      "contentType": "HTML",
      "htmlContent": "\n<h2>Pendahuluan</h2>\n<p>Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) adalah ASN berdasarkan UU No. 20/2023. Seleksi PPPK memiliki format unik yang berbeda dari CPNS: tidak ada TWK/TIU/TKP, melainkan fokus pada kompetensi teknis sesuai jabatan. Ebook ini menyajikan materi lengkap untuk semua formasi PPPK.</p>\n\n<h2>BAB 1: Struktur Seleksi PPPK</h2>\n<table>\n<thead><tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Passing Grade</th><th>Bobot</th></tr></thead>\n<tbody>\n<tr><td>Kompetensi Teknis</td><td>90 soal</td><td>90 menit</td><td>Sesuai formasi</td><td>Terbesar</td></tr>\n<tr><td>Kompetensi Manajerial</td><td>25 soal</td><td>25 menit</td><td>130</td><td>Sedang</td></tr>\n<tr><td>Kompetensi Sosiokultural</td><td>20 soal</td><td>15 menit</td><td>104</td><td>Sedang</td></tr>\n<tr><td>Wawancara</td><td>10 soal</td><td>10 menit</td><td>24</td><td>Kecil</td></tr>\n</tbody>\n</table>\n<p><strong>Penting:</strong> Seleksi PPPK menggunakan sistem <strong>peringkat</strong>, bukan sekadar passing grade. Anda bersaing dengan peserta lain yang melamar formasi yang sama.</p>\n\n<h2>BAB 2: Kompetensi Teknis PPPK Guru</h2>\n<p>Kompetensi teknis guru terdiri dari 3 area utama dengan bobot terbesar dalam seleksi.</p>\n\n<h3>2.1 Kompetensi Pedagogik</h3>\n<p>Mengukur kemampuan mengelola pembelajaran.</p>\n\n<h4>Teori Belajar:</h4>\n<ul>\n<li><strong>Konstruktivisme</strong> (Piaget, Vygotsky) — Siswa membangun pengetahuan sendiri melalui pengalaman. Zone of Proximal Development (ZPD) Vygotsky: area antara kemampuan mandiri dan kemampuan dengan bantuan.</li>\n<li><strong>Behaviorisme</strong> (Skinner, Pavlov) — Belajar melalui stimulus-respons. Reinforcement positif/negatif.</li>\n<li><strong>Kognitivisme</strong> (Bruner, Ausubel) — Belajar melalui proses berpikir. Discovery learning, meaningful learning.</li>\n<li><strong>Humanisme</strong> (Maslow, Rogers) — Belajar yang mempertimbangkan kebutuhan dan emosi siswa. Hierarchy of needs.</li>\n</ul>\n\n<h4>Kurikulum Merdeka:</h4>\n<ul>\n<li><strong>Profil Pelajar Pancasila</strong> — 6 dimensi: Beriman/Bertakwa, Berkebinekaan Global, Gotong Royong, Mandiri, Bernalar Kritis, Kreatif</li>\n<li><strong>Proyek Penguatan Profil Pelajar Pancasila (P5)</strong> — Pembelajaran berbasis proyek lintas mata pelajaran</li>\n<li><strong>Capaian Pembelajaran (CP)</strong> — Menggantikan KI/KD, berbasis fase (bukan kelas)</li>\n<li><strong>Asesmen Diagnostik</strong> — Mengetahui kemampuan awal siswa</li>\n<li><strong>Asesmen Formatif</strong> — Memantau proses belajar</li>\n<li><strong>Asesmen Sumatif</strong> — Mengevaluasi pencapaian di akhir</li>\n</ul>\n\n<h4>Diferensiasi Pembelajaran:</h4>\n<ul>\n<li><strong>Diferensiasi Konten</strong> — Menyesuaikan materi sesuai level siswa</li>\n<li><strong>Diferensiasi Proses</strong> — Menyesuaikan cara belajar (visual, auditori, kinestetik)</li>\n<li><strong>Diferensiasi Produk</strong> — Menyesuaikan bentuk tugas/output</li>\n</ul>\n\n<h4>Contoh Soal Pedagogik:</h4>\n<blockquote>\n<p>Seorang guru menemukan bahwa siswa di kelasnya memiliki kemampuan membaca yang beragam. Beberapa siswa sudah lancar membaca teks kompleks, sementara yang lain masih kesulitan memahami teks sederhana. Pendekatan yang paling tepat adalah...<br>\nA. Menggunakan satu teks yang sama untuk semua siswa<br>\nB. Menyediakan teks dengan tingkat kesulitan berbeda sesuai kemampuan masing-masing siswa<br>\nC. Memfokuskan pembelajaran pada siswa yang tertinggal saja<br>\nD. Memberikan tugas tambahan hanya untuk siswa yang sudah lancar<br>\nE. Meminta siswa yang pandai mengajari temannya tanpa bimbingan guru</p>\n</blockquote>\n<p><strong>Jawaban: B.</strong> Ini adalah diferensiasi konten — menyesuaikan materi sesuai level kemampuan siswa (teaching at the right level).</p>\n\n<h3>2.2 Kompetensi Profesional</h3>\n<p>Menguji penguasaan materi mata pelajaran yang diampu. Soal spesifik per bidang studi:</p>\n<ul>\n<li><strong>Guru Matematika</strong> — Aljabar, geometri, statistika, kalkulus tingkat SMA</li>\n<li><strong>Guru Bahasa Indonesia</strong> — Linguistik, sastra, tata bahasa, EYD/PUEBI</li>\n<li><strong>Guru IPA</strong> — Fisika, kimia, biologi sesuai jenjang</li>\n<li><strong>Guru Bahasa Inggris</strong> — Grammar, literature, language teaching methodology</li>\n</ul>\n\n<h3>2.3 Pedagogical Content Knowledge (PCK)</h3>\n<p>PCK menguji kemampuan mengajarkan materi secara efektif:</p>\n<ul>\n<li>Mengidentifikasi miskonsepsi siswa yang umum terjadi</li>\n<li>Merancang aktivitas pembelajaran yang tepat untuk materi tertentu</li>\n<li>Memilih representasi/analogi yang efektif untuk menjelaskan konsep abstrak</li>\n<li>Merancang asesmen yang mengukur pemahaman konseptual, bukan hafalan</li>\n</ul>\n\n<h2>BAB 3: Kompetensi Teknis PPPK Teknis</h2>\n<p>Soal disesuaikan dengan jabatan yang dilamar.</p>\n\n<h3>3.1 Administrasi</h3>\n<ul>\n<li>Tata naskah dinas (Permenpan RB tentang pedoman umum tata naskah dinas)</li>\n<li>Kearsipan (UU No. 43/2009 tentang Kearsipan)</li>\n<li>Prosedur administrasi pemerintahan</li>\n<li>Manajemen perkantoran modern</li>\n</ul>\n\n<h3>3.2 Keuangan</h3>\n<ul>\n<li>Akuntansi pemerintahan (SAP berbasis akrual)</li>\n<li>APBN/APBD (UU tentang Keuangan Negara)</li>\n<li>Pengelolaan BMN (Barang Milik Negara)</li>\n<li>Pengadaan barang/jasa (Perpres No. 12/2021)</li>\n</ul>\n\n<h3>3.3 Pranata Komputer/IT</h3>\n<ul>\n<li>Jaringan komputer (TCP/IP, LAN/WAN, subnetting)</li>\n<li>Keamanan informasi (ISO 27001, enkripsi, firewall)</li>\n<li>Basis data (SQL, normalisasi, ERD)</li>\n<li>Pengembangan aplikasi (SDLC, metodologi agile)</li>\n</ul>\n\n<h2>BAB 4: Kompetensi Teknis PPPK Nakes</h2>\n<p>Soal menggunakan format <strong>vignette klinis</strong> — skenario kasus yang harus dianalisis.</p>\n\n<h3>Format Vignette:</h3>\n<blockquote>\n<p>Seorang pasien perempuan, usia 45 tahun, datang ke puskesmas dengan keluhan nyeri dada sebelah kiri yang menjalar ke lengan kiri sejak 2 jam yang lalu. TD: 160/100 mmHg, Nadi: 100x/menit, RR: 24x/menit. Tindakan awal yang paling tepat dilakukan adalah...</p>\n</blockquote>\n<p>Soal berbeda untuk setiap profesi: dokter, perawat, bidan, apoteker, gizi, kesehatan masyarakat, dll.</p>\n\n<h2>BAB 5: Kompetensi Manajerial — 25 soal, 25 menit</h2>\n<p>Passing grade: <strong>130</strong>. Format SJT dengan skor 1-4 per jawaban.</p>\n\n<h3>8 Dimensi Manajerial:</h3>\n\n<h4>1. Integritas</h4>\n<p>Konsistensi antara ucapan dan tindakan, kejujuran, ketaatan pada aturan.</p>\n<p><strong>Skor 4:</strong> Proaktif menegakkan integritas meskipun ada tekanan. Menolak permintaan yang melanggar aturan dengan sopan tapi tegas.</p>\n<p><strong>Skor 1:</strong> Mengikuti tekanan untuk melanggar aturan demi kemudahan.</p>\n\n<h4>2. Kerjasama</h4>\n<p>Kolaborasi aktif, kontribusi dalam tim, membantu rekan.</p>\n<p><strong>Skor 4:</strong> Menginisiasi kolaborasi lintas unit untuk menyelesaikan masalah bersama.</p>\n<p><strong>Skor 1:</strong> Hanya fokus pada tugas sendiri tanpa peduli tim.</p>\n\n<h4>3. Komunikasi</h4>\n<p>Penyampaian informasi yang jelas, mendengarkan aktif, mediasi.</p>\n<p><strong>Skor 4:</strong> Mengkomunikasikan informasi penting secara proaktif dan menjadi mediator ketika terjadi miscommunication.</p>\n\n<h4>4. Orientasi pada Hasil</h4>\n<p>Fokus pada pencapaian target dengan kualitas terbaik.</p>\n<p><strong>Skor 4:</strong> Menetapkan target yang menantang, membuat rencana aksi detail, dan konsisten mengevaluasi progress.</p>\n\n<h4>5. Pelayanan Publik</h4>\n<p>Sikap melayani, responsif, inovatif dalam pelayanan.</p>\n<p><strong>Skor 4:</strong> Mengidentifikasi kebutuhan masyarakat secara proaktif dan mengusulkan perbaikan sistem pelayanan.</p>\n\n<h4>6. Pengembangan Diri dan Orang Lain</h4>\n<p>Pembelajaran berkelanjutan dan mentoring.</p>\n<p><strong>Skor 4:</strong> Aktif belajar mandiri, berbagi pengetahuan, dan membimbing rekan/bawahan.</p>\n\n<h4>7. Mengelola Perubahan</h4>\n<p>Adaptasi dan inisiasi perubahan positif.</p>\n<p><strong>Skor 4:</strong> Menjadi agen perubahan, meyakinkan pihak lain tentang pentingnya perubahan.</p>\n\n<h4>8. Pengambilan Keputusan</h4>\n<p>Keputusan berdasarkan data, analisis, dan pertimbangan dampak.</p>\n<p><strong>Skor 4:</strong> Mengambil keputusan berdasarkan data dan analisis, mempertimbangkan dampak jangka panjang.</p>\n\n<h4>Contoh Soal Manajerial:</h4>\n<blockquote>\n<p>Anda baru saja dimutasi ke unit kerja baru yang memiliki budaya kerja sangat berbeda dari unit sebelumnya. Beberapa rekan terlihat tidak ramah. Yang Anda lakukan...<br>\nA. Meminta mutasi kembali ke unit sebelumnya<br>\nB. Bekerja sendiri tanpa banyak berinteraksi<br>\nC. Beradaptasi secara bertahap, menunjukkan kinerja baik, dan berinisiatif mengenal rekan satu per satu<br>\nD. Melapor ke atasan tentang sikap rekan yang tidak ramah</p>\n</blockquote>\n<p><strong>Skor 4: C.</strong> Menunjukkan adaptabilitas, inisiatif, dan kerjasama.</p>\n\n<h2>BAB 6: Kompetensi Sosiokultural — 20 soal, 15 menit</h2>\n<p>Passing grade: <strong>104</strong>. Format SJT dengan skor 1-4.</p>\n\n<h3>4 Dimensi Sosiokultural:</h3>\n\n<h4>1. Perekat Bangsa</h4>\n<p>Menjaga persatuan dalam keberagaman, toleransi aktif.</p>\n\n<h4>2. Nasionalisme</h4>\n<p>Cinta tanah air, mengutamakan kepentingan bangsa.</p>\n\n<h4>3. Etika Publik</h4>\n<p>Norma dan standar perilaku di ruang publik, akuntabilitas.</p>\n\n<h4>4. Pilar Negara</h4>\n<p>Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika.</p>\n\n<h4>Contoh Soal Sosiokultural:</h4>\n<blockquote>\n<p>Di kantor Anda, terjadi ketegangan antara dua kelompok pegawai dari latar belakang budaya berbeda terkait pelaksanaan kegiatan keagamaan di kantor. Sebagai pegawai, Anda...<br>\nA. Membiarkan karena bukan urusan Anda<br>\nB. Memihak kelompok yang lebih besar<br>\nC. Mengusulkan dialog terbuka untuk mencari solusi yang menghargai semua pihak<br>\nD. Melarang semua kegiatan keagamaan di kantor</p>\n</blockquote>\n<p><strong>Skor 4: C.</strong> Menunjukkan sikap perekat bangsa dan toleransi aktif.</p>\n\n<h2>BAB 7: Wawancara — 10 soal, 10 menit</h2>\n<p>Passing grade: <strong>24</strong>. Dilaksanakan dengan CAT (pilihan ganda), bukan tatap muka.</p>\n\n<h3>Aspek yang Diuji:</h3>\n<ul>\n<li><strong>Motivasi</strong> — Alasan menjadi ASN, komitmen terhadap pelayanan publik</li>\n<li><strong>Komitmen</strong> — Kesediaan ditempatkan sesuai formasi, dedikasi jangka panjang</li>\n<li><strong>Pengalaman</strong> — Relevansi pengalaman kerja dengan jabatan yang dilamar</li>\n<li><strong>Rencana Kontribusi</strong> — Apa yang akan dilakukan untuk instansi</li>\n</ul>\n\n<h2>BAB 8: Strategi Persiapan per Formasi</h2>\n\n<h3>PPPK Guru:</h3>\n<ol>\n<li>Fokus 70% waktu belajar untuk kompetensi teknis (pedagogik + profesional)</li>\n<li>Kuasai Kurikulum Merdeka — ini topik terbaru yang pasti keluar</li>\n<li>Latih soal PCK: bagaimana mengajarkan konsep X kepada siswa yang salah paham</li>\n<li>Manajerial + sosiokultural: pahami pola jawaban skor 4</li>\n</ol>\n\n<h3>PPPK Teknis:</h3>\n<ol>\n<li>Pelajari standar kompetensi jabatan yang dilamar</li>\n<li>Kuasai regulasi terkait (UU, PP, Permen yang relevan)</li>\n<li>Latih soal-soal teknis sesuai bidang</li>\n</ol>\n\n<h3>PPPK Nakes:</h3>\n<ol>\n<li>Kuasai standar kompetensi profesi</li>\n<li>Latih soal vignette klinis sebanyak mungkin</li>\n<li>Update protokol terbaru sesuai profesi</li>\n</ol>\n\n<h2>Sumber Belajar</h2>\n<ul>\n<li>Portal SSCASN: sscasn.bkn.go.id</li>\n<li>UU ASN No. 20/2023</li>\n<li>Modul Kurikulum Merdeka: guru.kemdikbud.go.id</li>\n<li>Try out PPPK di platform Toutopia</li>\n</ul>\n    ",
      "pdfUrl": null,
      "coverImage": null,
      "category": "PPPK",
      "tags": [
        "pppk",
        "guru",
        "teknis",
        "nakes",
        "manajerial",
        "sosiokultural"
      ],
      "status": "PUBLISHED",
      "publishedAt": "2026-02-01T00:00:00.000Z",
      "pageCount": 65
    }
  ],
  "badges": [
    {
      "slug": "first-exam",
      "name": "Langkah Pertama",
      "description": "Selesaikan ujian pertamamu",
      "icon": "Rocket",
      "category": "exam",
      "requirement": {
        "type": "exam_count",
        "value": 1
      },
      "xpReward": 50
    },
    {
      "slug": "ten-exams",
      "name": "Rajin Berlatih",
      "description": "Selesaikan 10 ujian",
      "icon": "Target",
      "category": "exam",
      "requirement": {
        "type": "exam_count",
        "value": 10
      },
      "xpReward": 200
    },
    {
      "slug": "fifty-exams",
      "name": "Pejuang Soal",
      "description": "Selesaikan 50 ujian",
      "icon": "Swords",
      "category": "exam",
      "requirement": {
        "type": "exam_count",
        "value": 50
      },
      "xpReward": 500
    },
    {
      "slug": "hundred-exams",
      "name": "Master Ujian",
      "description": "Selesaikan 100 ujian",
      "icon": "Crown",
      "category": "exam",
      "requirement": {
        "type": "exam_count",
        "value": 100
      },
      "xpReward": 1000
    },
    {
      "slug": "perfect-score",
      "name": "Nilai Sempurna",
      "description": "Raih skor 100 di satu ujian",
      "icon": "Star",
      "category": "mastery",
      "requirement": {
        "type": "best_score",
        "value": 100
      },
      "xpReward": 300
    },
    {
      "slug": "high-scorer",
      "name": "Skor Tinggi",
      "description": "Raih skor minimal 90",
      "icon": "TrendingUp",
      "category": "mastery",
      "requirement": {
        "type": "best_score",
        "value": 90
      },
      "xpReward": 150
    },
    {
      "slug": "all-correct",
      "name": "Tanpa Cela",
      "description": "Jawab semua soal dengan benar dalam satu ujian",
      "icon": "CheckCircle",
      "category": "mastery",
      "requirement": {
        "type": "all_correct",
        "value": 1
      },
      "xpReward": 250
    },
    {
      "slug": "speed-demon",
      "name": "Kilat",
      "description": "Selesaikan ujian dalam kurang dari setengah waktu",
      "icon": "Zap",
      "category": "mastery",
      "requirement": {
        "type": "speed",
        "value": 1
      },
      "xpReward": 200
    },
    {
      "slug": "streak-3",
      "name": "Konsisten",
      "description": "Login dan latihan 3 hari berturut-turut",
      "icon": "Flame",
      "category": "streak",
      "requirement": {
        "type": "streak",
        "value": 3
      },
      "xpReward": 100
    },
    {
      "slug": "streak-7",
      "name": "Seminggu Penuh",
      "description": "Login dan latihan 7 hari berturut-turut",
      "icon": "CalendarCheck",
      "category": "streak",
      "requirement": {
        "type": "streak",
        "value": 7
      },
      "xpReward": 300
    },
    {
      "slug": "streak-30",
      "name": "Dedikasi Tinggi",
      "description": "Login dan latihan 30 hari berturut-turut",
      "icon": "Award",
      "category": "streak",
      "requirement": {
        "type": "streak",
        "value": 30
      },
      "xpReward": 1000
    },
    {
      "slug": "multi-category",
      "name": "Serba Bisa",
      "description": "Ikuti ujian dari 3 kategori berbeda",
      "icon": "Layers",
      "category": "exam",
      "requirement": {
        "type": "category_count",
        "value": 3
      },
      "xpReward": 200
    },
    {
      "slug": "referral-1",
      "name": "Ajak Teman",
      "description": "Ajak 1 teman bergabung di Toutopia",
      "icon": "UserPlus",
      "category": "social",
      "requirement": {
        "type": "referral_count",
        "value": 1
      },
      "xpReward": 100
    },
    {
      "slug": "referral-5",
      "name": "Influencer",
      "description": "Ajak 5 teman bergabung di Toutopia",
      "icon": "Users",
      "category": "social",
      "requirement": {
        "type": "referral_count",
        "value": 5
      },
      "xpReward": 500
    }
  ]
};

async function main(): Promise<void> {
  console.log("Seeding content (categories, topics, articles, ebooks, badges)...\n");

  // ── Step 0: Ensure admin exists ──
  const adminPassword = await hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@toutopia.id" },
    update: {},
    create: {
      email: "admin@toutopia.id",
      name: "Super Admin",
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      credits: {
        create: { balance: 0, freeCredits: 0 },
      },
    },
  });
  console.log("  Admin: " + admin.email);

  // ── Step 1: Categories → SubCategories → Subjects → Topics ──
  console.log("\nSeeding categories & topics...");
  for (const cat of DATA.categories) {
    const category = await prisma.examCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
      },
    });

    for (const sub of cat.subCategories) {
      const subCategory = await prisma.examSubCategory.upsert({
        where: {
          categoryId_slug: { categoryId: category.id, slug: sub.slug },
        },
        update: { name: sub.name, order: sub.order },
        create: {
          categoryId: category.id,
          name: sub.name,
          slug: sub.slug,
          order: sub.order,
        },
      });

      for (const subj of sub.subjects) {
        const subject = await prisma.subject.upsert({
          where: {
            subCategoryId_slug: { subCategoryId: subCategory.id, slug: subj.slug },
          },
          update: { name: subj.name, order: subj.order },
          create: {
            subCategoryId: subCategory.id,
            name: subj.name,
            slug: subj.slug,
            order: subj.order,
          },
        });

        for (const topic of subj.topics) {
          await prisma.topic.upsert({
            where: {
              subjectId_slug: { subjectId: subject.id, slug: topic.slug },
            },
            update: { name: topic.name, order: topic.order },
            create: {
              subjectId: subject.id,
              name: topic.name,
              slug: topic.slug,
              order: topic.order,
            },
          });
        }
      }
    }
    console.log("  ✓ " + cat.name + " (" + cat.subCategories.length + " sub, " +
      cat.subCategories.reduce((sum: number, sc: { subjects: { topics: unknown[] }[] }) =>
        sum + sc.subjects.reduce((s2: number, subj: { topics: unknown[] }) => s2 + subj.topics.length, 0), 0) + " topics)");
  }

  // ── Step 2: Articles ──
  console.log("\nSeeding articles...");
  for (const article of DATA.articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        coverImage: article.coverImage,
      },
      create: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        coverImage: article.coverImage,
        authorId: admin.id,
      },
    });
    console.log("  ✓ " + article.title);
  }

  // ── Step 3: Ebooks ──
  console.log("\nSeeding ebooks...");
  for (const ebook of DATA.ebooks) {
    await prisma.ebook.upsert({
      where: { slug: ebook.slug },
      update: {
        title: ebook.title,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        pdfUrl: ebook.pdfUrl,
        coverImage: ebook.coverImage,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt) : null,
        pageCount: ebook.pageCount,
      },
      create: {
        title: ebook.title,
        slug: ebook.slug,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        pdfUrl: ebook.pdfUrl,
        coverImage: ebook.coverImage,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt) : null,
        pageCount: ebook.pageCount,
        authorId: admin.id,
      },
    });
    console.log("  ✓ " + ebook.title);
  }

  // ── Step 4: Badges ──
  console.log("\nSeeding badges...");
  for (const badge of DATA.badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement as Record<string, unknown>,
        xpReward: badge.xpReward,
      },
      create: {
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement as Record<string, unknown>,
        xpReward: badge.xpReward,
      },
    });
  }
  console.log("  ✓ " + DATA.badges.length + " badges");

  console.log("\n✅ Content seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
