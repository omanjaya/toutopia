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
    content: "Lima orang (P, Q, R, S, T) duduk melingkar. P duduk di sebelah kanan Q. R tidak duduk bersebelahan dengan S. T duduk di sebelah kiri P. Siapa yang duduk di sebelah kanan T?",
    options: [
      { label: "A", content: "P", isCorrect: false },
      { label: "B", content: "Q", isCorrect: false },
      { label: "C", content: "R", isCorrect: false },
      { label: "D", content: "S", isCorrect: true },
      { label: "E", content: "Tidak dapat ditentukan", isCorrect: false },
    ],
    explanation: "Urutan melingkar: T-P-Q-...-... dengan T di kiri P berarti P di kanan T. Lalu P di kanan Q berarti Q-P. Jadi urutan: ...Q-P-T-...-... Karena R tidak bersebelahan S, dan posisi tersisa untuk R dan S, maka S di kanan T dan R di posisi lain.",
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
    content: "Ani lebih tua dari Beni. Cici lebih muda dari Dedi. Dedi lebih tua dari Ani. Beni lebih tua dari Eka. Siapa yang paling muda?",
    options: [
      { label: "A", content: "Ani", isCorrect: false },
      { label: "B", content: "Beni", isCorrect: false },
      { label: "C", content: "Cici", isCorrect: false },
      { label: "D", content: "Dedi", isCorrect: false },
      { label: "E", content: "Eka", isCorrect: true },
    ],
    explanation: "Urutan dari tua ke muda: Dedi > Ani > Beni > Eka. Cici < Dedi tapi posisinya relatif terhadap lainnya tidak pasti. Namun Eka pasti paling muda karena Beni > Eka dan Beni di bawah Ani dan Dedi.",
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

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function main() {
  console.log("Seeding UTBK questions...\n");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (!admin) throw new Error("Admin user not found. Run main seed first.");

  // Get UTBK-SNBT category
  const utbkCategory = await prisma.examCategory.findUnique({
    where: { slug: "utbk-snbt" },
  });
  if (!utbkCategory) throw new Error("UTBK-SNBT category not found. Run main seed first.");

  // Get TPS subcategory
  const tpsSubCategory = await prisma.examSubCategory.findFirst({
    where: { categoryId: utbkCategory.id, slug: "tps" },
  });
  if (!tpsSubCategory) throw new Error("TPS subcategory not found.");

  // Get subjects & their first topics
  const subjects = await prisma.subject.findMany({
    where: { subCategoryId: tpsSubCategory.id },
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

  // Map soal ke subject slug
  const questionSets: { slug: string; questions: QuestionSeed[] }[] = [
    { slug: "penalaran-umum", questions: penalaranUmumQuestions },
    { slug: "pengetahuan-kuantitatif", questions: pengetahuanKuantitatifQuestions },
    { slug: "penalaran-matematika", questions: penalaranMatematikaQuestions },
    { slug: "literasi-bahasa-indonesia", questions: literasiBahasaIndonesiaQuestions },
    { slug: "literasi-bahasa-inggris", questions: literasiBahasaInggrisQuestions },
  ];

  // Create questions
  const createdQuestionIds: Record<string, string[]> = {};

  for (const set of questionSets) {
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
          createdById: admin.id,
          type: QuestionType.SINGLE_CHOICE,
          status: QuestionStatus.APPROVED,
          difficulty: q.difficulty,
          content: q.content,
          explanation: q.explanation,
          source: q.source,
          year: q.year,
          reviewedBy: admin.id,
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

  // Create Exam Package: Simulasi UTBK-SNBT 2026
  console.log("\nCreating exam package: Simulasi UTBK-SNBT 2026...");

  const existingPackage = await prisma.examPackage.findUnique({
    where: { slug: "simulasi-utbk-snbt-2026" },
  });

  if (existingPackage) {
    // Delete existing sections and questions
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
    0
  );

  const examPackage = await prisma.examPackage.create({
    data: {
      categoryId: utbkCategory.id,
      title: "Simulasi UTBK-SNBT 2026",
      slug: "simulasi-utbk-snbt-2026",
      description:
        "Paket simulasi UTBK-SNBT lengkap dengan 52 soal TPS dari 5 subtes: Penalaran Umum, Pengetahuan Kuantitatif, Penalaran Matematika, Literasi Bahasa Indonesia, dan Literasi Bahasa Inggris. Soal disusun berdasarkan kisi-kisi resmi SNBT.",
      price: 0,
      isFree: true,
      durationMinutes: 120,
      totalQuestions,
      passingScore: 60,
      maxAttempts: 5,
      status: ExamPackageStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  console.log(`  ✓ Package created: ${examPackage.title} (${totalQuestions} soal)`);

  // Create sections and assign questions
  const sectionConfigs = [
    { slug: "penalaran-umum", title: "Penalaran Umum", duration: 25, order: 1 },
    { slug: "pengetahuan-kuantitatif", title: "Pengetahuan Kuantitatif", duration: 25, order: 2 },
    { slug: "penalaran-matematika", title: "Penalaran Matematika", duration: 25, order: 3 },
    { slug: "literasi-bahasa-indonesia", title: "Literasi Bahasa Indonesia", duration: 25, order: 4 },
    { slug: "literasi-bahasa-inggris", title: "Literasi Bahasa Inggris", duration: 20, order: 5 },
  ];

  for (const config of sectionConfigs) {
    const mapping = subjectMap[config.slug];
    if (!mapping) continue;

    const questionIds = createdQuestionIds[config.slug] ?? [];

    const section = await prisma.examSection.create({
      data: {
        packageId: examPackage.id,
        subjectId: mapping.subjectId,
        title: config.title,
        durationMinutes: config.duration,
        totalQuestions: questionIds.length,
        order: config.order,
      },
    });

    // Assign questions to section
    for (let i = 0; i < questionIds.length; i++) {
      await prisma.examSectionQuestion.create({
        data: {
          sectionId: section.id,
          questionId: questionIds[i],
          order: i + 1,
        },
      });
    }

    console.log(`  ✓ Section: ${config.title} (${questionIds.length} soal)`);
  }

  console.log("\n✅ Seed UTBK questions complete!");
  console.log(`   Total: ${totalQuestions} soal dalam 5 subtes`);
  console.log(`   Package: ${examPackage.title} (PUBLISHED, FREE)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
