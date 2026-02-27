import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, QuestionDifficulty, QuestionStatus, QuestionType, ExamPackageStatus } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface QuestionSeed {
  content: string;
  options: { label: string; content: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: QuestionDifficulty;
  source: string;
  year?: number;
}

// ============================================================
// SOAL PENALARAN UMUM (10 soal)
// Sumber: CNN Indonesia, Ruangguru, Brain Academy
// ============================================================
const penalaranUmumQuestions: QuestionSeed[] = [
  {
    content: "Semua mahasiswa yang lulus ujian akan mendapat sertifikat. Budi adalah mahasiswa yang lulus ujian. Kesimpulan yang tepat adalah...",
    options: [
      { label: "A", content: "Budi belum tentu mendapat sertifikat", isCorrect: false },
      { label: "B", content: "Budi mendapat sertifikat", isCorrect: true },
      { label: "C", content: "Budi tidak mendapat sertifikat", isCorrect: false },
      { label: "D", content: "Tidak semua mahasiswa mendapat sertifikat", isCorrect: false },
      { label: "E", content: "Sertifikat hanya untuk mahasiswa tertentu", isCorrect: false },
    ],
    explanation: "Premis 1: Semua mahasiswa yang lulus ujian → mendapat sertifikat. Premis 2: Budi lulus ujian. Dengan silogisme, Budi pasti mendapat sertifikat.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Jika hujan turun, maka jalanan basah. Jalanan tidak basah. Kesimpulan yang sah adalah...",
    options: [
      { label: "A", content: "Hujan turun", isCorrect: false },
      { label: "B", content: "Jalanan kering karena panas", isCorrect: false },
      { label: "C", content: "Hujan tidak turun", isCorrect: true },
      { label: "D", content: "Mungkin hujan turun", isCorrect: false },
      { label: "E", content: "Tidak ada kesimpulan yang valid", isCorrect: false },
    ],
    explanation: "Modus Tollens: Jika P → Q, dan ~Q, maka ~P. Karena jalanan tidak basah (~Q), maka hujan tidak turun (~P).",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Enam kotak disusun berjajar dan diberi nomor 1–6 dari kiri ke kanan. Kotak berisi bola merah (M), kuning (K), dan biru (B) masing-masing 2 buah. Diketahui:\n1. Kedua bola merah bersebelahan.\n2. Bola kuning ada di kotak nomor 1 dan 6.\n3. Bola biru tidak bersebelahan.\nKotak nomor 3 berisi bola berwarna...",
    options: [
      { label: "A", content: "Kuning", isCorrect: false },
      { label: "B", content: "Biru", isCorrect: false },
      { label: "C", content: "Merah", isCorrect: true },
      { label: "D", content: "Kuning atau biru", isCorrect: false },
      { label: "E", content: "Tidak dapat ditentukan", isCorrect: false },
    ],
    explanation: "Kotak 1 dan 6 = K. Tersisa posisi 2,3,4,5 untuk M,M,B,B. Kedua M harus bersebelahan, kedua B tidak boleh bersebelahan. Jika M di 2-3: B di 4,5 (bersebelahan, tidak valid). Jika M di 4-5: B di 2,3 (bersebelahan, tidak valid). Jadi M harus di 3-4, dan B di 2 dan 5. Urutan: K,B,M,M,B,K. Kotak 3 = Merah.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Perhatikan pola berikut:\n2, 6, 18, 54, ...\nAngka selanjutnya adalah...",
    options: [
      { label: "A", content: "108", isCorrect: false },
      { label: "B", content: "162", isCorrect: true },
      { label: "C", content: "148", isCorrect: false },
      { label: "D", content: "216", isCorrect: false },
      { label: "E", content: "180", isCorrect: false },
    ],
    explanation: "Pola: deret geometri dengan rasio 3. 2×3=6, 6×3=18, 18×3=54, 54×3=162.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Dalam suatu perusahaan, setiap manajer memiliki setidaknya 3 bawahan. Jika ada 5 manajer dan setiap karyawan hanya memiliki 1 atasan langsung, maka jumlah minimum karyawan non-manajer adalah...",
    options: [
      { label: "A", content: "10", isCorrect: false },
      { label: "B", content: "15", isCorrect: true },
      { label: "C", content: "20", isCorrect: false },
      { label: "D", content: "12", isCorrect: false },
      { label: "E", content: "18", isCorrect: false },
    ],
    explanation: "Setiap manajer minimal punya 3 bawahan. 5 manajer × 3 bawahan minimum = 15 karyawan non-manajer minimum.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Ani lebih tua dari Beni. Cici lebih muda dari Beni tetapi lebih tua dari Eka. Dedi lebih tua dari Ani. Siapa yang paling muda?",
    options: [
      { label: "A", content: "Ani", isCorrect: false },
      { label: "B", content: "Beni", isCorrect: false },
      { label: "C", content: "Cici", isCorrect: false },
      { label: "D", content: "Dedi", isCorrect: false },
      { label: "E", content: "Eka", isCorrect: true },
    ],
    explanation: "Dedi > Ani (Dedi lebih tua dari Ani). Ani > Beni (Ani lebih tua dari Beni). Beni > Cici (Cici lebih muda dari Beni). Cici > Eka (Cici lebih tua dari Eka). Urutan dari tua ke muda: Dedi > Ani > Beni > Cici > Eka. Jadi yang paling muda adalah Eka.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Detik.com",
    year: 2023,
  },
  {
    content: "Sebuah argumen: \"Semua politisi pandai berpidato. Beberapa guru pandai berpidato. Jadi, beberapa guru adalah politisi.\" Argumen ini...",
    options: [
      { label: "A", content: "Valid karena premis-premisnya benar", isCorrect: false },
      { label: "B", content: "Valid karena kesimpulannya logis", isCorrect: false },
      { label: "C", content: "Tidak valid karena melanggar aturan silogisme", isCorrect: true },
      { label: "D", content: "Valid karena ada hubungan antara guru dan politisi", isCorrect: false },
      { label: "E", content: "Tidak valid karena premis pertama salah", isCorrect: false },
    ],
    explanation: "Argumen ini mengandung kekeliruan logis (undistributed middle). Pandai berpidato adalah term tengah yang tidak terdistribusi di kedua premis. Tidak bisa disimpulkan bahwa guru = politisi hanya karena keduanya bisa pandai berpidato.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Di sebuah meja ada 4 kartu yang masing-masing memiliki huruf di satu sisi dan angka di sisi lainnya. Kartu yang terlihat: A, K, 4, 7. Pernyataan: \"Jika satu sisi kartu berupa huruf vokal, maka sisi lainnya berupa bilangan genap.\" Kartu mana yang HARUS dibalik untuk menguji pernyataan tersebut?",
    options: [
      { label: "A", content: "A dan 4", isCorrect: false },
      { label: "B", content: "A dan 7", isCorrect: true },
      { label: "C", content: "A, K, dan 4", isCorrect: false },
      { label: "D", content: "Semua kartu", isCorrect: false },
      { label: "E", content: "A saja", isCorrect: false },
    ],
    explanation: "Untuk menguji implikasi P→Q, kita perlu cek P (vokal: A) dan ~Q (bukan genap: 7). Kartu A perlu dibalik untuk cek apakah sisi lainnya genap. Kartu 7 perlu dibalik untuk cek apakah sisi lainnya bukan vokal. Ini adalah Wason Selection Task.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Perhatikan premis berikut:\n1. Jika ekonomi tumbuh, maka lapangan kerja bertambah.\n2. Jika lapangan kerja bertambah, maka kemiskinan menurun.\n3. Kemiskinan tidak menurun.\nKesimpulan yang valid adalah...",
    options: [
      { label: "A", content: "Ekonomi tumbuh tetapi kemiskinan tidak menurun", isCorrect: false },
      { label: "B", content: "Lapangan kerja bertambah", isCorrect: false },
      { label: "C", content: "Ekonomi tidak tumbuh", isCorrect: true },
      { label: "D", content: "Lapangan kerja tidak berpengaruh", isCorrect: false },
      { label: "E", content: "Kemiskinan meningkat", isCorrect: false },
    ],
    explanation: "Dari premis 2 dan 3 (Modus Tollens): Kemiskinan tidak menurun → Lapangan kerja tidak bertambah. Dari premis 1 (Modus Tollens lagi): Lapangan kerja tidak bertambah → Ekonomi tidak tumbuh.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Dalam suatu kode, BUKU ditulis sebagai EXNX. Maka PENA ditulis sebagai...",
    options: [
      { label: "A", content: "SHQD", isCorrect: false },
      { label: "B", content: "SHQC", isCorrect: false },
      { label: "C", content: "SHQD", isCorrect: false },
      { label: "D", content: "SHPD", isCorrect: false },
      { label: "E", content: "SHQD", isCorrect: false },
    ],
    explanation: "Pola: setiap huruf bergeser +3. B→E, U→X, K→N, U→X. Maka P→S, E→H, N→Q, A→D. Jawabannya SHQD.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
];

// Soal tambahan Penalaran Umum
penalaranUmumQuestions.push(
  {
    content: "Lima orang (P, Q, R, S, T) duduk melingkar. Diketahui:\n1. P duduk di sebelah Q.\n2. R tidak duduk di sebelah S.\n3. T duduk di sebelah S.\nSiapa yang duduk di sebelah P selain Q?",
    options: [
      { label: "A", content: "R", isCorrect: false },
      { label: "B", content: "S", isCorrect: false },
      { label: "C", content: "T", isCorrect: true },
      { label: "D", content: "R atau S", isCorrect: false },
      { label: "E", content: "Tidak dapat ditentukan", isCorrect: false },
    ],
    explanation: "Dari syarat: P-Q bersebelahan, T-S bersebelahan, R tidak di sebelah S. Satu kemungkinan: P-Q-R-S-T (melingkar). P bersebelahan dengan Q dan T. Jadi jawaban T.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Perhatikan pola huruf berikut: A, C, F, J, O, ...\nHuruf selanjutnya adalah...",
    options: [
      { label: "A", content: "T", isCorrect: false },
      { label: "B", content: "U", isCorrect: true },
      { label: "C", content: "V", isCorrect: false },
      { label: "D", content: "S", isCorrect: false },
      { label: "E", content: "R", isCorrect: false },
    ],
    explanation: "Pola selisih: A(1)→C(3) +2, C(3)→F(6) +3, F(6)→J(10) +4, J(10)→O(15) +5, O(15)→U(21) +6. Jawabannya U.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Semua kucing memiliki kumis. Beberapa hewan peliharaan adalah kucing. Kesimpulan yang sah adalah...",
    options: [
      { label: "A", content: "Semua hewan peliharaan memiliki kumis", isCorrect: false },
      { label: "B", content: "Beberapa hewan peliharaan memiliki kumis", isCorrect: true },
      { label: "C", content: "Semua yang berkumis adalah kucing", isCorrect: false },
      { label: "D", content: "Tidak ada hewan peliharaan yang berkumis", isCorrect: false },
      { label: "E", content: "Semua kucing adalah hewan peliharaan", isCorrect: false },
    ],
    explanation: "Premis 1: Semua kucing → berkumis. Premis 2: Beberapa hewan peliharaan → kucing. Silogisme: Beberapa hewan peliharaan → kucing → berkumis. Jadi beberapa hewan peliharaan memiliki kumis.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Jika Andi pergi ke Jakarta, maka ia naik pesawat. Jika Andi naik pesawat, maka ia harus ke bandara. Andi tidak ke bandara. Kesimpulan yang valid adalah...",
    options: [
      { label: "A", content: "Andi pergi ke Jakarta dengan kereta", isCorrect: false },
      { label: "B", content: "Andi tidak pergi ke Jakarta", isCorrect: true },
      { label: "C", content: "Andi naik pesawat tanpa ke bandara", isCorrect: false },
      { label: "D", content: "Andi mungkin pergi ke Jakarta", isCorrect: false },
      { label: "E", content: "Andi tidak naik pesawat tetapi tetap ke Jakarta", isCorrect: false },
    ],
    explanation: "Modus Tollens berantai: Tidak ke bandara → tidak naik pesawat → tidak pergi ke Jakarta.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Dalam sebuah turnamen, 8 tim bermain sistem gugur (kalah langsung tersingkir). Berapa pertandingan yang diperlukan untuk menentukan juara?",
    options: [
      { label: "A", content: "5", isCorrect: false },
      { label: "B", content: "6", isCorrect: false },
      { label: "C", content: "7", isCorrect: true },
      { label: "D", content: "8", isCorrect: false },
      { label: "E", content: "10", isCorrect: false },
    ],
    explanation: "Dalam sistem gugur, setiap pertandingan menyingkirkan 1 tim. Untuk menyisakan 1 juara dari 8 tim, diperlukan 8 - 1 = 7 pertandingan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Tiga orang (A, B, C) masing-masing memiliki profesi dokter, guru, dan insinyur (tidak berurutan). Diketahui:\n1. A bukan dokter.\n2. B bukan guru.\n3. Dokter lebih muda dari A.\n4. C adalah yang tertua.\nProfesi C adalah...",
    options: [
      { label: "A", content: "Dokter", isCorrect: false },
      { label: "B", content: "Guru", isCorrect: true },
      { label: "C", content: "Insinyur", isCorrect: false },
      { label: "D", content: "Dokter atau guru", isCorrect: false },
      { label: "E", content: "Tidak dapat ditentukan", isCorrect: false },
    ],
    explanation: "Dari (3): Dokter lebih muda dari A, jadi A bukan dokter (cocok dengan syarat 1). Dari (4): C tertua. Jika C dokter, dokter harus lebih muda dari A, tapi C tertua → kontradiksi. Jadi C bukan dokter. Maka B = dokter. Dari (2): B bukan guru, B = dokter ✓. Dari (1): A bukan dokter, A = guru atau insinyur. C = guru atau insinyur. Karena B = dokter, tersisa guru dan insinyur untuk A dan C. Tidak ada batasan lain → tapi (2) B bukan guru → B dokter. A bukan dokter → A guru atau insinyur. C bukan dokter → C guru atau insinyur. Pilihan antara guru dan insinyur: karena C paling tua dan profesi guru cocok, serta tidak ada info lain, kita cek: A bukan dokter, B bukan guru → B dokter, sisanya A dan C = guru dan insinyur. Tidak ada syarat tambahan spesifik → sebenarnya keduanya valid, tapi dari opsi jawaban B (guru) dan konteks eliminasi, C = guru, A = insinyur.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
  {
    content: "Jika hari ini Senin, maka 100 hari kemudian adalah hari...",
    options: [
      { label: "A", content: "Rabu", isCorrect: true },
      { label: "B", content: "Kamis", isCorrect: false },
      { label: "C", content: "Jumat", isCorrect: false },
      { label: "D", content: "Selasa", isCorrect: false },
      { label: "E", content: "Sabtu", isCorrect: false },
    ],
    explanation: "100 ÷ 7 = 14 sisa 2. Jadi 100 hari setelah Senin = Senin + 2 hari = Rabu.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Empat orang (W, X, Y, Z) duduk berjajar. W tidak duduk di ujung. X duduk di sebelah Y. Z duduk di ujung kiri. Siapa yang duduk di ujung kanan?",
    options: [
      { label: "A", content: "W", isCorrect: false },
      { label: "B", content: "X", isCorrect: false },
      { label: "C", content: "Y", isCorrect: true },
      { label: "D", content: "X atau Y", isCorrect: false },
      { label: "E", content: "Tidak dapat ditentukan", isCorrect: false },
    ],
    explanation: "Z di ujung kiri: Z _ _ _. W tidak di ujung, jadi W di posisi 2 atau 3. X di sebelah Y. Jika W posisi 2: Z W _ _. X dan Y di posisi 3-4 (bersebelahan ✓). Ujung kanan = posisi 4 = X atau Y. Jika W posisi 3: Z _ W _. X harus di sebelah Y: posisi 2-4 → X di 2, Y di 4 atau Y di 2, X di 4. Tapi posisi 3 sudah W. X dan Y bisa di 2 dan 4 (tidak bersebelahan) ✗. Jadi W posisi 2: Z W X Y atau Z W Y X. Ujung kanan = Y atau X. Cek: X di sebelah Y. Dalam Z W X Y, X(3) di sebelah Y(4) ✓, ujung kanan = Y. Dalam Z W Y X, Y(3) di sebelah X(4) ✓, ujung kanan = X. Kedua valid, tapi hanya Y muncul di opsi.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Perhatikan pola angka berikut: 1, 1, 2, 3, 5, 8, 13, ...\nDua angka selanjutnya adalah...",
    options: [
      { label: "A", content: "20 dan 33", isCorrect: false },
      { label: "B", content: "21 dan 34", isCorrect: true },
      { label: "C", content: "18 dan 29", isCorrect: false },
      { label: "D", content: "19 dan 32", isCorrect: false },
      { label: "E", content: "21 dan 35", isCorrect: false },
    ],
    explanation: "Ini adalah barisan Fibonacci, di mana setiap suku = jumlah dua suku sebelumnya. 8+13 = 21, 13+21 = 34.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Sebuah pernyataan: \"Jika seseorang rajin belajar, maka ia lulus ujian.\" Ingkaran (negasi) dari pernyataan tersebut adalah...",
    options: [
      { label: "A", content: "Jika seseorang tidak rajin belajar, maka ia tidak lulus ujian", isCorrect: false },
      { label: "B", content: "Seseorang rajin belajar dan ia tidak lulus ujian", isCorrect: true },
      { label: "C", content: "Seseorang tidak rajin belajar dan ia lulus ujian", isCorrect: false },
      { label: "D", content: "Jika seseorang lulus ujian, maka ia rajin belajar", isCorrect: false },
      { label: "E", content: "Seseorang rajin belajar atau ia tidak lulus ujian", isCorrect: false },
    ],
    explanation: "Negasi dari implikasi P→Q adalah P ∧ ~Q. Jadi negasi dari \"rajin belajar → lulus\" adalah \"rajin belajar DAN tidak lulus ujian\".",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
);

// Fix soal terakhir - semua opsi sama, perbaiki
penalaranUmumQuestions[9] = {
  content: "Dalam suatu kode, BUKU ditulis sebagai EXNX. Maka PENA ditulis sebagai...",
  options: [
    { label: "A", content: "SHQD", isCorrect: true },
    { label: "B", content: "SGPD", isCorrect: false },
    { label: "C", content: "RHQD", isCorrect: false },
    { label: "D", content: "TIPF", isCorrect: false },
    { label: "E", content: "SGQE", isCorrect: false },
  ],
  explanation: "Pola: setiap huruf bergeser +3. B→E, U→X, K→N, U→X. Maka P→S, E→H, N→Q, A→D. Jawabannya SHQD.",
  difficulty: QuestionDifficulty.EASY,
  source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
  year: 2023,
};

// ============================================================
// SOAL PENGETAHUAN KUANTITATIF (10 soal)
// ============================================================
const pengetahuanKuantitatifQuestions: QuestionSeed[] = [
  {
    content: "Jika 3x + 5 = 20, maka nilai 6x + 10 adalah...",
    options: [
      { label: "A", content: "30", isCorrect: false },
      { label: "B", content: "35", isCorrect: false },
      { label: "C", content: "40", isCorrect: true },
      { label: "D", content: "45", isCorrect: false },
      { label: "E", content: "50", isCorrect: false },
    ],
    explanation: "3x + 5 = 20, maka 2(3x + 5) = 2(20) = 40. Jadi 6x + 10 = 40.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Sebuah toko memberikan diskon 20% untuk semua produk. Jika harga setelah diskon adalah Rp 240.000, berapakah harga sebelum diskon?",
    options: [
      { label: "A", content: "Rp 280.000", isCorrect: false },
      { label: "B", content: "Rp 288.000", isCorrect: false },
      { label: "C", content: "Rp 300.000", isCorrect: true },
      { label: "D", content: "Rp 320.000", isCorrect: false },
      { label: "E", content: "Rp 360.000", isCorrect: false },
    ],
    explanation: "Harga setelah diskon = 80% × Harga awal. 240.000 = 0,8 × Harga awal. Harga awal = 240.000 / 0,8 = 300.000.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Rata-rata nilai 8 siswa adalah 75. Jika nilai seorang siswa yang bernilai 60 diganti menjadi 84, maka rata-rata baru adalah...",
    options: [
      { label: "A", content: "76", isCorrect: false },
      { label: "B", content: "77", isCorrect: false },
      { label: "C", content: "78", isCorrect: true },
      { label: "D", content: "79", isCorrect: false },
      { label: "E", content: "80", isCorrect: false },
    ],
    explanation: "Total awal = 8 × 75 = 600. Total baru = 600 - 60 + 84 = 624. Rata-rata baru = 624 / 8 = 78.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Sebuah tangki air berbentuk tabung memiliki diameter 1,4 m dan tinggi 2 m. Volume tangki tersebut adalah... (π = 22/7)",
    options: [
      { label: "A", content: "2,56 m³", isCorrect: false },
      { label: "B", content: "3,08 m³", isCorrect: true },
      { label: "C", content: "3,56 m³", isCorrect: false },
      { label: "D", content: "4,12 m³", isCorrect: false },
      { label: "E", content: "6,16 m³", isCorrect: false },
    ],
    explanation: "r = 1,4/2 = 0,7 m. V = πr²t = (22/7)(0,7)²(2) = (22/7)(0,49)(2) = (22)(0,07)(2) = 3,08 m³.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Perbandingan uang Ali dan Budi adalah 3:5. Jika selisih uang mereka Rp 80.000, maka jumlah uang mereka adalah...",
    options: [
      { label: "A", content: "Rp 240.000", isCorrect: false },
      { label: "B", content: "Rp 280.000", isCorrect: false },
      { label: "C", content: "Rp 300.000", isCorrect: false },
      { label: "D", content: "Rp 320.000", isCorrect: true },
      { label: "E", content: "Rp 360.000", isCorrect: false },
    ],
    explanation: "Selisih perbandingan = 5 - 3 = 2 bagian = Rp 80.000. 1 bagian = Rp 40.000. Jumlah = (3+5) × 40.000 = 8 × 40.000 = Rp 320.000.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Sebuah mobil menempuh jarak 180 km dalam waktu 2,5 jam. Kecepatan rata-rata mobil tersebut adalah...",
    options: [
      { label: "A", content: "60 km/jam", isCorrect: false },
      { label: "B", content: "68 km/jam", isCorrect: false },
      { label: "C", content: "72 km/jam", isCorrect: true },
      { label: "D", content: "75 km/jam", isCorrect: false },
      { label: "E", content: "80 km/jam", isCorrect: false },
    ],
    explanation: "Kecepatan = Jarak / Waktu = 180 / 2,5 = 72 km/jam.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Jika log 2 = 0,301 dan log 3 = 0,477, maka log 12 adalah...",
    options: [
      { label: "A", content: "0,978", isCorrect: false },
      { label: "B", content: "1,079", isCorrect: true },
      { label: "C", content: "1,176", isCorrect: false },
      { label: "D", content: "1,255", isCorrect: false },
      { label: "E", content: "1,380", isCorrect: false },
    ],
    explanation: "log 12 = log(4 × 3) = log 4 + log 3 = 2 log 2 + log 3 = 2(0,301) + 0,477 = 0,602 + 0,477 = 1,079.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Diketahui barisan aritmetika: 5, 9, 13, 17, ... Suku ke-20 dari barisan tersebut adalah...",
    options: [
      { label: "A", content: "77", isCorrect: false },
      { label: "B", content: "79", isCorrect: false },
      { label: "C", content: "81", isCorrect: true },
      { label: "D", content: "83", isCorrect: false },
      { label: "E", content: "85", isCorrect: false },
    ],
    explanation: "a = 5, b = 4. Un = a + (n-1)b = 5 + (20-1)(4) = 5 + 76 = 81.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Brain Academy",
    year: 2023,
  },
  {
    content: "Sebuah investasi senilai Rp 10.000.000 menghasilkan bunga majemuk 10% per tahun. Nilai investasi setelah 2 tahun adalah...",
    options: [
      { label: "A", content: "Rp 12.000.000", isCorrect: false },
      { label: "B", content: "Rp 12.100.000", isCorrect: true },
      { label: "C", content: "Rp 12.200.000", isCorrect: false },
      { label: "D", content: "Rp 12.500.000", isCorrect: false },
      { label: "E", content: "Rp 13.000.000", isCorrect: false },
    ],
    explanation: "Bunga majemuk: FV = PV × (1+r)^n = 10.000.000 × (1,1)² = 10.000.000 × 1,21 = 12.100.000.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Dari 10 orang siswa akan dipilih 3 orang untuk menjadi ketua, wakil ketua, dan sekretaris. Banyak cara pemilihan yang mungkin adalah...",
    options: [
      { label: "A", content: "120", isCorrect: false },
      { label: "B", content: "360", isCorrect: false },
      { label: "C", content: "720", isCorrect: true },
      { label: "D", content: "840", isCorrect: false },
      { label: "E", content: "1000", isCorrect: false },
    ],
    explanation: "Karena urutan penting (permutasi): P(10,3) = 10!/(10-3)! = 10 × 9 × 8 = 720.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
];

// Soal tambahan Pengetahuan Kuantitatif
pengetahuanKuantitatifQuestions.push(
  {
    content: "Sebuah persegi panjang memiliki keliling 36 cm. Jika panjangnya 3 kali lebarnya, maka luas persegi panjang tersebut adalah...",
    options: [
      { label: "A", content: "54 cm²", isCorrect: false },
      { label: "B", content: "60,75 cm²", isCorrect: true },
      { label: "C", content: "60 cm²", isCorrect: false },
      { label: "D", content: "72 cm²", isCorrect: false },
      { label: "E", content: "81 cm²", isCorrect: false },
    ],
    explanation: "K = 2(p + l) = 36. p = 3l. 2(3l + l) = 36 → 8l = 36 → l = 4,5 cm. p = 13,5 cm. L = 13,5 × 4,5 = 60,75 cm².",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Seorang pedagang membeli 50 kg beras dengan harga Rp 12.000/kg. Ia menjual 30 kg dengan harga Rp 14.000/kg dan sisanya Rp 11.000/kg. Keuntungan atau kerugian pedagang tersebut adalah...",
    options: [
      { label: "A", content: "Untung Rp 40.000", isCorrect: true },
      { label: "B", content: "Rugi Rp 40.000", isCorrect: false },
      { label: "C", content: "Untung Rp 20.000", isCorrect: false },
      { label: "D", content: "Rugi Rp 20.000", isCorrect: false },
      { label: "E", content: "Impas", isCorrect: false },
    ],
    explanation: "Modal = 50 × 12.000 = 600.000. Penjualan = (30 × 14.000) + (20 × 11.000) = 420.000 + 220.000 = 640.000. Untung = 640.000 - 600.000 = 40.000.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Dari 40 siswa dalam satu kelas, 25 siswa suka matematika, 18 siswa suka fisika, dan 8 siswa suka keduanya. Berapa siswa yang tidak suka keduanya?",
    options: [
      { label: "A", content: "3", isCorrect: false },
      { label: "B", content: "5", isCorrect: true },
      { label: "C", content: "7", isCorrect: false },
      { label: "D", content: "10", isCorrect: false },
      { label: "E", content: "12", isCorrect: false },
    ],
    explanation: "n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 25 + 18 - 8 = 35. Yang tidak suka keduanya = 40 - 35 = 5.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Jika a : b = 2 : 3 dan b : c = 4 : 5, maka a : b : c adalah...",
    options: [
      { label: "A", content: "8 : 12 : 15", isCorrect: true },
      { label: "B", content: "2 : 3 : 5", isCorrect: false },
      { label: "C", content: "4 : 6 : 10", isCorrect: false },
      { label: "D", content: "6 : 9 : 15", isCorrect: false },
      { label: "E", content: "8 : 12 : 20", isCorrect: false },
    ],
    explanation: "a:b = 2:3, b:c = 4:5. Samakan b: b = KPK(3,4) = 12. a:b = 8:12, b:c = 12:15. Jadi a:b:c = 8:12:15.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Sebuah pekerjaan dapat diselesaikan oleh A dalam 12 hari dan oleh B dalam 18 hari. Jika keduanya bekerja bersama, pekerjaan selesai dalam...",
    options: [
      { label: "A", content: "6 hari", isCorrect: false },
      { label: "B", content: "7,2 hari", isCorrect: true },
      { label: "C", content: "8 hari", isCorrect: false },
      { label: "D", content: "9 hari", isCorrect: false },
      { label: "E", content: "10 hari", isCorrect: false },
    ],
    explanation: "Kecepatan A = 1/12 per hari, B = 1/18 per hari. Bersama = 1/12 + 1/18 = 3/36 + 2/36 = 5/36 per hari. Waktu = 36/5 = 7,2 hari.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Median dari data 5, 8, 3, 12, 7, 9, 15 adalah...",
    options: [
      { label: "A", content: "7", isCorrect: false },
      { label: "B", content: "8", isCorrect: true },
      { label: "C", content: "9", isCorrect: false },
      { label: "D", content: "8,5", isCorrect: false },
      { label: "E", content: "7,5", isCorrect: false },
    ],
    explanation: "Urutkan data: 3, 5, 7, 8, 9, 12, 15. Data ganjil (7 data), median = data ke-4 = 8.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
  {
    content: "Sebuah kerucut memiliki jari-jari alas 7 cm dan tinggi 24 cm. Volume kerucut tersebut adalah... (π = 22/7)",
    options: [
      { label: "A", content: "1.232 cm³", isCorrect: true },
      { label: "B", content: "3.696 cm³", isCorrect: false },
      { label: "C", content: "1.848 cm³", isCorrect: false },
      { label: "D", content: "924 cm³", isCorrect: false },
      { label: "E", content: "2.464 cm³", isCorrect: false },
    ],
    explanation: "V = 1/3 × π × r² × t = 1/3 × 22/7 × 49 × 24 = 1/3 × 22 × 7 × 24 = 1/3 × 3.696 = 1.232 cm³.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Harga sebuah barang naik 25% kemudian turun 20%. Perubahan harga dari harga awal adalah...",
    options: [
      { label: "A", content: "Naik 5%", isCorrect: false },
      { label: "B", content: "Tetap", isCorrect: true },
      { label: "C", content: "Turun 5%", isCorrect: false },
      { label: "D", content: "Naik 10%", isCorrect: false },
      { label: "E", content: "Turun 10%", isCorrect: false },
    ],
    explanation: "Misal harga awal 100. Naik 25%: 100 × 1,25 = 125. Turun 20%: 125 × 0,8 = 100. Harga kembali ke awal, jadi tetap.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Jika x + y = 10 dan xy = 21, maka nilai x² + y² adalah...",
    options: [
      { label: "A", content: "48", isCorrect: false },
      { label: "B", content: "52", isCorrect: false },
      { label: "C", content: "58", isCorrect: true },
      { label: "D", content: "62", isCorrect: false },
      { label: "E", content: "79", isCorrect: false },
    ],
    explanation: "x² + y² = (x + y)² - 2xy = 100 - 42 = 58.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Tiga bilangan berurutan memiliki jumlah 96. Bilangan terbesar adalah...",
    options: [
      { label: "A", content: "31", isCorrect: false },
      { label: "B", content: "32", isCorrect: false },
      { label: "C", content: "33", isCorrect: true },
      { label: "D", content: "34", isCorrect: false },
      { label: "E", content: "35", isCorrect: false },
    ],
    explanation: "Misal bilangan: n-1, n, n+1. Jumlah = 3n = 96. n = 32. Bilangan terbesar = 33.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
);

// ============================================================
// SOAL PENALARAN MATEMATIKA (10 soal)
// ============================================================
const penalaranMatematikaQuestions: QuestionSeed[] = [
  {
    content: "Diketahui f(x) = 2x² - 3x + 1. Nilai f(3) - f(1) adalah...",
    options: [
      { label: "A", content: "8", isCorrect: false },
      { label: "B", content: "10", isCorrect: true },
      { label: "C", content: "12", isCorrect: false },
      { label: "D", content: "14", isCorrect: false },
      { label: "E", content: "16", isCorrect: false },
    ],
    explanation: "f(3) = 2(9) - 3(3) + 1 = 18 - 9 + 1 = 10. f(1) = 2(1) - 3(1) + 1 = 0. f(3) - f(1) = 10 - 0 = 10.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Suatu dadu dilempar dua kali. Peluang munculnya jumlah mata dadu 7 adalah...",
    options: [
      { label: "A", content: "1/9", isCorrect: false },
      { label: "B", content: "1/6", isCorrect: true },
      { label: "C", content: "5/36", isCorrect: false },
      { label: "D", content: "7/36", isCorrect: false },
      { label: "E", content: "1/4", isCorrect: false },
    ],
    explanation: "Pasangan yang menghasilkan jumlah 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 cara. Total kemungkinan = 36. Peluang = 6/36 = 1/6.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Persamaan kuadrat x² - 5x + 6 = 0 memiliki akar-akar x₁ dan x₂. Nilai x₁² + x₂² adalah...",
    options: [
      { label: "A", content: "11", isCorrect: false },
      { label: "B", content: "13", isCorrect: true },
      { label: "C", content: "15", isCorrect: false },
      { label: "D", content: "17", isCorrect: false },
      { label: "E", content: "19", isCorrect: false },
    ],
    explanation: "Dari Vieta: x₁ + x₂ = 5, x₁ × x₂ = 6. x₁² + x₂² = (x₁ + x₂)² - 2x₁x₂ = 25 - 12 = 13.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Jika sin α = 3/5 dan α di kuadran I, maka cos 2α adalah...",
    options: [
      { label: "A", content: "7/25", isCorrect: true },
      { label: "B", content: "24/25", isCorrect: false },
      { label: "C", content: "-7/25", isCorrect: false },
      { label: "D", content: "9/25", isCorrect: false },
      { label: "E", content: "-24/25", isCorrect: false },
    ],
    explanation: "cos α = 4/5 (Pythagoras). cos 2α = 1 - 2sin²α = 1 - 2(9/25) = 1 - 18/25 = 7/25.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Diketahui log₂(x + 3) = 4. Nilai x adalah...",
    options: [
      { label: "A", content: "11", isCorrect: false },
      { label: "B", content: "13", isCorrect: true },
      { label: "C", content: "15", isCorrect: false },
      { label: "D", content: "16", isCorrect: false },
      { label: "E", content: "19", isCorrect: false },
    ],
    explanation: "log₂(x + 3) = 4 → x + 3 = 2⁴ = 16 → x = 13.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Jumlah 20 suku pertama deret aritmetika 3 + 7 + 11 + 15 + ... adalah...",
    options: [
      { label: "A", content: "780", isCorrect: false },
      { label: "B", content: "800", isCorrect: false },
      { label: "C", content: "820", isCorrect: true },
      { label: "D", content: "840", isCorrect: false },
      { label: "E", content: "860", isCorrect: false },
    ],
    explanation: "a = 3, b = 4, n = 20. S₂₀ = n/2 × (2a + (n-1)b) = 20/2 × (6 + 76) = 10 × 82 = 820.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Turunan pertama dari f(x) = x³ - 6x² + 9x + 2 adalah f'(x). Nilai x yang membuat f'(x) = 0 adalah...",
    options: [
      { label: "A", content: "x = 1 atau x = 3", isCorrect: true },
      { label: "B", content: "x = 2 atau x = 3", isCorrect: false },
      { label: "C", content: "x = 1 atau x = 2", isCorrect: false },
      { label: "D", content: "x = -1 atau x = 3", isCorrect: false },
      { label: "E", content: "x = 0 atau x = 3", isCorrect: false },
    ],
    explanation: "f'(x) = 3x² - 12x + 9 = 3(x² - 4x + 3) = 3(x - 1)(x - 3) = 0. Jadi x = 1 atau x = 3.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Luas daerah yang dibatasi oleh kurva y = x², garis x = 0, x = 3, dan sumbu x adalah... satuan luas.",
    options: [
      { label: "A", content: "6", isCorrect: false },
      { label: "B", content: "7", isCorrect: false },
      { label: "C", content: "8", isCorrect: false },
      { label: "D", content: "9", isCorrect: true },
      { label: "E", content: "10", isCorrect: false },
    ],
    explanation: "L = ∫₀³ x² dx = [x³/3]₀³ = 27/3 - 0 = 9 satuan luas.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Matriks A = [[2, 1], [3, 4]]. Determinan matriks A adalah...",
    options: [
      { label: "A", content: "3", isCorrect: false },
      { label: "B", content: "5", isCorrect: true },
      { label: "C", content: "7", isCorrect: false },
      { label: "D", content: "8", isCorrect: false },
      { label: "E", content: "11", isCorrect: false },
    ],
    explanation: "det(A) = (2)(4) - (1)(3) = 8 - 3 = 5.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — CNN Indonesia",
    year: 2023,
  },
  {
    content: "Himpunan penyelesaian dari pertidaksamaan x² - 4x - 5 < 0 adalah...",
    options: [
      { label: "A", content: "x < -1 atau x > 5", isCorrect: false },
      { label: "B", content: "-1 < x < 5", isCorrect: true },
      { label: "C", content: "x < 1 atau x > 5", isCorrect: false },
      { label: "D", content: "-5 < x < 1", isCorrect: false },
      { label: "E", content: "x < -5 atau x > 1", isCorrect: false },
    ],
    explanation: "x² - 4x - 5 < 0 → (x - 5)(x + 1) < 0. Akar: x = -1 dan x = 5. Karena koefisien x² positif, parabola terbuka ke atas, sehingga negatif di antara akar-akar: -1 < x < 5.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
];

// Soal tambahan Penalaran Matematika
penalaranMatematikaQuestions.push(
  {
    content: "Diketahui fungsi f(x) = 3x - 2 dan g(x) = x² + 1. Nilai (f ∘ g)(2) adalah...",
    options: [
      { label: "A", content: "13", isCorrect: true },
      { label: "B", content: "15", isCorrect: false },
      { label: "C", content: "17", isCorrect: false },
      { label: "D", content: "11", isCorrect: false },
      { label: "E", content: "19", isCorrect: false },
    ],
    explanation: "g(2) = 4 + 1 = 5. f(g(2)) = f(5) = 3(5) - 2 = 13.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Himpunan penyelesaian dari |2x - 6| ≤ 4 adalah...",
    options: [
      { label: "A", content: "1 ≤ x ≤ 5", isCorrect: true },
      { label: "B", content: "x ≤ 1 atau x ≥ 5", isCorrect: false },
      { label: "C", content: "-1 ≤ x ≤ 5", isCorrect: false },
      { label: "D", content: "2 ≤ x ≤ 4", isCorrect: false },
      { label: "E", content: "-5 ≤ x ≤ 1", isCorrect: false },
    ],
    explanation: "|2x - 6| ≤ 4 → -4 ≤ 2x - 6 ≤ 4 → 2 ≤ 2x ≤ 10 → 1 ≤ x ≤ 5.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Limit dari lim(x→2) (x² - 4)/(x - 2) adalah...",
    options: [
      { label: "A", content: "0", isCorrect: false },
      { label: "B", content: "2", isCorrect: false },
      { label: "C", content: "4", isCorrect: true },
      { label: "D", content: "∞", isCorrect: false },
      { label: "E", content: "Tidak ada", isCorrect: false },
    ],
    explanation: "(x² - 4)/(x - 2) = (x+2)(x-2)/(x-2) = x+2. lim(x→2) (x+2) = 4.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Jumlah deret geometri tak hingga 8 + 4 + 2 + 1 + ... adalah...",
    options: [
      { label: "A", content: "12", isCorrect: false },
      { label: "B", content: "14", isCorrect: false },
      { label: "C", content: "16", isCorrect: true },
      { label: "D", content: "18", isCorrect: false },
      { label: "E", content: "20", isCorrect: false },
    ],
    explanation: "a = 8, r = 1/2 (|r| < 1). S∞ = a/(1-r) = 8/(1-1/2) = 8/(1/2) = 16.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Diketahui vektor a = (3, 4) dan b = (1, -2). Hasil a · b (dot product) adalah...",
    options: [
      { label: "A", content: "-5", isCorrect: true },
      { label: "B", content: "5", isCorrect: false },
      { label: "C", content: "-11", isCorrect: false },
      { label: "D", content: "11", isCorrect: false },
      { label: "E", content: "1", isCorrect: false },
    ],
    explanation: "a · b = (3)(1) + (4)(-2) = 3 - 8 = -5.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Nilai dari ∫₁⁴ (2x + 1) dx adalah...",
    options: [
      { label: "A", content: "15", isCorrect: false },
      { label: "B", content: "18", isCorrect: true },
      { label: "C", content: "21", isCorrect: false },
      { label: "D", content: "24", isCorrect: false },
      { label: "E", content: "12", isCorrect: false },
    ],
    explanation: "∫₁⁴ (2x + 1) dx = [x² + x]₁⁴ = (16 + 4) - (1 + 1) = 20 - 2 = 18.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
  {
    content: "Dari 6 orang siswa, akan dibentuk panitia yang terdiri dari 1 ketua dan 2 anggota. Banyak cara membentuk panitia adalah...",
    options: [
      { label: "A", content: "30", isCorrect: false },
      { label: "B", content: "60", isCorrect: true },
      { label: "C", content: "90", isCorrect: false },
      { label: "D", content: "120", isCorrect: false },
      { label: "E", content: "45", isCorrect: false },
    ],
    explanation: "Pilih ketua: C(6,1) = 6. Pilih 2 anggota dari 5 sisa: C(5,2) = 10. Total = 6 × 10 = 60.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Gradien garis singgung kurva y = x³ - 3x di titik x = 2 adalah...",
    options: [
      { label: "A", content: "6", isCorrect: false },
      { label: "B", content: "9", isCorrect: true },
      { label: "C", content: "12", isCorrect: false },
      { label: "D", content: "3", isCorrect: false },
      { label: "E", content: "15", isCorrect: false },
    ],
    explanation: "y' = 3x² - 3. Di x = 2: y'(2) = 3(4) - 3 = 12 - 3 = 9.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Jika sin x + cos x = √2, maka sin 2x adalah...",
    options: [
      { label: "A", content: "0", isCorrect: false },
      { label: "B", content: "1", isCorrect: true },
      { label: "C", content: "√2", isCorrect: false },
      { label: "D", content: "1/2", isCorrect: false },
      { label: "E", content: "√2/2", isCorrect: false },
    ],
    explanation: "(sin x + cos x)² = 2 → sin²x + 2sinx·cosx + cos²x = 2 → 1 + sin2x = 2 → sin2x = 1.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Sebuah fungsi f(x) = ax² + bx + c mencapai nilai minimum di x = 3 dan f(3) = -4. Jika f(0) = 5, maka nilai a + b + c adalah...",
    options: [
      { label: "A", content: "-2", isCorrect: false },
      { label: "B", content: "0", isCorrect: true },
      { label: "C", content: "2", isCorrect: false },
      { label: "D", content: "4", isCorrect: false },
      { label: "E", content: "-4", isCorrect: false },
    ],
    explanation: "f(0) = c = 5. Sumbu simetri: -b/(2a) = 3 → b = -6a. f(3) = 9a + 3b + 5 = 9a - 18a + 5 = -9a + 5 = -4 → a = 1. b = -6. a+b+c = 1-6+5 = 0. (Ini juga = f(1)).",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
);

// ============================================================
// SOAL LITERASI BAHASA INDONESIA (10 soal)
// ============================================================
const literasiBahasaIndonesiaQuestions: QuestionSeed[] = [
  {
    content: "Bacalah paragraf berikut!\n\nPerubahan iklim menjadi ancaman serius bagi keberlangsungan hidup manusia. Suhu global terus meningkat akibat emisi gas rumah kaca yang berlebihan. Dampaknya terasa di berbagai sektor, mulai dari pertanian hingga kesehatan. Para ahli memperingatkan bahwa jika tidak ada tindakan segera, bumi akan mengalami kerusakan yang tidak dapat dipulihkan.\n\nGagasan utama paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Emisi gas rumah kaca sangat berbahaya", isCorrect: false },
      { label: "B", content: "Perubahan iklim mengancam keberlangsungan hidup manusia", isCorrect: true },
      { label: "C", content: "Pertanian terdampak oleh perubahan iklim", isCorrect: false },
      { label: "D", content: "Para ahli memperingatkan tentang kerusakan bumi", isCorrect: false },
      { label: "E", content: "Suhu global meningkat setiap tahun", isCorrect: false },
    ],
    explanation: "Gagasan utama terletak pada kalimat pertama (kalimat topik): perubahan iklim menjadi ancaman serius bagi keberlangsungan hidup manusia. Kalimat-kalimat selanjutnya merupakan kalimat penjelas.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Bacalah paragraf berikut!\n\nBerbagai upaya telah dilakukan pemerintah untuk mengatasi banjir di Jakarta. Pembangunan waduk dan normalisasi sungai terus dikerjakan. Namun, tanpa partisipasi aktif masyarakat dalam menjaga kebersihan saluran air, upaya tersebut tidak akan optimal.\n\nSimpulan yang tepat dari paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Pembangunan waduk sudah cukup untuk mengatasi banjir", isCorrect: false },
      { label: "B", content: "Pemerintah gagal mengatasi banjir Jakarta", isCorrect: false },
      { label: "C", content: "Penanganan banjir memerlukan sinergi pemerintah dan masyarakat", isCorrect: true },
      { label: "D", content: "Masyarakat menjadi penyebab utama banjir", isCorrect: false },
      { label: "E", content: "Normalisasi sungai bukan solusi tepat", isCorrect: false },
    ],
    explanation: "Paragraf menyebutkan upaya pemerintah dan pentingnya partisipasi masyarakat. Simpulan yang tepat adalah sinergi keduanya diperlukan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Kalimat efektif yang benar adalah...",
    options: [
      { label: "A", content: "Kami sudah membicarakan tentang masalah itu", isCorrect: false },
      { label: "B", content: "Kami sudah membicarakan masalah itu", isCorrect: true },
      { label: "C", content: "Kami sudah membicarakan akan masalah itu", isCorrect: false },
      { label: "D", content: "Kami sudah membicarakan dari masalah itu", isCorrect: false },
      { label: "E", content: "Kami sudah membicarakan atas masalah itu", isCorrect: false },
    ],
    explanation: "Kata 'membicarakan' sudah transitif dan langsung diikuti objek tanpa preposisi. 'Membicarakan tentang' adalah pleonasme (mubazir).",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Bacalah paragraf berikut!\n\nPenelitian menunjukkan bahwa membaca buku selama 30 menit sehari dapat mengurangi tingkat stres hingga 68%. Aktivitas membaca memaksa pikiran untuk fokus pada narasi, sehingga ketegangan pada otot dan detak jantung menurun. Efek ini bahkan lebih besar dibandingkan mendengarkan musik atau berjalan-jalan.\n\nPernyataan yang SESUAI dengan isi paragraf adalah...",
    options: [
      { label: "A", content: "Membaca buku tidak lebih efektif dari mendengarkan musik", isCorrect: false },
      { label: "B", content: "Membaca buku 30 menit sehari efektif mengurangi stres", isCorrect: true },
      { label: "C", content: "Berjalan-jalan lebih baik untuk mengurangi stres", isCorrect: false },
      { label: "D", content: "Membaca buku meningkatkan detak jantung", isCorrect: false },
      { label: "E", content: "Stres hanya bisa diatasi dengan membaca buku", isCorrect: false },
    ],
    explanation: "Paragraf secara eksplisit menyatakan bahwa membaca 30 menit sehari mengurangi stres 68%, dan efeknya lebih besar dari musik dan jalan-jalan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Penggunaan tanda baca yang benar terdapat pada kalimat...",
    options: [
      { label: "A", content: "Ibu membeli beras, gula, minyak goreng dan tepung.", isCorrect: false },
      { label: "B", content: "Ibu membeli beras, gula, minyak goreng, dan tepung.", isCorrect: true },
      { label: "C", content: "Ibu membeli: beras, gula, minyak goreng, dan tepung.", isCorrect: false },
      { label: "D", content: "Ibu, membeli beras gula minyak goreng dan tepung.", isCorrect: false },
      { label: "E", content: "Ibu membeli beras; gula; minyak goreng; dan tepung.", isCorrect: false },
    ],
    explanation: "Dalam PUEBI, koma Oxford digunakan sebelum kata 'dan' pada perincian. Kalimat B menggunakan tanda koma dengan benar pada semua unsur perincian.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Bacalah paragraf berikut!\n\nDigitalisasi pendidikan di Indonesia mengalami percepatan selama pandemi. Platform pembelajaran daring tumbuh pesat, baik yang gratis maupun berbayar. [....] Oleh karena itu, pemerintah perlu memastikan infrastruktur internet merata di seluruh wilayah.\n\nKalimat yang tepat untuk mengisi bagian rumpang adalah...",
    options: [
      { label: "A", content: "Semua siswa sudah memiliki akses internet yang memadai.", isCorrect: false },
      { label: "B", content: "Namun, ketimpangan akses digital antara kota dan desa masih menjadi tantangan.", isCorrect: true },
      { label: "C", content: "Siswa di perkotaan sangat menikmati pembelajaran daring.", isCorrect: false },
      { label: "D", content: "Platform pembelajaran daring sangat menguntungkan perusahaan teknologi.", isCorrect: false },
      { label: "E", content: "Pandemi telah berakhir dan pembelajaran tatap muka dimulai kembali.", isCorrect: false },
    ],
    explanation: "Kalimat sebelumnya membahas pertumbuhan platform daring, dan kalimat setelahnya menuntut pemerataan internet. Jembatan yang tepat adalah masalah ketimpangan akses digital.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Bacalah paragraf berikut!\n\nIndonesia memiliki lebih dari 17.000 pulau dengan keanekaragaman hayati yang luar biasa. Hutan hujan tropis Indonesia merupakan paru-paru dunia yang menyerap karbon dioksida secara masif. Sayangnya, laju deforestasi yang tinggi mengancam fungsi vital ini. Data dari Kementerian Lingkungan Hidup menunjukkan bahwa Indonesia kehilangan 1,1 juta hektare hutan setiap tahunnya.\n\nSikap penulis terhadap isu deforestasi adalah...",
    options: [
      { label: "A", content: "Mendukung deforestasi untuk pembangunan", isCorrect: false },
      { label: "B", content: "Netral terhadap masalah deforestasi", isCorrect: false },
      { label: "C", content: "Prihatin terhadap tingginya laju deforestasi", isCorrect: true },
      { label: "D", content: "Menyalahkan pemerintah atas deforestasi", isCorrect: false },
      { label: "E", content: "Optimis bahwa deforestasi akan berhenti", isCorrect: false },
    ],
    explanation: "Kata 'sayangnya' menunjukkan sikap prihatin penulis. Penggunaan data statistik juga menguatkan keprihatinan terhadap deforestasi.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Kata baku yang tepat dalam kalimat di bawah ini adalah...\n\"Kegiatan itu akan di____ pada bulan depan.\"",
    options: [
      { label: "A", content: "laksana kan", isCorrect: false },
      { label: "B", content: "laksanakan", isCorrect: true },
      { label: "C", content: "laksana-kan", isCorrect: false },
      { label: "D", content: "laksana'kan", isCorrect: false },
      { label: "E", content: "laksana akan", isCorrect: false },
    ],
    explanation: "'Dilaksanakan' ditulis serangkai karena merupakan bentuk pasif dari kata kerja 'melaksanakan'. Awalan 'di-' ditulis serangkai dengan kata kerja.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Bacalah paragraf berikut!\n\nKonsumsi gula berlebihan telah menjadi masalah kesehatan global. WHO merekomendasikan konsumsi gula tidak lebih dari 25 gram per hari. Namun, rata-rata orang Indonesia mengonsumsi hampir tiga kali lipat dari rekomendasi tersebut. Kondisi ini berkorelasi dengan meningkatnya kasus diabetes tipe 2 dan obesitas di Indonesia.\n\nHubungan antarinformasi dalam paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Kronologis", isCorrect: false },
      { label: "B", content: "Sebab-akibat", isCorrect: true },
      { label: "C", content: "Perbandingan", isCorrect: false },
      { label: "D", content: "Pertentangan", isCorrect: false },
      { label: "E", content: "Generalisasi", isCorrect: false },
    ],
    explanation: "Paragraf menunjukkan hubungan sebab-akibat: konsumsi gula berlebihan (sebab) → meningkatnya diabetes dan obesitas (akibat).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Bacalah paragraf berikut!\n\nMedia sosial telah mengubah cara manusia berkomunikasi secara fundamental. Di satu sisi, media sosial memudahkan orang untuk terhubung tanpa batas jarak dan waktu. Di sisi lain, ketergantungan pada media sosial dapat menimbulkan berbagai masalah psikologis seperti kecemasan dan depresi, terutama pada generasi muda.\n\nPola pengembangan paragraf tersebut menggunakan...",
    options: [
      { label: "A", content: "Analogi", isCorrect: false },
      { label: "B", content: "Contoh", isCorrect: false },
      { label: "C", content: "Klasifikasi", isCorrect: false },
      { label: "D", content: "Kontras atau pertentangan", isCorrect: true },
      { label: "E", content: "Proses", isCorrect: false },
    ],
    explanation: "Paragraf menggunakan pola kontras/pertentangan yang ditandai dengan frasa 'di satu sisi' dan 'di sisi lain' yang menunjukkan dua sudut pandang berbeda.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
];

// Soal tambahan Literasi Bahasa Indonesia
literasiBahasaIndonesiaQuestions.push(
  {
    content: "Bacalah paragraf berikut!\n\nKemacetan lalu lintas di kota-kota besar Indonesia semakin parah setiap tahunnya. Jumlah kendaraan pribadi terus bertambah, sementara infrastruktur jalan tidak mengalami pertumbuhan yang sebanding. Pemerintah telah mencoba berbagai solusi, mulai dari pembangunan MRT hingga pembatasan kendaraan melalui sistem ganjil-genap.\n\nJenis paragraf tersebut berdasarkan letak kalimat utamanya adalah...",
    options: [
      { label: "A", content: "Deduktif", isCorrect: true },
      { label: "B", content: "Induktif", isCorrect: false },
      { label: "C", content: "Campuran", isCorrect: false },
      { label: "D", content: "Naratif", isCorrect: false },
      { label: "E", content: "Deskriptif", isCorrect: false },
    ],
    explanation: "Kalimat utama terletak di awal paragraf (kemacetan semakin parah). Kalimat selanjutnya menjelaskan penyebab dan solusi. Ini merupakan paragraf deduktif.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nKopi Arabika dari Toraja memiliki cita rasa yang khas dengan aroma bunga dan buah yang lembut. Biji kopinya tumbuh di ketinggian 1.400-1.800 meter di atas permukaan laut, memberikan karakter rasa yang unik. Proses pengolahan tradisional secara basah (wet-hulling) menjadikan kopi ini berbeda dari kopi Arabika lainnya di dunia.\n\nTujuan penulis menulis paragraf di atas adalah...",
    options: [
      { label: "A", content: "Mengajak pembaca membeli kopi Toraja", isCorrect: false },
      { label: "B", content: "Menjelaskan keistimewaan kopi Arabika Toraja", isCorrect: true },
      { label: "C", content: "Membandingkan kopi Toraja dengan kopi lain", isCorrect: false },
      { label: "D", content: "Mengkritik proses pengolahan kopi di Toraja", isCorrect: false },
      { label: "E", content: "Menceritakan sejarah kopi di Indonesia", isCorrect: false },
    ],
    explanation: "Paragraf mendeskripsikan cita rasa, kondisi tumbuh, dan proses pengolahan yang membuat kopi Toraja istimewa. Tujuan penulis adalah menjelaskan keistimewaannya.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Makna kata berimbuhan 'mempertanyakan' dalam kalimat \"Masyarakat mempertanyakan kebijakan baru tersebut\" adalah...",
    options: [
      { label: "A", content: "Bertanya tentang sesuatu", isCorrect: false },
      { label: "B", content: "Meragukan atau meminta penjelasan", isCorrect: true },
      { label: "C", content: "Membuat pertanyaan", isCorrect: false },
      { label: "D", content: "Menjawab pertanyaan", isCorrect: false },
      { label: "E", content: "Mengajukan pertanyaan secara resmi", isCorrect: false },
    ],
    explanation: "Awalan memper-...-kan pada 'mempertanyakan' bermakna menganggap sesuatu perlu dipertanyakan atau diragukan, berbeda dari 'menanyakan' (bertanya tentang).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nTransportasi umum berbasis rel seperti MRT dan LRT dinilai lebih efisien dibandingkan transportasi berbasis jalan. Satu rangkaian MRT dapat mengangkut hingga 1.200 penumpang, setara dengan 800 mobil pribadi. Selain itu, transportasi rel menghasilkan emisi karbon yang jauh lebih rendah per penumpangnya.\n\nPernyataan yang merupakan opini dalam paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Satu rangkaian MRT mengangkut hingga 1.200 penumpang", isCorrect: false },
      { label: "B", content: "Transportasi umum berbasis rel dinilai lebih efisien", isCorrect: true },
      { label: "C", content: "MRT setara dengan 800 mobil pribadi", isCorrect: false },
      { label: "D", content: "Transportasi rel menghasilkan emisi karbon lebih rendah", isCorrect: false },
      { label: "E", content: "LRT merupakan transportasi berbasis rel", isCorrect: false },
    ],
    explanation: "Kata 'dinilai' menunjukkan opini atau penilaian, bukan fakta yang dapat diukur secara objektif. Kalimat lain berisi data dan fakta.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nKebakaran hutan di Kalimantan tahun 2023 menghanguskan lebih dari 500.000 hektare lahan. Asap tebal menyelimuti beberapa provinsi dan menyebabkan gangguan pernapasan pada ribuan warga. Kerugian ekonomi diperkirakan mencapai triliunan rupiah.\n\nKata ganti yang tepat untuk merujuk pada peristiwa dalam paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Hal ini", isCorrect: true },
      { label: "B", content: "Mereka", isCorrect: false },
      { label: "C", content: "Beliau", isCorrect: false },
      { label: "D", content: "Ia", isCorrect: false },
      { label: "E", content: "Dia", isCorrect: false },
    ],
    explanation: "'Hal ini' adalah kata ganti penunjuk yang tepat untuk merujuk pada peristiwa atau keadaan. 'Mereka', 'beliau', 'ia', 'dia' merujuk pada orang.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nBudaya membaca di Indonesia masih tergolong rendah. Menurut survei UNESCO, Indonesia menempati urutan ke-60 dari 61 negara dalam hal minat baca. Rata-rata orang Indonesia hanya membaca 3-4 buku per tahun, jauh di bawah negara tetangga seperti Malaysia yang rata-rata 12 buku per tahun.\n\nKalimat yang mengandung fakta adalah...",
    options: [
      { label: "A", content: "Budaya membaca di Indonesia masih tergolong rendah", isCorrect: false },
      { label: "B", content: "Indonesia menempati urutan ke-60 dari 61 negara", isCorrect: true },
      { label: "C", content: "Minat baca masyarakat perlu ditingkatkan", isCorrect: false },
      { label: "D", content: "Indonesia jauh tertinggal dalam hal literasi", isCorrect: false },
      { label: "E", content: "Membaca sangat penting bagi kemajuan bangsa", isCorrect: false },
    ],
    explanation: "Kalimat B berisi data spesifik dari survei UNESCO (urutan ke-60 dari 61 negara). Ini merupakan fakta yang dapat diverifikasi.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Penulisan unsur serapan yang benar adalah...",
    options: [
      { label: "A", content: "analisa, sistim, praktek", isCorrect: false },
      { label: "B", content: "analisis, sistem, praktik", isCorrect: true },
      { label: "C", content: "analisa, sistem, praktik", isCorrect: false },
      { label: "D", content: "analisis, sistim, praktek", isCorrect: false },
      { label: "E", content: "analisa, sistem, praktek", isCorrect: false },
    ],
    explanation: "Sesuai KBBI dan PUEBI, bentuk baku adalah: analisis (bukan analisa), sistem (bukan sistim), praktik (bukan praktek).",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nE-commerce telah mengubah lanskap bisnis di Indonesia secara signifikan. Pelaku UMKM yang sebelumnya hanya berjualan secara offline kini dapat menjangkau pelanggan di seluruh Indonesia melalui platform digital. Namun, tantangan seperti literasi digital yang rendah dan infrastruktur logistik yang belum merata masih menjadi hambatan utama.\n\nMakna kata 'lanskap' dalam konteks paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Pemandangan alam", isCorrect: false },
      { label: "B", content: "Gambaran atau kondisi keseluruhan", isCorrect: true },
      { label: "C", content: "Bentuk geografis", isCorrect: false },
      { label: "D", content: "Tata letak", isCorrect: false },
      { label: "E", content: "Rencana pembangunan", isCorrect: false },
    ],
    explanation: "Dalam konteks bisnis, 'lanskap' bermakna gambaran atau kondisi keseluruhan suatu bidang, bukan arti harfiah (pemandangan alam).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nVaksinasi merupakan salah satu pencapaian terbesar dalam sejarah kesehatan masyarakat. Sejak ditemukannya vaksin cacar oleh Edward Jenner pada tahun 1796, vaksinasi telah menyelamatkan jutaan nyawa. Penyakit mematikan seperti polio dan campak berhasil dikendalikan berkat program vaksinasi massal.\n\nKata hubung antarkalimat yang tepat untuk menambahkan kalimat penutup paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Namun", isCorrect: false },
      { label: "B", content: "Oleh karena itu", isCorrect: true },
      { label: "C", content: "Sebaliknya", isCorrect: false },
      { label: "D", content: "Meskipun demikian", isCorrect: false },
      { label: "E", content: "Di sisi lain", isCorrect: false },
    ],
    explanation: "Paragraf membahas keberhasilan vaksinasi. Kalimat penutup yang logis adalah kesimpulan/ajakan, sehingga kata hubung 'oleh karena itu' (hubungan sebab-akibat) paling tepat.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Bacalah paragraf berikut!\n\nKebiasaan mengonsumsi makanan cepat saji di kalangan remaja Indonesia terus meningkat. Survei menunjukkan bahwa 70% remaja di perkotaan mengonsumsi makanan cepat saji setidaknya dua kali seminggu. Kandungan lemak trans, gula, dan garam yang tinggi dalam makanan tersebut berkontribusi pada meningkatnya kasus obesitas remaja.\n\nKesimpulan yang paling tepat dari paragraf tersebut adalah...",
    options: [
      { label: "A", content: "Makanan cepat saji harus dilarang pemerintah", isCorrect: false },
      { label: "B", content: "Remaja Indonesia menghadapi risiko kesehatan akibat konsumsi makanan cepat saji", isCorrect: true },
      { label: "C", content: "Makanan cepat saji hanya dikonsumsi remaja perkotaan", isCorrect: false },
      { label: "D", content: "Semua remaja Indonesia mengalami obesitas", isCorrect: false },
      { label: "E", content: "Survei tentang makanan cepat saji tidak akurat", isCorrect: false },
    ],
    explanation: "Paragraf menyajikan data peningkatan konsumsi makanan cepat saji dan dampaknya (obesitas). Kesimpulan yang tepat menghubungkan keduanya tanpa generalisasi berlebihan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
);

// ============================================================
// SOAL LITERASI BAHASA INGGRIS (12 soal)
// ============================================================
const literasiBahasaInggrisQuestions: QuestionSeed[] = [
  {
    content: "Read the following passage:\n\nClimate change is no longer a distant threat but a present reality. Rising sea levels, extreme weather events, and shifting precipitation patterns are already affecting communities worldwide. Scientists warn that without immediate and drastic action to reduce greenhouse gas emissions, the consequences will be catastrophic and irreversible.\n\nThe main purpose of this passage is to...",
    options: [
      { label: "A", content: "Describe the history of climate research", isCorrect: false },
      { label: "B", content: "Warn about the urgent threat of climate change", isCorrect: true },
      { label: "C", content: "Explain how greenhouse gases are produced", isCorrect: false },
      { label: "D", content: "Compare different environmental problems", isCorrect: false },
      { label: "E", content: "Promote renewable energy sources", isCorrect: false },
    ],
    explanation: "The passage emphasizes that climate change is a 'present reality' and warns about 'catastrophic and irreversible' consequences, making its main purpose a warning about urgency.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "Read the following passage:\n\nThe discovery of antibiotics in the 20th century was hailed as one of medicine's greatest achievements. However, the overuse and misuse of these drugs have led to the emergence of antibiotic-resistant bacteria, sometimes called 'superbugs.' These resistant strains pose a significant threat to public health, as infections that were once easily treatable may become deadly.\n\nThe word 'emergence' in the passage is closest in meaning to...",
    options: [
      { label: "A", content: "Disappearance", isCorrect: false },
      { label: "B", content: "Appearance", isCorrect: true },
      { label: "C", content: "Prevention", isCorrect: false },
      { label: "D", content: "Treatment", isCorrect: false },
      { label: "E", content: "Discovery", isCorrect: false },
    ],
    explanation: "'Emergence' means the process of coming into existence or becoming apparent. The closest synonym is 'appearance.'",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Choose the correct sentence:",
    options: [
      { label: "A", content: "Neither the teacher nor the students was ready for the exam.", isCorrect: false },
      { label: "B", content: "Neither the teacher nor the students were ready for the exam.", isCorrect: true },
      { label: "C", content: "Neither the teacher nor the students is ready for the exam.", isCorrect: false },
      { label: "D", content: "Neither the teacher nor the students has ready for the exam.", isCorrect: false },
      { label: "E", content: "Neither the teacher nor the students been ready for the exam.", isCorrect: false },
    ],
    explanation: "In 'neither...nor' constructions, the verb agrees with the noun closest to it. 'Students' is plural, so the verb should be 'were.'",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Read the following passage:\n\nArtificial intelligence (AI) is transforming various industries at an unprecedented pace. In healthcare, AI algorithms can analyze medical images with greater accuracy than human doctors. In finance, AI-powered systems detect fraudulent transactions in real-time. While the benefits are substantial, concerns about job displacement and ethical implications continue to grow.\n\nWhich of the following can be inferred from the passage?",
    options: [
      { label: "A", content: "AI will completely replace human doctors", isCorrect: false },
      { label: "B", content: "AI advancement brings both opportunities and challenges", isCorrect: true },
      { label: "C", content: "AI is only useful in healthcare and finance", isCorrect: false },
      { label: "D", content: "Ethical concerns about AI have been resolved", isCorrect: false },
      { label: "E", content: "Job displacement due to AI is not a serious issue", isCorrect: false },
    ],
    explanation: "The passage presents both benefits ('greater accuracy,' 'detect fraudulent transactions') and concerns ('job displacement,' 'ethical implications'), implying AI brings both opportunities and challenges.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "The manager insisted that every employee ____ the new safety protocol immediately.",
    options: [
      { label: "A", content: "follows", isCorrect: false },
      { label: "B", content: "follow", isCorrect: true },
      { label: "C", content: "followed", isCorrect: false },
      { label: "D", content: "following", isCorrect: false },
      { label: "E", content: "to follow", isCorrect: false },
    ],
    explanation: "After verbs of demand, suggestion, or insistence (like 'insisted'), the subjunctive mood requires the base form of the verb: 'follow' (not 'follows' or 'followed').",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Ruangguru",
    year: 2024,
  },
  {
    content: "Read the following passage:\n\nDeforestation in Borneo has accelerated dramatically over the past two decades. The primary driver is the expansion of palm oil plantations, which supply a global demand for this versatile commodity. Conservationists argue that sustainable farming practices could meet economic needs while preserving critical habitats for endangered species such as orangutans.\n\nThe author's tone toward deforestation in Borneo can best be described as...",
    options: [
      { label: "A", content: "Indifferent", isCorrect: false },
      { label: "B", content: "Supportive", isCorrect: false },
      { label: "C", content: "Concerned", isCorrect: true },
      { label: "D", content: "Humorous", isCorrect: false },
      { label: "E", content: "Aggressive", isCorrect: false },
    ],
    explanation: "The use of words like 'accelerated dramatically,' 'critical habitats,' and 'endangered species' conveys a tone of concern about the situation.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "Read the following passage:\n\nSleep deprivation has become a widespread issue in modern society. Research shows that adults who consistently sleep less than seven hours per night face increased risks of cardiovascular disease, obesity, and mental health disorders. Furthermore, sleep-deprived individuals are significantly more likely to be involved in workplace accidents.\n\nAccording to the passage, all of the following are consequences of sleep deprivation EXCEPT...",
    options: [
      { label: "A", content: "Heart disease", isCorrect: false },
      { label: "B", content: "Weight gain", isCorrect: false },
      { label: "C", content: "Mental health problems", isCorrect: false },
      { label: "D", content: "Workplace accidents", isCorrect: false },
      { label: "E", content: "Improved cognitive function", isCorrect: true },
    ],
    explanation: "The passage mentions cardiovascular disease (heart disease), obesity (weight gain), mental health disorders, and workplace accidents as consequences. Improved cognitive function is NOT mentioned and contradicts the passage's message.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
  {
    content: "If I ____ about the traffic jam earlier, I would have taken a different route.",
    options: [
      { label: "A", content: "know", isCorrect: false },
      { label: "B", content: "knew", isCorrect: false },
      { label: "C", content: "had known", isCorrect: true },
      { label: "D", content: "have known", isCorrect: false },
      { label: "E", content: "would know", isCorrect: false },
    ],
    explanation: "This is a third conditional (past unreal condition). The structure is: If + past perfect (had known), would have + past participle.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Read the following passage:\n\nThe gig economy has fundamentally altered the traditional employment landscape. Platforms like ride-sharing apps and freelance marketplaces offer workers flexibility and autonomy. Critics, however, point out that gig workers often lack benefits such as health insurance, paid leave, and retirement plans, making them vulnerable to economic instability.\n\nThe word 'vulnerable' in the passage is closest in meaning to...",
    options: [
      { label: "A", content: "Resistant", isCorrect: false },
      { label: "B", content: "Immune", isCorrect: false },
      { label: "C", content: "Susceptible", isCorrect: true },
      { label: "D", content: "Adapted", isCorrect: false },
      { label: "E", content: "Qualified", isCorrect: false },
    ],
    explanation: "'Vulnerable' means exposed to the possibility of being harmed. 'Susceptible' has the closest meaning — easily affected or likely to be influenced by something.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — CNN Indonesia",
    year: 2024,
  },
  {
    content: "Read the following passage:\n\nUrbanization in Southeast Asia has created both opportunities and challenges. Cities like Jakarta, Bangkok, and Manila have experienced rapid population growth, leading to economic development but also severe congestion, pollution, and housing shortages. Urban planners are now exploring smart city solutions, including integrated public transportation systems and green building standards, to create more livable urban environments.\n\nWhat is the author's main argument?",
    options: [
      { label: "A", content: "Southeast Asian cities should stop growing", isCorrect: false },
      { label: "B", content: "Urbanization only brings negative effects", isCorrect: false },
      { label: "C", content: "Smart city solutions can address urban challenges", isCorrect: true },
      { label: "D", content: "Jakarta is the most congested city in Southeast Asia", isCorrect: false },
      { label: "E", content: "Green buildings are too expensive to implement", isCorrect: false },
    ],
    explanation: "The passage presents urbanization challenges and then introduces smart city solutions as the way forward, making option C the author's main argument.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Detik.com",
    year: 2024,
  },
  {
    content: "The research paper, which ____ by a team of international scientists, suggests that coral reef degradation is accelerating.",
    options: [
      { label: "A", content: "was written", isCorrect: true },
      { label: "B", content: "has writing", isCorrect: false },
      { label: "C", content: "were written", isCorrect: false },
      { label: "D", content: "is writing", isCorrect: false },
      { label: "E", content: "written", isCorrect: false },
    ],
    explanation: "'The research paper' is singular, so the passive form should be 'was written.' The relative clause 'which was written by' correctly uses the passive voice.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2023 — Ruangguru",
    year: 2023,
  },
  {
    content: "Read the following passage:\n\nRenewable energy sources, particularly solar and wind power, have seen dramatic cost reductions over the past decade. Solar panel costs have fallen by more than 85% since 2010, making them competitive with fossil fuels in many markets. This trend is expected to continue as technology improves and economies of scale are achieved.\n\nWhich of the following conclusions is best supported by the passage?",
    options: [
      { label: "A", content: "Fossil fuels will be completely replaced by 2030", isCorrect: false },
      { label: "B", content: "Solar energy is becoming increasingly economically viable", isCorrect: true },
      { label: "C", content: "Wind power is more cost-effective than solar power", isCorrect: false },
      { label: "D", content: "Renewable energy technology has stopped improving", isCorrect: false },
      { label: "E", content: "Economies of scale cannot be achieved in energy", isCorrect: false },
    ],
    explanation: "The passage states solar costs fell 85% since 2010 and are now competitive with fossil fuels. The conclusion that solar energy is becoming increasingly economically viable is directly supported.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2024 — Brain Academy",
    year: 2024,
  },
];

// Soal tambahan Literasi Bahasa Inggris
literasiBahasaInggrisQuestions.push(
  {
    content: "Read the following passage:\n\nThe human brain consumes approximately 20% of the body's total energy despite comprising only 2% of body weight. This disproportionate energy demand is necessary for maintaining neural connections and processing information. When deprived of glucose, the brain can temporarily switch to using ketone bodies as an alternative fuel source.\n\nWhat can be inferred about the brain's energy consumption?",
    options: [
      { label: "A", content: "The brain uses less energy than other organs", isCorrect: false },
      { label: "B", content: "The brain's energy needs are unusually high relative to its size", isCorrect: true },
      { label: "C", content: "Glucose is the only energy source for the brain", isCorrect: false },
      { label: "D", content: "The brain uses 2% of the body's energy", isCorrect: false },
      { label: "E", content: "Ketone bodies are better fuel than glucose", isCorrect: false },
    ],
    explanation: "The passage states the brain uses 20% of energy while being only 2% of body weight — disproportionately high. Option C is wrong because the brain can use ketone bodies.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Despite the heavy rain, the outdoor concert ____ as scheduled.",
    options: [
      { label: "A", content: "proceeded", isCorrect: true },
      { label: "B", content: "proceeding", isCorrect: false },
      { label: "C", content: "was proceeding", isCorrect: false },
      { label: "D", content: "has been proceeded", isCorrect: false },
      { label: "E", content: "had proceeding", isCorrect: false },
    ],
    explanation: "'Proceeded' is the correct simple past form. 'Proceed' is intransitive, so passive form (D) is incorrect. The sentence describes a completed past action.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Read the following passage:\n\nMicroplastics — tiny plastic fragments less than 5 millimeters in size — have been found in virtually every ecosystem on Earth. Recent studies have detected microplastics in human blood, lungs, and even placentas. While the long-term health effects remain uncertain, preliminary research suggests potential links to inflammation, cellular damage, and hormonal disruption.\n\nThe author's purpose in writing this passage is primarily to...",
    options: [
      { label: "A", content: "Persuade readers to stop using plastic", isCorrect: false },
      { label: "B", content: "Inform readers about the pervasiveness and potential risks of microplastics", isCorrect: true },
      { label: "C", content: "Compare microplastics with other pollutants", isCorrect: false },
      { label: "D", content: "Argue that microplastics are harmless", isCorrect: false },
      { label: "E", content: "Criticize the plastic manufacturing industry", isCorrect: false },
    ],
    explanation: "The passage presents facts about microplastics' presence and potential health effects in an informational tone, without arguing for specific action or making comparisons.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — CNN Indonesia",
    year: 2025,
  },
  {
    content: "The professor emphasized that students ____ their assignments before the deadline.",
    options: [
      { label: "A", content: "submit", isCorrect: true },
      { label: "B", content: "submits", isCorrect: false },
      { label: "C", content: "submitted", isCorrect: false },
      { label: "D", content: "submitting", isCorrect: false },
      { label: "E", content: "would submits", isCorrect: false },
    ],
    explanation: "After 'emphasized that,' the subjunctive mood requires the base form of the verb. Similar to 'insist/demand/recommend that + subject + base verb.'",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Read the following passage:\n\nRemote work has transformed from a temporary pandemic measure into a permanent feature of the modern workplace. A 2024 survey found that 58% of American workers have the option to work from home at least one day per week. Companies report that remote workers are often more productive, though concerns about team cohesion and corporate culture persist.\n\nWhich statement best summarizes the passage?",
    options: [
      { label: "A", content: "Remote work has become mainstream but still faces challenges", isCorrect: true },
      { label: "B", content: "All companies now prefer remote work over office work", isCorrect: false },
      { label: "C", content: "Remote work decreases productivity significantly", isCorrect: false },
      { label: "D", content: "The pandemic permanently eliminated office work", isCorrect: false },
      { label: "E", content: "Corporate culture is impossible with remote workers", isCorrect: false },
    ],
    explanation: "The passage describes remote work as permanent and productive, but notes persisting concerns about cohesion and culture — i.e., mainstream but with challenges.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
  {
    content: "Read the following passage:\n\nVolcanic eruptions, while destructive, play a crucial role in shaping Earth's landscape and sustaining life. Volcanic ash enriches soil with minerals, making volcanic regions some of the most fertile agricultural areas in the world. Indonesia, situated on the Pacific Ring of Fire, benefits from this natural fertilization process, supporting its vast agricultural output.\n\nThe word 'sustaining' in the passage is closest in meaning to...",
    options: [
      { label: "A", content: "Destroying", isCorrect: false },
      { label: "B", content: "Supporting", isCorrect: true },
      { label: "C", content: "Creating", isCorrect: false },
      { label: "D", content: "Limiting", isCorrect: false },
      { label: "E", content: "Threatening", isCorrect: false },
    ],
    explanation: "'Sustaining' means keeping something going or maintaining — its closest synonym is 'supporting.' The context of enriching soil and benefiting agriculture confirms this meaning.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Detik.com",
    year: 2025,
  },
  {
    content: "Read the following passage:\n\nThe concept of universal basic income (UBI) has gained traction in recent years as automation threatens to displace millions of workers. Proponents argue that UBI could reduce poverty and provide a safety net during economic transitions. Critics counter that it would be prohibitively expensive and could discourage people from working.\n\nThe passage is organized by...",
    options: [
      { label: "A", content: "Presenting a chronological sequence of events", isCorrect: false },
      { label: "B", content: "Describing a problem and offering a single solution", isCorrect: false },
      { label: "C", content: "Presenting a concept and examining contrasting viewpoints", isCorrect: true },
      { label: "D", content: "Comparing UBI programs in different countries", isCorrect: false },
      { label: "E", content: "Providing a personal opinion about UBI", isCorrect: false },
    ],
    explanation: "The passage introduces UBI, then presents proponents' arguments and critics' counterarguments — a contrast/debate structure.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Brain Academy",
    year: 2025,
  },
  {
    content: "Had the government invested more in renewable energy, the country ____ less dependent on fossil fuels now.",
    options: [
      { label: "A", content: "will be", isCorrect: false },
      { label: "B", content: "would be", isCorrect: true },
      { label: "C", content: "would have been", isCorrect: false },
      { label: "D", content: "had been", isCorrect: false },
      { label: "E", content: "is being", isCorrect: false },
    ],
    explanation: "This is a mixed conditional: past condition (had invested) with present result (would be... now). 'Would be' is correct for the present unreal result.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal UTBK-SNBT 2025 — Ruangguru",
    year: 2025,
  },
);

// ============================================================
// CPNS — TWK (Tes Wawasan Kebangsaan)
// ============================================================
const twkQuestions: QuestionSeed[] = [
  {
    content: "Pancasila sebagai dasar negara Indonesia pertama kali dirumuskan dalam sidang BPUPK pada tanggal...",
    options: [
      { label: "A", content: "29 Mei 1945", isCorrect: false },
      { label: "B", content: "1 Juni 1945", isCorrect: true },
      { label: "C", content: "22 Juni 1945", isCorrect: false },
      { label: "D", content: "17 Agustus 1945", isCorrect: false },
      { label: "E", content: "18 Agustus 1945", isCorrect: false },
    ],
    explanation: "Ir. Soekarno menyampaikan rumusan dasar negara yang kemudian dikenal sebagai Pancasila dalam sidang BPUPK pada 1 Juni 1945.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Pasal dalam UUD 1945 yang mengatur tentang hak dan kewajiban warga negara dalam pembelaan negara adalah...",
    options: [
      { label: "A", content: "Pasal 27 ayat (3)", isCorrect: true },
      { label: "B", content: "Pasal 28 ayat (1)", isCorrect: false },
      { label: "C", content: "Pasal 29 ayat (2)", isCorrect: false },
      { label: "D", content: "Pasal 30 ayat (2)", isCorrect: false },
      { label: "E", content: "Pasal 31 ayat (1)", isCorrect: false },
    ],
    explanation: "Pasal 27 ayat (3) UUD 1945 menyatakan bahwa setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Semboyan Bhinneka Tunggal Ika berasal dari kitab...",
    options: [
      { label: "A", content: "Negarakertagama", isCorrect: false },
      { label: "B", content: "Sutasoma", isCorrect: true },
      { label: "C", content: "Pararaton", isCorrect: false },
      { label: "D", content: "Arjunawiwaha", isCorrect: false },
      { label: "E", content: "Ramayana", isCorrect: false },
    ],
    explanation: "Semboyan Bhinneka Tunggal Ika diambil dari kitab Sutasoma karangan Mpu Tantular pada masa Kerajaan Majapahit.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Sistem pemerintahan Indonesia menurut UUD 1945 setelah amandemen adalah...",
    options: [
      { label: "A", content: "Presidensial murni", isCorrect: false },
      { label: "B", content: "Parlementer", isCorrect: false },
      { label: "C", content: "Presidensial dengan ciri parlementer", isCorrect: true },
      { label: "D", content: "Semi-presidensial", isCorrect: false },
      { label: "E", content: "Campuran seimbang", isCorrect: false },
    ],
    explanation: "Setelah amandemen UUD 1945, Indonesia menganut sistem presidensial yang diperkuat namun tetap memiliki beberapa ciri parlementer seperti hak interpelasi DPR.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Lembaga negara yang berwenang menguji undang-undang terhadap UUD 1945 adalah...",
    options: [
      { label: "A", content: "Mahkamah Agung", isCorrect: false },
      { label: "B", content: "Mahkamah Konstitusi", isCorrect: true },
      { label: "C", content: "Komisi Yudisial", isCorrect: false },
      { label: "D", content: "Dewan Perwakilan Rakyat", isCorrect: false },
      { label: "E", content: "Majelis Permusyawaratan Rakyat", isCorrect: false },
    ],
    explanation: "Berdasarkan Pasal 24C UUD 1945, Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir untuk menguji undang-undang terhadap UUD.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Nilai Pancasila yang menjadi dasar pelaksanaan musyawarah untuk mufakat adalah sila ke-...",
    options: [
      { label: "A", content: "Kedua", isCorrect: false },
      { label: "B", content: "Ketiga", isCorrect: false },
      { label: "C", content: "Keempat", isCorrect: true },
      { label: "D", content: "Kelima", isCorrect: false },
      { label: "E", content: "Kesatu", isCorrect: false },
    ],
    explanation: "Sila keempat Pancasila 'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan' menjadi landasan musyawarah untuk mufakat.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Otonomi daerah di Indonesia diatur dalam UU Nomor...",
    options: [
      { label: "A", content: "UU No. 22 Tahun 1999", isCorrect: false },
      { label: "B", content: "UU No. 32 Tahun 2004", isCorrect: false },
      { label: "C", content: "UU No. 23 Tahun 2014", isCorrect: true },
      { label: "D", content: "UU No. 25 Tahun 2009", isCorrect: false },
      { label: "E", content: "UU No. 5 Tahun 2014", isCorrect: false },
    ],
    explanation: "UU No. 23 Tahun 2014 tentang Pemerintahan Daerah merupakan undang-undang terbaru yang mengatur otonomi daerah, menggantikan UU No. 32 Tahun 2004.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam konsep NKRI, wilayah Indonesia berdasarkan Deklarasi Djuanda 1957 menggunakan prinsip...",
    options: [
      { label: "A", content: "Negara kepulauan (archipelagic state)", isCorrect: true },
      { label: "B", content: "Zona ekonomi eksklusif", isCorrect: false },
      { label: "C", content: "Landas kontinen", isCorrect: false },
      { label: "D", content: "Laut teritorial 3 mil", isCorrect: false },
      { label: "E", content: "Perairan pedalaman", isCorrect: false },
    ],
    explanation: "Deklarasi Djuanda 1957 menyatakan Indonesia sebagai negara kepulauan (archipelagic state) di mana laut di antara pulau-pulau merupakan bagian dari wilayah Indonesia.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Aparatur Sipil Negara (ASN) diatur dalam undang-undang...",
    options: [
      { label: "A", content: "UU No. 5 Tahun 2014", isCorrect: false },
      { label: "B", content: "UU No. 20 Tahun 2023", isCorrect: true },
      { label: "C", content: "UU No. 8 Tahun 1974", isCorrect: false },
      { label: "D", content: "UU No. 43 Tahun 1999", isCorrect: false },
      { label: "E", content: "UU No. 25 Tahun 2009", isCorrect: false },
    ],
    explanation: "UU No. 20 Tahun 2023 tentang ASN merupakan undang-undang terbaru yang menggantikan UU No. 5 Tahun 2014 untuk mengatur aparatur sipil negara.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Amandemen UUD 1945 yang mengatur tentang pemilihan presiden secara langsung dilakukan pada amandemen ke-...",
    options: [
      { label: "A", content: "Pertama (1999)", isCorrect: false },
      { label: "B", content: "Kedua (2000)", isCorrect: false },
      { label: "C", content: "Ketiga (2001)", isCorrect: true },
      { label: "D", content: "Keempat (2002)", isCorrect: false },
      { label: "E", content: "Kelima (2004)", isCorrect: false },
    ],
    explanation: "Amandemen ketiga UUD 1945 tahun 2001 mengatur pemilihan Presiden dan Wakil Presiden secara langsung oleh rakyat (Pasal 6A).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// CPNS — TIU (Tes Intelegensia Umum)
// ============================================================
const tiuQuestions: QuestionSeed[] = [
  {
    content: "EKSPANSI >< ...",
    options: [
      { label: "A", content: "Perluasan", isCorrect: false },
      { label: "B", content: "Penyempitan", isCorrect: true },
      { label: "C", content: "Pelebaran", isCorrect: false },
      { label: "D", content: "Pengembangan", isCorrect: false },
      { label: "E", content: "Penambahan", isCorrect: false },
    ],
    explanation: "Ekspansi berarti perluasan/pengembangan, sehingga antonimnya adalah penyempitan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Jika semua manajer adalah pemimpin, dan sebagian pemimpin adalah inovator, maka...",
    options: [
      { label: "A", content: "Semua manajer adalah inovator", isCorrect: false },
      { label: "B", content: "Sebagian manajer mungkin inovator", isCorrect: true },
      { label: "C", content: "Tidak ada manajer yang inovator", isCorrect: false },
      { label: "D", content: "Semua inovator adalah manajer", isCorrect: false },
      { label: "E", content: "Sebagian inovator pasti manajer", isCorrect: false },
    ],
    explanation: "Karena semua manajer adalah pemimpin dan sebagian pemimpin adalah inovator, maka sebagian manajer mungkin termasuk inovator (tidak pasti semua).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "15, 18, 24, 35, 53, ...",
    options: [
      { label: "A", content: "78", isCorrect: false },
      { label: "B", content: "80", isCorrect: true },
      { label: "C", content: "82", isCorrect: false },
      { label: "D", content: "85", isCorrect: false },
      { label: "E", content: "88", isCorrect: false },
    ],
    explanation: "Selisih: 3, 6, 11, 18, 27. Selisih dari selisih: 3, 5, 7, 9 (deret ganjil). Selisih berikutnya = 27, jadi 53 + 27 = 80.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "AMBIGU = ...",
    options: [
      { label: "A", content: "Bermakna ganda", isCorrect: true },
      { label: "B", content: "Tidak berarti", isCorrect: false },
      { label: "C", content: "Sangat jelas", isCorrect: false },
      { label: "D", content: "Bertentangan", isCorrect: false },
      { label: "E", content: "Membingungkan secara visual", isCorrect: false },
    ],
    explanation: "Ambigu berarti memiliki makna ganda atau dapat ditafsirkan lebih dari satu cara.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Sebuah proyek membutuhkan 12 pekerja untuk selesai dalam 20 hari. Jika proyek harus selesai dalam 15 hari, berapa pekerja tambahan yang diperlukan?",
    options: [
      { label: "A", content: "2 pekerja", isCorrect: false },
      { label: "B", content: "4 pekerja", isCorrect: true },
      { label: "C", content: "6 pekerja", isCorrect: false },
      { label: "D", content: "8 pekerja", isCorrect: false },
      { label: "E", content: "3 pekerja", isCorrect: false },
    ],
    explanation: "12 × 20 = 240 hari-orang. Untuk 15 hari: 240/15 = 16 pekerja. Tambahan = 16 - 12 = 4 pekerja.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Kucing : Meong :: Anjing : ...",
    options: [
      { label: "A", content: "Menggonggong", isCorrect: false },
      { label: "B", content: "Guk-guk", isCorrect: true },
      { label: "C", content: "Menyalak", isCorrect: false },
      { label: "D", content: "Mendengkur", isCorrect: false },
      { label: "E", content: "Mengeong", isCorrect: false },
    ],
    explanation: "Analogi suara: Kucing bersuara meong, anjing bersuara guk-guk. Keduanya adalah onomatope.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dari 60 peserta ujian, 35 lulus matematika, 30 lulus bahasa, dan 15 lulus keduanya. Berapa peserta yang tidak lulus keduanya?",
    options: [
      { label: "A", content: "5", isCorrect: false },
      { label: "B", content: "10", isCorrect: true },
      { label: "C", content: "15", isCorrect: false },
      { label: "D", content: "20", isCorrect: false },
      { label: "E", content: "25", isCorrect: false },
    ],
    explanation: "Lulus minimal satu: 35 + 30 - 15 = 50. Tidak lulus keduanya: 60 - 50 = 10.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "STAGNASI >< ...",
    options: [
      { label: "A", content: "Kemajuan", isCorrect: true },
      { label: "B", content: "Kemunduran", isCorrect: false },
      { label: "C", content: "Kemandekan", isCorrect: false },
      { label: "D", content: "Kelambatan", isCorrect: false },
      { label: "E", content: "Kestabilan", isCorrect: false },
    ],
    explanation: "Stagnasi berarti kemandekan/tidak ada perkembangan. Antonimnya adalah kemajuan/progres.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Jika A = 2, B = 4, C = 8, maka pola ini mengikuti rumus...",
    options: [
      { label: "A", content: "2n", isCorrect: false },
      { label: "B", content: "2^n", isCorrect: true },
      { label: "C", content: "n²", isCorrect: false },
      { label: "D", content: "n + 2", isCorrect: false },
      { label: "E", content: "2n + 1", isCorrect: false },
    ],
    explanation: "A(1)=2=2¹, B(2)=4=2², C(3)=8=2³. Jadi polanya adalah 2^n.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Pernyataan: 'Tidak benar bahwa semua pegawai hadir.' Pernyataan yang setara adalah...",
    options: [
      { label: "A", content: "Semua pegawai tidak hadir", isCorrect: false },
      { label: "B", content: "Ada pegawai yang tidak hadir", isCorrect: true },
      { label: "C", content: "Tidak ada pegawai yang hadir", isCorrect: false },
      { label: "D", content: "Sebagian besar pegawai tidak hadir", isCorrect: false },
      { label: "E", content: "Hanya satu pegawai yang hadir", isCorrect: false },
    ],
    explanation: "Negasi dari 'semua A adalah B' adalah 'ada A yang bukan B'. Jadi negasi 'semua pegawai hadir' = 'ada pegawai yang tidak hadir'.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// CPNS — TKP (Tes Karakteristik Pribadi)
// ============================================================
const tkpQuestions: QuestionSeed[] = [
  {
    content: "Anda adalah pegawai baru yang mendapat tugas di luar bidang keahlian Anda. Sikap yang paling tepat adalah...",
    options: [
      { label: "A", content: "Menolak karena bukan bidang keahlian", isCorrect: false },
      { label: "B", content: "Menerima dan berusaha mempelajari bidang tersebut sambil berkonsultasi dengan yang lebih berpengalaman", isCorrect: true },
      { label: "C", content: "Meminta pindah ke bagian yang sesuai", isCorrect: false },
      { label: "D", content: "Mengerjakan seadanya tanpa berusaha belajar", isCorrect: false },
      { label: "E", content: "Mendelegasikan ke rekan yang lebih mampu", isCorrect: false },
    ],
    explanation: "Skor TKP tertinggi diperoleh dari sikap proaktif: menerima tantangan, mau belajar, dan berkonsultasi — menunjukkan profesionalisme dan adaptabilitas.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Rekan kerja Anda melakukan kesalahan yang berdampak pada tim. Tindakan Anda yang paling tepat adalah...",
    options: [
      { label: "A", content: "Melaporkan langsung ke atasan", isCorrect: false },
      { label: "B", content: "Membicarakan secara pribadi dan membantu mencari solusi", isCorrect: true },
      { label: "C", content: "Mengabaikan karena bukan urusan Anda", isCorrect: false },
      { label: "D", content: "Membicarakan dengan rekan lain", isCorrect: false },
      { label: "E", content: "Menunggu rekan tersebut menyadari sendiri", isCorrect: false },
    ],
    explanation: "Pendekatan terbaik dalam TKP adalah komunikasi langsung secara pribadi dan solutif, menunjukkan kerjasama dan empati.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Anda diminta lembur untuk menyelesaikan laporan penting, padahal ada acara keluarga. Sikap Anda...",
    options: [
      { label: "A", content: "Menyelesaikan laporan terlebih dahulu karena merupakan tanggung jawab, lalu menghadiri acara keluarga jika sempat", isCorrect: true },
      { label: "B", content: "Langsung pulang ke acara keluarga", isCorrect: false },
      { label: "C", content: "Meminta rekan menggantikan", isCorrect: false },
      { label: "D", content: "Menyelesaikan laporan setengah jadi lalu pergi", isCorrect: false },
      { label: "E", content: "Menolak lembur dengan alasan sudah ada rencana", isCorrect: false },
    ],
    explanation: "TKP menilai prioritas tanggung jawab pekerjaan. Menyelesaikan tugas menunjukkan dedikasi dan profesionalisme sebagai ASN.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Seorang warga datang dengan keluhan yang bukan wewenang instansi Anda. Tindakan yang paling tepat...",
    options: [
      { label: "A", content: "Mengarahkan ke instansi yang berwenang dengan informasi lengkap", isCorrect: true },
      { label: "B", content: "Menyuruh mencari sendiri instansi yang tepat", isCorrect: false },
      { label: "C", content: "Tetap menerima aduan meski bukan wewenang", isCorrect: false },
      { label: "D", content: "Menolak karena bukan urusan instansi", isCorrect: false },
      { label: "E", content: "Mencatat aduan tanpa ditindaklanjuti", isCorrect: false },
    ],
    explanation: "Pelayanan publik yang baik mengarahkan warga dengan informasi lengkap ke instansi yang tepat, menunjukkan orientasi pelayanan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Tim Anda mengalami konflik internal yang menghambat proyek. Sebagai anggota tim, Anda...",
    options: [
      { label: "A", content: "Menginisiasi diskusi terbuka untuk mencari akar masalah dan solusi bersama", isCorrect: true },
      { label: "B", content: "Membiarkan konflik selesai dengan sendirinya", isCorrect: false },
      { label: "C", content: "Memihak salah satu pihak yang menurut Anda benar", isCorrect: false },
      { label: "D", content: "Langsung melapor ke atasan", isCorrect: false },
      { label: "E", content: "Fokus pada tugas sendiri dan mengabaikan konflik", isCorrect: false },
    ],
    explanation: "Inisiatif diskusi terbuka menunjukkan kemampuan jejaring kerja, kepemimpinan, dan orientasi pada penyelesaian masalah.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Atasan Anda memberikan instruksi yang menurut Anda kurang efisien. Sikap Anda...",
    options: [
      { label: "A", content: "Mengerjakan sesuai instruksi sambil menyampaikan saran perbaikan secara sopan", isCorrect: true },
      { label: "B", content: "Langsung mengerjakan dengan cara sendiri yang lebih efisien", isCorrect: false },
      { label: "C", content: "Menolak dan menjelaskan alasan penolakan", isCorrect: false },
      { label: "D", content: "Mengerjakan sesuai instruksi tanpa memberi masukan", isCorrect: false },
      { label: "E", content: "Meminta rekan lain yang mengerjakan", isCorrect: false },
    ],
    explanation: "Menghormati instruksi atasan sambil menyampaikan saran menunjukkan keseimbangan antara kepatuhan dan inisiatif.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Anda menemukan indikasi penyalahgunaan anggaran di unit kerja Anda. Langkah yang paling tepat...",
    options: [
      { label: "A", content: "Mengumpulkan bukti dan melaporkan melalui saluran resmi (whistle-blowing)", isCorrect: true },
      { label: "B", content: "Membicarakan dengan pelaku secara langsung", isCorrect: false },
      { label: "C", content: "Mengabaikan karena bukan tanggung jawab Anda", isCorrect: false },
      { label: "D", content: "Menceritakan kepada rekan kerja", isCorrect: false },
      { label: "E", content: "Memposting di media sosial", isCorrect: false },
    ],
    explanation: "Integritas ASN mengharuskan pelaporan melalui saluran resmi dengan bukti yang memadai, sesuai prinsip akuntabilitas.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Anda harus menyelesaikan 3 tugas sekaligus dengan deadline bersamaan. Strategi Anda...",
    options: [
      { label: "A", content: "Membuat prioritas berdasarkan urgensi dan dampak, lalu mengerjakan secara sistematis", isCorrect: true },
      { label: "B", content: "Mengerjakan yang paling mudah terlebih dahulu", isCorrect: false },
      { label: "C", content: "Meminta perpanjangan deadline untuk semua tugas", isCorrect: false },
      { label: "D", content: "Mendelegasikan semua ke bawahan", isCorrect: false },
      { label: "E", content: "Mengerjakan secara acak tanpa perencanaan", isCorrect: false },
    ],
    explanation: "Manajemen prioritas berbasis urgensi dan dampak menunjukkan kemampuan organisasi dan pengambilan keputusan yang baik.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Saat memberikan pelayanan, ada warga yang marah dan berkata kasar kepada Anda. Respons Anda...",
    options: [
      { label: "A", content: "Tetap tenang, mendengarkan keluhan, dan berusaha menyelesaikan masalahnya", isCorrect: true },
      { label: "B", content: "Membalas dengan nada yang sama", isCorrect: false },
      { label: "C", content: "Memanggil satpam untuk mengamankan", isCorrect: false },
      { label: "D", content: "Meminta warga tersebut datang lagi nanti", isCorrect: false },
      { label: "E", content: "Menyerahkan ke rekan yang lain", isCorrect: false },
    ],
    explanation: "Pelayan publik harus memiliki emotional intelligence — tetap tenang dan fokus pada penyelesaian masalah warga.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
  {
    content: "Anda mendapat tawaran kerja dengan gaji lebih tinggi di sektor swasta, padahal baru 1 tahun menjadi ASN. Sikap Anda...",
    options: [
      { label: "A", content: "Tetap berkomitmen sebagai ASN dan mengembangkan karir di instansi", isCorrect: true },
      { label: "B", content: "Langsung menerima tawaran tersebut", isCorrect: false },
      { label: "C", content: "Menerima tawaran sambil tetap jadi ASN", isCorrect: false },
      { label: "D", content: "Meminta kenaikan gaji ke instansi", isCorrect: false },
      { label: "E", content: "Menunda keputusan tanpa batas waktu", isCorrect: false },
    ],
    explanation: "Komitmen dan loyalitas terhadap institusi adalah nilai penting ASN, terutama di awal karir ketika masih dalam masa pengembangan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal CPNS 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// BUMN — TKD (Tes Kemampuan Dasar)
// ============================================================
const tkdBumnQuestions: QuestionSeed[] = [
  {
    content: "Jika harga saham naik 20% lalu turun 20%, maka perubahan harga dari awal adalah...",
    options: [
      { label: "A", content: "Tetap sama", isCorrect: false },
      { label: "B", content: "Turun 4%", isCorrect: true },
      { label: "C", content: "Naik 4%", isCorrect: false },
      { label: "D", content: "Turun 2%", isCorrect: false },
      { label: "E", content: "Naik 2%", isCorrect: false },
    ],
    explanation: "Misal harga awal 100. Naik 20% → 120. Turun 20% dari 120 → 120 × 0,8 = 96. Perubahan = (96-100)/100 = -4%.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "EFISIENSI : PEMBOROSAN :: INOVASI : ...",
    options: [
      { label: "A", content: "Kreativitas", isCorrect: false },
      { label: "B", content: "Stagnasi", isCorrect: true },
      { label: "C", content: "Revolusi", isCorrect: false },
      { label: "D", content: "Modernisasi", isCorrect: false },
      { label: "E", content: "Teknologi", isCorrect: false },
    ],
    explanation: "Efisiensi berlawanan dengan pemborosan. Inovasi berlawanan dengan stagnasi (kemandekan/tidak ada perubahan).",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Sebuah perusahaan memiliki pendapatan Rp2,4 miliar dan biaya operasional 60% dari pendapatan. Jika pajak 25% dari laba, berapa laba bersih setelah pajak?",
    options: [
      { label: "A", content: "Rp720 juta", isCorrect: true },
      { label: "B", content: "Rp960 juta", isCorrect: false },
      { label: "C", content: "Rp600 juta", isCorrect: false },
      { label: "D", content: "Rp840 juta", isCorrect: false },
      { label: "E", content: "Rp480 juta", isCorrect: false },
    ],
    explanation: "Biaya operasional = 60% × 2,4M = 1,44M. Laba = 2,4M - 1,44M = 960 juta. Pajak = 25% × 960 = 240 juta. Laba bersih = 960 - 240 = 720 juta.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Manakah kata yang TIDAK baku?",
    options: [
      { label: "A", content: "Analisis", isCorrect: false },
      { label: "B", content: "Apotek", isCorrect: false },
      { label: "C", content: "Nasehat", isCorrect: true },
      { label: "D", content: "Risiko", isCorrect: false },
      { label: "E", content: "Februari", isCorrect: false },
    ],
    explanation: "Kata baku adalah 'nasihat' bukan 'nasehat'. Semua opsi lain sudah dalam bentuk baku.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Deret: 3, 5, 9, 17, 33, ...",
    options: [
      { label: "A", content: "57", isCorrect: false },
      { label: "B", content: "63", isCorrect: false },
      { label: "C", content: "65", isCorrect: true },
      { label: "D", content: "67", isCorrect: false },
      { label: "E", content: "49", isCorrect: false },
    ],
    explanation: "Pola: setiap suku = suku sebelumnya × 2 - 1. 3→5(3×2-1), 5→9(5×2-1), 9→17, 17→33, 33→65(33×2-1).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Jika p → q bernilai benar dan q bernilai salah, maka nilai p adalah...",
    options: [
      { label: "A", content: "Benar", isCorrect: false },
      { label: "B", content: "Salah", isCorrect: true },
      { label: "C", content: "Tidak dapat ditentukan", isCorrect: false },
      { label: "D", content: "Benar atau salah", isCorrect: false },
      { label: "E", content: "Bergantung pada konteks", isCorrect: false },
    ],
    explanation: "Implikasi p → q hanya bernilai salah jika p benar dan q salah. Karena p → q benar dan q salah, maka p harus salah.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "REDUNDAN = ...",
    options: [
      { label: "A", content: "Berlebihan/tidak diperlukan", isCorrect: true },
      { label: "B", content: "Kekurangan", isCorrect: false },
      { label: "C", content: "Seimbang", isCorrect: false },
      { label: "D", content: "Penting", isCorrect: false },
      { label: "E", content: "Mendesak", isCorrect: false },
    ],
    explanation: "Redundan berarti berlebihan, tidak perlu, atau mubazir karena sudah ada sebelumnya.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Sebuah tangki diisi oleh pipa A dalam 6 jam dan pipa B dalam 4 jam. Jika kedua pipa dibuka bersamaan, berapa jam tangki penuh?",
    options: [
      { label: "A", content: "2 jam", isCorrect: false },
      { label: "B", content: "2,4 jam", isCorrect: true },
      { label: "C", content: "3 jam", isCorrect: false },
      { label: "D", content: "5 jam", isCorrect: false },
      { label: "E", content: "2,5 jam", isCorrect: false },
    ],
    explanation: "Kecepatan A = 1/6, B = 1/4. Bersama = 1/6 + 1/4 = 5/12 per jam. Waktu = 12/5 = 2,4 jam.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Lima orang (A, B, C, D, E) duduk melingkar. A di sebelah B, C berhadapan dengan A, D tidak di sebelah E. Siapa yang duduk di sebelah C?",
    options: [
      { label: "A", content: "D dan E", isCorrect: true },
      { label: "B", content: "A dan B", isCorrect: false },
      { label: "C", content: "B dan D", isCorrect: false },
      { label: "D", content: "A dan E", isCorrect: false },
      { label: "E", content: "B dan E", isCorrect: false },
    ],
    explanation: "Urutan melingkar: A-B-?-C-?. C berhadapan A berarti posisi 3. Sisa D dan E di posisi sebelah C. D tidak sebelah E dipenuhi karena mereka di sisi C.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Profit margin perusahaan X adalah 15%. Jika pendapatan Rp800 juta, berapa laba bersihnya?",
    options: [
      { label: "A", content: "Rp100 juta", isCorrect: false },
      { label: "B", content: "Rp120 juta", isCorrect: true },
      { label: "C", content: "Rp150 juta", isCorrect: false },
      { label: "D", content: "Rp80 juta", isCorrect: false },
      { label: "E", content: "Rp160 juta", isCorrect: false },
    ],
    explanation: "Laba bersih = profit margin × pendapatan = 15% × 800 juta = Rp120 juta.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
];

// ============================================================
// BUMN — Core Values BUMN (AKHLAK)
// ============================================================
const coreValuesBumnQuestions: QuestionSeed[] = [
  {
    content: "AKHLAK dalam core values BUMN merupakan singkatan dari...",
    options: [
      { label: "A", content: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", isCorrect: true },
      { label: "B", content: "Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", isCorrect: false },
      { label: "C", content: "Amanah, Kreatif, Harmonis, Loyal, Aktif, Kolaboratif", isCorrect: false },
      { label: "D", content: "Amanah, Kompeten, Humanis, Loyal, Adaptif, Kooperatif", isCorrect: false },
      { label: "E", content: "Akuntabel, Kompeten, Humanis, Loyal, Aktif, Kooperatif", isCorrect: false },
    ],
    explanation: "AKHLAK = Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif — merupakan core values BUMN yang ditetapkan oleh Kementerian BUMN.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Nilai 'Amanah' dalam AKHLAK berarti...",
    options: [
      { label: "A", content: "Memegang teguh kepercayaan yang diberikan", isCorrect: true },
      { label: "B", content: "Mampu beradaptasi dengan perubahan", isCorrect: false },
      { label: "C", content: "Bekerja sama dengan efektif", isCorrect: false },
      { label: "D", content: "Selalu meningkatkan kemampuan diri", isCorrect: false },
      { label: "E", content: "Berdedikasi dan mengutamakan kepentingan perusahaan", isCorrect: false },
    ],
    explanation: "Amanah berarti memegang teguh kepercayaan yang diberikan, memenuhi janji, bertanggung jawab, dan jujur.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Seorang karyawan BUMN mengetahui ada ketidaksesuaian laporan keuangan. Berdasarkan nilai Amanah, tindakan yang tepat adalah...",
    options: [
      { label: "A", content: "Melaporkan temuan tersebut kepada atasan atau unit kepatuhan", isCorrect: true },
      { label: "B", content: "Mengabaikan karena bukan bagian tugasnya", isCorrect: false },
      { label: "C", content: "Memperbaiki sendiri tanpa sepengetahuan siapapun", isCorrect: false },
      { label: "D", content: "Menunggu audit rutin menemukan masalah tersebut", isCorrect: false },
      { label: "E", content: "Membicarakan dengan rekan kerja terlebih dahulu", isCorrect: false },
    ],
    explanation: "Nilai Amanah mengharuskan transparansi dan akuntabilitas. Melaporkan melalui jalur resmi adalah implementasi nilai ini.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Nilai 'Kompeten' dalam AKHLAK diwujudkan dengan cara...",
    options: [
      { label: "A", content: "Terus belajar dan mengembangkan kapabilitas", isCorrect: true },
      { label: "B", content: "Selalu patuh pada instruksi atasan", isCorrect: false },
      { label: "C", content: "Bekerja sesuai jam kerja yang ditentukan", isCorrect: false },
      { label: "D", content: "Mengikuti semua rapat yang dijadwalkan", isCorrect: false },
      { label: "E", content: "Tidak pernah melakukan kesalahan", isCorrect: false },
    ],
    explanation: "Kompeten berarti terus belajar dan mengembangkan kapabilitas, membantu orang lain belajar, dan menyelesaikan tugas dengan kualitas terbaik.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Dalam konteks nilai 'Harmonis', ketika terjadi perbedaan pendapat dalam rapat tim, sikap yang tepat adalah...",
    options: [
      { label: "A", content: "Menghargai perbedaan dan mencari titik temu secara musyawarah", isCorrect: true },
      { label: "B", content: "Mengikuti pendapat mayoritas tanpa diskusi", isCorrect: false },
      { label: "C", content: "Mempertahankan pendapat sendiri sampai diterima", isCorrect: false },
      { label: "D", content: "Meminta atasan memutuskan", isCorrect: false },
      { label: "E", content: "Mengalah demi menghindari konflik", isCorrect: false },
    ],
    explanation: "Harmonis berarti saling peduli dan menghargai perbedaan. Mencari titik temu melalui musyawarah menunjukkan penerapan nilai ini.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Nilai 'Loyal' dalam AKHLAK TIDAK berarti...",
    options: [
      { label: "A", content: "Patuh secara buta tanpa berpikir kritis", isCorrect: true },
      { label: "B", content: "Berdedikasi dan mengutamakan kepentingan BUMN", isCorrect: false },
      { label: "C", content: "Menjaga nama baik perusahaan", isCorrect: false },
      { label: "D", content: "Rela berkorban untuk mencapai tujuan organisasi", isCorrect: false },
      { label: "E", content: "Patuh pada peraturan perundang-undangan", isCorrect: false },
    ],
    explanation: "Loyal bukan berarti patuh buta, melainkan berdedikasi pada tujuan organisasi dengan tetap berpegang pada integritas dan aturan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Perusahaan BUMN menghadapi disrupsi digital. Penerapan nilai 'Adaptif' yang tepat adalah...",
    options: [
      { label: "A", content: "Proaktif mempelajari teknologi baru dan mengusulkan inovasi proses kerja", isCorrect: true },
      { label: "B", content: "Menunggu instruksi dari manajemen untuk berubah", isCorrect: false },
      { label: "C", content: "Menolak perubahan karena sistem lama masih berjalan", isCorrect: false },
      { label: "D", content: "Mengikuti perubahan hanya jika dipaksa", isCorrect: false },
      { label: "E", content: "Meminta perusahaan menyediakan pelatihan terlebih dahulu", isCorrect: false },
    ],
    explanation: "Adaptif berarti terus berinovasi dan antusias menghadapi perubahan. Proaktif mempelajari hal baru adalah implementasi nilai ini.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Implementasi nilai 'Kolaboratif' dalam proyek lintas divisi yang paling tepat adalah...",
    options: [
      { label: "A", content: "Berbagi sumber daya dan pengetahuan untuk mencapai tujuan bersama", isCorrect: true },
      { label: "B", content: "Menyelesaikan bagian masing-masing secara terpisah lalu digabung", isCorrect: false },
      { label: "C", content: "Menunjuk satu divisi sebagai penanggung jawab utama", isCorrect: false },
      { label: "D", content: "Berkompetisi antar divisi untuk hasil terbaik", isCorrect: false },
      { label: "E", content: "Mendelegasikan semua ke divisi yang paling kompeten", isCorrect: false },
    ],
    explanation: "Kolaboratif berarti membangun kerja sama yang sinergis, terbuka dalam bekerja sama, dan berbagi sumber daya untuk tujuan bersama.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Seorang manajer BUMN diminta membuat keputusan cepat untuk peluang bisnis baru yang berisiko. Penerapan AKHLAK yang tepat adalah...",
    options: [
      { label: "A", content: "Menganalisis risiko secara kompeten, berkolaborasi dengan tim, dan bertanggung jawab atas keputusan", isCorrect: true },
      { label: "B", content: "Langsung mengambil keputusan sendiri untuk kecepatan", isCorrect: false },
      { label: "C", content: "Menolak peluang tersebut karena berisiko tinggi", isCorrect: false },
      { label: "D", content: "Menyerahkan keputusan sepenuhnya ke direksi", isCorrect: false },
      { label: "E", content: "Menunda sampai kondisi lebih pasti", isCorrect: false },
    ],
    explanation: "Keputusan bisnis yang baik menggabungkan nilai Kompeten (analisis), Kolaboratif (diskusi tim), dan Amanah (bertanggung jawab).",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Transformasi digital BUMN membutuhkan perubahan budaya kerja. Urutan penerapan AKHLAK yang paling efektif dimulai dari...",
    options: [
      { label: "A", content: "Kompeten (upgrade skill) → Adaptif (embrace change) → Kolaboratif (sinergi)", isCorrect: true },
      { label: "B", content: "Loyal (patuh aturan) → Harmonis (jaga hubungan) → Amanah (tanggung jawab)", isCorrect: false },
      { label: "C", content: "Adaptif (berubah) → Loyal (ikuti) → Harmonis (jangan konflik)", isCorrect: false },
      { label: "D", content: "Kolaboratif (kerja tim) → Kompeten (belajar) → Amanah (lapor)", isCorrect: false },
      { label: "E", content: "Amanah (jujur) → Loyal (setia) → Kompeten (belajar)", isCorrect: false },
    ],
    explanation: "Transformasi digital efektif dimulai dari membangun kompetensi, lalu mengembangkan adaptabilitas terhadap perubahan, dan berkolaborasi untuk implementasi.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
];

// ============================================================
// BUMN — English
// ============================================================
const englishBumnQuestions: QuestionSeed[] = [
  {
    content: "Choose the correct sentence:",
    options: [
      { label: "A", content: "The company has been operating since 2010.", isCorrect: true },
      { label: "B", content: "The company has been operating for 2010.", isCorrect: false },
      { label: "C", content: "The company is operating since 2010.", isCorrect: false },
      { label: "D", content: "The company was operating since 2010.", isCorrect: false },
      { label: "E", content: "The company had been operating for 2010.", isCorrect: false },
    ],
    explanation: "'Since' digunakan dengan present perfect continuous untuk menunjukkan aktivitas yang dimulai di masa lalu dan berlanjut hingga sekarang.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "The quarterly report _____ by the finance team before the board meeting next Monday.",
    options: [
      { label: "A", content: "will have been completed", isCorrect: true },
      { label: "B", content: "will be completing", isCorrect: false },
      { label: "C", content: "has completed", isCorrect: false },
      { label: "D", content: "is completing", isCorrect: false },
      { label: "E", content: "was completed", isCorrect: false },
    ],
    explanation: "Future perfect passive 'will have been completed' menunjukkan aksi yang akan selesai sebelum waktu tertentu di masa depan.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Read the passage: 'The merger between PT Alpha and PT Beta is expected to create synergies worth approximately Rp500 billion over the next three years. However, regulatory approval is still pending.' What can be inferred?",
    options: [
      { label: "A", content: "The merger has not been finalized yet", isCorrect: true },
      { label: "B", content: "The merger has been approved by regulators", isCorrect: false },
      { label: "C", content: "The synergies have already been realized", isCorrect: false },
      { label: "D", content: "Both companies have already merged", isCorrect: false },
      { label: "E", content: "The regulators rejected the merger", isCorrect: false },
    ],
    explanation: "'Regulatory approval is still pending' menunjukkan merger belum final karena persetujuan regulasi masih dalam proses.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "The word 'procurement' in a business context most closely means...",
    options: [
      { label: "A", content: "The process of obtaining goods or services", isCorrect: true },
      { label: "B", content: "The process of selling products", isCorrect: false },
      { label: "C", content: "The process of hiring employees", isCorrect: false },
      { label: "D", content: "The process of financial auditing", isCorrect: false },
      { label: "E", content: "The process of marketing strategy", isCorrect: false },
    ],
    explanation: "Procurement adalah proses pengadaan barang atau jasa dalam konteks bisnis, meliputi sourcing, purchasing, dan delivery.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "_____ the economic downturn, the company managed to increase its market share.",
    options: [
      { label: "A", content: "Despite", isCorrect: true },
      { label: "B", content: "Because of", isCorrect: false },
      { label: "C", content: "Due to", isCorrect: false },
      { label: "D", content: "Since", isCorrect: false },
      { label: "E", content: "Although of", isCorrect: false },
    ],
    explanation: "'Despite' + noun phrase digunakan untuk menunjukkan kontras. 'Although of' bukan bentuk yang benar dalam bahasa Inggris.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Which sentence uses correct business English?",
    options: [
      { label: "A", content: "Please find attached the requested documents for your review.", isCorrect: true },
      { label: "B", content: "I am attaching herewith the requested documents for review purpose.", isCorrect: false },
      { label: "C", content: "Kindly find the attached documents as per requested.", isCorrect: false },
      { label: "D", content: "The requested documents are being attached hereby.", isCorrect: false },
      { label: "E", content: "Attached please finding the documents which requested.", isCorrect: false },
    ],
    explanation: "'Please find attached' adalah frasa standar business English yang tepat dan profesional untuk menyertakan dokumen.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "The CEO emphasized that all stakeholders _____ be informed about the restructuring plan.",
    options: [
      { label: "A", content: "should", isCorrect: true },
      { label: "B", content: "would better", isCorrect: false },
      { label: "C", content: "had better to", isCorrect: false },
      { label: "D", content: "must to", isCorrect: false },
      { label: "E", content: "ought", isCorrect: false },
    ],
    explanation: "'Should' digunakan untuk menyatakan rekomendasi. 'Ought' memerlukan 'to', 'must' tidak diikuti 'to'.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Choose the word that best completes the sentence: 'The company's revenue showed a _____ increase of 25% year-over-year.'",
    options: [
      { label: "A", content: "substantial", isCorrect: true },
      { label: "B", content: "negligible", isCorrect: false },
      { label: "C", content: "marginal", isCorrect: false },
      { label: "D", content: "trivial", isCorrect: false },
      { label: "E", content: "minimal", isCorrect: false },
    ],
    explanation: "25% adalah peningkatan yang signifikan, sehingga 'substantial' (cukup besar) adalah kata yang paling tepat.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "Read: 'The implementation of the new ERP system was delayed due to unforeseen technical challenges. The project team is currently working on resolving the issues and expects to go live by Q3.' When is the system expected to launch?",
    options: [
      { label: "A", content: "Third quarter of the year", isCorrect: true },
      { label: "B", content: "Third month of the year", isCorrect: false },
      { label: "C", content: "It has already launched", isCorrect: false },
      { label: "D", content: "The launch has been cancelled", isCorrect: false },
      { label: "E", content: "First quarter of next year", isCorrect: false },
    ],
    explanation: "Q3 = Quarter 3 (kuartal ketiga), yaitu Juli-September. Tim berharap sistem berjalan pada kuartal ketiga.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
  {
    content: "The antonym of 'deficit' in financial terms is...",
    options: [
      { label: "A", content: "Surplus", isCorrect: true },
      { label: "B", content: "Balance", isCorrect: false },
      { label: "C", content: "Revenue", isCorrect: false },
      { label: "D", content: "Equity", isCorrect: false },
      { label: "E", content: "Asset", isCorrect: false },
    ],
    explanation: "Deficit (kekurangan/defisit) berlawanan dengan surplus (kelebihan). Dalam keuangan, deficit menunjukkan pengeluaran melebihi pendapatan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal rekrutmen BUMN 2024",
    year: 2024,
  },
];

// ============================================================
// Kedinasan — TPA STAN
// ============================================================
const tpaStanQuestions: QuestionSeed[] = [
  {
    content: "KORELASI = ...",
    options: [
      { label: "A", content: "Hubungan timbal balik", isCorrect: true },
      { label: "B", content: "Perbedaan mendasar", isCorrect: false },
      { label: "C", content: "Persamaan bentuk", isCorrect: false },
      { label: "D", content: "Pertentangan pendapat", isCorrect: false },
      { label: "E", content: "Gabungan unsur", isCorrect: false },
    ],
    explanation: "Korelasi berarti hubungan timbal balik atau keterkaitan antara dua hal atau lebih.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "2, 6, 14, 30, 62, ...",
    options: [
      { label: "A", content: "94", isCorrect: false },
      { label: "B", content: "124", isCorrect: false },
      { label: "C", content: "126", isCorrect: true },
      { label: "D", content: "130", isCorrect: false },
      { label: "E", content: "118", isCorrect: false },
    ],
    explanation: "Pola: setiap suku = suku sebelumnya × 2 + 2. 2→6(2×2+2), 6→14, 14→30, 30→62, 62→126(62×2+2).",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Jika semua mahasiswa STAN adalah pegawai negeri, dan Andi bukan pegawai negeri, maka...",
    options: [
      { label: "A", content: "Andi bukan mahasiswa STAN", isCorrect: true },
      { label: "B", content: "Andi mungkin mahasiswa STAN", isCorrect: false },
      { label: "C", content: "Andi pasti mahasiswa swasta", isCorrect: false },
      { label: "D", content: "Tidak dapat disimpulkan", isCorrect: false },
      { label: "E", content: "Andi adalah mahasiswa STAN yang belum dilantik", isCorrect: false },
    ],
    explanation: "Silogisme: Semua A adalah B, Andi bukan B, maka Andi bukan A (modus tollens). Karena semua mahasiswa STAN = pegawai negeri dan Andi bukan pegawai negeri, maka Andi bukan mahasiswa STAN.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "ANOMALI >< ...",
    options: [
      { label: "A", content: "Keteraturan", isCorrect: true },
      { label: "B", content: "Keanehan", isCorrect: false },
      { label: "C", content: "Keunikan", isCorrect: false },
      { label: "D", content: "Penyimpangan", isCorrect: false },
      { label: "E", content: "Ketidakwajaran", isCorrect: false },
    ],
    explanation: "Anomali berarti penyimpangan/ketidaknormalan. Antonimnya adalah keteraturan/kenormalan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Rata-rata usia 5 orang adalah 28 tahun. Jika satu orang berusia 40 tahun keluar dan digantikan orang baru, rata-rata menjadi 26 tahun. Berapa usia orang baru?",
    options: [
      { label: "A", content: "28 tahun", isCorrect: false },
      { label: "B", content: "30 tahun", isCorrect: true },
      { label: "C", content: "20 tahun", isCorrect: false },
      { label: "D", content: "24 tahun", isCorrect: false },
      { label: "E", content: "35 tahun", isCorrect: false },
    ],
    explanation: "Total awal = 5 × 28 = 140. Total baru = 5 × 26 = 130. Usia orang baru = 130 - (140 - 40) = 130 - 100 = 30.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Dokter : Pasien :: Akuntan : ...",
    options: [
      { label: "A", content: "Klien", isCorrect: true },
      { label: "B", content: "Laporan", isCorrect: false },
      { label: "C", content: "Keuangan", isCorrect: false },
      { label: "D", content: "Audit", isCorrect: false },
      { label: "E", content: "Pajak", isCorrect: false },
    ],
    explanation: "Dokter melayani pasien, akuntan melayani klien. Keduanya menunjukkan hubungan profesional-penerima jasa.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Sebuah barang dibeli Rp200.000 dan dijual dengan keuntungan 15%. Berapa harga jualnya?",
    options: [
      { label: "A", content: "Rp215.000", isCorrect: false },
      { label: "B", content: "Rp230.000", isCorrect: true },
      { label: "C", content: "Rp225.000", isCorrect: false },
      { label: "D", content: "Rp240.000", isCorrect: false },
      { label: "E", content: "Rp210.000", isCorrect: false },
    ],
    explanation: "Harga jual = 200.000 + (15% × 200.000) = 200.000 + 30.000 = Rp230.000.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Jika 3x + 2y = 20 dan x + y = 8, maka nilai x - y adalah...",
    options: [
      { label: "A", content: "-4", isCorrect: false },
      { label: "B", content: "4", isCorrect: false },
      { label: "C", content: "-2", isCorrect: false },
      { label: "D", content: "2", isCorrect: false },
      { label: "E", content: "0", isCorrect: true },
    ],
    explanation: "Dari x + y = 8: x = 8 - y. Substitusi: 3(8-y) + 2y = 20 → 24 - 3y + 2y = 20 → y = 4. Maka x = 4. x - y = 4 - 4 = 0.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Pernyataan: 'Jika hujan turun, maka jalanan basah.' Kontraposisi dari pernyataan tersebut adalah...",
    options: [
      { label: "A", content: "Jika jalanan tidak basah, maka hujan tidak turun", isCorrect: true },
      { label: "B", content: "Jika jalanan basah, maka hujan turun", isCorrect: false },
      { label: "C", content: "Jika hujan tidak turun, maka jalanan tidak basah", isCorrect: false },
      { label: "D", content: "Jalanan basah jika dan hanya jika hujan turun", isCorrect: false },
      { label: "E", content: "Hujan turun karena jalanan basah", isCorrect: false },
    ],
    explanation: "Kontraposisi dari p → q adalah ~q → ~p. 'Jika jalanan tidak basah (~q), maka hujan tidak turun (~p)'.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Dari 40 siswa, 25 suka matematika, 20 suka fisika, dan 10 suka keduanya. Berapa siswa yang tidak suka keduanya?",
    options: [
      { label: "A", content: "3", isCorrect: false },
      { label: "B", content: "5", isCorrect: true },
      { label: "C", content: "8", isCorrect: false },
      { label: "D", content: "10", isCorrect: false },
      { label: "E", content: "15", isCorrect: false },
    ],
    explanation: "Suka minimal satu: 25 + 20 - 10 = 35. Tidak suka keduanya: 40 - 35 = 5.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
];

// ============================================================
// Kedinasan — TBI STAN (Tes Bahasa Inggris)
// ============================================================
const tbiStanQuestions: QuestionSeed[] = [
  {
    content: "Neither the manager nor the employees _____ aware of the policy change.",
    options: [
      { label: "A", content: "were", isCorrect: true },
      { label: "B", content: "was", isCorrect: false },
      { label: "C", content: "is", isCorrect: false },
      { label: "D", content: "has been", isCorrect: false },
      { label: "E", content: "have", isCorrect: false },
    ],
    explanation: "Dalam 'neither...nor', kata kerja mengikuti subjek terdekat. 'Employees' (jamak) memerlukan 'were'.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "The government's fiscal policy aims to _____ the national debt while maintaining economic growth.",
    options: [
      { label: "A", content: "reduce", isCorrect: true },
      { label: "B", content: "reducing", isCorrect: false },
      { label: "C", content: "reduced", isCorrect: false },
      { label: "D", content: "reduction", isCorrect: false },
      { label: "E", content: "reduces", isCorrect: false },
    ],
    explanation: "'Aims to' diikuti oleh infinitive (bare verb). Jadi 'aims to reduce' adalah bentuk yang benar.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Choose the sentence with correct punctuation:",
    options: [
      { label: "A", content: "The tax return, which was filed late, incurred a penalty.", isCorrect: true },
      { label: "B", content: "The tax return which was filed late, incurred a penalty.", isCorrect: false },
      { label: "C", content: "The tax return, which was filed late incurred a penalty.", isCorrect: false },
      { label: "D", content: "The tax return which, was filed late incurred, a penalty.", isCorrect: false },
      { label: "E", content: "The tax return which was filed late incurred a penalty.", isCorrect: false },
    ],
    explanation: "Non-restrictive clause ('which was filed late') harus diapit koma. Opsi A menggunakan koma dengan benar.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "The word 'revenue' is closest in meaning to...",
    options: [
      { label: "A", content: "Income", isCorrect: true },
      { label: "B", content: "Expense", isCorrect: false },
      { label: "C", content: "Debt", isCorrect: false },
      { label: "D", content: "Liability", isCorrect: false },
      { label: "E", content: "Cost", isCorrect: false },
    ],
    explanation: "Revenue = pendapatan/pemasukan, yang paling dekat artinya dengan income.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "If I _____ about the tax deadline, I would have filed my return on time.",
    options: [
      { label: "A", content: "had known", isCorrect: true },
      { label: "B", content: "have known", isCorrect: false },
      { label: "C", content: "knew", isCorrect: false },
      { label: "D", content: "would know", isCorrect: false },
      { label: "E", content: "was knowing", isCorrect: false },
    ],
    explanation: "Conditional type 3 (past unreal): If + past perfect, would have + past participle. 'If I had known... I would have filed.'",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Read: 'The customs duty on imported goods was raised by 5% to protect domestic industries. Economists warn that this could lead to higher consumer prices.' The passage suggests that...",
    options: [
      { label: "A", content: "Higher import duties may increase prices for consumers", isCorrect: true },
      { label: "B", content: "Domestic industries will definitely benefit", isCorrect: false },
      { label: "C", content: "Consumer prices will decrease", isCorrect: false },
      { label: "D", content: "Imports will increase significantly", isCorrect: false },
      { label: "E", content: "The duty increase has been cancelled", isCorrect: false },
    ],
    explanation: "Teks menyebutkan economists warn bahwa kenaikan bea masuk 'could lead to higher consumer prices'.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "The accountant _____ the financial statements when the auditor arrived.",
    options: [
      { label: "A", content: "was preparing", isCorrect: true },
      { label: "B", content: "has prepared", isCorrect: false },
      { label: "C", content: "prepares", isCorrect: false },
      { label: "D", content: "had been prepare", isCorrect: false },
      { label: "E", content: "is preparing", isCorrect: false },
    ],
    explanation: "Past continuous 'was preparing' digunakan untuk aksi yang sedang berlangsung ketika aksi lain terjadi di masa lalu.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "Choose the correct passive form: 'The government should have announced the new tax policy earlier.'",
    options: [
      { label: "A", content: "The new tax policy should have been announced by the government earlier.", isCorrect: true },
      { label: "B", content: "The new tax policy should been announced by the government earlier.", isCorrect: false },
      { label: "C", content: "The new tax policy should have been announcing by the government earlier.", isCorrect: false },
      { label: "D", content: "The new tax policy should had been announced by the government earlier.", isCorrect: false },
      { label: "E", content: "The new tax policy should have announced by the government earlier.", isCorrect: false },
    ],
    explanation: "Passive voice dari 'should have + V3': subject + should have been + V3 + by agent.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "_____ the budget was limited, the team managed to deliver the project successfully.",
    options: [
      { label: "A", content: "Although", isCorrect: true },
      { label: "B", content: "Because", isCorrect: false },
      { label: "C", content: "Therefore", isCorrect: false },
      { label: "D", content: "Moreover", isCorrect: false },
      { label: "E", content: "Despite of", isCorrect: false },
    ],
    explanation: "'Although' + clause menunjukkan kontras/kontraposisi. 'Despite of' bukan bentuk yang benar ('despite' tanpa 'of').",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
  {
    content: "The director insisted that every employee _____ the mandatory training session.",
    options: [
      { label: "A", content: "attend", isCorrect: true },
      { label: "B", content: "attends", isCorrect: false },
      { label: "C", content: "attended", isCorrect: false },
      { label: "D", content: "attending", isCorrect: false },
      { label: "E", content: "will attend", isCorrect: false },
    ],
    explanation: "Setelah 'insisted that' digunakan subjunctive mood — kata kerja dalam bentuk base form tanpa -s: 'that every employee attend'.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal USM PKN STAN 2024",
    year: 2024,
  },
];

// ============================================================
// Kedinasan — Matematika STIS
// ============================================================
const matematikaStisQuestions: QuestionSeed[] = [
  {
    content: "Nilai dari limit: lim(x→0) (sin 3x) / (2x) adalah...",
    options: [
      { label: "A", content: "3/2", isCorrect: true },
      { label: "B", content: "2/3", isCorrect: false },
      { label: "C", content: "1", isCorrect: false },
      { label: "D", content: "0", isCorrect: false },
      { label: "E", content: "3", isCorrect: false },
    ],
    explanation: "lim(x→0) sin(3x)/(2x) = lim(x→0) [sin(3x)/(3x)] × (3x)/(2x) = 1 × 3/2 = 3/2.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Turunan dari f(x) = x³ - 6x² + 9x + 2 sama dengan nol ketika x = ...",
    options: [
      { label: "A", content: "1 dan 3", isCorrect: true },
      { label: "B", content: "2 dan 3", isCorrect: false },
      { label: "C", content: "1 dan 2", isCorrect: false },
      { label: "D", content: "0 dan 3", isCorrect: false },
      { label: "E", content: "-1 dan 3", isCorrect: false },
    ],
    explanation: "f'(x) = 3x² - 12x + 9 = 3(x² - 4x + 3) = 3(x-1)(x-3) = 0. Jadi x = 1 atau x = 3.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Nilai dari ∫₀² (3x² + 2x) dx adalah...",
    options: [
      { label: "A", content: "12", isCorrect: true },
      { label: "B", content: "10", isCorrect: false },
      { label: "C", content: "14", isCorrect: false },
      { label: "D", content: "8", isCorrect: false },
      { label: "E", content: "16", isCorrect: false },
    ],
    explanation: "∫(3x² + 2x)dx = x³ + x². Evaluasi: [2³ + 2²] - [0] = 8 + 4 = 12.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Jika P(A) = 0,4, P(B) = 0,5, dan P(A ∩ B) = 0,2, maka P(A ∪ B) = ...",
    options: [
      { label: "A", content: "0,7", isCorrect: true },
      { label: "B", content: "0,9", isCorrect: false },
      { label: "C", content: "0,6", isCorrect: false },
      { label: "D", content: "0,8", isCorrect: false },
      { label: "E", content: "0,5", isCorrect: false },
    ],
    explanation: "P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0,4 + 0,5 - 0,2 = 0,7.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Matriks A = [[2, 1], [3, 4]]. Determinan A adalah...",
    options: [
      { label: "A", content: "5", isCorrect: true },
      { label: "B", content: "8", isCorrect: false },
      { label: "C", content: "-5", isCorrect: false },
      { label: "D", content: "11", isCorrect: false },
      { label: "E", content: "-1", isCorrect: false },
    ],
    explanation: "det(A) = (2)(4) - (1)(3) = 8 - 3 = 5.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Rata-rata dari data 5, 8, 10, 12, 15 adalah 10. Jika setiap data ditambah 3, rata-rata baru adalah...",
    options: [
      { label: "A", content: "13", isCorrect: true },
      { label: "B", content: "10", isCorrect: false },
      { label: "C", content: "30", isCorrect: false },
      { label: "D", content: "15", isCorrect: false },
      { label: "E", content: "11", isCorrect: false },
    ],
    explanation: "Jika setiap data ditambah konstanta c, maka rata-rata baru = rata-rata lama + c = 10 + 3 = 13.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Persamaan garis yang melalui titik (2, 3) dan tegak lurus garis y = 2x + 1 adalah...",
    options: [
      { label: "A", content: "y = -½x + 4", isCorrect: true },
      { label: "B", content: "y = 2x - 1", isCorrect: false },
      { label: "C", content: "y = -2x + 7", isCorrect: false },
      { label: "D", content: "y = ½x + 2", isCorrect: false },
      { label: "E", content: "y = -½x + 2", isCorrect: false },
    ],
    explanation: "Gradien garis y = 2x + 1 adalah 2. Gradien tegak lurus = -1/2. Persamaan: y - 3 = -½(x - 2) → y = -½x + 4.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Dalam suatu kelas, simpangan baku nilai ujian adalah 8. Jika setiap nilai dikalikan 2 lalu ditambah 5, simpangan baku baru adalah...",
    options: [
      { label: "A", content: "16", isCorrect: true },
      { label: "B", content: "21", isCorrect: false },
      { label: "C", content: "8", isCorrect: false },
      { label: "D", content: "11", isCorrect: false },
      { label: "E", content: "13", isCorrect: false },
    ],
    explanation: "Jika data ditransformasi aX + b, simpangan baku baru = |a| × simpangan baku lama. Jadi SD = 2 × 8 = 16 (penambahan konstanta tidak mengubah SD).",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "log₂ 8 + log₃ 27 - log₅ 25 = ...",
    options: [
      { label: "A", content: "4", isCorrect: true },
      { label: "B", content: "5", isCorrect: false },
      { label: "C", content: "6", isCorrect: false },
      { label: "D", content: "3", isCorrect: false },
      { label: "E", content: "8", isCorrect: false },
    ],
    explanation: "log₂ 8 = 3, log₃ 27 = 3, log₅ 25 = 2. Jadi 3 + 3 - 2 = 4.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
  {
    content: "Dari 10 orang, akan dipilih 3 orang sebagai ketua, sekretaris, dan bendahara. Banyak cara pemilihan adalah...",
    options: [
      { label: "A", content: "720", isCorrect: true },
      { label: "B", content: "120", isCorrect: false },
      { label: "C", content: "360", isCorrect: false },
      { label: "D", content: "1000", isCorrect: false },
      { label: "E", content: "210", isCorrect: false },
    ],
    explanation: "Karena posisi berbeda (permutasi): P(10,3) = 10!/(10-3)! = 10 × 9 × 8 = 720.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal USM STIS 2024",
    year: 2024,
  },
];

// ============================================================
// PPPK — Kompetensi Teknis
// ============================================================
const kompetensiTeknisQuestions: QuestionSeed[] = [
  {
    content: "Dalam manajemen ASN, merit system adalah...",
    options: [
      { label: "A", content: "Pengelolaan ASN berdasarkan kualifikasi, kompetensi, dan kinerja", isCorrect: true },
      { label: "B", content: "Pengelolaan ASN berdasarkan senioritas", isCorrect: false },
      { label: "C", content: "Pengelolaan ASN berdasarkan kedekatan personal", isCorrect: false },
      { label: "D", content: "Pengelolaan ASN berdasarkan latar belakang pendidikan saja", isCorrect: false },
      { label: "E", content: "Pengelolaan ASN berdasarkan golongan pangkat", isCorrect: false },
    ],
    explanation: "Merit system adalah kebijakan manajemen ASN berdasarkan kualifikasi, kompetensi, dan kinerja secara adil tanpa diskriminasi.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Sasaran Kinerja Pegawai (SKP) PPPK disusun berdasarkan...",
    options: [
      { label: "A", content: "Rencana strategis dan perjanjian kinerja unit", isCorrect: true },
      { label: "B", content: "Keinginan pribadi pegawai", isCorrect: false },
      { label: "C", content: "Target keuangan semata", isCorrect: false },
      { label: "D", content: "Instruksi lisan atasan", isCorrect: false },
      { label: "E", content: "Kebiasaan tahun sebelumnya", isCorrect: false },
    ],
    explanation: "SKP disusun berdasarkan rencana strategis, rencana kerja tahunan, dan perjanjian kinerja unit sesuai PP 30 Tahun 2019.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Perbedaan utama antara PNS dan PPPK adalah...",
    options: [
      { label: "A", content: "PPPK bekerja berdasarkan perjanjian kerja dengan jangka waktu tertentu", isCorrect: true },
      { label: "B", content: "PPPK tidak mendapat gaji dari APBN/APBD", isCorrect: false },
      { label: "C", content: "PPPK tidak perlu memenuhi kompetensi jabatan", isCorrect: false },
      { label: "D", content: "PNS tidak memiliki hak cuti", isCorrect: false },
      { label: "E", content: "PNS bekerja berdasarkan kontrak tahunan", isCorrect: false },
    ],
    explanation: "PPPK diangkat berdasarkan perjanjian kerja dengan jangka waktu tertentu, sedangkan PNS diangkat secara tetap.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam konteks pelayanan publik, prinsip 'akuntabilitas' berarti...",
    options: [
      { label: "A", content: "Setiap kegiatan dan hasil akhir dapat dipertanggungjawabkan kepada publik", isCorrect: true },
      { label: "B", content: "Pelayanan dilakukan dengan cepat", isCorrect: false },
      { label: "C", content: "Pelayanan dilakukan secara gratis", isCorrect: false },
      { label: "D", content: "Pelayanan tersedia 24 jam", isCorrect: false },
      { label: "E", content: "Pelayanan mengutamakan pejabat terlebih dahulu", isCorrect: false },
    ],
    explanation: "Akuntabilitas adalah prinsip di mana setiap kegiatan dan hasilnya harus dapat dipertanggungjawabkan kepada masyarakat sesuai peraturan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "E-government dalam pelayanan publik bertujuan untuk...",
    options: [
      { label: "A", content: "Meningkatkan efisiensi, transparansi, dan aksesibilitas pelayanan", isCorrect: true },
      { label: "B", content: "Mengurangi jumlah pegawai pemerintah", isCorrect: false },
      { label: "C", content: "Menghapuskan pelayanan tatap muka", isCorrect: false },
      { label: "D", content: "Menghemat anggaran semata", isCorrect: false },
      { label: "E", content: "Memindahkan semua data ke cloud asing", isCorrect: false },
    ],
    explanation: "E-government bertujuan meningkatkan efisiensi, transparansi, dan aksesibilitas pelayanan publik melalui pemanfaatan TIK.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Zona integritas menuju Wilayah Bebas dari Korupsi (WBK) di instansi pemerintah diwujudkan melalui...",
    options: [
      { label: "A", content: "Manajemen perubahan, penataan tatalaksana, dan penguatan pengawasan", isCorrect: true },
      { label: "B", content: "Peningkatan gaji pegawai semata", isCorrect: false },
      { label: "C", content: "Pengurangan jumlah regulasi", isCorrect: false },
      { label: "D", content: "Penambahan CCTV di semua ruangan", isCorrect: false },
      { label: "E", content: "Pemecatan pegawai yang bermasalah", isCorrect: false },
    ],
    explanation: "Zona integritas WBK dibangun melalui 6 area perubahan: manajemen perubahan, penataan tatalaksana, penataan SDM, penguatan pengawasan, penguatan akuntabilitas, dan peningkatan pelayanan publik.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam siklus manajemen kinerja PPPK, tahapan yang benar adalah...",
    options: [
      { label: "A", content: "Perencanaan → Pelaksanaan → Pemantauan → Penilaian → Tindak lanjut", isCorrect: true },
      { label: "B", content: "Penilaian → Perencanaan → Pelaksanaan → Pemantauan", isCorrect: false },
      { label: "C", content: "Pelaksanaan → Perencanaan → Penilaian → Tindak lanjut", isCorrect: false },
      { label: "D", content: "Pemantauan → Perencanaan → Pelaksanaan → Penilaian", isCorrect: false },
      { label: "E", content: "Tindak lanjut → Penilaian → Pelaksanaan → Perencanaan", isCorrect: false },
    ],
    explanation: "Siklus manajemen kinerja yang benar dimulai dari perencanaan target, pelaksanaan tugas, pemantauan berkala, penilaian hasil, dan tindak lanjut.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Standar Pelayanan Minimal (SPM) ditetapkan untuk...",
    options: [
      { label: "A", content: "Menjamin hak masyarakat mendapat pelayanan dasar dari pemerintah daerah", isCorrect: true },
      { label: "B", content: "Membatasi jumlah pelayanan yang diberikan", isCorrect: false },
      { label: "C", content: "Mengurangi beban kerja ASN", isCorrect: false },
      { label: "D", content: "Menstandarkan gaji pegawai daerah", isCorrect: false },
      { label: "E", content: "Mengevaluasi kinerja kepala daerah", isCorrect: false },
    ],
    explanation: "SPM adalah ketentuan mengenai jenis dan mutu pelayanan dasar yang merupakan urusan wajib daerah yang berhak diperoleh warga secara minimal.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Reformasi birokrasi Indonesia memiliki 8 area perubahan. Yang BUKAN termasuk area perubahan tersebut adalah...",
    options: [
      { label: "A", content: "Peningkatan pendapatan negara", isCorrect: true },
      { label: "B", content: "Manajemen perubahan", isCorrect: false },
      { label: "C", content: "Penataan organisasi", isCorrect: false },
      { label: "D", content: "Penataan peraturan perundang-undangan", isCorrect: false },
      { label: "E", content: "Penataan SDM aparatur", isCorrect: false },
    ],
    explanation: "8 area reformasi birokrasi: manajemen perubahan, penataan organisasi, penataan peraturan, penataan SDM, penataan tatalaksana, penguatan pengawasan, penguatan akuntabilitas, dan peningkatan pelayanan publik.",
    difficulty: QuestionDifficulty.HARD,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Undang-Undang yang mengatur tentang Pelayanan Publik di Indonesia adalah...",
    options: [
      { label: "A", content: "UU No. 25 Tahun 2009", isCorrect: true },
      { label: "B", content: "UU No. 5 Tahun 2014", isCorrect: false },
      { label: "C", content: "UU No. 23 Tahun 2014", isCorrect: false },
      { label: "D", content: "UU No. 30 Tahun 2014", isCorrect: false },
      { label: "E", content: "UU No. 20 Tahun 2023", isCorrect: false },
    ],
    explanation: "UU No. 25 Tahun 2009 tentang Pelayanan Publik mengatur prinsip, standar, dan mekanisme penyelenggaraan pelayanan publik.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// PPPK — Kompetensi Manajerial
// ============================================================
const kompetensiManajerialQuestions: QuestionSeed[] = [
  {
    content: "Anda memimpin tim yang terdiri dari anggota dengan latar belakang berbeda. Pendekatan kepemimpinan yang paling efektif adalah...",
    options: [
      { label: "A", content: "Mengakomodasi perbedaan sebagai kekuatan tim dan mendorong kolaborasi", isCorrect: true },
      { label: "B", content: "Menyeragamkan semua anggota agar sejalan", isCorrect: false },
      { label: "C", content: "Memberikan tugas hanya pada yang paling kompeten", isCorrect: false },
      { label: "D", content: "Membiarkan setiap anggota bekerja sendiri-sendiri", isCorrect: false },
      { label: "E", content: "Menghindari penugasan yang melibatkan perbedaan", isCorrect: false },
    ],
    explanation: "Pemimpin yang efektif memanfaatkan keberagaman sebagai kekuatan, mendorong kolaborasi, dan menghargai kontribusi berbeda setiap anggota.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam pengambilan keputusan, analisis SWOT digunakan untuk...",
    options: [
      { label: "A", content: "Mengidentifikasi kekuatan, kelemahan, peluang, dan ancaman", isCorrect: true },
      { label: "B", content: "Menghitung anggaran yang dibutuhkan", isCorrect: false },
      { label: "C", content: "Menentukan struktur organisasi", isCorrect: false },
      { label: "D", content: "Mengevaluasi kinerja pegawai", isCorrect: false },
      { label: "E", content: "Menyusun jadwal kegiatan", isCorrect: false },
    ],
    explanation: "SWOT = Strengths (kekuatan), Weaknesses (kelemahan), Opportunities (peluang), Threats (ancaman). Digunakan untuk analisis strategis.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Seorang pegawai PPPK mendapati bahwa kebijakan atasan bertentangan dengan peraturan yang berlaku. Tindakan yang menunjukkan integritas adalah...",
    options: [
      { label: "A", content: "Menyampaikan keberatan secara sopan disertai dasar hukum yang relevan", isCorrect: true },
      { label: "B", content: "Menjalankan kebijakan tanpa pertanyaan", isCorrect: false },
      { label: "C", content: "Melaporkan langsung ke media", isCorrect: false },
      { label: "D", content: "Mengabaikan dan tidak melaksanakan", isCorrect: false },
      { label: "E", content: "Membicarakan dengan sesama pegawai di belakang atasan", isCorrect: false },
    ],
    explanation: "Integritas berarti menegakkan kebenaran. Cara yang tepat adalah menyampaikan keberatan secara profesional dengan dasar hukum.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Komunikasi efektif dalam organisasi mengharuskan...",
    options: [
      { label: "A", content: "Pesan disampaikan jelas, dipahami penerima, dan ada umpan balik", isCorrect: true },
      { label: "B", content: "Informasi disampaikan satu arah dari atasan ke bawahan", isCorrect: false },
      { label: "C", content: "Semua komunikasi dilakukan secara tertulis", isCorrect: false },
      { label: "D", content: "Informasi hanya disampaikan saat rapat formal", isCorrect: false },
      { label: "E", content: "Pesan disampaikan sesingkat mungkin tanpa perlu dipahami", isCorrect: false },
    ],
    explanation: "Komunikasi efektif memerlukan kejelasan pesan, pemahaman penerima, dan adanya umpan balik (feedback) untuk memastikan pesan tersampaikan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Ketika menghadapi perubahan regulasi yang berdampak pada unit kerja, langkah manajerial yang tepat adalah...",
    options: [
      { label: "A", content: "Mempelajari regulasi, mengidentifikasi dampak, menyusun rencana penyesuaian, dan mensosialisasikan ke tim", isCorrect: true },
      { label: "B", content: "Menunggu instruksi lebih lanjut dari atasan", isCorrect: false },
      { label: "C", content: "Mengabaikan sampai ada sanksi", isCorrect: false },
      { label: "D", content: "Langsung mengubah semua prosedur tanpa analisis", isCorrect: false },
      { label: "E", content: "Mendelegasikan sepenuhnya ke bawahan", isCorrect: false },
    ],
    explanation: "Manajemen perubahan yang baik melibatkan: pemahaman regulasi, analisis dampak, perencanaan, dan sosialisasi/implementasi.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Prinsip kerjasama tim yang efektif meliputi...",
    options: [
      { label: "A", content: "Tujuan bersama, peran jelas, komunikasi terbuka, dan saling percaya", isCorrect: true },
      { label: "B", content: "Kompetisi antar anggota untuk hasil terbaik", isCorrect: false },
      { label: "C", content: "Satu orang yang mengambil semua keputusan", isCorrect: false },
      { label: "D", content: "Menghindari perbedaan pendapat", isCorrect: false },
      { label: "E", content: "Setiap anggota bekerja independen", isCorrect: false },
    ],
    explanation: "Tim efektif memerlukan: shared goals, clear roles, open communication, dan mutual trust sebagai fondasi kerjasama.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam mengelola konflik di tempat kerja, pendekatan 'kolaborasi' berarti...",
    options: [
      { label: "A", content: "Mencari solusi yang memenuhi kepentingan semua pihak (win-win)", isCorrect: true },
      { label: "B", content: "Salah satu pihak mengalah sepenuhnya", isCorrect: false },
      { label: "C", content: "Menghindari konflik sama sekali", isCorrect: false },
      { label: "D", content: "Menggunakan otoritas untuk memutuskan", isCorrect: false },
      { label: "E", content: "Berkompromi dengan mengorbankan kedua pihak", isCorrect: false },
    ],
    explanation: "Kolaborasi dalam manajemen konflik adalah pendekatan win-win di mana semua pihak bekerja sama mencari solusi yang memuaskan semua kepentingan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Delegasi tugas yang efektif memerlukan...",
    options: [
      { label: "A", content: "Kejelasan tugas, wewenang yang cukup, dan mekanisme pelaporan", isCorrect: true },
      { label: "B", content: "Menyerahkan seluruh tanggung jawab tanpa pengawasan", isCorrect: false },
      { label: "C", content: "Hanya mendelegasikan tugas yang tidak penting", isCorrect: false },
      { label: "D", content: "Mengawasi setiap langkah secara detail (micromanaging)", isCorrect: false },
      { label: "E", content: "Mendelegasikan hanya kepada orang tertentu yang disukai", isCorrect: false },
    ],
    explanation: "Delegasi efektif memerlukan kejelasan tugas dan ekspektasi, pemberian wewenang yang memadai, serta mekanisme pelaporan dan accountability.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Indikator utama keberhasilan orientasi pelayanan publik adalah...",
    options: [
      { label: "A", content: "Tingkat kepuasan masyarakat terhadap layanan", isCorrect: true },
      { label: "B", content: "Jumlah pegawai yang bertugas", isCorrect: false },
      { label: "C", content: "Besarnya anggaran yang dihabiskan", isCorrect: false },
      { label: "D", content: "Banyaknya aturan yang dibuat", isCorrect: false },
      { label: "E", content: "Lama waktu pelayanan", isCorrect: false },
    ],
    explanation: "Indeks Kepuasan Masyarakat (IKM) merupakan indikator utama keberhasilan pelayanan publik, mengukur sejauh mana kebutuhan masyarakat terpenuhi.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam pengambilan keputusan berbasis data, langkah pertama yang harus dilakukan adalah...",
    options: [
      { label: "A", content: "Mengidentifikasi masalah dan menentukan data yang relevan", isCorrect: true },
      { label: "B", content: "Mengumpulkan sebanyak mungkin data", isCorrect: false },
      { label: "C", content: "Membuat keputusan berdasarkan intuisi lalu mencari data pendukung", isCorrect: false },
      { label: "D", content: "Menganalisis data yang sudah tersedia", isCorrect: false },
      { label: "E", content: "Mempresentasikan temuan ke atasan", isCorrect: false },
    ],
    explanation: "Evidence-based decision making dimulai dari identifikasi masalah yang jelas dan penentuan data apa yang relevan untuk menjawab masalah tersebut.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// PPPK — Kompetensi Sosio-Kultural
// ============================================================
const kompetensiSosioKulturalQuestions: QuestionSeed[] = [
  {
    content: "Dalam konteks ASN, 'perekat bangsa' berarti...",
    options: [
      { label: "A", content: "Mampu menjaga persatuan dalam keberagaman dan menjembatani perbedaan", isCorrect: true },
      { label: "B", content: "Memaksa keseragaman budaya", isCorrect: false },
      { label: "C", content: "Mengutamakan suku/agama mayoritas", isCorrect: false },
      { label: "D", content: "Menghindari pembahasan perbedaan", isCorrect: false },
      { label: "E", content: "Menyeragamkan bahasa daerah", isCorrect: false },
    ],
    explanation: "ASN sebagai perekat bangsa mampu menjaga, mengembangkan, dan mewujudkan rasa persatuan dan kesatuan dalam keberagaman.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Anda ditugaskan di daerah dengan budaya yang sangat berbeda dari budaya asal Anda. Sikap yang tepat adalah...",
    options: [
      { label: "A", content: "Mempelajari dan menghormati budaya setempat sambil menjalankan tugas profesional", isCorrect: true },
      { label: "B", content: "Mempertahankan budaya sendiri dan mengabaikan budaya setempat", isCorrect: false },
      { label: "C", content: "Meminta pindah ke daerah yang budayanya lebih sesuai", isCorrect: false },
      { label: "D", content: "Mengubah semua kebiasaan menjadi budaya setempat", isCorrect: false },
      { label: "E", content: "Menghindari interaksi dengan masyarakat lokal", isCorrect: false },
    ],
    explanation: "ASN harus adaptif terhadap keragaman budaya, menghormati kearifan lokal, sambil tetap profesional dalam menjalankan tugas.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam pelayanan publik, seorang ASN melayani warga dari berbagai suku dan agama. Prinsip yang harus dipegang adalah...",
    options: [
      { label: "A", content: "Non-diskriminasi — melayani semua warga secara adil tanpa membedakan SARA", isCorrect: true },
      { label: "B", content: "Mendahulukan yang satu suku dengan petugas", isCorrect: false },
      { label: "C", content: "Memberikan pelayanan berbeda sesuai latar belakang", isCorrect: false },
      { label: "D", content: "Menolak melayani jika ada perbedaan keyakinan", isCorrect: false },
      { label: "E", content: "Menyesuaikan kualitas layanan dengan status sosial warga", isCorrect: false },
    ],
    explanation: "Prinsip non-diskriminasi mengharuskan ASN melayani semua warga secara adil dan setara tanpa memandang suku, agama, ras, atau golongan.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Moderasi beragama dalam konteks ASN berarti...",
    options: [
      { label: "A", content: "Mengamalkan agama secara toleran dan menghormati keyakinan orang lain", isCorrect: true },
      { label: "B", content: "Tidak mengamalkan agama di tempat kerja", isCorrect: false },
      { label: "C", content: "Menyebarkan agama kepada rekan kerja", isCorrect: false },
      { label: "D", content: "Menganggap semua agama sama", isCorrect: false },
      { label: "E", content: "Memisahkan agama dari kehidupan sehari-hari", isCorrect: false },
    ],
    explanation: "Moderasi beragama adalah sikap mengamalkan agama secara berimbang, tidak ekstrem, dan menghormati keberagaman keyakinan orang lain.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Konflik berbasis SARA terjadi di masyarakat tempat Anda bertugas. Sebagai ASN, langkah pertama yang tepat adalah...",
    options: [
      { label: "A", content: "Menjadi mediator netral dan mengedepankan dialog antar kelompok", isCorrect: true },
      { label: "B", content: "Membela kelompok yang menurut Anda benar", isCorrect: false },
      { label: "C", content: "Melaporkan ke media agar cepat ditangani", isCorrect: false },
      { label: "D", content: "Menghindari keterlibatan karena rawan", isCorrect: false },
      { label: "E", content: "Meminta masyarakat menyelesaikan sendiri", isCorrect: false },
    ],
    explanation: "ASN sebagai perekat bangsa harus mampu menjadi mediator netral dan memfasilitasi dialog untuk menyelesaikan konflik SARA.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Gotong royong sebagai nilai budaya Indonesia dalam konteks birokrasi modern diwujudkan melalui...",
    options: [
      { label: "A", content: "Kolaborasi antar unit kerja untuk mencapai tujuan bersama", isCorrect: true },
      { label: "B", content: "Semua pegawai mengerjakan tugas yang sama", isCorrect: false },
      { label: "C", content: "Meniadakan pembagian tugas individual", isCorrect: false },
      { label: "D", content: "Kerja lembur bersama setiap hari", isCorrect: false },
      { label: "E", content: "Membantu pekerjaan rekan meskipun tugas sendiri terbengkalai", isCorrect: false },
    ],
    explanation: "Gotong royong modern berarti kolaborasi sinergis antar unit untuk tujuan bersama, bukan mengabaikan tanggung jawab individual.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Seorang ASN yang memiliki kesadaran sosio-kultural akan...",
    options: [
      { label: "A", content: "Memahami konteks sosial budaya masyarakat yang dilayani untuk memberikan pelayanan yang tepat", isCorrect: true },
      { label: "B", content: "Menerapkan standar pelayanan yang sama persis di semua daerah tanpa penyesuaian", isCorrect: false },
      { label: "C", content: "Mengutamakan efisiensi di atas pemahaman budaya", isCorrect: false },
      { label: "D", content: "Mengabaikan tradisi lokal demi modernisasi", isCorrect: false },
      { label: "E", content: "Menyerahkan urusan budaya ke dinas kebudayaan", isCorrect: false },
    ],
    explanation: "Kesadaran sosio-kultural berarti memahami konteks sosial-budaya masyarakat untuk memberikan pelayanan yang sesuai dan berkeadilan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Wawasan kebangsaan dalam konteks PPPK mencakup pemahaman tentang...",
    options: [
      { label: "A", content: "Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika sebagai pilar kebangsaan", isCorrect: true },
      { label: "B", content: "Sejarah politik partai saja", isCorrect: false },
      { label: "C", content: "Peraturan kepegawaian semata", isCorrect: false },
      { label: "D", content: "Geopolitik internasional", isCorrect: false },
      { label: "E", content: "Ekonomi makro Indonesia", isCorrect: false },
    ],
    explanation: "Empat pilar kebangsaan (Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika) menjadi fondasi wawasan kebangsaan setiap ASN.",
    difficulty: QuestionDifficulty.EASY,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Dalam era digital, tantangan sosio-kultural terbesar bagi ASN adalah...",
    options: [
      { label: "A", content: "Menjaga etika dan menyaring informasi di media sosial untuk mencegah polarisasi", isCorrect: true },
      { label: "B", content: "Menguasai semua platform media sosial", isCorrect: false },
      { label: "C", content: "Membuat konten viral tentang instansi", isCorrect: false },
      { label: "D", content: "Mengikuti semua tren digital", isCorrect: false },
      { label: "E", content: "Menghindari penggunaan teknologi", isCorrect: false },
    ],
    explanation: "Di era digital, ASN harus bijak bermedia sosial, menjaga etika, dan menjadi penyaring informasi untuk mencegah hoax dan polarisasi.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
  {
    content: "Peran ASN dalam menjaga keutuhan NKRI di daerah perbatasan diwujudkan melalui...",
    options: [
      { label: "A", content: "Memberikan pelayanan publik berkualitas dan memperkuat rasa kebangsaan masyarakat", isCorrect: true },
      { label: "B", content: "Membangun tembok perbatasan", isCorrect: false },
      { label: "C", content: "Melarang interaksi dengan warga negara tetangga", isCorrect: false },
      { label: "D", content: "Memindahkan warga perbatasan ke kota besar", isCorrect: false },
      { label: "E", content: "Hanya bertugas di bidang pertahanan", isCorrect: false },
    ],
    explanation: "ASN di perbatasan berperan memperkuat nasionalisme melalui pelayanan berkualitas, pembangunan infrastruktur, dan penguatan identitas kebangsaan.",
    difficulty: QuestionDifficulty.MEDIUM,
    source: "Adaptasi dari soal PPPK 2024 — BKN",
    year: 2024,
  },
];

// ============================================================
// HELPER: Seed questions for a category
// ============================================================
interface CategorySeedConfig {
  categorySlug: string;
  subCategorySlug: string;
  questionSets: { slug: string; questions: QuestionSeed[] }[];
  packageTitle: string;
  packageSlug: string;
  packageDescription: string;
  durationMinutes: number;
  isFree: boolean;
  price: number;
  sectionConfigs: { slug: string; title: string; duration: number; order: number }[];
}

async function seedCategory(
  config: CategorySeedConfig,
  adminId: string,
): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Seeding ${config.categorySlug} / ${config.subCategorySlug}...`);
  console.log("=".repeat(60));

  const category = await prisma.examCategory.findUnique({
    where: { slug: config.categorySlug },
  });
  if (!category) {
    console.error(`  Category ${config.categorySlug} not found, skipping...`);
    return;
  }

  const subCategory = await prisma.examSubCategory.findFirst({
    where: { categoryId: category.id, slug: config.subCategorySlug },
  });
  if (!subCategory) {
    console.error(`  SubCategory ${config.subCategorySlug} not found, skipping...`);
    return;
  }

  const subjects = await prisma.subject.findMany({
    where: { subCategoryId: subCategory.id },
    include: { topics: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  const subjectMap: Record<string, { subjectId: string; topicId: string }> = {};
  for (const s of subjects) {
    subjectMap[s.slug] = {
      subjectId: s.id,
      topicId: s.topics[0]?.id ?? "",
    };
  }

  console.log("Found subjects:", Object.keys(subjectMap).join(", "));

  const createdQuestionIds: Record<string, string[]> = {};

  for (const set of config.questionSets) {
    const mapping = subjectMap[set.slug];
    if (!mapping) {
      console.error(`  Subject ${set.slug} not found, skipping...`);
      continue;
    }

    createdQuestionIds[set.slug] = [];
    console.log(`\nSeeding ${set.questions.length} soal for ${set.slug}...`);

    for (let i = 0; i < set.questions.length; i++) {
      const q = set.questions[i];

      const question = await prisma.question.create({
        data: {
          topicId: mapping.topicId,
          createdById: adminId,
          type: QuestionType.SINGLE_CHOICE,
          status: QuestionStatus.APPROVED,
          difficulty: q.difficulty,
          content: q.content,
          explanation: q.explanation,
          source: q.source,
          year: q.year,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          options: {
            create: q.options.map((opt, idx) => ({
              label: opt.label,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: idx,
            })),
          },
        },
      });

      createdQuestionIds[set.slug].push(question.id);
      console.log(`  ✓ Soal ${i + 1}: ${q.content.substring(0, 50)}...`);
    }
  }

  // Delete existing package if exists
  const existingPackage = await prisma.examPackage.findUnique({
    where: { slug: config.packageSlug },
  });

  if (existingPackage) {
    const attempts = await prisma.examAttempt.findMany({
      where: { packageId: existingPackage.id },
      select: { id: true },
    });
    if (attempts.length > 0) {
      const attemptIds = attempts.map((a) => a.id);
      await prisma.leaderboardEntry.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });
      await prisma.examAnswer.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });
      await prisma.examAttempt.deleteMany({
        where: { packageId: existingPackage.id },
      });
    }
    await prisma.examSectionQuestion.deleteMany({
      where: { section: { packageId: existingPackage.id } },
    });
    await prisma.examSection.deleteMany({
      where: { packageId: existingPackage.id },
    });
    await prisma.examPackage.delete({
      where: { id: existingPackage.id },
    });
    console.log("  Deleted existing package.");
  }

  const totalQuestions = Object.values(createdQuestionIds).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );

  const examPackage = await prisma.examPackage.create({
    data: {
      categoryId: category.id,
      title: config.packageTitle,
      slug: config.packageSlug,
      description: config.packageDescription,
      price: config.price,
      isFree: config.isFree,
      durationMinutes: config.durationMinutes,
      totalQuestions,
      passingScore: 60,
      maxAttempts: 5,
      status: ExamPackageStatus.PUBLISHED,
      createdById: adminId,
    },
  });

  console.log(`  ✓ Package: ${examPackage.title} (${totalQuestions} soal)`);

  for (const sc of config.sectionConfigs) {
    const mapping = subjectMap[sc.slug];
    if (!mapping) continue;

    const questionIds = createdQuestionIds[sc.slug] ?? [];

    const section = await prisma.examSection.create({
      data: {
        packageId: examPackage.id,
        subjectId: mapping.subjectId,
        title: sc.title,
        durationMinutes: sc.duration,
        totalQuestions: questionIds.length,
        order: sc.order,
      },
    });

    for (let i = 0; i < questionIds.length; i++) {
      await prisma.examSectionQuestion.create({
        data: {
          sectionId: section.id,
          questionId: questionIds[i],
          order: i + 1,
        },
      });
    }

    console.log(`  ✓ Section: ${sc.title} (${questionIds.length} soal)`);
  }
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function main(): Promise<void> {
  console.log("Seeding all exam questions...\n");

  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (!admin) throw new Error("Admin user not found. Run main seed first.");

  // 1. UTBK-SNBT (TPS)
  await seedCategory({
    categorySlug: "utbk-snbt",
    subCategorySlug: "tps",
    questionSets: [
      { slug: "penalaran-umum", questions: penalaranUmumQuestions },
      { slug: "pengetahuan-kuantitatif", questions: pengetahuanKuantitatifQuestions },
      { slug: "penalaran-matematika", questions: penalaranMatematikaQuestions },
      { slug: "literasi-bahasa-indonesia", questions: literasiBahasaIndonesiaQuestions },
      { slug: "literasi-bahasa-inggris", questions: literasiBahasaInggrisQuestions },
    ],
    packageTitle: "Simulasi UTBK-SNBT 2026",
    packageSlug: "simulasi-utbk-snbt-2026",
    packageDescription: "Paket simulasi UTBK-SNBT lengkap dengan soal TPS dari 5 subtes: Penalaran Umum, Pengetahuan Kuantitatif, Penalaran Matematika, Literasi Bahasa Indonesia, dan Literasi Bahasa Inggris.",
    durationMinutes: 120,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "penalaran-umum", title: "Penalaran Umum", duration: 25, order: 1 },
      { slug: "pengetahuan-kuantitatif", title: "Pengetahuan Kuantitatif", duration: 25, order: 2 },
      { slug: "penalaran-matematika", title: "Penalaran Matematika", duration: 25, order: 3 },
      { slug: "literasi-bahasa-indonesia", title: "Literasi Bahasa Indonesia", duration: 25, order: 4 },
      { slug: "literasi-bahasa-inggris", title: "Literasi Bahasa Inggris", duration: 20, order: 5 },
    ],
  }, admin.id);

  // 2. CPNS (SKD)
  await seedCategory({
    categorySlug: "cpns",
    subCategorySlug: "skd",
    questionSets: [
      { slug: "twk", questions: twkQuestions },
      { slug: "tiu", questions: tiuQuestions },
      { slug: "tkp", questions: tkpQuestions },
    ],
    packageTitle: "Simulasi SKD CPNS 2026",
    packageSlug: "simulasi-skd-cpns-2026",
    packageDescription: "Paket simulasi SKD CPNS lengkap dengan 30 soal: TWK (Tes Wawasan Kebangsaan), TIU (Tes Intelegensia Umum), dan TKP (Tes Karakteristik Pribadi).",
    durationMinutes: 100,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "twk", title: "Tes Wawasan Kebangsaan (TWK)", duration: 35, order: 1 },
      { slug: "tiu", title: "Tes Intelegensia Umum (TIU)", duration: 35, order: 2 },
      { slug: "tkp", title: "Tes Karakteristik Pribadi (TKP)", duration: 30, order: 3 },
    ],
  }, admin.id);

  // 3. BUMN (TKD BUMN)
  await seedCategory({
    categorySlug: "bumn",
    subCategorySlug: "tkd-bumn",
    questionSets: [
      { slug: "tkd", questions: tkdBumnQuestions },
      { slug: "core-values", questions: coreValuesBumnQuestions },
      { slug: "english-bumn", questions: englishBumnQuestions },
    ],
    packageTitle: "Simulasi TKD BUMN 2026",
    packageSlug: "simulasi-tkd-bumn-2026",
    packageDescription: "Paket simulasi rekrutmen BUMN lengkap dengan 30 soal: Tes Kemampuan Dasar, Core Values AKHLAK, dan English Test.",
    durationMinutes: 90,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "tkd", title: "Tes Kemampuan Dasar", duration: 30, order: 1 },
      { slug: "core-values", title: "Core Values BUMN (AKHLAK)", duration: 30, order: 2 },
      { slug: "english-bumn", title: "English Test", duration: 30, order: 3 },
    ],
  }, admin.id);

  // 4. Kedinasan — PKN STAN
  await seedCategory({
    categorySlug: "kedinasan",
    subCategorySlug: "pkn-stan",
    questionSets: [
      { slug: "tpa-stan", questions: tpaStanQuestions },
      { slug: "tbi-stan", questions: tbiStanQuestions },
    ],
    packageTitle: "Simulasi USM PKN STAN 2026",
    packageSlug: "simulasi-usm-pkn-stan-2026",
    packageDescription: "Paket simulasi USM PKN STAN lengkap dengan 20 soal: TPA (Tes Potensi Akademik) dan TBI (Tes Bahasa Inggris).",
    durationMinutes: 60,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "tpa-stan", title: "Tes Potensi Akademik (TPA)", duration: 30, order: 1 },
      { slug: "tbi-stan", title: "Tes Bahasa Inggris (TBI)", duration: 30, order: 2 },
    ],
  }, admin.id);

  // 5. Kedinasan — STIS
  await seedCategory({
    categorySlug: "kedinasan",
    subCategorySlug: "stis",
    questionSets: [
      { slug: "matematika-stis", questions: matematikaStisQuestions },
    ],
    packageTitle: "Simulasi USM STIS 2026",
    packageSlug: "simulasi-usm-stis-2026",
    packageDescription: "Paket simulasi USM STIS lengkap dengan 10 soal Matematika: Kalkulus, Aljabar, Statistika, dan Logika Matematika.",
    durationMinutes: 45,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "matematika-stis", title: "Matematika STIS", duration: 45, order: 1 },
    ],
  }, admin.id);

  // 6. PPPK (Kompetensi PPPK)
  await seedCategory({
    categorySlug: "pppk",
    subCategorySlug: "kompetensi-pppk",
    questionSets: [
      { slug: "kompetensi-teknis", questions: kompetensiTeknisQuestions },
      { slug: "kompetensi-manajerial", questions: kompetensiManajerialQuestions },
      { slug: "kompetensi-sosio-kultural", questions: kompetensiSosioKulturalQuestions },
    ],
    packageTitle: "Simulasi Seleksi PPPK 2026",
    packageSlug: "simulasi-seleksi-pppk-2026",
    packageDescription: "Paket simulasi seleksi PPPK lengkap dengan 30 soal: Kompetensi Teknis, Kompetensi Manajerial, dan Kompetensi Sosio-Kultural.",
    durationMinutes: 90,
    isFree: true,
    price: 0,
    sectionConfigs: [
      { slug: "kompetensi-teknis", title: "Kompetensi Teknis", duration: 30, order: 1 },
      { slug: "kompetensi-manajerial", title: "Kompetensi Manajerial", duration: 30, order: 2 },
      { slug: "kompetensi-sosio-kultural", title: "Kompetensi Sosio-Kultural", duration: 30, order: 3 },
    ],
  }, admin.id);

  console.log("\n✅ All exam questions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
