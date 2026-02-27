interface PromptParams {
  subtest: string;
  topic: string;
  difficulty: string;
  count: number;
  type: string;
  examType: string;
  customInstruction?: string;
}

const DIFFICULTY_MAP: Record<string, string> = {
  VERY_EASY: "Sangat Mudah (C1 — hafalan/pengetahuan dasar)",
  EASY: "Mudah (C2 — pemahaman dasar)",
  MEDIUM: "Sedang (C3-C4 — aplikasi dan analisis)",
  HARD: "Sulit (C5 — evaluasi dan sintesis)",
  VERY_HARD: "Sangat Sulit (C6 — kreasi, multi-step reasoning)",
  MIXED: "Campuran (distribusi: 20% mudah, 50% sedang, 30% sulit)",
};

const TYPE_MAP: Record<string, string> = {
  SINGLE_CHOICE: "Pilihan Ganda (5 opsi: A-E, 1 jawaban benar)",
  MULTIPLE_CHOICE: "Pilihan Ganda Kompleks (5 opsi: A-E, bisa lebih dari 1 jawaban benar)",
  TRUE_FALSE: "Benar/Salah (2 opsi)",
};

const JSON_SCHEMA = `[
  {
    "content": "Teks soal lengkap termasuk stimulus/konteks (narasi, data, tabel)",
    "explanation": "Pembahasan LENGKAP step-by-step: (1) identifikasi informasi kunci, (2) langkah penalaran, (3) mengapa jawaban benar, (4) mengapa setiap opsi lain salah",
    "difficulty": "EASY | MEDIUM | HARD | VERY_EASY | VERY_HARD",
    "type": "SINGLE_CHOICE | MULTIPLE_CHOICE | TRUE_FALSE",
    "options": [
      { "label": "A", "content": "Teks opsi", "isCorrect": false, "order": 0 },
      { "label": "B", "content": "Teks opsi", "isCorrect": true, "order": 1 },
      { "label": "C", "content": "Teks opsi", "isCorrect": false, "order": 2 },
      { "label": "D", "content": "Teks opsi", "isCorrect": false, "order": 3 },
      { "label": "E", "content": "Teks opsi", "isCorrect": false, "order": 4 }
    ]
  }
]`;

const JSON_SCHEMA_GRADUATED_5 = `[
  {
    "content": "Deskripsi situasi/skenario kerja",
    "explanation": "Pembahasan: mengapa setiap opsi mendapat skor tersebut, prinsip yang mendasari penilaian",
    "difficulty": "EASY | MEDIUM | HARD | VERY_EASY | VERY_HARD",
    "type": "SINGLE_CHOICE",
    "options": [
      { "label": "A", "content": "Respons/sikap opsi A", "isCorrect": false, "order": 0, "score": 3 },
      { "label": "B", "content": "Respons/sikap opsi B", "isCorrect": true, "order": 1, "score": 5 },
      { "label": "C", "content": "Respons/sikap opsi C", "isCorrect": false, "order": 2, "score": 4 },
      { "label": "D", "content": "Respons/sikap opsi D", "isCorrect": false, "order": 3, "score": 2 },
      { "label": "E", "content": "Respons/sikap opsi E", "isCorrect": false, "order": 4, "score": 1 }
    ]
  }
]
CATATAN: Opsi dengan skor TERTINGGI (5) ditandai isCorrect: true. Semua 5 skor HARUS unik (1,2,3,4,5). ACAK urutan skor agar tidak terprediksi.`;

const JSON_SCHEMA_GRADUATED_4 = `[
  {
    "content": "Deskripsi situasi/skenario kerja",
    "explanation": "Pembahasan: mengapa setiap opsi mendapat skor tersebut",
    "difficulty": "EASY | MEDIUM | HARD | VERY_EASY | VERY_HARD",
    "type": "SINGLE_CHOICE",
    "options": [
      { "label": "A", "content": "Respons opsi A", "isCorrect": false, "order": 0, "score": 2 },
      { "label": "B", "content": "Respons opsi B", "isCorrect": true, "order": 1, "score": 4 },
      { "label": "C", "content": "Respons opsi C", "isCorrect": false, "order": 2, "score": 3 },
      { "label": "D", "content": "Respons opsi D", "isCorrect": false, "order": 3, "score": 1 }
    ]
  }
]
CATATAN: HANYA 4 opsi (A-D). Opsi dengan skor TERTINGGI (4) ditandai isCorrect: true. Semua 4 skor HARUS unik (1,2,3,4). ACAK urutan skor.`;

function buildBaseRules(type: string): string {
  const rules = [
    "- Setiap soal WAJIB memiliki stimulus/konteks BARU dan ORIGINAL — gunakan skenario fiktif, data sintetis, atau entitas buatan (nama perusahaan/desa/tokoh fiktif)",
    "- JANGAN gunakan soal yang bisa ditemukan di buku teks, bank soal online, atau Brainly",
    "- Distractor (opsi salah) harus masuk akal dan merepresentasikan common misconception",
    "- Pembahasan WAJIB ada dan HARUS detail step-by-step: jelaskan MENGAPA jawaban benar DAN MENGAPA setiap opsi lain salah",
    "- Bahasa Indonesia formal dan baku",
    "- Tidak mengandung unsur SARA, politik sensitif, atau konten tidak pantas",
    "- Setiap soal harus independen (tidak bergantung pada soal lain)",
    "- Soal harus memerlukan minimal 2-3 langkah penalaran untuk dijawab (multi-step reasoning)",
  ];

  if (type === "SINGLE_CHOICE") {
    rules.push("- Tepat 1 jawaban benar dari 5 opsi (A-E)");
    rules.push("- Semua opsi harus setara dalam panjang dan kompleksitas");
  } else if (type === "MULTIPLE_CHOICE") {
    rules.push("- Bisa ada lebih dari 1 jawaban benar");
    rules.push("- Tandai semua opsi yang benar dengan isCorrect: true");
  } else if (type === "TRUE_FALSE") {
    rules.push("- 2 opsi: Benar dan Salah");
  }

  return rules.join("\n");
}

const ANTI_SEARCH_INSTRUCTIONS = `
STRATEGI ANTI-PLAGIARISME (WAJIB):
1. Gunakan FICTIONAL SCENARIO GENERATION — buat entitas fiktif (nama perusahaan, organisasi, desa, tokoh, zat, dll) yang unik
2. Gunakan DATA SYNTHESIS — buat angka, tabel, dan data statistik yang konsisten secara logika namun sepenuhnya original
3. JANGAN pernah mengutip langsung dari buku teks, jurnal, atau sumber yang sudah ada
4. Setiap soal harus memiliki konteks yang TIDAK MUNGKIN ditemukan di Google, Brainly, atau bank soal manapun
`;

export function buildUtbkPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  const subtestGuide = getUtbkSubtestGuide(params.subtest);

  return `Kamu adalah seorang ahli pembuat soal UTBK-SNBT yang berpengalaman di Badan Pengelolaan Pengujian Pendidikan (BPPP). Kamu telah membuat ribuan soal UTBK berkualitas tinggi selama 10 tahun. Keahlianmu adalah membuat soal HOTS yang menguji penalaran mendalam, bukan hafalan.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk UTBK-SNBT.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

PANDUAN UTBK-SNBT 2026 (Sumber: snpmb.id resmi):
- Total: 160 soal, 195 menit
- TPS: Penalaran Umum (PU), Pengetahuan & Pemahaman Umum (PPU), Pemahaman Bacaan & Menulis (PBM), Pengetahuan Kuantitatif (PK)
- Tes Literasi: Literasi Bahasa Indonesia (LBI), Literasi Bahasa Inggris (LBE), Penalaran Matematika (PM)
- Scoring: IRT (Item Response Theory) — skor ditentukan tingkat kesulitan soal yang dijawab benar, skor 200-800 per subtes
- Tidak ada pengurangan nilai untuk jawaban salah
- Soal UTBK mengutamakan HOTS (C4-C6 Bloom's) — PENALARAN bukan HAFALAN
- Setiap soal HARUS memiliki stimulus baru berupa bacaan, data, grafik, tabel, atau skenario FIKTIF

INSIGHT DARI PESERTA (untuk kalibrasi difficulty):
- Penalaran Matematika paling sulit (9/10) — peserta hanya mampu kerjakan 4-5 soal
- Pengetahuan Kuantitatif sulit (8/10) — banyak kehabisan waktu
- Soal UTBK asli LEBIH SULIT dari tryout online — soal yang dibuat harus match level asli
- Rata-rata 1.2 menit per soal — soal harus bisa dikerjakan dalam waktu tersebut
${subtestGuide}
${ANTI_SEARCH_INSTRUCTIONS}

TEKNIK PEMBUATAN SOAL (Chain-of-Thought):
Untuk setiap soal, pikirkan langkah-langkah berikut:
1. Tentukan konsep/kompetensi yang diuji
2. Rancang skenario fiktif yang relevan dengan topik
3. Buat stimulus (narasi/data/tabel) dengan detail yang cukup
4. Formulasikan pertanyaan yang memerlukan 2-3 langkah penalaran
5. Buat 1 jawaban benar dan 4 distractor yang merepresentasikan kesalahan umum
6. Tulis pembahasan lengkap yang menjelaskan setiap langkah

ATURAN:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${JSON_SCHEMA}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.
- Pembahasan harus menjelaskan: (1) konsep yang diuji, (2) langkah penyelesaian, (3) mengapa jawaban benar, (4) mengapa opsi lain salah.`;
}

function getUtbkSubtestGuide(subtest: string): string {
  const lower = subtest.toLowerCase();

  // Check specific subtests first before generic "penalaran"
  if (lower.includes("penalaran matematika") || lower === "pm") {
    return `
PANDUAN KHUSUS PENALARAN MATEMATIKA (PM) — 20 Soal, 25 menit (75 detik/soal):
DIFFICULTY: PALING SULIT di UTBK (9/10) — peserta hanya mampu 4-5 soal

TIPE SOAL (variasikan):

1. PROBLEM SOLVING GEOMETRI:
   - Soal cerita melibatkan luas, keliling, volume, transformasi
   - Topik: segitiga, lingkaran, bangun ruang, penalaran spasial
   - Gunakan dimensi yang menghasilkan angka bulat

2. ALJABAR & FUNGSI:
   - Persamaan/pertidaksamaan (linear, kuadrat, eksponen, logaritma)
   - Fungsi dan grafik, barisan/deret aritmetika-geometri
   - Pola bilangan

3. STATISTIKA & PROBABILITAS:
   - Mean, median, modus, simpangan baku
   - Peluang kejadian, distribusi frekuensi
   - Interpretasi data dari tabel/grafik

4. LOGIKA MATEMATIKA:
   - Implikasi, bikonditional, tabel kebenaran
   - Konjungsi, disjungsi, kontraposisi, invers

ATURAN PM:
- Setiap soal WAJIB kontekstual (masalah kehidupan nyata FIKTIF) — BUKAN soal abstrak murni
- Multi-step: memerlukan 2-3 langkah perhitungan/penalaran
- Penekanan pada PENALARAN bukan hafalan rumus
- Gunakan data sintetis konsisten (tabel harga, jadwal, statistik populasi fiktif)
- Untuk Isian Singkat: jawaban angka bulat (tanpa satuan/simbol)
- Pastikan setiap angka konsisten dan dapat diverifikasi`;
  }

  if (lower.includes("penalaran umum") || lower.includes("penalaran") || lower === "pu") {
    return `
PANDUAN KHUSUS PENALARAN UMUM (PU) — 30 Soal, 30 menit (60 detik/soal):

TIPE SOAL WAJIB (variasikan):

1. PENALARAN BERBASIS TEKS (Reading-based Reasoning):
   - Stimulus: paragraf bacaan 150-300 kata (berita, artikel ilmiah populer, editorial — FIKTIF)
   - Stem: "Simpulan yang tepat berdasarkan bacaan...", "Pernyataan yang sesuai dengan paragraf X..."
   - Level: C4-C5 (Analisis-Evaluasi)

2. SILOGISME / LOGIKA FORMAL:
   - Stimulus: 2-3 premis logis
   - 4 tipe proposisi: Universal Affirmative "Semua X adalah Y" (A), Universal Negative "Tidak ada X yang Y" (E), Particular Affirmative "Sebagian X adalah Y" (I), Particular Negative "Sebagian X bukan Y" (O)
   - Kombinasi valid: AAA (Barbara), EAE (Celarent), AII (Darii), EIO (Ferio)
   - DISTRACTOR: inverse conclusion, overgeneralization (sebagian→semua), unrelated conclusion, affirmation of consequent fallacy

3. ANALOGI & HUBUNGAN KATA:
   - Format: "A : B = C : ..."
   - 10 tipe relasi: (1) Profesi→Objek (Dokter→Pasien), (2) Alat→Fungsi (Palu→Memukul), (3) Bagian→Keseluruhan (Roda→Mobil), (4) Sinonim, (5) Antonim, (6) Sebab→Akibat, (7) Bahan→Produk, (8) Spesifik→Umum, (9) Tempat→Aktivitas, (10) Intensitas (Marah→Murka)
   - DISTRACTOR: relasi yang mirip tapi berbeda tipe

4. PENALARAN INDUKTIF/DEDUKTIF:
   - Stimulus: data/fakta/tabel/diagram
   - Stem: "Berdasarkan data, kesimpulan PALING tepat...", "Penalaran yang TIDAK valid..."
   - Level: C5-C6 (Evaluasi-Mencipta)

ATURAN PU:
- Soal HARUS memerlukan minimal 2 langkah logika
- Jawaban TIDAK boleh ditemukan langsung dari 1 kalimat saja
- Gunakan konteks FIKTIF (kerajaan, sistem klasifikasi alien, kebijakan negara fiktif)`;
  }

  if (lower.includes("literasi") && lower.includes("indonesia")) {
    return `
PANDUAN KHUSUS LITERASI BAHASA INDONESIA (LBI) — 30 Soal, 45 menit (90 detik/soal):

FORMAT: Teks stimulus 200-400 kata diikuti 3-5 pertanyaan per teks
JENIS TEKS: berita, editorial, esai ilmiah populer, teks prosedur, cuplikan novel remaja (sesuai framework SNPMB)
GAYA: akademis/jurnalistik, bahasa baku PUEBI

10 SUB-PATTERN SOAL (variasikan):
1. Ide pokok / gagasan utama — "Ide pokok paragraf ke-3 adalah..."
2. Makna kata kontekstual — "Makna kata 'X' dalam kalimat tersebut adalah..."
3. Kalimat utama vs kalimat penjelas
4. Simpulan bacaan — kesimpulan yang didukung teks
5. Hubungan antar paragraf — sebab-akibat, kronologis, kontras, perbandingan
6. Tujuan penulis — "Tujuan penulis menulis teks tersebut adalah..."
7. Jenis teks — narasi, deskripsi, eksposisi, argumentasi, persuasi
8. Keefektifan kalimat (EYD/PUEBI) — kalimat baku, ejaan, tanda baca
9. Kalimat fakta vs opini
10. Pola pengembangan paragraf — deduktif, induktif, campuran

3 LEVEL KOGNITIF (Framework SNPMB):
- Mengakses & menemukan informasi dalam teks (C1-C2)
- Memadukan & menafsirkan makna teks (C2-C3)
- Mengevaluasi & merefleksi isi/bentuk teks (C4-C5)

ATURAN LBI:
- Teks HARUS ORIGINAL dan FIKTIF
- JANGAN buat pertanyaan yang jawabannya dari 1 kalimat saja (harus lintas paragraf)
- Untuk Pilihan Majemuk Kompleks: buat 4 pernyataan yang dievaluasi Benar/Salah berdasarkan teks
- Variasikan level kognitif — tidak semua soal level rendah`;
  }

  if (lower.includes("literasi") && lower.includes("inggris")) {
    return `
PANDUAN KHUSUS LITERASI BAHASA INGGRIS (LBE) — 20 Soal, 25 menit (75 detik/soal):

FORMAT: English passage 150-300 words diikuti 3-5 pertanyaan per passage
LEVEL: B1-B2 CEFR (Intermediate to Upper-Intermediate)
JENIS TEKS: academic articles, news reports, scientific passages, social commentary — FICTIONAL

7 SUB-PATTERN SOAL (variasikan):
1. Main idea / topic — "What is the passage mainly about?"
2. Vocabulary in context — "The word 'X' in line Y is closest in meaning to..."
3. Inference / implied meaning — "It can be inferred from the passage that..."
4. Detail / specific information — "According to the passage..."
5. Logical structure / purpose — "The author's primary purpose is to..."
6. Tone / attitude of author — "The author's tone in discussing X is..."
7. Reference (pronoun reference) — "The word 'it/they/this' in line X refers to..."

DISTRACTOR RULES LBE:
- Kata mirip tapi berbeda makna
- Informasi ada di teks tapi bukan jawaban yang ditanya
- Over-generalization dari informasi teks
- Jawaban yang benar untuk pertanyaan lain

ATURAN LBE:
- Teks dalam Bahasa Inggris, pertanyaan dalam Bahasa Indonesia
- Teks HARUS ORIGINAL dan FIKTIF
- Untuk Pilihan Majemuk Kompleks: statements to evaluate True/False based on passage`;
  }

  if (lower.includes("kuantitatif") || lower === "pk") {
    return `
PANDUAN KHUSUS PENGETAHUAN KUANTITATIF (PK) — 15 Soal, 20 menit (80 detik/soal):
DIFFICULTY: Sulit (8/10) — banyak peserta kehabisan waktu

TIPE SOAL (variasikan):

1. DERET ANGKA (paling sering keluar):
   - 10 tipe deret: (1) Aritmatika (+d tetap), (2) Geometri (×r tetap), (3) Kuadrat (n²), (4) Kubik (n³), (5) Fibonacci (Fn=Fn-1+Fn-2), (6) Prima, (7) Beda bertingkat, (8) Campuran (2 deret selang-seling), (9) Berpola operasi (+1,+2,+3...), (10) Faktorial
   - Difficulty: Easy=aritmatika/geometri, Medium=kuadrat/fibonacci, Hard=campuran/beda bertingkat, Very Hard=multi-operasi tersembunyi

2. PERBANDINGAN KUANTITATIF:
   - Format: "Kuantitas A: [ekspresi] vs Kuantitas B: [ekspresi]"
   - Opsi: (A) A lebih besar, (B) B lebih besar, (C) Sama, (D) Tidak dapat ditentukan

3. INTERPRETASI DATA (Tabel/Grafik):
   - Stimulus: tabel data numerik / grafik batang FIKTIF
   - "Berdasarkan tabel, pernyataan yang benar adalah..."
   - "Persentase kenaikan dari tahun X ke Y adalah..."

4. ARITMATIKA & ALJABAR DASAR:
   - Persentase, rasio, proporsi, SPLTV, persamaan
   - Soal cerita: keuntungan/kerugian, campuran, usia, kecepatan

ATURAN PK:
- Topik high-frequency: aljabar (persamaan & pertidaksamaan), bilangan (persentase, rasio), statistika (interpretasi data)
- Multi-step: memerlukan 2-3 langkah
- Kontekstual — gunakan skenario FIKTIF
- Setiap angka harus konsisten dan dapat diverifikasi`;
  }

  if (lower.includes("pemahaman") || lower.includes("ppu") || lower.includes("pengetahuan umum")) {
    return `
PANDUAN KHUSUS PENGETAHUAN & PEMAHAMAN UMUM (PPU):

TIPE SOAL:
1. Kosakata dalam konteks — makna kata/istilah dalam kalimat tertentu
2. Kepaduan paragraf — kalimat paling tepat melengkapi paragraf
3. Ide pokok & gagasan utama — tema utama bacaan
4. Hubungan antar-paragraf — koherensi, transisi logis, sebab-akibat
5. Simpulan bacaan — kesimpulan yang didukung teks

JENIS TEKS: artikel ilmiah populer, esai, teks eksposisi, teks argumentasi
TOPIK: sains, teknologi, sosial, budaya, lingkungan, kesehatan — FIKTIF tapi realistis

POLA STEM:
- "Makna kata 'X' dalam paragraf kedua adalah..."
- "Kalimat yang paling tepat melengkapi paragraf di atas adalah..."
- "Ide pokok paragraf ketiga adalah..."
- "Hubungan paragraf 2 dan 3 adalah..."

ATURAN PPU:
- Teks bacaan ORIGINAL tentang isu kontemporer FIKTIF
- Sajikan argumen pro-kontra, minta identifikasi kelemahan/kekuatan
- Level kognitif: C2-C5 (Pemahaman sampai Evaluasi)`;
  }

  if (lower.includes("membaca") || lower.includes("menulis") || lower.includes("kbm") || lower.includes("pbm")) {
    return `
PANDUAN KHUSUS PEMAHAMAN BACAAN & MENULIS (PBM):

TIPE SOAL:
1. Pemahaman literal — informasi eksplisit dalam teks
2. Pemahaman inferensial — makna tersirat, implikasi
3. Evaluasi — menilai argumen, kelemahan penalaran
4. Perbaikan kalimat — EYD/PUEBI, kalimat efektif, diksi
5. Penyusunan paragraf — urutan kalimat yang logis

JENIS TEKS: berita, artikel opini, esai ilmiah, cerpen/novel (apresiasi sastra) — FIKTIF

LEVEL KOGNITIF:
- Menemukan informasi (C1-C2)
- Memahami dan menafsirkan (C2-C3)
- Mengevaluasi dan merefleksi (C4-C5)

ATURAN PBM:
- Buat teks dengan sengaja memasukkan kesalahan logika/tata bahasa/struktur untuk soal perbaikan
- Untuk soal menulis: berikan paragraf dengan pilihan perbaikan
- Uji pemahaman mendalam tentang PUEBI dan struktur teks
- Variasikan level kognitif dalam setiap set soal`;
  }

  return "";
}

export function buildCpnsPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  return `Kamu adalah seorang ahli pembuat soal Seleksi Kompetensi Dasar (SKD) CPNS yang berpengalaman di BKN. Kamu memahami standar soal SKD dan mampu membuat soal yang menguji kompetensi ASN secara mendalam.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk SKD CPNS.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

PANDUAN SKD CPNS (KepmenPAN RB No. 321/2024):
- SKD terdiri dari 3 subtes: TWK (30 soal), TIU (35 soal), TKP (45 soal) = 110 soal total
- Passing grade: TWK ≥65 (max 150), TIU ≥80 (max 175), TKP ≥166 (max 225), Kumulatif ≥311 (max 550)
- Sistem eliminasi per komponen — harus lolos SEMUA subtes

PANDUAN TWK (Tes Wawasan Kebangsaan — 30 soal, scoring: benar=5, salah=0):
- Pancasila (5-7 soal): implementasi sila, sejarah perumusan BPUPKI/PPKI, Piagam Jakarta
- UUD 1945 (5-7 soal): Pasal 1, 27, 28-28J (HAM), 29, 33, 34, amandemen I-IV (1999-2002)
- NKRI & Bhinneka Tunggal Ika (4-5 soal): otonomi daerah, toleransi, integrasi nasional
- Bahasa Indonesia (3-5 soal): EYD/PUEBI, kalimat efektif, kata baku, kata serapan
- Sejarah (3-4 soal): tokoh pahlawan, peristiwa penting, BUKAN hafalan tahun tapi MAKNA
- PENTING: Soal TWK sekarang banyak HOTS — analisis kasus, evaluasi kebijakan, bukan hafalan

PANDUAN TIU (Tes Intelegensia Umum — 35 soal, scoring: benar=5, salah=0):
- Verbal (10-12 soal): sinonim, antonim, analogi, kelompok kata, pemahaman bacaan
- Numerik (10-12 soal): deret angka, aritmatika, perbandingan/proporsi, soal cerita
- Figural (8-10 soal): serial gambar, analogi gambar, ketidaksamaan, rotasi/cermin
- Logika (5-7 soal): silogisme, kondisional, analitik, diagram Venn

PANDUAN TKP (Tes Karakteristik Pribadi — 45 soal, scoring GRADUATED 1-5):
- TIDAK ADA jawaban salah — setiap opsi bernilai 1-5
- 12 aspek: pelayanan publik, jejaring kerja, sosial budaya, TIK, profesionalisme, anti radikalisme, semangat berprestasi, kreativitas, adaptasi, pengendalian diri, kerja mandiri, belajar berkelanjutan
- Skor 5: Proaktif, solutif, mengutamakan publik, kolaboratif, profesional
- Skor 4: Responsif, mengikuti prosedur dengan baik
- Skor 3: Pasif-positif, tidak melanggar tapi tidak proaktif
- Skor 2: Pasif-negatif, cenderung menghindar
- Skor 1: Kontraproduktif, egois, melanggar etika/aturan

ATURAN KHUSUS TKP:
- SEMUA 5 opsi HARUS memiliki skor unik (1,2,3,4,5) — tidak boleh ada skor yang sama
- Opsi dengan skor tertinggi (5) ditandai isCorrect: true
- Setiap opsi harus masuk akal — tidak ada jawaban yang "jelas konyol"
- Buat skenario situasi kerja FIKTIF yang realistis (nama instansi dan pegawai fiktif)
- Skenario harus menggambarkan dilema etika/profesional yang realistis di lingkungan ASN

${ANTI_SEARCH_INSTRUCTIONS}

ATURAN UMUM:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${getCpnsSchema(params.subtest)}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.`;
}

function getCpnsSchema(subtest: string): string {
  const lower = subtest.toLowerCase();
  if (lower.includes("tkp") || lower.includes("karakteristik")) {
    return JSON_SCHEMA_GRADUATED_5;
  }
  return JSON_SCHEMA;
}

export function buildBumnPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  return `Kamu adalah seorang ahli pembuat soal Rekrutmen Bersama BUMN yang memahami standar tes FHCI dan nilai-nilai AKHLAK BUMN.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk tes BUMN.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

PANDUAN TES REKRUTMEN BERSAMA BUMN 2025 (Sumber: FHCI):

TAHAP 1 — TKD (100 soal, 73 menit):
- Verbal (30%): sinonim, antonim, analogi, kelompok kata, bacaan
- Numerik (30%): deret angka, aritmatika, perbandingan, soal cerita
- Penalaran/Logika (40%): analitik, visual/figural, spasial

TAHAP 1 — Tes AKHLAK (Situational Judgment Test):
Setiap soal HARUS jelas mengukur SATU nilai utama AKHLAK:
- Amanah: jujur, bertanggung jawab, menepati janji, kredibel
- Kompeten: meningkatkan skill, belajar terus, kualitas terbaik
- Harmonis: menghargai perbedaan, empati, peduli lingkungan, toleransi
- Loyal: dedikasi, menjaga nama baik BUMN, patuh aturan
- Adaptif: inovatif, antusias perubahan, proaktif
- Kolaboratif: kerja tim, berbagi pengetahuan, sinergi lintas unit

TAHAP 1 — TWK: Sama dengan TWK CPNS (Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika)

TAHAP 2 — Bahasa Inggris (TOEFL-like, level B1-B2 CEFR):
- Structure & Grammar, Reading Comprehension, Vocabulary

TAHAP 2 — Learning Agility (5 dimensi):
- Mental Agility: berpikir kritis, memecahkan masalah kompleks
- Change Agility: terbuka terhadap perubahan
- People Agility: interpersonal, membaca situasi sosial
- Results Agility: orientasi hasil dalam situasi baru
- Self-Awareness: reflektif, mau belajar dari pengalaman

KONTEKS: Buat skenario di perusahaan BUMN FIKTIF (pertambangan, perbankan, infrastruktur, energi, dll)

${ANTI_SEARCH_INSTRUCTIONS}

ATURAN:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${getBumnSchema(params.subtest)}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.`;
}

function getBumnSchema(subtest: string): string {
  const lower = subtest.toLowerCase();
  if (lower.includes("akhlak") || lower.includes("core value")) {
    return JSON_SCHEMA_GRADUATED_5;
  }
  return JSON_SCHEMA;
}

export function buildKedinasanPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  return `Kamu adalah seorang ahli pembuat soal Seleksi Masuk Sekolah Kedinasan yang memahami standar tes PKN STAN, STIS, IPDN, STIN, dan sekolah kedinasan lainnya.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk seleksi Sekolah Kedinasan.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

PANDUAN TES SEKOLAH KEDINASAN:
- Seleksi menggunakan SKD (sama seperti CPNS: TWK, TIU, TKP) DAN tes khusus per sekolah
- PKN STAN: Tes Potensi Akademik (TPA), Bahasa Inggris — scoring PENALTI (jawaban salah dikurangi 1, benar +4, kosong 0)
- STIS: Matematika Dasar, Matematika IPA, Bahasa Inggris — level SMA IPA, scoring PENALTI
- IPDN: Tes Akademik (Pengetahuan Umum, Bahasa Indonesia, Bahasa Inggris) — soal cenderung HOTS
- STIN: Tes Akademik (Pengetahuan Umum, Matematika, Bahasa Inggris, Bahasa Indonesia) — fokus penalaran dan analisis
- Semua sekolah kedinasan menerapkan passing grade yang ketat
- Soal harus menguji kemampuan analitis dan penalaran, bukan sekedar hafalan

ATURAN KHUSUS SCORING PENALTI:
- Karena ada penalti jawaban salah, distractor harus SANGAT MEYAKINKAN
- Buat opsi yang menguji pemahaman mendalam, bukan tebakan
- Setiap opsi salah harus merepresentasikan kesalahan penalaran yang umum dilakukan

${ANTI_SEARCH_INSTRUCTIONS}

ATURAN:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${JSON_SCHEMA}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.`;
}

export function buildPppkPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  return `Kamu adalah seorang ahli pembuat soal Seleksi PPPK (Pegawai Pemerintah dengan Perjanjian Kerja) yang memahami standar kompetensi ASN dan kebutuhan formasi PPPK.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk seleksi PPPK.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

PANDUAN TES PPPK (KepmenPAN RB No. 1127-1128/2021):
Seleksi PPPK terdiri dari 4 komponen:
  1. Kompetensi Teknis (scoring: benar=5, salah=0) — spesifik per formasi
  2. Kompetensi Manajerial (scoring GRADUATED 1-4, 4 OPSI) — 8 kompetensi
  3. Kompetensi Sosio-Kultural (scoring GRADUATED 1-4, 4 OPSI) — kepekaan sosial/budaya
  4. Wawancara CAT (scoring GRADUATED 1-4, 4 OPSI) — motivasi, komitmen

KOMPETENSI TEKNIS — Per Formasi:
- GURU: Pedagogik 40-50 soal (teori belajar, RPP, Kurikulum Merdeka, asesmen) + Profesional 40-50 soal (materi mapel, level HOTS)
- NAKES: Kasus klinis → diagnosa/tindakan, prioritas triase, interpretasi hasil lab, SOP medis, etika kesehatan
- TEKNIS: Administrasi, IT, keuangan, hukum → sesuai jabatan fungsional

KOMPETENSI MANAJERIAL — 8 Dimensi (4 opsi A-D, skor 1-4):
1. Integritas: kejujuran, konsistensi moral
2. Kerja sama: kolaborasi dalam tim
3. Komunikasi: penyampaian informasi efektif
4. Orientasi pada Hasil: fokus pencapaian target
5. Pelayanan Publik: responsif, akuntabel, transparan
6. Pengembangan Diri & Orang Lain: belajar, mentoring
7. Mengelola Perubahan: adaptif, inovatif
8. Pengambilan Keputusan: analitis, bertanggung jawab
- Skor 4: Proaktif, kolaboratif, mengikuti prosedur tapi tetap solutif
- Skor 3: Responsif, melakukan tugas sesuai standar
- Skor 2: Pasif, menunggu instruksi, kurang inisiatif
- Skor 1: Menyalahkan orang lain, menghindar tanggung jawab

KOMPETENSI SOSIO-KULTURAL (4 opsi A-D, skor 1-4):
- Menghargai keberagaman, dialog & konsensus, harmoni tanpa mengorbankan prinsip

PENTING — PERBEDAAN DENGAN TKP CPNS:
- PPPK Manajerial/SosKul: **4 opsi (A-D)**, skor **1-4**
- CPNS TKP: 5 opsi (A-E), skor 1-5
- JANGAN CAMPUR — pastikan jumlah opsi sesuai tipe kompetensi

ATURAN KHUSUS PPPK:
- Soal Teknis: menguji PENERAPAN, bukan hafalan teori. Level HOTS (C3-C6)
- Soal Manajerial/SosKul: format SJT, 4 opsi, skor 1-4, semua opsi masuk akal
- Buat studi kasus/skenario kerja FIKTIF yang realistis
- Guru: konteks kelas, siswa, Kurikulum Merdeka (CP bukan KD)
- Nakes: vignette klinis fiktif yang aman dan edukatif

${ANTI_SEARCH_INSTRUCTIONS}

ATURAN:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${getPppkSchema(params.subtest)}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.`;
}

function getPppkSchema(subtest: string): string {
  const lower = subtest.toLowerCase();
  if (lower.includes("manajerial") || lower.includes("sosiokultural") || lower.includes("sosio-kultural") || lower.includes("wawancara")) {
    return JSON_SCHEMA_GRADUATED_4;
  }
  return JSON_SCHEMA;
}

export function buildGenericPrompt(params: PromptParams): string {
  const difficulty = DIFFICULTY_MAP[params.difficulty] ?? params.difficulty;
  const type = TYPE_MAP[params.type] ?? params.type;

  return `Kamu adalah seorang ahli pembuat soal ujian profesional untuk ujian ${params.examType} di Indonesia.

TUGAS: Buatkan ${params.count} soal ${params.subtest} untuk ${params.examType}.
Topik: ${params.topic}
Tingkat Kesulitan: ${difficulty}
Tipe Soal: ${type}

${ANTI_SEARCH_INSTRUCTIONS}

ATURAN:
${buildBaseRules(params.type)}

${params.customInstruction ? `INSTRUKSI TAMBAHAN:\n${params.customInstruction}\n` : ""}

FORMAT OUTPUT: JSON array SAJA (tanpa markdown code block, tanpa teks tambahan).
${JSON_SCHEMA}

PENTING:
- Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.
- Setiap soal WAJIB memiliki field "explanation" yang berisi pembahasan lengkap.`;
}

export function buildPrompt(params: PromptParams): string {
  switch (params.examType) {
    case "UTBK":
      return buildUtbkPrompt(params);
    case "CPNS":
      return buildCpnsPrompt(params);
    case "BUMN":
      return buildBumnPrompt(params);
    case "KEDINASAN":
    case "Kedinasan":
      return buildKedinasanPrompt(params);
    case "PPPK":
      return buildPppkPrompt(params);
    default:
      return buildGenericPrompt(params);
  }
}

export function buildValidatorPrompt(questions: { content: string; explanation: string; options: { label: string; content: string; isCorrect: boolean }[] }[]): string {
  const questionsJson = JSON.stringify(questions, null, 2);

  return `Kamu adalah seorang VALIDATOR soal ujian yang sangat teliti dan kritis. Tugasmu adalah mengecek kualitas soal-soal berikut dan memberikan penilaian.

SOAL-SOAL YANG PERLU DIVALIDASI:
${questionsJson}

UNTUK SETIAP SOAL, CEK:
1. **Kebenaran Kunci Jawaban**: Apakah jawaban yang ditandai benar memang benar? Verifikasi dengan penalaran step-by-step.
2. **Kualitas Distractor**: Apakah opsi salah masuk akal? Apakah ada opsi yang terlalu jelas salah?
3. **Ambiguitas**: Apakah ada pertanyaan yang ambigu atau bisa diinterpretasikan ganda?
4. **Tingkat Kesulitan**: Apakah soal ini benar-benar HOTS atau hanya menguji hafalan?
5. **Kelengkapan Pembahasan**: Apakah pembahasan sudah menjelaskan semua langkah dan mengapa opsi lain salah?
6. **Originalitas**: Apakah soal ini cukup unik dan tidak mudah ditemukan di internet?

FORMAT OUTPUT: JSON array SAJA.
[
  {
    "index": 0,
    "valid": true,
    "issues": [],
    "suggestions": "Saran perbaikan jika ada",
    "correctedExplanation": "Pembahasan yang diperbaiki jika explanation asli kurang lengkap (null jika sudah bagus)"
  }
]

PENTING: Output HANYA JSON array valid. Tidak ada teks sebelum atau sesudah JSON.`;
}
