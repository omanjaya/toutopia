# Analisis Pattern Soal — Semua Kategori Ujian Indonesia

> Deep analysis setiap tipe, format, pola scoring, dan template soal
> untuk keperluan auto-generation dan quality control di Toutopia.

---

## Daftar Isi

1. [Overview Pattern Umum](#1-overview-pattern-umum)
2. [UTBK-SNBT Pattern](#2-utbk-snbt-pattern)
3. [CPNS/CASN Pattern (SKD)](#3-cpnscasn-pattern-skd)
4. [BUMN Pattern](#4-bumn-pattern)
5. [Kedinasan Pattern](#5-kedinasan-pattern)
6. [PPPK Pattern](#6-pppk-pattern)
7. [Pola Scoring & Passing Grade](#7-pola-scoring--passing-grade)
8. [Template Generator — Soal Auto-Generated](#8-template-generator--soal-auto-generated)
9. [Mapping Pattern ke Database Schema](#9-mapping-pattern-ke-database-schema)

---

## 1. Overview Pattern Umum

### Fakta Kunci
- **Semua ujian standar Indonesia menggunakan 5 opsi jawaban** (A, B, C, D, E)
- Mayoritas soal berbentuk **pilihan ganda tunggal** (single correct answer)
- Ada 3 "archetype" soal utama yang muncul di semua ujian:

| Archetype | Deskripsi | Muncul di |
|-----------|-----------|-----------|
| **Knowledge-based** | Menguji fakta/konsep langsung | TWK, TKA, Kedinasan |
| **Reasoning-based** | Menguji logika, penalaran, analisis | TPS, TIU, TPA |
| **Situational Judgment** | Menguji respons terhadap skenario | TKP, AKHLAK BUMN, Manajerial PPPK |

### Format Universal

```
┌─────────────────────────────────────────────┐
│ [STIMULUS] (opsional)                        │
│ Teks bacaan / grafik / tabel / gambar        │
│                                              │
│ [STEM] — Pertanyaan utama                    │
│                                              │
│ [OPTIONS]                                    │
│ A. ....                                      │
│ B. ....                                      │
│ C. ....                                      │
│ D. ....                                      │
│ E. ....                                      │
│                                              │
│ [METADATA] (internal, tidak ditampilkan)      │
│ - Jawaban benar: X                           │
│ - Pembahasan: ...                            │
│ - Difficulty: 1-5                            │
│ - Topic/Subtopic: ...                        │
│ - Cognitive level: C1-C6                     │
└─────────────────────────────────────────────┘
```

---

## 2. UTBK-SNBT Pattern

### 2.1 Struktur Ujian

| Subtes | Jumlah Soal | Waktu (menit) | Detik/Soal |
|--------|-------------|---------------|------------|
| **Penalaran Umum (PU)** | 30 | 30 | 60 |
| **Pengetahuan Kuantitatif (PK)** | 15 | 20 | 80 |
| **Penalaran Matematika (PM)** | 20 | 25 | 75 |
| **Literasi Bahasa Indonesia (LBI)** | 30 | 45 | 90 |
| **Literasi Bahasa Inggris (LBE)** | 20 | 25 | 75 |
| **Total TPS** | **115** | **145** | - |

> **Catatan**: Sejak SNBT 2024, TKA (Saintek/Soshum) sudah DIHAPUS.
> UTBK sekarang HANYA TPS. Ini penting untuk Toutopia — fokus konten ke TPS.

### 2.2 Penalaran Umum (PU) — 30 Soal

**Pattern yang teridentifikasi:**

#### Pattern PU-1: Penalaran Berbasis Teks (Reading-based Reasoning)
```
STIMULUS: Paragraf bacaan 150-300 kata (bisa dari berita, artikel ilmiah populer, editorial)
STEM: "Pernyataan yang sesuai dengan paragraf X adalah..."
       "Simpulan yang tepat berdasarkan bacaan tersebut adalah..."
       "Hubungan antar paragraf dalam teks tersebut adalah..."
OPTIONS: 5 pernyataan, 1 benar

COGNITIVE LEVEL: C4-C5 (Analisis - Evaluasi)
DAPAT DI-GENERATE: ⚠️ Parsial — teks harus original/CC, soal bisa auto-generate dari teks
```

#### Pattern PU-2: Silogisme / Logika Formal
```
STIMULUS: 2-3 premis logis
  Contoh:
    "Semua mahasiswa rajin belajar."
    "Budi adalah mahasiswa."
STEM: "Kesimpulan yang tepat adalah..."
OPTIONS: 5 kesimpulan, 1 valid

COGNITIVE LEVEL: C4 (Analisis)
DAPAT DI-GENERATE: ✅ Ya — pattern silogisme sangat algoritmik
```

**Template Silogisme:**
```
TYPE A: Universal Affirmative — "Semua X adalah Y"
TYPE E: Universal Negative — "Tidak ada X yang Y"
TYPE I: Particular Affirmative — "Sebagian X adalah Y"
TYPE O: Particular Negative — "Sebagian X bukan Y"

COMBINATION RULES:
- AAA (Barbara): Semua M=P, Semua S=M → Semua S=P ✓
- EAE (Celarent): Tidak ada M=P, Semua S=M → Tidak ada S=P ✓
- AII (Darii): Semua M=P, Sebagian S=M → Sebagian S=P ✓
- EIO (Ferio): Tidak ada M=P, Sebagian S=M → Sebagian S bukan P ✓

DISTRACTOR RULES:
- Inverse conclusion (salah arah)
- Overgeneralization (sebagian → semua)
- Unrelated conclusion
- Affirmation of consequent fallacy
```

#### Pattern PU-3: Analogi & Hubungan Kata
```
STEM: "DOKTER : PASIEN = GURU : ..."
       "A berbanding B seperti C berbanding ..."
OPTIONS: 5 kata/frasa

COGNITIVE LEVEL: C4 (Analisis)
DAPAT DI-GENERATE: ✅ Ya — dari database pasangan kata + tipe relasi
```

**Tipe Relasi Analogi:**
```
1. Profesi → Objek kerja (Dokter → Pasien, Guru → Murid)
2. Alat → Fungsi (Palu → Memukul, Gunting → Memotong)
3. Bagian → Keseluruhan (Roda → Mobil, Daun → Pohon)
4. Sinonim (Besar → Raksasa, Kecil → Mungil)
5. Antonim (Panas → Dingin, Tinggi → Rendah)
6. Sebab → Akibat (Hujan → Banjir, Api → Panas)
7. Bahan → Produk (Kayu → Meja, Kapas → Kain)
8. Spesifik → Umum (Mawar → Bunga, Kucing → Hewan)
9. Tempat → Aktivitas (Sekolah → Belajar, Rumah Sakit → Berobat)
10. Intensitas (Marah → Murka, Suka → Cinta)
```

#### Pattern PU-4: Penalaran Induktif/Deduktif
```
STIMULUS: Data/fakta/informasi (bisa tabel, diagram, atau teks singkat)
STEM: "Berdasarkan data di atas, kesimpulan yang PALING tepat adalah..."
       "Penalaran yang TIDAK valid berdasarkan informasi tersebut adalah..."
OPTIONS: 5 kesimpulan/penalaran

COGNITIVE LEVEL: C5-C6 (Evaluasi - Mencipta)
DAPAT DI-GENERATE: ⚠️ Parsial — butuh data/konteks original
```

### 2.3 Pengetahuan Kuantitatif (PK) — 15 Soal

**Pattern yang teridentifikasi:**

#### Pattern PK-1: Deret Angka
```
STEM: "1, 4, 9, 16, 25, ..."
       "2, 6, 18, 54, ..."
OPTIONS: 5 angka

COGNITIVE LEVEL: C3-C4 (Aplikasi - Analisis)
DAPAT DI-GENERATE: ✅ 100% — algoritmik murni
```

**Tipe Deret:**
```
1. Aritmatika: a, a+d, a+2d, ... (beda tetap)
2. Geometri: a, ar, ar², ... (rasio tetap)
3. Kuadrat: 1, 4, 9, 16, ... (n²)
4. Kubik: 1, 8, 27, 64, ... (n³)
5. Fibonacci: 1, 1, 2, 3, 5, 8, ... (Fn = Fn-1 + Fn-2)
6. Prima: 2, 3, 5, 7, 11, ...
7. Beda bertingkat: beda dari beda membentuk pola
8. Campuran: 2 deret saling selang-seling
9. Berpola operasi: +1, +2, +3, +4, ... (beda naik)
10. Faktorial: 1, 2, 6, 24, 120, ...

DIFFICULTY MAPPING:
- Easy (1-2): Deret aritmatika/geometri sederhana
- Medium (3): Kuadrat, kubik, fibonacci
- Hard (4): Campuran, beda bertingkat
- Very Hard (5): Pola tersembunyi, multi-operasi
```

#### Pattern PK-2: Perbandingan Kuantitatif
```
STEM: "Manakah yang lebih besar?"
       "Kuantitas A: 3⁴    Kuantitas B: 4³"
OPTIONS:
  A. Kuantitas A lebih besar
  B. Kuantitas B lebih besar
  C. Keduanya sama
  D. Tidak dapat ditentukan

COGNITIVE LEVEL: C3 (Aplikasi)
DAPAT DI-GENERATE: ✅ Ya — generate pasangan ekspresi matematika
```

#### Pattern PK-3: Interpretasi Data (Tabel/Grafik)
```
STIMULUS: Tabel data numerik / grafik batang / pie chart
STEM: "Berdasarkan tabel di atas, pernyataan yang benar adalah..."
       "Persentase kenaikan dari tahun X ke Y adalah..."
OPTIONS: 5 pernyataan/angka

COGNITIVE LEVEL: C4 (Analisis)
DAPAT DI-GENERATE: ✅ Ya — generate data tabel acak + soal kalkulasi
```

#### Pattern PK-4: Aritmatika & Aljabar Dasar
```
STEM: "Jika x + y = 10 dan x - y = 4, maka xy = ..."
       "Jika harga barang naik 20% kemudian diskon 10%, maka..."
OPTIONS: 5 angka

COGNITIVE LEVEL: C3 (Aplikasi)
DAPAT DI-GENERATE: ✅ Ya — parameterized math problems
```

### 2.4 Penalaran Matematika (PM) — 20 Soal

#### Pattern PM-1: Problem Solving Geometri
```
STEM: Soal cerita melibatkan bentuk geometri (luas, keliling, volume)
OPTIONS: 5 angka + satuan

TOPIK: Segitiga, lingkaran, bangun ruang, transformasi
DAPAT DI-GENERATE: ✅ Ya — generate dimensi acak, hitung jawaban
```

#### Pattern PM-2: Aljabar & Fungsi
```
STEM: Persamaan, pertidaksamaan, fungsi, grafik
OPTIONS: 5 ekspresi/angka

TOPIK: Persamaan linear, kuadrat, eksponen, logaritma
DAPAT DI-GENERATE: ✅ Ya — generate koefisien acak
```

#### Pattern PM-3: Statistika & Probabilitas
```
STEM: Mean, median, modus, simpangan, peluang
OPTIONS: 5 angka

TOPIK: Ukuran pemusatan, penyebaran, distribusi
DAPAT DI-GENERATE: ✅ Ya — generate dataset acak
```

#### Pattern PM-4: Logika Matematika
```
STEM: Implikasi, bikonditional, tabel kebenaran
OPTIONS: 5 pernyataan

TOPIK: Konjungsi, disjungsi, implikasi, kontraposisi, invers
DAPAT DI-GENERATE: ✅ Ya — truth table generation
```

### 2.5 Literasi Bahasa Indonesia (LBI) — 30 Soal

#### Pattern LBI-1: Pemahaman Bacaan
```
STIMULUS: Teks bacaan 200-400 kata (berita, editorial, esai)
STEM: "Ide pokok paragraf ke-3 adalah..."
       "Makna kata 'X' dalam teks tersebut adalah..."
       "Kalimat utama paragraf ke-2 adalah..."
OPTIONS: 5 pernyataan

COGNITIVE LEVEL: C2-C4 (Pemahaman - Analisis)
DAPAT DI-GENERATE: ⚠️ Parsial — teks harus disiapkan, soal bisa templated
```

**Sub-pattern soal literasi:**
```
1. Ide pokok / gagasan utama → setiap paragraf
2. Makna kata kontekstual → kata dalam kalimat
3. Kalimat utama vs penjelas
4. Simpulan bacaan
5. Hubungan antar paragraf (sebab-akibat, kronologis, kontras)
6. Tujuan penulis
7. Jenis teks (narasi, deskripsi, eksposisi, argumentasi, persuasi)
8. Keefektifan kalimat (EYD/PUEBI)
9. Kalimat fakta vs opini
10. Pola pengembangan paragraf
```

#### Pattern LBI-2: Kebahasaan (EYD/PUEBI)
```
STEM: "Penulisan yang sesuai dengan PUEBI adalah..."
       "Kalimat efektif di bawah ini adalah..."
OPTIONS: 5 kalimat

COGNITIVE LEVEL: C2-C3 (Pemahaman - Aplikasi)
DAPAT DI-GENERATE: ✅ Ya — dari database aturan PUEBI + contoh
```

### 2.6 Literasi Bahasa Inggris (LBE) — 20 Soal

#### Pattern LBE-1: Reading Comprehension
```
STIMULUS: English passage 150-300 words
STEM: "What is the main idea of the passage?"
       "The word 'X' in line Y most likely means..."
OPTIONS: 5 statements

DAPAT DI-GENERATE: ⚠️ Parsial — teks dari sumber CC, soal bisa templated
```

**Sub-pattern:**
```
1. Main idea / topic
2. Vocabulary in context
3. Inference / implied meaning
4. Detail / specific information
5. Logical structure / purpose
6. Tone / attitude of author
7. Reference (pronoun reference)
```

---

## 3. CPNS/CASN Pattern (SKD)

### 3.1 Struktur Ujian

| Subtes | Jumlah Soal | Waktu (menit) | Passing Grade | Skor/Soal |
|--------|-------------|---------------|---------------|-----------|
| **TWK** | 30 | 25 | 65 (dari 150) | 5 (benar) / 0 (salah) |
| **TIU** | 35 | 30 | 80 (dari 175) | 5 (benar) / 0 (salah) |
| **TKP** | 35 | 35 | 166 (dari 175) | 1-5 (graduated) |
| **Total SKD** | **100** | **90** | **311** (dari 500) | - |

> ⚠️ **Poin penting TKP**: Tidak ada jawaban "salah" di TKP. Setiap opsi bernilai 1-5.
> Ini artinya scoring TKP BERBEDA dari TWK/TIU.

### 3.2 TWK — Tes Wawasan Kebangsaan (30 Soal)

#### Pattern TWK-1: Pancasila
```
STEM: "Sila ke-4 Pancasila berbunyi..."
       "Implementasi sila Kemanusiaan yang adil dan beradab dalam kehidupan sehari-hari adalah..."
       "Nilai-nilai yang terkandung dalam Pancasila sila ke-3 adalah..."
OPTIONS: 5 pernyataan, 1 benar

TOPIK:
  - 5 Sila & bunyi lengkap
  - Nilai-nilai setiap sila
  - Implementasi dalam kehidupan
  - Sejarah perumusan Pancasila (BPUPKI, PPKI, Piagam Jakarta)
  - Pancasila sebagai dasar negara, ideologi, pandangan hidup

DAPAT DI-GENERATE: ✅ Ya — dari database fakta Pancasila
```

#### Pattern TWK-2: UUD 1945
```
STEM: "Berdasarkan Pasal 1 Ayat 2 UUD 1945, kedaulatan berada di tangan..."
       "Amandemen UUD 1945 yang mengatur tentang HAM terdapat pada..."
OPTIONS: 5 pernyataan, 1 benar

TOPIK:
  - Pasal-pasal penting (1-37 + Amandemen)
  - Pembukaan UUD 1945 (Alinea 1-4)
  - Lembaga negara (MPR, DPR, DPD, Presiden, MA, MK, BPK)
  - Hubungan antar lembaga negara
  - Amandemen I-IV (1999-2002)
  - Hak & kewajiban warga negara

DAPAT DI-GENERATE: ✅ Ya — dari database pasal UUD 1945
```

#### Pattern TWK-3: NKRI & Bhinneka Tunggal Ika
```
STEM: "Toleransi dalam kehidupan antar umat beragama berarti..."
       "Bentuk implementasi Bhinneka Tunggal Ika adalah..."
OPTIONS: 5 pernyataan, 1 benar

TOPIK:
  - Keanekaragaman suku, budaya, agama
  - Wawasan nusantara
  - Ketahanan nasional
  - Integrasi nasional
  - Bela negara (UU No. 3 Tahun 2002)
  - Sejarah kemerdekaan & perjuangan bangsa

DAPAT DI-GENERATE: ✅ Ya — dari database fakta kebangsaan
```

#### Pattern TWK-4: Pilar Negara & UU ASN
```
STEM: "Menurut UU No. 5 Tahun 2014 tentang ASN, pegawai ASN terdiri atas..."
       "Kode etik ASN meliputi..."
OPTIONS: 5 pernyataan, 1 benar

TOPIK:
  - UU ASN (No. 5/2014, diperbarui UU No. 20/2023)
  - Kode etik & kode perilaku ASN
  - Hak & kewajiban ASN
  - Disiplin PNS (PP No. 94/2021)
  - Manajemen ASN
  - Sistem merit

DAPAT DI-GENERATE: ✅ Ya — dari database regulasi ASN
```

### 3.3 TIU — Tes Intelegensia Umum (35 Soal)

#### Pattern TIU-1: Verbal (Sinonim/Antonim)
```
STEM: "Sinonim dari kata ABSURD adalah..."
       "Antonim dari kata PARSIAL adalah..."
OPTIONS: 5 kata

DISTRIBUTION: ~5-7 soal per tes
DAPAT DI-GENERATE: ✅ Ya — dari database kosa kata + sinonim/antonim
```

**Database kata yang dibutuhkan:**
```
Level 1 (Umum): ~500 kata dasar
Level 2 (Akademik): ~500 kata akademik
Level 3 (Jarang): ~500 kata jarang/formal
Level 4 (Serapan): ~300 kata serapan asing

Per kata: sinonim (2-3), antonim (2-3), definisi, contoh kalimat
Total: ~1.800 entri → bisa generate ribuan soal
```

#### Pattern TIU-2: Verbal (Analogi)
```
STEM: "HAKIM : PENGADILAN = DOKTER : ..."
OPTIONS: 5 kata/frasa

DISTRIBUTION: ~3-5 soal per tes
DAPAT DI-GENERATE: ✅ Ya — dari database relasi kata (lihat PU-3)
```

#### Pattern TIU-3: Verbal (Pengelompokan Kata)
```
STEM: "Kata yang TIDAK termasuk kelompok yang sama adalah..."
       Pilihan: pisang, apel, mangga, wortel, jeruk
OPTIONS: 5 kata

DISTRIBUTION: ~2-3 soal per tes
DAPAT DI-GENERATE: ✅ Ya — dari database kategori kata
```

#### Pattern TIU-4: Numerik (Deret Angka)
```
STEM: "3, 6, 12, 24, ..."
OPTIONS: 5 angka

DISTRIBUTION: ~5-7 soal per tes
DAPAT DI-GENERATE: ✅ 100% — sama dengan PK-1
```

#### Pattern TIU-5: Numerik (Aritmatika)
```
STEM: "Jika 2x + 5 = 15, maka x = ..."
       "25% dari 480 adalah..."
OPTIONS: 5 angka

DISTRIBUTION: ~5-7 soal per tes
DAPAT DI-GENERATE: ✅ 100%
```

#### Pattern TIU-6: Figural (Pola Gambar)
```
STEM: Serangkaian gambar/bentuk dengan pola tertentu
       "Gambar selanjutnya yang melengkapi pola adalah..."
OPTIONS: 5 gambar

DISTRIBUTION: ~5-7 soal per tes
DAPAT DI-GENERATE: ⚠️ Parsial — butuh SVG generator untuk pattern visual

SUB-PATTERN:
  1. Rotasi (90°, 180°, 270°)
  2. Refleksi (horizontal, vertikal)
  3. Penambahan/pengurangan elemen
  4. Pergeseran posisi
  5. Perubahan warna/shading
  6. Kombinasi transformasi
```

### 3.4 TKP — Tes Karakteristik Pribadi (35 Soal)

> ⚡ **SANGAT PENTING**: TKP menggunakan scoring graduated (1-5), bukan benar/salah.
> Setiap opsi punya skor berbeda. Opsi "terbaik" = 5, "terburuk" = 1.

#### Pattern TKP-1: Pelayanan Publik
```
STIMULUS: "Anda sebagai petugas pelayanan di kantor pemerintah.
           Seorang warga datang dengan keluhan yang bukan
           wewenang Anda. Apa yang Anda lakukan?"
OPTIONS (dengan skor):
  A. Mengarahkan ke bagian yang tepat dan membantu prosesnya (SKOR: 5)
  B. Mengarahkan ke bagian yang tepat (SKOR: 4)
  C. Mencoba menangani sendiri meskipun bukan wewenang (SKOR: 3)
  D. Menyuruh warga mencari tahu sendiri (SKOR: 2)
  E. Mengabaikan keluhan tersebut (SKOR: 1)

SCORING PRINCIPLE: Respons paling proaktif & berorientasi pelayanan = skor tertinggi
```

#### Pattern TKP-2: Jejaring Kerja (Networking)
```
STIMULUS: Skenario tentang membangun relasi kerja antar instansi/unit
SCORING PRINCIPLE: Kolaboratif & inisiatif = skor tertinggi

TOPIK:
  - Koordinasi antar unit kerja
  - Kerjasama dengan instansi lain
  - Membangun hubungan profesional
  - Resolusi konflik antar rekan kerja
```

#### Pattern TKP-3: Sosial Budaya
```
STIMULUS: Skenario perbedaan budaya/agama/suku di tempat kerja
SCORING PRINCIPLE: Toleran, inklusif, menghargai perbedaan = skor tertinggi

TOPIK:
  - Toleransi antar umat beragama
  - Menghargai perbedaan budaya
  - Adaptasi di lingkungan multikultural
  - Mengatasi stereotip
```

#### Pattern TKP-4: Teknologi Informasi & Komunikasi
```
STIMULUS: Skenario tentang penggunaan teknologi di tempat kerja
SCORING PRINCIPLE: Adaptif terhadap teknologi, efisien = skor tertinggi

TOPIK:
  - Digitalisasi pelayanan
  - Keamanan data
  - Pemanfaatan TI untuk efisiensi
  - Social media etiquette ASN
```

#### Pattern TKP-5: Profesionalisme
```
STIMULUS: Dilema etika di tempat kerja
SCORING PRINCIPLE: Integritas, profesionalisme, kepatuhan aturan = skor tertinggi

TOPIK:
  - Konflik kepentingan
  - Disiplin kerja
  - Tanggung jawab jabatan
  - Pengembangan kompetensi diri
```

**Master Pattern TKP — Scoring Guide:**
```
SKOR 5: Proaktif, menyelesaikan masalah, mengutamakan kepentingan publik/organisasi
SKOR 4: Responsif, melakukan yang seharusnya, mengikuti prosedur
SKOR 3: Pasif-positif, tidak menyalahi aturan tapi tidak proaktif
SKOR 2: Pasif-negatif, cenderung menghindar atau tidak peduli
SKOR 1: Kontraproduktif, egois, melanggar etika/aturan
```

**TKP DAPAT DI-GENERATE: ✅ Ya** — buat skenario + 5 respons graduated.
Ini sangat cocok untuk auto-generation karena follow pattern yang konsisten.

---

## 4. BUMN Pattern

### 4.1 Struktur Tes Rekrutmen Bersama BUMN

| Subtes | Jumlah Soal | Waktu (menit) | Format |
|--------|-------------|---------------|--------|
| **TKD (Kemampuan Dasar)** | 50 | 60 | Multiple choice 5 opsi |
| **Core Values AKHLAK** | 45 | 45 | Situational judgment |
| **Learning Agility** | 30 | 30 | Situational + self-assessment |
| **English** | 40 | 40 | Multiple choice 5 opsi |

### 4.2 Core Values AKHLAK (45 Soal)

> Pattern mirip TKP CPNS tapi fokus pada 6 nilai BUMN

#### Pattern AKHLAK-1: Amanah
```
STIMULUS: Skenario yang menguji kejujuran & tanggung jawab
CONTOH: "Anda menemukan kesalahan dalam laporan keuangan yang bisa menguntungkan perusahaan.
         Apa yang Anda lakukan?"
SCORING: Graduated 1-5

KEYWORD INDIKATOR: jujur, bertanggung jawab, amanah, transparan
```

#### Pattern AKHLAK-2 sampai AKHLAK-6
```
Kompeten: skenario pengembangan diri, belajar, meningkatkan skill
Harmonis: skenario keragaman, perbedaan pendapat, lingkungan kerja
Loyal: skenario dedikasi, pengutamaan kepentingan organisasi
Adaptif: skenario perubahan, inovasi, tantangan baru
Kolaboratif: skenario kerja tim, sinergi, gotong royong

SEMUA PATTERN: Situational judgment dengan 5 opsi graduated (1-5)
DAPAT DI-GENERATE: ✅ Ya — template skenario + respons
```

### 4.3 English BUMN (40 Soal)

```
Pattern sama dengan TOEFL ITP (simplified):
1. Structure & Grammar: ~15 soal
2. Reading Comprehension: ~15 soal
3. Vocabulary: ~10 soal

DAPAT DI-GENERATE: ✅ Ya (grammar & vocab), ⚠️ Parsial (reading — butuh teks)
```

---

## 5. Kedinasan Pattern

### 5.1 PKN STAN

| Subtes | Jumlah Soal | Waktu | Pattern |
|--------|-------------|-------|---------|
| **TPA (Tes Potensi Akademik)** | 120 | 100 menit | = TPS UTBK + TIU CPNS |
| **TBI (Tes Bahasa Inggris)** | 60 | 50 menit | = TOEFL-like |

**Keunikan STAN**: Soal TPA STAN terkenal level kesulitan TINGGI. Perlu tag difficulty 4-5.

### 5.2 STIS

| Subtes | Pattern |
|--------|---------|
| Matematika | Aljabar, kalkulus, statistika — level SMA/awal kuliah |
| Bahasa Inggris | Reading + Grammar (TOEFL-like) |
| Logika | Sama dengan TIU figural/verbal |

### 5.3 IPDN

```
Pattern = CPNS SKD (TWK + TIU + TKP)
Tambahan: Tes Kesemaptaan (fisik) → di luar scope digital

DAPAT DI-GENERATE: ✅ Ya — reuse soal CPNS SKD dengan difficulty adjustment
```

---

## 6. PPPK Pattern

### 6.1 Struktur

| Subtes | Jumlah Soal | Waktu | Scoring |
|--------|-------------|-------|---------|
| **Kompetensi Manajerial** | 25 | 25 menit | Graduated 1-4 |
| **Kompetensi Sosio-Kultural** | 20 | 20 menit | Graduated 1-4 |
| **Kompetensi Teknis** | 75 | 90 menit | Benar/Salah (3/0/-1) |
| **Wawancara** | - | 10 menit | Panel |

> ⚠️ **Perbedaan**: PPPK Manajerial & Sosio-Kultural menggunakan skor 1-4 (bukan 1-5 seperti TKP CPNS)
> Kompetensi Teknis menggunakan POIN MINUS (-1 untuk salah)

### 6.2 Kompetensi Teknis — Per Formasi

**Guru:**
```
- Pedagogik (40%): metode pembelajaran, kurikulum, assessment
- Profesional (60%): penguasaan materi sesuai mata pelajaran

TOPIK GURU SD: Bahasa Indonesia, Matematika, IPA, IPS, PKn, Seni
TOPIK GURU MAPEL: Sesuai mata pelajaran yang diampu
```

**Tenaga Kesehatan:**
```
TOPIK: Sesuai profesi (dokter, perawat, bidan, apoteker, dll)
FORMAT: Kasus klinis + pertanyaan
```

### 6.3 8 Kompetensi Manajerial PPPK
```
1. Integritas
2. Kerjasama
3. Komunikasi
4. Orientasi pada hasil
5. Pelayanan publik
6. Pengembangan diri dan orang lain
7. Mengelola perubahan
8. Pengambilan keputusan

PATTERN: Situational judgment, graduated scoring 1-4
DAPAT DI-GENERATE: ✅ Ya — mirip TKP tapi 4 opsi & 4 skor
```

---

## 7. Pola Scoring & Passing Grade

### 7.1 Perbedaan Sistem Scoring

| Ujian | Sistem Scoring | Detail |
|-------|---------------|--------|
| **UTBK-SNBT** | IRT (Item Response Theory) | Skor 200-800 per subtes, bukan jumlah benar |
| **CPNS TWK** | Binary (5/0) | 5 poin benar, 0 salah, Passing Grade: 65 |
| **CPNS TIU** | Binary (5/0) | 5 poin benar, 0 salah, Passing Grade: 80 |
| **CPNS TKP** | Graduated (1-5) | 5 opsi masing-masing bernilai 1-5, PG: 166 |
| **PPPK Teknis** | Ternary (3/0/-1) | 3 benar, 0 kosong, -1 salah |
| **PPPK Manajerial** | Graduated (1-4) | 4 opsi bernilai 1-4 |
| **BUMN AKHLAK** | Graduated (1-5) | Mirip TKP CPNS |

### 7.2 IRT Scoring (UTBK) — Detail

```
UTBK TIDAK menggunakan "jumlah benar" = skor.
UTBK menggunakan IRT (Item Response Theory):

- Setiap soal punya parameter kesulitan (difficulty)
- Menjawab benar soal SULIT = skor tinggi
- Menjawab benar soal MUDAH = skor rendah
- Menjawab salah soal MUDAH = penalty

Untuk Toutopia:
- Kita TIDAK bisa mereplikasi IRT scoring yang persis (butuh kalibrasi statistik ribuan peserta)
- Yang bisa dilakukan: SIMULASI scoring berdasarkan weighted difficulty
- Formula simulasi:
  score = Σ (weight[difficulty] × correct[i]) / total_questions × 800

  weight = {
    VERY_EASY: 0.5,
    EASY: 0.75,
    MEDIUM: 1.0,
    HARD: 1.5,
    VERY_HARD: 2.0
  }
```

### 7.3 Passing Grade Summary

| Ujian | Subtes | Passing Grade | Max Score |
|-------|--------|---------------|-----------|
| CPNS | TWK | 65 | 150 |
| CPNS | TIU | 80 | 175 |
| CPNS | TKP | 166 | 175 |
| CPNS | **Total SKD** | **311** | **500** |
| PPPK | Manajerial | Ditentukan per formasi | 100 |
| PPPK | Sosio-Kultural | Ditentukan per formasi | 80 |
| PPPK | Teknis | Ditentukan per formasi | 225 |

---

## 8. Template Generator — Soal Auto-Generated

### 8.1 Summary: Apa yang Bisa Auto-Generate

| Tipe Soal | Auto-Generate? | Estimated Volume | Effort |
|-----------|---------------|-----------------|--------|
| Deret angka | ✅ 100% | Unlimited | Low |
| Aritmatika/aljabar | ✅ 100% | Unlimited | Low |
| Silogisme/logika | ✅ 100% | 10.000+ | Low |
| Analogi kata | ✅ 100% | 5.000+ (dari DB) | Medium |
| Sinonim/antonim | ✅ 100% | 5.000+ (dari DB) | Medium |
| Kelompok kata | ✅ 100% | 3.000+ (dari DB) | Medium |
| Perbandingan kuantitatif | ✅ 100% | Unlimited | Low |
| TWK (Pancasila/UUD) | ✅ ~90% | 2.000+ (dari DB fakta) | Medium |
| TWK (UU ASN) | ✅ ~90% | 1.000+ (dari DB regulasi) | Medium |
| TKP (situational) | ✅ ~80% | 5.000+ (dari template) | Medium |
| AKHLAK BUMN | ✅ ~80% | 3.000+ (dari template) | Medium |
| Geometri | ✅ ~90% | Unlimited | Medium |
| Statistika | ✅ ~90% | Unlimited | Medium |
| Figural/visual | ⚠️ ~60% | 2.000+ (SVG) | High |
| Literasi BI (text-based) | ⚠️ ~40% | Butuh teks | High |
| Literasi BE (text-based) | ⚠️ ~40% | Butuh teks | High |
| PPPK Teknis | ❌ ~10% | Butuh ahli bidang | Very High |

### 8.2 Arsitektur Question Generator

```
┌─────────────────────────────────────────────┐
│            QUESTION GENERATOR                │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐   ┌──────────────────┐    │
│  │  Template DB  │   │  Parameter Pool  │    │
│  │  (pattern +   │   │  (angka, kata,   │    │
│  │   stem +      │   │   skenario,      │    │
│  │   distractor  │   │   fakta)         │    │
│  │   rules)      │   │                  │    │
│  └──────┬───────┘   └────────┬─────────┘    │
│         │                    │               │
│         ▼                    ▼               │
│  ┌─────────────────────────────────────┐    │
│  │          Generator Engine            │    │
│  │  1. Pick template                    │    │
│  │  2. Fill parameters randomly         │    │
│  │  3. Calculate correct answer         │    │
│  │  4. Generate distractors             │    │
│  │  5. Shuffle options                  │    │
│  │  6. Generate explanation             │    │
│  └──────────────┬──────────────────────┘    │
│                 ▼                            │
│  ┌─────────────────────────────────────┐    │
│  │          Validation Layer            │    │
│  │  - No duplicate questions            │    │
│  │  - Answer is unique (not ambiguous)  │    │
│  │  - Difficulty is correct             │    │
│  │  - Distractors are plausible         │    │
│  └──────────────┬──────────────────────┘    │
│                 ▼                            │
│  ┌─────────────────────────────────────┐    │
│  │         OUTPUT: Question Object      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 8.3 Contoh Template: Deret Angka

```typescript
interface DeretTemplate {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  generator: (params: DeretParams) => GeneratedQuestion;
}

// Template: Deret Aritmatika
const arithmeticSeries: DeretTemplate = {
  id: 'DERET_ARITMATIKA',
  name: 'Deret Aritmatika',
  difficulty: 1,
  generator: ({ startRange, diffRange, length }) => {
    const a = randomInt(startRange[0], startRange[1]);
    const d = randomInt(diffRange[0], diffRange[1]);
    const series = Array.from({ length }, (_, i) => a + i * d);
    const answer = a + length * d;

    return {
      stem: `${series.join(', ')}, ...`,
      correctAnswer: answer,
      distractors: [
        answer + d,          // common mistake: one step further
        answer - d,          // common mistake: one step back
        answer + 1,          // off by one
        series[length - 1],  // repeat last
      ],
      explanation: `Deret aritmatika dengan a=${a}, d=${d}. Suku ke-${length + 1} = ${a} + ${length}×${d} = ${answer}`,
    };
  },
};

// Template: Deret Geometri
const geometricSeries: DeretTemplate = {
  id: 'DERET_GEOMETRI',
  name: 'Deret Geometri',
  difficulty: 2,
  generator: ({ startRange, ratioRange, length }) => {
    const a = randomInt(startRange[0], startRange[1]);
    const r = randomInt(ratioRange[0], ratioRange[1]);
    const series = Array.from({ length }, (_, i) => a * Math.pow(r, i));
    const answer = a * Math.pow(r, length);

    return {
      stem: `${series.join(', ')}, ...`,
      correctAnswer: answer,
      distractors: generateGeometricDistractors(answer, r, series),
      explanation: `Deret geometri dengan a=${a}, r=${r}. Suku ke-${length + 1} = ${a}×${r}^${length} = ${answer}`,
    };
  },
};
```

### 8.4 Contoh Template: Soal TKP

```typescript
interface TKPTemplate {
  id: string;
  category: 'PELAYANAN' | 'JEJARING' | 'SOSIAL_BUDAYA' | 'TIK' | 'PROFESIONALISME';
  scenarioTemplates: string[];
  responseTemplates: Record<1 | 2 | 3 | 4 | 5, string[]>;
}

const pelayananTemplate: TKPTemplate = {
  id: 'TKP_PELAYANAN_001',
  category: 'PELAYANAN',
  scenarioTemplates: [
    'Anda sebagai {jabatan} di {instansi}. Seorang {pemohon} datang dengan {masalah} yang {kondisi}. Apa yang Anda lakukan?',
    'Saat bertugas di {unit_kerja}, Anda menerima {keluhan} dari {pemohon}. {detail_keluhan}. Langkah Anda adalah...',
  ],
  responseTemplates: {
    5: [
      'Mendengarkan dengan empati, mengidentifikasi masalah, dan segera membantu menyelesaikan dengan mengarahkan ke prosedur yang tepat',
      'Proaktif membantu mencarikan solusi dan memastikan pemohon mendapatkan layanan yang dibutuhkan',
    ],
    4: [
      'Mengarahkan ke bagian yang berwenang dan menjelaskan prosedurnya',
      'Memberikan informasi yang diperlukan sesuai SOP',
    ],
    3: [
      'Menerima keluhan dan mencatatnya untuk ditindaklanjuti',
      'Menyampaikan bahwa akan diproses sesuai antrian',
    ],
    2: [
      'Menyarankan pemohon untuk kembali lain waktu',
      'Meminta pemohon menunggu tanpa kepastian waktu',
    ],
    1: [
      'Mengabaikan keluhan karena bukan tupoksi',
      'Meminta pemohon mencari tahu sendiri',
    ],
  },
};
```

---

## 9. Mapping Pattern ke Database Schema

### 9.1 QuestionType Enum (perlu diperluas)

```typescript
enum QuestionType {
  // Existing
  SINGLE_CHOICE = 'SINGLE_CHOICE',       // 1 jawaban benar (TWK, TIU, UTBK)
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',     // Multiple jawaban benar
  TRUE_FALSE = 'TRUE_FALSE',               // Benar/Salah
  NUMERIC = 'NUMERIC',                     // Input angka

  // PERLU DITAMBAHKAN:
  GRADUATED_5 = 'GRADUATED_5',             // Scoring 1-5 (TKP CPNS, AKHLAK BUMN)
  GRADUATED_4 = 'GRADUATED_4',             // Scoring 1-4 (PPPK Manajerial/SosKul)
}
```

### 9.2 Scoring Model per Question Type

```typescript
interface ScoringConfig {
  type: 'BINARY' | 'GRADUATED' | 'PENALTY';
  binaryScore?: { correct: number; incorrect: number };        // TWK, TIU: 5/0
  graduatedScore?: { min: number; max: number };               // TKP: 1-5, PPPK: 1-4
  penaltyScore?: { correct: number; blank: number; incorrect: number }; // PPPK Teknis: 3/0/-1
}

const SCORING_CONFIGS: Record<string, ScoringConfig> = {
  'CPNS_TWK': { type: 'BINARY', binaryScore: { correct: 5, incorrect: 0 } },
  'CPNS_TIU': { type: 'BINARY', binaryScore: { correct: 5, incorrect: 0 } },
  'CPNS_TKP': { type: 'GRADUATED', graduatedScore: { min: 1, max: 5 } },
  'PPPK_TEKNIS': { type: 'PENALTY', penaltyScore: { correct: 3, blank: 0, incorrect: -1 } },
  'PPPK_MANAJERIAL': { type: 'GRADUATED', graduatedScore: { min: 1, max: 4 } },
  'PPPK_SOSIOKULTURAL': { type: 'GRADUATED', graduatedScore: { min: 1, max: 4 } },
  'UTBK_TPS': { type: 'BINARY', binaryScore: { correct: 1, incorrect: 0 } }, // IRT weighting applied later
  'BUMN_AKHLAK': { type: 'GRADUATED', graduatedScore: { min: 1, max: 5 } },
  'BUMN_TKD': { type: 'BINARY', binaryScore: { correct: 1, incorrect: 0 } },
};
```

### 9.3 Option Schema untuk Graduated Scoring

```typescript
// Untuk soal BINARY (TWK, TIU, UTBK):
interface BinaryOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  isCorrect: boolean;  // true untuk 1 opsi, false untuk sisanya
}

// Untuk soal GRADUATED (TKP, AKHLAK, PPPK Manajerial):
interface GraduatedOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  score: number;  // 1-5 untuk TKP/AKHLAK, 1-4 untuk PPPK
}
```

### 9.4 Auto-Generate Feasibility Summary

```
TOTAL SOAL YANG BISA AUTO-GENERATE (tanpa human input):

Deret angka (10+ tipe × unlimited params)     = UNLIMITED
Aritmatika/Aljabar (parameterized)             = UNLIMITED
Geometri (parameterized)                       = UNLIMITED
Statistika (parameterized)                     = UNLIMITED
Silogisme (4 tipe × kombinasi)                 = ~5.000
Analogi (10 tipe relasi × 500 kata)            = ~5.000
Sinonim/Antonim (1.800 kata × 2 arah)          = ~3.600
Kelompok kata (500 kategori × 6 kombinasi)     = ~3.000
TWK Pancasila (5 sila × 50 aspek)              = ~1.000
TWK UUD 1945 (200 pasal × 3 variasi)           = ~600
TWK NKRI (100 topik × 3 variasi)               = ~300
TWK UU ASN (50 pasal × 3 variasi)              = ~150
TKP/AKHLAK (5 kategori × 200 skenario)         = ~5.000
Perbandingan kuantitatif                       = UNLIMITED
─────────────────────────────────────────────────
TOTAL ESTIMASI MINIMUM                         = ~25.000+
(belum termasuk unlimited math/deret)
```

---

*Dokumen ini dibuat: 25 Februari 2026*
*Reference: tryout.id, BKN, SNPMB, PermenPAN RB*
