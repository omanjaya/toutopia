import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// SEED EBOOKS — 5 comprehensive HTML ebooks
// ============================================================

interface SeedEbook {
  title: string;
  slug: string;
  description: string;
  contentType: "HTML";
  htmlContent: string;
  category: string;
  tags: string[];
  status: "PUBLISHED";
  publishedAt: Date;
  pageCount: number;
}

const EBOOKS: SeedEbook[] = [
  // ============================================================
  // 1. UTBK-SNBT
  // ============================================================
  {
    title: "Kisi-kisi & Materi Lengkap UTBK-SNBT",
    slug: "kisi-kisi-materi-lengkap-utbk-snbt",
    description:
      "Panduan belajar komprehensif UTBK-SNBT mencakup TPS, Literasi, dan Penalaran Matematika. Dilengkapi contoh soal dan strategi pengerjaan per subtes.",
    contentType: "HTML",
    category: "UTBK",
    tags: ["utbk", "snbt", "tps", "literasi", "penmat"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-10"),
    pageCount: 45,
    htmlContent: `
<h2>Pendahuluan</h2>
<p>Buku panduan ini disusun untuk membantu peserta UTBK-SNBT memahami secara menyeluruh struktur ujian, materi yang diujikan, serta strategi pengerjaan yang efektif. UTBK-SNBT yang diselenggarakan oleh BPPP Kemdikbud merupakan jalur seleksi masuk PTN berbasis tes yang mengukur kemampuan kognitif dan potensi akademik.</p>
<p>Berbeda dengan ujian berbasis hafalan, UTBK-SNBT dirancang untuk mengukur kemampuan berpikir tingkat tinggi (Higher Order Thinking Skills/HOTS). Oleh karena itu, persiapan yang efektif bukan sekadar menghafal materi, melainkan melatih pola berpikir dan strategi pengerjaan.</p>

<h2>BAB 1: Tes Potensi Skolastik (TPS)</h2>

<h3>1.1 Penalaran Umum (PU) — 20 soal, 25 menit</h3>
<p>Penalaran Umum mengukur kemampuan berpikir logis, baik secara induktif maupun deduktif. Subtes ini menjadi salah satu komponen terpenting karena menggambarkan kemampuan analisis peserta.</p>

<h4>Tipe Soal Penalaran Umum:</h4>
<ul>
<li><strong>Silogisme</strong> — Menarik kesimpulan dari dua atau lebih premis. Contoh: "Semua mahasiswa rajin. Andi mahasiswa. Maka..."</li>
<li><strong>Penalaran Analitis</strong> — Menentukan urutan, posisi, atau hubungan berdasarkan syarat-syarat yang diberikan</li>
<li><strong>Penalaran Logis</strong> — Mengevaluasi argumen, mencari asumsi, mengidentifikasi kelemahan penalaran</li>
<li><strong>Deret/Pola</strong> — Menentukan angka atau huruf berikutnya dalam suatu pola</li>
</ul>

<h4>Contoh Soal Silogisme:</h4>
<blockquote>
<p>Premis 1: Semua diplomat harus menguasai minimal 3 bahasa.<br>
Premis 2: Sebagian diplomat yang menguasai lebih dari 4 bahasa ditempatkan di divisi khusus.<br>
Premis 3: Kaelen adalah diplomat yang menguasai 5 bahasa.<br><br>
Manakah simpulan yang PASTI BENAR?<br>
A. Kaelen pasti ditempatkan di divisi khusus<br>
B. Semua diplomat menguasai 5 bahasa<br>
C. Jika Kaelen di divisi khusus, ia menguasai lebih dari 4 bahasa<br>
D. Kaelen adalah satu-satunya diplomat dengan 5 bahasa<br>
E. Tidak ada diplomat yang menguasai kurang dari 3 bahasa</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Kaelen menguasai 5 > 4 bahasa. Kata "sebagian" berarti tidak semua yang menguasai >4 bahasa ditempatkan di divisi khusus. Namun jika ia di divisi khusus, syaratnya pasti terpenuhi (>4 bahasa). Jawaban E juga benar berdasarkan premis 1.</p>

<h4>Contoh Soal Deret:</h4>
<blockquote>
<p>3, 5, 9, 15, 23, ...<br>
A. 29 &nbsp; B. 31 &nbsp; C. 33 &nbsp; D. 35 &nbsp; E. 37</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Selisih: 2, 4, 6, 8 (bertambah 2). Selisih berikutnya = 10, sehingga 23 + 10 = 33.</p>

<h4>Strategi PU:</h4>
<ol>
<li>Identifikasi tipe soal terlebih dahulu (silogisme, analitis, atau deret)</li>
<li>Untuk silogisme: gambar diagram Venn untuk visualisasi hubungan</li>
<li>Untuk deret: cari selisih tingkat pertama, jika tidak teratur cari selisih tingkat kedua</li>
<li>Untuk penalaran analitis: buat tabel/matriks untuk memetakan informasi</li>
</ol>

<h3>1.2 Pengetahuan dan Pemahaman Umum (PPU) — 20 soal, 20 menit</h3>
<p>PPU menguji kemampuan memahami, menganalisis, dan mengevaluasi teks bacaan serta data visual (grafik, tabel, infografis).</p>

<h4>Tipe Soal PPU:</h4>
<ul>
<li><strong>Ide pokok</strong> — Menentukan gagasan utama paragraf atau keseluruhan teks</li>
<li><strong>Inferensi</strong> — Menarik kesimpulan yang tidak dinyatakan eksplisit</li>
<li><strong>Interpretasi grafik</strong> — Membaca dan menganalisis data dari grafik/tabel</li>
<li><strong>Hubungan antaride</strong> — Menentukan hubungan sebab-akibat, perbandingan, atau kronologi</li>
</ul>

<h4>Strategi PPU:</h4>
<ol>
<li>Baca pertanyaan terlebih dahulu sebelum membaca teks</li>
<li>Scan teks untuk menemukan informasi yang relevan dengan pertanyaan</li>
<li>Untuk grafik: perhatikan judul, sumbu, legenda, dan tren data</li>
<li>Jangan terjebak pada informasi yang tidak ditanyakan</li>
</ol>

<h3>1.3 Pemahaman Bacaan dan Menulis (PBM) — 20 soal, 25 menit</h3>
<p>PBM mengukur kemampuan menulis argumentatif dan memahami teks secara kritis.</p>

<h4>Tipe Soal PBM:</h4>
<ul>
<li><strong>Kalimat efektif</strong> — Memilih kalimat yang paling efektif dan sesuai konteks</li>
<li><strong>Koherensi paragraf</strong> — Menentukan urutan kalimat yang logis</li>
<li><strong>Penalaran penulis</strong> — Mengidentifikasi argumen, asumsi, dan bukti pendukung</li>
<li><strong>Evaluasi teks</strong> — Menilai kekuatan dan kelemahan argumen</li>
</ul>

<h3>1.4 Pengetahuan Kuantitatif (PK) — 15 soal, 20 menit</h3>
<p>PK mengukur kemampuan matematika dasar yang diperlukan untuk penalaran kuantitatif.</p>

<h4>Materi PK:</h4>
<ul>
<li><strong>Aritmatika</strong> — Perbandingan, persentase, rata-rata, campuran</li>
<li><strong>Aljabar</strong> — Persamaan linear, kuadrat, pertidaksamaan</li>
<li><strong>Geometri</strong> — Luas, keliling, volume, sudut, kesebangunan</li>
<li><strong>Probabilitas</strong> — Peluang kejadian, permutasi, kombinasi dasar</li>
</ul>

<h4>Contoh Soal PK:</h4>
<blockquote>
<p>Survei di kota fiktif menunjukkan: 60% penduduk menggunakan transportasi umum, 45% menggunakan kendaraan pribadi, 20% menggunakan keduanya. Berapa persen yang tidak menggunakan keduanya?<br>
A. 5% &nbsp; B. 10% &nbsp; C. 15% &nbsp; D. 20% &nbsp; E. 25%</p>
</blockquote>
<p><strong>Jawaban: C.</strong> P(A∪B) = 60% + 45% - 20% = 85%. Tidak keduanya = 100% - 85% = 15%.</p>

<h2>BAB 2: Literasi Bahasa Indonesia — 30 soal, 45 menit</h2>

<h3>2.1 Tipe Teks yang Diujikan</h3>
<ul>
<li><strong>Teks Fiksi</strong> — Cerpen, kutipan novel, puisi. Soal menguji pemahaman makna, karakter, tema, dan gaya bahasa.</li>
<li><strong>Teks Informasi</strong> — Artikel ilmiah, berita, laporan penelitian. Soal menguji pemahaman fakta, argumen, dan struktur teks.</li>
<li><strong>Teks Persuasi</strong> — Editorial, opini, iklan. Soal menguji kemampuan mengevaluasi argumen dan mengidentifikasi bias.</li>
</ul>

<h3>2.2 Cognitive Levels</h3>
<table>
<thead><tr><th>Level</th><th>Deskripsi</th><th>Contoh Pertanyaan</th></tr></thead>
<tbody>
<tr><td>Menemukan Informasi</td><td>Mencari informasi tersurat dalam teks</td><td>"Menurut teks, kapan peristiwa X terjadi?"</td></tr>
<tr><td>Memahami</td><td>Menafsirkan makna tersirat</td><td>"Apa yang dimaksud penulis dengan...?"</td></tr>
<tr><td>Mengevaluasi & Merefleksi</td><td>Menilai kualitas teks dan menghubungkan dengan konteks</td><td>"Apakah argumen penulis didukung bukti yang memadai?"</td></tr>
</tbody>
</table>

<h3>2.3 Strategi Literasi B. Indonesia:</h3>
<ol>
<li>Latih membaca cepat (skimming dan scanning) untuk efisiensi waktu</li>
<li>Perhatikan kata penghubung (namun, akan tetapi, meskipun) yang sering menjadi kunci jawaban</li>
<li>Untuk soal evaluasi: cari klaim utama penulis lalu evaluasi buktinya</li>
</ol>

<h2>BAB 3: Literasi Bahasa Inggris — 20 soal, 30 menit</h2>

<h3>3.1 Level Kemampuan: CEFR B1-B2</h3>
<p>Soal literasi bahasa Inggris setara CEFR B1-B2, yang berarti peserta diharapkan dapat:</p>
<ul>
<li>Memahami poin utama dari teks yang jelas tentang topik familiar</li>
<li>Memahami deskripsi kejadian, perasaan, dan keinginan</li>
<li>Memahami teks yang lebih kompleks, baik konkret maupun abstrak</li>
</ul>

<h3>3.2 Fokus Soal:</h3>
<ul>
<li><strong>Reading comprehension</strong> — Main idea, detail, inference, author's purpose</li>
<li><strong>Vocabulary in context</strong> — Meaning of words based on surrounding text</li>
<li><strong>Reference</strong> — Identifying what pronouns or phrases refer to</li>
<li><strong>Tone and attitude</strong> — Understanding the author's perspective</li>
</ul>

<h3>3.3 Contoh Soal:</h3>
<blockquote>
<p>Read the passage:<br>
"The proliferation of social media has fundamentally altered how young people interact. While proponents argue it enhances connectivity, critics contend that it erodes genuine interpersonal skills."<br><br>
The word "proliferation" in the passage is closest in meaning to:<br>
A. Decline &nbsp; B. Regulation &nbsp; C. Rapid spread &nbsp; D. Restriction &nbsp; E. Improvement</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Proliferation berarti penyebaran/pertumbuhan yang cepat.</p>

<h2>BAB 4: Penalaran Matematika — 20 soal, 30 menit</h2>

<h3>4.1 Domain Bilangan & Operasinya</h3>
<p>Mencakup pecahan, rasio, persentase, FPB/KPK, dan operasi bilangan bulat. Soal sering dikontekstualisasi dalam masalah sehari-hari.</p>

<h3>4.2 Domain Aljabar & Fungsi</h3>
<p>Mencakup persamaan dan pertidaksamaan linear/kuadrat, fungsi, barisan dan deret (aritmatika, geometri), serta pola bilangan.</p>

<h4>Contoh Soal Barisan:</h4>
<blockquote>
<p>Suku pertama barisan aritmatika adalah 5 dan suku ke-10 adalah 32. Berapakah jumlah 20 suku pertama?<br>
A. 610 &nbsp; B. 670 &nbsp; C. 690 &nbsp; D. 710 &nbsp; E. 730</p>
</blockquote>
<p><strong>Jawaban: B.</strong> a=5, a10=5+9b=32, maka b=3. S20 = 20/2 × (2(5)+19(3)) = 10 × (10+57) = 10 × 67 = 670.</p>

<h3>4.3 Domain Geometri & Pengukuran</h3>
<p>Mencakup bangun datar (luas, keliling), bangun ruang (volume, luas permukaan), transformasi geometri (translasi, rotasi, refleksi), dan trigonometri dasar.</p>

<h3>4.4 Domain Data, Statistika & Peluang</h3>
<p>Mencakup mean, median, modus, kuartil, simpangan, interpretasi diagram/grafik, dan peluang kejadian.</p>

<h4>Contoh Soal Statistika:</h4>
<blockquote>
<p>Data nilai: 6, 7, 7, 8, 8, 8, 9, 9, 10. Berapakah median dan modus?<br>
A. Median 8, Modus 8 &nbsp; B. Median 7, Modus 8 &nbsp; C. Median 8, Modus 9 &nbsp; D. Median 9, Modus 7 &nbsp; E. Median 8, Modus 7</p>
</blockquote>
<p><strong>Jawaban: A.</strong> 9 data, median = data ke-5 = 8. Modus (paling sering muncul) = 8 (muncul 3 kali).</p>

<h2>BAB 5: Tips & Strategi Pengerjaan</h2>

<h3>5.1 Manajemen Waktu</h3>
<table>
<thead><tr><th>Subtes</th><th>Soal</th><th>Waktu</th><th>Rata-rata per Soal</th></tr></thead>
<tbody>
<tr><td>TPS - PU</td><td>20</td><td>25 menit</td><td>75 detik</td></tr>
<tr><td>TPS - PPU</td><td>20</td><td>20 menit</td><td>60 detik</td></tr>
<tr><td>TPS - PBM</td><td>20</td><td>25 menit</td><td>75 detik</td></tr>
<tr><td>TPS - PK</td><td>15</td><td>20 menit</td><td>80 detik</td></tr>
<tr><td>Literasi Indo</td><td>30</td><td>45 menit</td><td>90 detik</td></tr>
<tr><td>Literasi Eng</td><td>20</td><td>30 menit</td><td>90 detik</td></tr>
<tr><td>Penalaran Mat</td><td>20</td><td>30 menit</td><td>90 detik</td></tr>
</tbody>
</table>

<h3>5.2 Strategi Umum</h3>
<ol>
<li><strong>Tidak ada penalti</strong> — Jawab semua soal, jangan ada yang kosong</li>
<li><strong>Kerjakan yang mudah dulu</strong> — Scan soal, kerjakan yang familiar, tandai yang sulit</li>
<li><strong>Eliminasi opsi</strong> — Biasanya 2 dari 5 opsi jelas tidak relevan</li>
<li><strong>Jangan terpaku</strong> — Jika >2 menit di satu soal, tandai dan lanjut</li>
<li><strong>Cek ulang</strong> — Gunakan sisa waktu untuk mengecek jawaban yang ditandai</li>
</ol>

<h3>5.3 Persiapan H-1</h3>
<ul>
<li>Tidur cukup (7-8 jam)</li>
<li>Siapkan dokumen (KTP, kartu peserta)</li>
<li>Datang 60 menit sebelum jadwal</li>
<li>Jangan belajar materi baru, cukup review catatan ringkas</li>
</ul>

<h2>Sumber Belajar Resmi</h2>
<ul>
<li>Portal SNPMB: snpmb.bppp.kemdikbud.go.id</li>
<li>Bank soal dan try out UTBK di platform Toutopia</li>
</ul>
    `,
  },

  // ============================================================
  // 2. CPNS
  // ============================================================
  {
    title: "Panduan Materi SKD CPNS: TWK, TIU, TKP",
    slug: "panduan-materi-skd-cpns-twk-tiu-tkp",
    description:
      "Materi lengkap persiapan SKD CPNS meliputi TWK (Pancasila, UUD, NKRI), TIU (verbal, numerik, figural), dan TKP (6 dimensi). Dilengkapi contoh soal dan strategi skor maksimal.",
    contentType: "HTML",
    category: "CPNS",
    tags: ["cpns", "skd", "twk", "tiu", "tkp"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-15"),
    pageCount: 60,
    htmlContent: `
<h2>Pendahuluan</h2>
<p>Seleksi Kompetensi Dasar (SKD) adalah tahap krusial dalam seleksi CPNS yang menggunakan sistem Computer Assisted Test (CAT) dari BKN. Ebook ini menyajikan materi komprehensif untuk ketiga subtes SKD beserta contoh soal dan strategi pengerjaan.</p>

<h2>BAB 1: Tes Wawasan Kebangsaan (TWK) — 30 soal</h2>
<p>TWK bertujuan menilai penguasaan pengetahuan dan kemampuan mengimplementasikan nilai-nilai kebangsaan. Passing grade: <strong>65 dari 150</strong> (minimal 13 soal benar).</p>

<h3>1.1 Pancasila</h3>
<h4>Sejarah Perumusan:</h4>
<ul>
<li>BPUPKI bersidang 29 Mei – 1 Juni 1945</li>
<li>Pidato Ir. Soekarno tentang dasar negara: 1 Juni 1945 (Hari Lahir Pancasila)</li>
<li>Panitia Sembilan merumuskan Piagam Jakarta: 22 Juni 1945</li>
<li>Perubahan "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya" menjadi "Ketuhanan Yang Maha Esa": 18 Agustus 1945</li>
</ul>

<h4>5 Sila dan Butir Pengamalan (45 butir):</h4>
<ol>
<li><strong>Ketuhanan Yang Maha Esa</strong> (7 butir) — Percaya dan takwa kepada Tuhan YME, toleransi antarumat beragama, tidak memaksakan agama</li>
<li><strong>Kemanusiaan yang Adil dan Beradab</strong> (10 butir) — Mengakui persamaan derajat, menjunjung nilai kemanusiaan, tenggang rasa</li>
<li><strong>Persatuan Indonesia</strong> (7 butir) — Mengutamakan kepentingan bangsa, cinta tanah air, rela berkorban</li>
<li><strong>Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan</strong> (10 butir) — Musyawarah mufakat, mengutamakan kepentingan bersama</li>
<li><strong>Keadilan Sosial bagi Seluruh Rakyat Indonesia</strong> (11 butir) — Gotong royong, adil, tidak bermewah-mewahan</li>
</ol>

<h4>Contoh Soal Pancasila:</h4>
<blockquote>
<p>Sila Pancasila yang mengandung makna bahwa bangsa Indonesia mengakui persamaan derajat, hak, dan kewajiban setiap manusia adalah...<br>
A. Sila ke-1 &nbsp; B. Sila ke-2 &nbsp; C. Sila ke-3 &nbsp; D. Sila ke-4 &nbsp; E. Sila ke-5</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Sila ke-2 (Kemanusiaan yang Adil dan Beradab).</p>

<h3>1.2 UUD 1945</h3>
<h4>Struktur UUD 1945:</h4>
<ul>
<li><strong>Pembukaan</strong> — 4 alinea (tidak dapat diubah karena mengandung Pancasila)</li>
<li><strong>Batang Tubuh</strong> — 37 pasal (setelah amandemen: 73 pasal, 194 ayat, 3 pasal aturan peralihan, 2 pasal aturan tambahan)</li>
</ul>

<h4>Pasal-Pasal Kunci:</h4>
<table>
<thead><tr><th>Pasal</th><th>Isi</th></tr></thead>
<tbody>
<tr><td>Pasal 1</td><td>Bentuk negara kesatuan, republik, kedaulatan rakyat</td></tr>
<tr><td>Pasal 27</td><td>Persamaan hak di depan hukum dan pemerintahan</td></tr>
<tr><td>Pasal 28A-J</td><td>Hak Asasi Manusia (amandemen kedua)</td></tr>
<tr><td>Pasal 29</td><td>Negara berdasar Ketuhanan YME, kebebasan beragama</td></tr>
<tr><td>Pasal 31</td><td>Hak pendidikan, wajib belajar</td></tr>
<tr><td>Pasal 33</td><td>Perekonomian nasional berdasar demokrasi ekonomi</td></tr>
<tr><td>Pasal 34</td><td>Fakir miskin dipelihara negara</td></tr>
</tbody>
</table>

<h3>1.3 NKRI & Bhinneka Tunggal Ika</h3>
<ul>
<li><strong>NKRI</strong> ditetapkan dalam Pasal 1 ayat 1 UUD 1945. Otonomi daerah diatur UU No. 23/2014.</li>
<li><strong>Bhinneka Tunggal Ika</strong> berasal dari kitab Sutasoma karya Mpu Tantular. Bermakna "Berbeda-beda tetapi tetap satu jua."</li>
</ul>

<h3>1.4 UU ASN (No. 20/2023)</h3>
<p>Poin penting UU ASN yang sering ditanyakan:</p>
<ul>
<li>ASN terdiri dari PNS dan PPPK</li>
<li>Nilai dasar ASN: BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif)</li>
<li>Kode etik dan kode perilaku ASN</li>
<li>Netralitas ASN dalam politik</li>
<li>Manajemen talenta nasional</li>
</ul>

<h4>Contoh Soal UU ASN:</h4>
<blockquote>
<p>Berdasarkan UU ASN, nilai dasar seorang ASN yang mencerminkan sikap konsisten dalam perkataan dan perbuatan serta bertanggung jawab atas setiap tindakan adalah...<br>
A. Kompeten &nbsp; B. Harmonis &nbsp; C. Akuntabel &nbsp; D. Loyal &nbsp; E. Adaptif</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Akuntabel = bertanggung jawab atas tindakan dan keputusan.</p>

<h2>BAB 2: Tes Intelegensi Umum (TIU) — 35 soal</h2>
<p>TIU mengukur kemampuan kognitif. Passing grade: <strong>80 dari 175</strong> (minimal 16 soal benar).</p>

<h3>2.1 Verbal</h3>

<h4>Sinonim (Persamaan Kata):</h4>
<table>
<thead><tr><th>Kata</th><th>Sinonim</th></tr></thead>
<tbody>
<tr><td>Absolut</td><td>Mutlak</td></tr>
<tr><td>Ambigu</td><td>Bermakna ganda</td></tr>
<tr><td>Anomali</td><td>Penyimpangan</td></tr>
<tr><td>Deduksi</td><td>Penyimpulan dari umum ke khusus</td></tr>
<tr><td>Eksplisit</td><td>Tersurat, gamblang</td></tr>
<tr><td>Implisit</td><td>Tersirat</td></tr>
<tr><td>Konvergensi</td><td>Pemusatan/penggabungan</td></tr>
<tr><td>Paradoks</td><td>Pertentangan</td></tr>
<tr><td>Pragmatis</td><td>Berdasarkan kenyataan</td></tr>
<tr><td>Redundan</td><td>Berlebihan/mubazir</td></tr>
</tbody>
</table>

<h4>Antonim (Lawan Kata):</h4>
<table>
<thead><tr><th>Kata</th><th>Antonim</th></tr></thead>
<tbody>
<tr><td>Abstrak</td><td>Konkret</td></tr>
<tr><td>Homogen</td><td>Heterogen</td></tr>
<tr><td>Mayor</td><td>Minor</td></tr>
<tr><td>Optimis</td><td>Pesimis</td></tr>
<tr><td>Statis</td><td>Dinamis</td></tr>
</tbody>
</table>

<h4>Analogi:</h4>
<p>Pola hubungan yang sering muncul: sinonim, antonim, bagian-keseluruhan, alat-fungsi, sebab-akibat, pelaku-hasil.</p>
<blockquote>
<p>Pilot : Pesawat = ... : ...<br>
A. Nahkoda : Laut &nbsp; B. Masinis : Kereta &nbsp; C. Dokter : Rumah Sakit &nbsp; D. Guru : Murid &nbsp; E. Petani : Sawah</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Hubungan: operator - kendaraan yang dioperasikan.</p>

<h3>2.2 Numerik</h3>

<h4>Deret Angka — Pola Umum:</h4>
<ul>
<li><strong>Deret aritmatika</strong>: selisih tetap (2, 5, 8, 11, 14...)</li>
<li><strong>Deret geometri</strong>: rasio tetap (3, 6, 12, 24...)</li>
<li><strong>Deret bertingkat</strong>: selisih membentuk deret baru (1, 2, 4, 7, 11... → selisih: 1, 2, 3, 4...)</li>
<li><strong>Deret Fibonacci</strong>: jumlah dua suku sebelumnya (1, 1, 2, 3, 5, 8...)</li>
<li><strong>Deret campuran</strong>: kombinasi operasi berbeda</li>
</ul>

<h4>Contoh Soal Aritmatika:</h4>
<blockquote>
<p>Sebuah toko memberikan diskon 20% untuk pembelian pertama dan tambahan diskon 10% untuk total setelah diskon pertama. Jika harga barang Rp500.000, berapakah harga yang harus dibayar?<br>
A. Rp350.000 &nbsp; B. Rp360.000 &nbsp; C. Rp375.000 &nbsp; D. Rp380.000 &nbsp; E. Rp400.000</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Diskon 20%: 500.000 × 0.8 = 400.000. Diskon 10%: 400.000 × 0.9 = 360.000.</p>

<h3>2.3 Figural</h3>
<p>Soal figural menguji kemampuan mengenali pola visual: rotasi, pencerminan, penambahan/pengurangan elemen, dan pengelompokan. Tips: perhatikan perubahan pada posisi, jumlah, ukuran, dan arah elemen dalam gambar.</p>

<h3>2.4 Silogisme</h3>
<blockquote>
<p>Semua bunga mawar berduri. Sebagian tanaman hias adalah bunga mawar. Kesimpulan yang tepat adalah...<br>
A. Semua tanaman hias berduri<br>
B. Sebagian tanaman hias berduri<br>
C. Tidak ada tanaman hias yang berduri<br>
D. Semua yang berduri adalah tanaman hias<br>
E. Sebagian bunga mawar bukan tanaman hias</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Sebagian tanaman hias = bunga mawar, dan semua bunga mawar berduri, maka sebagian tanaman hias berduri.</p>

<h2>BAB 3: Tes Karakteristik Pribadi (TKP) — 45 soal</h2>
<p>TKP menggunakan skor 1-5 per soal (bukan benar/salah). Passing grade: <strong>166 dari 225</strong>. Ini subtes yang paling mudah dimaksimalkan.</p>

<h3>3.1 Enam Dimensi TKP</h3>

<h4>1. Pelayanan Publik</h4>
<p>Mengukur kemampuan melayani masyarakat dengan baik. Jawaban skor tinggi: proaktif, responsif, empati tinggi, memberikan solusi.</p>

<h4>2. Jejaring Kerja</h4>
<p>Mengukur kemampuan membangun dan memelihara hubungan kerja. Jawaban skor tinggi: inisiatif berkolaborasi, komunikatif, membangun trust.</p>

<h4>3. Sosial Budaya</h4>
<p>Mengukur kepekaan terhadap keberagaman. Jawaban skor tinggi: toleran, menghargai perbedaan, menjaga harmoni.</p>

<h4>4. Teknologi Informasi dan Komunikasi</h4>
<p>Mengukur keterbukaan terhadap teknologi. Jawaban skor tinggi: antusias belajar teknologi baru, memanfaatkan IT untuk efisiensi.</p>

<h4>5. Profesionalisme</h4>
<p>Mengukur dedikasi dan integritas. Jawaban skor tinggi: berintegritas, bertanggung jawab, disiplin, mengutamakan tugas.</p>

<h4>6. Anti-Radikalisme</h4>
<p>Mengukur sikap moderat dan nasionalis. Jawaban skor tinggi: menolak radikalisme, mendukung moderasi, bijak menggunakan media sosial.</p>

<h3>3.2 Pola Jawaban Skor 5 (Tertinggi)</h3>
<ul>
<li>Menunjukkan <strong>inisiatif</strong> (bukan menunggu perintah)</li>
<li>Mengutamakan <strong>kepentingan bersama/organisasi</strong></li>
<li>Mencari <strong>win-win solution</strong></li>
<li>Bersikap <strong>profesional dan etis</strong></li>
<li><strong>Tidak konfrontatif</strong> — cari jalan tengah</li>
</ul>

<h4>Contoh Soal TKP:</h4>
<blockquote>
<p>Anda mendapati rekan kerja melakukan kesalahan prosedur yang berdampak pada pelayanan publik. Apa yang Anda lakukan?<br>
A. Melaporkan langsung ke atasan tanpa memberitahu rekan<br>
B. Mengingatkan rekan secara pribadi dan membantu memperbaiki<br>
C. Membiarkan karena bukan tanggung jawab Anda<br>
D. Membicarakan dengan rekan lain<br>
E. Menunggu sampai ada dampak yang lebih besar</p>
</blockquote>
<p><strong>Jawaban skor 5: B.</strong> Menunjukkan kepedulian, inisiatif, dan pendekatan yang bijak.</p>

<h2>BAB 4: Strategi Lulus SKD</h2>

<h3>4.1 Target Skor Ideal</h3>
<table>
<thead><tr><th>Subtes</th><th>PG</th><th>Target Aman</th><th>Target Kompetitif</th></tr></thead>
<tbody>
<tr><td>TWK</td><td>65</td><td>100+</td><td>120+</td></tr>
<tr><td>TIU</td><td>80</td><td>110+</td><td>130+</td></tr>
<tr><td>TKP</td><td>166</td><td>180+</td><td>200+</td></tr>
<tr><td><strong>Total</strong></td><td><strong>311</strong></td><td><strong>390+</strong></td><td><strong>450+</strong></td></tr>
</tbody>
</table>

<h3>4.2 Urutan Prioritas Belajar</h3>
<ol>
<li><strong>TKP (paling mudah dimaksimalkan)</strong> — Pahami pola skor 5, latih 200+ soal</li>
<li><strong>TWK (hafalan)</strong> — Fokus Pancasila, UUD, UU ASN</li>
<li><strong>TIU (butuh latihan intensif)</strong> — Deret, aritmatika, silogisme setiap hari</li>
</ol>

<h3>4.3 Manajemen Waktu Ujian</h3>
<p>Total 110 soal dalam 100 menit = ~55 detik per soal. Strategi: TKP cukup 30 detik/soal (paling cepat), gunakan sisa waktu untuk TIU.</p>
    `,
  },

  // ============================================================
  // 3. BUMN
  // ============================================================
  {
    title: "Materi Rekrutmen BUMN: TKD, AKHLAK, & English",
    slug: "materi-rekrutmen-bumn-tkd-akhlak-english",
    description:
      "Panduan materi rekrutmen bersama BUMN meliputi TKD (verbal, numerik, logika), Core Values AKHLAK, TWK, English Test, dan Learning Agility.",
    contentType: "HTML",
    category: "BUMN",
    tags: ["bumn", "tkd", "akhlak", "english", "learning-agility"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-20"),
    pageCount: 50,
    htmlContent: `
<h2>Pendahuluan</h2>
<p>Rekrutmen Bersama BUMN merupakan seleksi terpadu untuk mengisi posisi di berbagai Badan Usaha Milik Negara Indonesia. Dikoordinasikan oleh Forum Human Capital Indonesia (FHCI), seleksi ini memiliki format yang unik dan berbeda dari CPNS. Ebook ini menyajikan materi lengkap untuk setiap tahap seleksi.</p>

<h2>BAB 1: TKD BUMN (Tes Kemampuan Dasar)</h2>
<p>TKD BUMN menguji kemampuan dasar dengan konteks yang lebih mengarah pada dunia bisnis dan korporasi.</p>

<h3>1.1 Verbal — 30 soal</h3>
<p>Soal verbal BUMN memiliki keunikan: teks bacaan sering bertemakan ekonomi, bisnis, dan korporasi.</p>

<h4>Tipe Soal:</h4>
<ul>
<li><strong>Sinonim/Antonim</strong> — Kosakata formal dan istilah bisnis</li>
<li><strong>Analogi</strong> — Hubungan konseptual, sering konteks bisnis</li>
<li><strong>Pemahaman Bacaan</strong> — Teks tentang ekonomi, manajemen, strategi bisnis</li>
</ul>

<h4>Kosakata Bisnis yang Sering Muncul:</h4>
<table>
<thead><tr><th>Kata</th><th>Arti</th></tr></thead>
<tbody>
<tr><td>Akuisisi</td><td>Pengambilalihan perusahaan</td></tr>
<tr><td>Diversifikasi</td><td>Penganekaragaman produk/investasi</td></tr>
<tr><td>Likuiditas</td><td>Kemampuan membayar kewajiban jangka pendek</td></tr>
<tr><td>Merger</td><td>Penggabungan perusahaan</td></tr>
<tr><td>Solvensi</td><td>Kemampuan membayar semua kewajiban</td></tr>
<tr><td>Sinergi</td><td>Kerja sama yang menghasilkan output lebih besar</td></tr>
<tr><td>Stakeholder</td><td>Pemangku kepentingan</td></tr>
<tr><td>Sustainability</td><td>Keberlanjutan</td></tr>
</tbody>
</table>

<h3>1.2 Numerik — 30 soal</h3>
<p>Soal numerik BUMN sering menggunakan konteks keuangan dan bisnis.</p>

<h4>Tipe Soal Numerik:</h4>
<ul>
<li><strong>Aritmatika bisnis</strong> — Margin keuntungan, break-even point, ROI sederhana</li>
<li><strong>Persentase</strong> — Kenaikan/penurunan harga, diskon bertingkat</li>
<li><strong>Rasio keuangan</strong> — Perbandingan sederhana antar komponen</li>
<li><strong>Deret angka</strong> — Pola aritmatika, geometri, campuran</li>
</ul>

<h4>Contoh Soal:</h4>
<blockquote>
<p>Sebuah perusahaan memiliki pendapatan Rp2 miliar dan biaya operasional Rp1.4 miliar. Jika pajak 25% dari laba, berapakah laba bersih?<br>
A. Rp350 juta &nbsp; B. Rp400 juta &nbsp; C. Rp450 juta &nbsp; D. Rp500 juta &nbsp; E. Rp600 juta</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Laba kotor = 2M - 1.4M = 600 juta. Pajak = 25% × 600 juta = 150 juta. Laba bersih = 600 - 150 = 450 juta.</p>

<h3>1.3 Logika — 40 soal</h3>
<ul>
<li><strong>Penalaran analitis</strong> — Urutan, posisi, penjadwalan</li>
<li><strong>Silogisme</strong> — Penarikan kesimpulan dari premis</li>
<li><strong>Figural</strong> — Pola gambar, rotasi, cermin</li>
<li><strong>Deret</strong> — Pola angka dan huruf</li>
</ul>

<h2>BAB 2: Core Values AKHLAK</h2>
<p>AKHLAK adalah budaya kerja BUMN yang ditetapkan oleh Menteri BUMN. Soal AKHLAK berformat SJT (Situational Judgment Test).</p>

<h3>2.1 Enam Nilai AKHLAK</h3>

<h4>A — Amanah</h4>
<p><strong>Definisi:</strong> Memegang teguh kepercayaan yang diberikan.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Memenuhi janji dan komitmen</li>
<li>Bertanggung jawab atas tugas, keputusan, dan tindakan</li>
<li>Berpegang teguh pada nilai moral dan etika</li>
</ul>
<p><strong>Contoh Situasi:</strong> Atasan menitipkan proyek penting saat cuti. Jawaban AKHLAK: menyelesaikan dengan penuh tanggung jawab dan melaporkan hasilnya.</p>

<h4>K — Kompeten</h4>
<p><strong>Definisi:</strong> Terus belajar dan mengembangkan kapabilitas.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Meningkatkan kompetensi diri secara mandiri</li>
<li>Membantu orang lain belajar (sharing knowledge)</li>
<li>Menyelesaikan tugas dengan kualitas terbaik</li>
</ul>

<h4>H — Harmonis</h4>
<p><strong>Definisi:</strong> Saling peduli dan menghargai perbedaan.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Menghargai keberagaman</li>
<li>Suka menolong dan memberikan dampak positif</li>
<li>Membangun lingkungan kerja yang kondusif</li>
</ul>

<h4>L — Loyal</h4>
<p><strong>Definisi:</strong> Berdedikasi dan mengutamakan kepentingan organisasi.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Menjaga nama baik organisasi</li>
<li>Rela berkorban untuk kepentingan organisasi</li>
<li>Patuh pada peraturan yang berlaku</li>
</ul>

<h4>A — Adaptif</h4>
<p><strong>Definisi:</strong> Terus berinovasi dan antusias menghadapi perubahan.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Cepat menyesuaikan diri dengan perubahan</li>
<li>Terus-menerus melakukan perbaikan</li>
<li>Bertindak proaktif menghadapi tantangan</li>
</ul>

<h4>K — Kolaboratif</h4>
<p><strong>Definisi:</strong> Membangun kerjasama yang sinergis.</p>
<p><strong>Perilaku Utama:</strong></p>
<ul>
<li>Memberi kesempatan berbagai pihak untuk berkontribusi</li>
<li>Terbuka dalam bekerja sama</li>
<li>Menggerakkan pemanfaatan sumber daya bersama</li>
</ul>

<h4>Contoh Soal AKHLAK:</h4>
<blockquote>
<p>Tim Anda gagal memenuhi target kuartal. Sebagai team leader, Anda...<br>
A. Menyalahkan anggota tim yang kinerjanya buruk<br>
B. Menganalisis penyebab, menyusun action plan bersama tim, dan melaporkan ke atasan<br>
C. Menunggu evaluasi dari atasan<br>
D. Meminta penambahan anggota tim<br>
E. Mengerjakan sendiri agar target tercapai</p>
</blockquote>
<p><strong>Jawaban skor tertinggi: B.</strong> Menunjukkan nilai Amanah (bertanggung jawab), Kompeten (menganalisis), dan Kolaboratif (bersama tim).</p>

<h2>BAB 3: English Test</h2>
<p>English test rekrutmen BUMN mengikuti format mirip TOEFL ITP.</p>

<h3>3.1 Structure & Written Expression</h3>
<p>Menguji penguasaan grammar bahasa Inggris. Tipe soal:</p>
<ul>
<li><strong>Sentence completion</strong> — Melengkapi kalimat dengan grammar yang benar</li>
<li><strong>Error identification</strong> — Mengidentifikasi bagian kalimat yang salah secara grammar</li>
</ul>

<h4>Grammar yang sering diujikan:</h4>
<ul>
<li>Subject-verb agreement</li>
<li>Tenses (present perfect vs simple past)</li>
<li>Conditional sentences (if clauses)</li>
<li>Relative clauses (who, which, that)</li>
<li>Passive voice</li>
<li>Gerund vs Infinitive</li>
</ul>

<h4>Contoh Soal:</h4>
<blockquote>
<p>Neither the manager nor the employees ___ aware of the policy change.<br>
A. is &nbsp; B. are &nbsp; C. was &nbsp; D. has been &nbsp; E. have been</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Dengan "neither...nor", verb mengikuti subjek terdekat (employees = plural → are).</p>

<h3>3.2 Reading Comprehension</h3>
<p>Teks bacaan bertema bisnis, ekonomi, dan umum. Tipe pertanyaan: main idea, detail, inference, vocabulary in context.</p>

<h3>3.3 Vocabulary</h3>
<p>Kosakata dalam konteks kalimat. Fokus pada kata-kata yang sering muncul di lingkungan bisnis.</p>

<h2>BAB 4: Learning Agility</h2>
<p>Learning Agility mengukur kemampuan belajar dari pengalaman dan menerapkannya di situasi baru.</p>

<h3>5 Aspek Learning Agility:</h3>
<table>
<thead><tr><th>Aspek</th><th>Deskripsi</th><th>Contoh Perilaku</th></tr></thead>
<tbody>
<tr><td>Mental Agility</td><td>Berpikir kritis dan menangani kompleksitas</td><td>Melihat masalah dari berbagai sudut pandang</td></tr>
<tr><td>Change Agility</td><td>Keterbukaan terhadap perubahan</td><td>Mengusulkan cara baru yang lebih efisien</td></tr>
<tr><td>People Agility</td><td>Keterampilan interpersonal</td><td>Memahami motivasi dan kebutuhan orang lain</td></tr>
<tr><td>Results Agility</td><td>Berorientasi hasil dalam situasi baru</td><td>Tetap deliver hasil meski dalam situasi penuh tekanan</td></tr>
<tr><td>Self-Awareness</td><td>Mengenali kekuatan dan kelemahan</td><td>Menerima feedback dan menggunakannya untuk berkembang</td></tr>
</tbody>
</table>

<h2>BAB 5: Strategi Persiapan</h2>
<ol>
<li><strong>Pelajari profil BUMN target</strong> — Visi, misi, core business, annual report</li>
<li><strong>Latih TKD dengan konteks bisnis</strong> — Gunakan soal-soal yang berkaitan dengan ekonomi dan keuangan</li>
<li><strong>Hafalkan 6 nilai AKHLAK</strong> — Beserta definisi, perilaku utama, dan contoh penerapan</li>
<li><strong>Tingkatkan English</strong> — Fokus grammar dan reading, target setara TOEFL 450+</li>
<li><strong>Simulasi lengkap</strong> — Gunakan try out BUMN di Toutopia</li>
</ol>
    `,
  },

  // ============================================================
  // 4. Kedinasan
  // ============================================================
  {
    title: "Panduan Seleksi Sekolah Kedinasan: STAN, STIS, IPDN, STIN",
    slug: "panduan-seleksi-sekolah-kedinasan",
    description:
      "Panduan lengkap seleksi masuk sekolah kedinasan populer meliputi PKN STAN, STIS, IPDN, dan STIN. Termasuk struktur tes, sistem penalti, contoh soal, dan strategi per sekolah.",
    contentType: "HTML",
    category: "Kedinasan",
    tags: ["kedinasan", "stan", "stis", "ipdn", "stin", "tpa", "tbi"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-25"),
    pageCount: 55,
    htmlContent: `
<h2>Pendahuluan</h2>
<p>Sekolah Kedinasan adalah lembaga pendidikan tinggi di bawah kementerian/lembaga pemerintah. Keunggulan utama: biaya pendidikan gratis (ditanggung negara), mendapat uang saku bulanan, dan jaminan penempatan kerja sebagai ASN setelah lulus. Kompetisi masuk sangat ketat — tingkat penerimaan hanya 1-5% dari total pendaftar.</p>

<h2>BAB 1: PKN STAN (Politeknik Keuangan Negara STAN)</h2>

<h3>1.1 Profil</h3>
<p>Di bawah Kementerian Keuangan. Lulusan ditempatkan di unit kerja Kemenkeu: DJP (Direktorat Jenderal Pajak), DJBC (Bea Cukai), DJPB (Perbendaharaan), DJKN (Kekayaan Negara), BPK, dan lainnya.</p>

<h3>1.2 Tahap Seleksi</h3>
<ol>
<li><strong>SKD (CAT BKN)</strong> — TWK, TIU, TKP dengan passing grade standar CPNS</li>
<li><strong>TPA (Tes Potensi Akademik)</strong> — Soal khusus STAN</li>
<li><strong>TBI (Tes Bahasa Inggris)</strong> — Grammar dan reading</li>
</ol>

<h3>1.3 TPA STAN — Format dan Materi</h3>
<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>
<p>Materi TPA STAN:</p>
<ul>
<li><strong>Sinonim/Antonim</strong> — Kosakata formal dan akademis</li>
<li><strong>Analogi</strong> — Hubungan kata yang kompleks</li>
<li><strong>Deret Angka</strong> — Pola aritmatika, geometri, Fibonacci, bertingkat</li>
<li><strong>Geometri</strong> — Bangun datar, ruang, sudut, jaring-jaring</li>
<li><strong>Logika</strong> — Penalaran deduktif, silogisme</li>
</ul>

<h4>Contoh Soal TPA STAN — Deret:</h4>
<blockquote>
<p>2, 3, 5, 8, 13, 21, ...<br>
A. 29 &nbsp; B. 31 &nbsp; C. 34 &nbsp; D. 37 &nbsp; E. 42</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Pola Fibonacci: setiap angka = jumlah dua angka sebelumnya. 13 + 21 = 34.</p>

<h4>Contoh Soal TPA STAN — Geometri:</h4>
<blockquote>
<p>Sebuah balok memiliki panjang 8 cm, lebar 6 cm, dan tinggi 4 cm. Berapakah panjang diagonal ruang balok?<br>
A. √96 &nbsp; B. √100 &nbsp; C. √116 &nbsp; D. √120 &nbsp; E. √136</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Diagonal ruang = √(8²+6²+4²) = √(64+36+16) = √116.</p>

<h3>1.4 TBI STAN — Format dan Materi</h3>
<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>
<ul>
<li><strong>Grammar</strong> — Tenses, agreement, conditional, passive, relative clause</li>
<li><strong>Reading</strong> — Teks pendek, vocabulary in context, main idea, detail</li>
</ul>

<h4>Contoh Soal TBI STAN:</h4>
<blockquote>
<p>If I ___ the answer, I would have told you.<br>
A. know &nbsp; B. knew &nbsp; C. had known &nbsp; D. have known &nbsp; E. would know</p>
</blockquote>
<p><strong>Jawaban: C.</strong> Conditional type 3: If + past perfect, would have + past participle.</p>

<h3>1.5 Strategi STAN (ada penalti)</h3>
<ol>
<li><strong>Jangan asal jawab!</strong> Karena salah -1, jawab hanya jika yakin atau bisa eliminasi minimal 2 opsi</li>
<li>Jika bisa eliminasi 2 dari 5 opsi, probabilitas benar = 1/3. Expected value = (1/3)(+4) + (2/3)(-1) = +0.67 → JAWAB</li>
<li>Jika hanya bisa eliminasi 1 opsi, expected value = (1/4)(+4) + (3/4)(-1) = +0.25 → masih layak dijawab</li>
<li>Jika sama sekali tidak tahu (tebak murni): expected value = (1/5)(+4) + (4/5)(-1) = 0 → KOSONGKAN</li>
</ol>

<h2>BAB 2: STIS (Sekolah Tinggi Ilmu Statistik)</h2>

<h3>2.1 Profil</h3>
<p>Di bawah BPS (Badan Pusat Statistik). Program studi: Statistika, Komputasi Statistik. Lulusan ditempatkan di kantor BPS seluruh Indonesia.</p>

<h3>2.2 Tahap Seleksi</h3>
<ol>
<li><strong>SKD (CAT BKN)</strong></li>
<li><strong>Matematika</strong> — Lebih sulit dari TPA STAN</li>
<li><strong>Bahasa Inggris</strong></li>
</ol>

<h3>2.3 Matematika STIS</h3>
<p><strong>Sistem penilaian: Benar +4, Salah -1, Kosong 0</strong></p>
<p>Materi:</p>
<ul>
<li><strong>Aljabar</strong> — Persamaan, pertidaksamaan, fungsi, logaritma</li>
<li><strong>Statistika</strong> — Mean, median, modus, simpangan, distribusi frekuensi</li>
<li><strong>Peluang</strong> — Peluang kejadian, permutasi, kombinasi, distribusi binomial</li>
<li><strong>Kalkulus Dasar</strong> — Limit, turunan, integral sederhana</li>
<li><strong>Program Linear</strong> — Fungsi objektif, kendala, daerah feasible, solusi optimal</li>
</ul>

<h4>Contoh Soal Matematika STIS — Peluang:</h4>
<blockquote>
<p>Dari 10 kartu bernomor 1-10, diambil 2 kartu sekaligus. Peluang keduanya bernomor genap adalah...<br>
A. 1/9 &nbsp; B. 2/9 &nbsp; C. 1/3 &nbsp; D. 4/9 &nbsp; E. 5/9</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Kartu genap: 2,4,6,8,10 (5 buah). C(5,2)/C(10,2) = 10/45 = 2/9.</p>

<h4>Contoh Soal Matematika STIS — Kalkulus:</h4>
<blockquote>
<p>Jika f(x) = 3x² - 4x + 1, maka f'(2) = ...<br>
A. 6 &nbsp; B. 8 &nbsp; C. 10 &nbsp; D. 12 &nbsp; E. 14</p>
</blockquote>
<p><strong>Jawaban: B.</strong> f'(x) = 6x - 4. f'(2) = 12 - 4 = 8.</p>

<h2>BAB 3: IPDN (Institut Pemerintahan Dalam Negeri)</h2>

<h3>3.1 Profil</h3>
<p>Di bawah Kemendagri. Pendidikan semi-militer. Lulusan menjadi Pamong Praja dan ditempatkan di pemerintah daerah seluruh Indonesia.</p>

<h3>3.2 Tahap Seleksi</h3>
<ol>
<li><strong>SKD (CAT BKN)</strong> — PG TWK: 75 (lebih tinggi dari umum!), TIU: 80, TKP: 166</li>
<li><strong>Tes Kesamaptaan</strong> (fisik)</li>
<li><strong>Tes Kesehatan</strong></li>
<li><strong>Tes Psikologi</strong></li>
<li><strong>Wawancara</strong></li>
</ol>

<h3>3.3 Tes Kesamaptaan IPDN</h3>
<table>
<thead><tr><th>Tes</th><th>Standar Pria</th><th>Standar Wanita</th></tr></thead>
<tbody>
<tr><td>Lari 12 menit</td><td>Min 2400 meter</td><td>Min 1800 meter</td></tr>
<tr><td>Pull-up</td><td>Min 8 kali</td><td>Min 15 detik (hang)</td></tr>
<tr><td>Push-up (1 menit)</td><td>Min 30 kali</td><td>Min 20 kali</td></tr>
<tr><td>Sit-up (1 menit)</td><td>Min 30 kali</td><td>Min 25 kali</td></tr>
<tr><td>Shuttle run</td><td>Max 18 detik</td><td>Max 20 detik</td></tr>
</tbody>
</table>

<h3>3.4 Persiapan Fisik IPDN</h3>
<ol>
<li>Mulai latihan fisik minimal 3 bulan sebelum seleksi</li>
<li>Latihan lari: mulai dari 1 km, tambah 500m setiap minggu hingga bisa 3+ km</li>
<li>Pull-up: mulai dengan negative pull-up, progress ke assisted, lalu full pull-up</li>
<li>Latihan rutin 5 hari/minggu dengan 2 hari recovery</li>
</ol>

<h2>BAB 4: STIN (Sekolah Tinggi Intelijen Negara)</h2>

<h3>4.1 Profil</h3>
<p>Di bawah BIN (Badan Intelijen Negara). Paling selektif di antara semua sekolah kedinasan. Lulusan berkarir di bidang intelijen negara.</p>

<h3>4.2 Tahap Seleksi</h3>
<ol>
<li>SKD (CAT BKN)</li>
<li>Tes Akademik</li>
<li>Tes Kesehatan (sangat ketat)</li>
<li>Tes Kesamaptaan/Fisik (sangat ketat)</li>
<li>Tes Psikologi (mendalam)</li>
<li>Tes Wawancara</li>
<li>Tes Penelusuran Rekam Jejak</li>
</ol>

<h3>4.3 Keunikan STIN</h3>
<ul>
<li>Seleksi paling panjang (bisa 6+ bulan dari pendaftaran hingga pengumuman)</li>
<li>Tes fisik meliputi renang, lari, dan tes ketahanan</li>
<li>Psikologi sangat mendalam — termasuk lie detector</li>
<li>Penelusuran rekam jejak hingga keluarga</li>
</ul>

<h2>BAB 5: Tabel Perbandingan Lengkap</h2>
<table>
<thead><tr><th>Aspek</th><th>PKN STAN</th><th>STIS</th><th>IPDN</th><th>STIN</th></tr></thead>
<tbody>
<tr><td>Kementerian</td><td>Kemenkeu</td><td>BPS</td><td>Kemendagri</td><td>BIN</td></tr>
<tr><td>Tes Khusus</td><td>TPA + TBI</td><td>Mat + Eng</td><td>Kesamaptaan</td><td>Fisik + Psikologi</td></tr>
<tr><td>Penalti</td><td>Ya (+4/-1)</td><td>Ya (+4/-1)</td><td>Tidak</td><td>Tidak</td></tr>
<tr><td>Tes Fisik</td><td>Tidak</td><td>Tidak</td><td>Ya (ketat)</td><td>Ya (sangat ketat)</td></tr>
<tr><td>PG TWK</td><td>65</td><td>65</td><td>75</td><td>65</td></tr>
<tr><td>Semi-Militer</td><td>Tidak</td><td>Tidak</td><td>Ya</td><td>Ya</td></tr>
<tr><td>Ikatan Dinas</td><td>2× masa studi</td><td>2× masa studi</td><td>10 tahun</td><td>10 tahun</td></tr>
<tr><td>Tingkat Seleksi</td><td>Ketat</td><td>Ketat</td><td>Sangat ketat</td><td>Paling ketat</td></tr>
</tbody>
</table>

<h2>BAB 6: Strategi per Sekolah</h2>
<h3>STAN:</h3>
<p>Fokus utama TPA dan TBI. Latih deret angka dan grammar intensif. Pahami sistem penalti — jangan tebak murni.</p>
<h3>STIS:</h3>
<p>Kuasai kalkulus dasar dan statistika. Latih soal program linear. Kemampuan matematika harus kuat.</p>
<h3>IPDN:</h3>
<p>Selain SKD, persiapan fisik sangat penting. TWK passing grade lebih tinggi (75) — perbanyak hafalan.</p>
<h3>STIN:</h3>
<p>Persiapan menyeluruh: akademik + fisik + mental. Pastikan rekam jejak bersih. Paling membutuhkan persiapan komprehensif.</p>
    `,
  },

  // ============================================================
  // 5. PPPK
  // ============================================================
  {
    title: "Materi Seleksi PPPK: Guru, Teknis, & Nakes",
    slug: "materi-seleksi-pppk-guru-teknis-nakes",
    description:
      "Materi lengkap seleksi PPPK mencakup kompetensi teknis (guru, teknis, nakes), manajerial, sosiokultural, dan wawancara. Dilengkapi contoh soal dan strategi per formasi.",
    contentType: "HTML",
    category: "PPPK",
    tags: ["pppk", "guru", "teknis", "nakes", "manajerial", "sosiokultural"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-01"),
    pageCount: 65,
    htmlContent: `
<h2>Pendahuluan</h2>
<p>Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) adalah ASN berdasarkan UU No. 20/2023. Seleksi PPPK memiliki format unik yang berbeda dari CPNS: tidak ada TWK/TIU/TKP, melainkan fokus pada kompetensi teknis sesuai jabatan. Ebook ini menyajikan materi lengkap untuk semua formasi PPPK.</p>

<h2>BAB 1: Struktur Seleksi PPPK</h2>
<table>
<thead><tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Passing Grade</th><th>Bobot</th></tr></thead>
<tbody>
<tr><td>Kompetensi Teknis</td><td>90 soal</td><td>90 menit</td><td>Sesuai formasi</td><td>Terbesar</td></tr>
<tr><td>Kompetensi Manajerial</td><td>25 soal</td><td>25 menit</td><td>130</td><td>Sedang</td></tr>
<tr><td>Kompetensi Sosiokultural</td><td>20 soal</td><td>15 menit</td><td>104</td><td>Sedang</td></tr>
<tr><td>Wawancara</td><td>10 soal</td><td>10 menit</td><td>24</td><td>Kecil</td></tr>
</tbody>
</table>
<p><strong>Penting:</strong> Seleksi PPPK menggunakan sistem <strong>peringkat</strong>, bukan sekadar passing grade. Anda bersaing dengan peserta lain yang melamar formasi yang sama.</p>

<h2>BAB 2: Kompetensi Teknis PPPK Guru</h2>
<p>Kompetensi teknis guru terdiri dari 3 area utama dengan bobot terbesar dalam seleksi.</p>

<h3>2.1 Kompetensi Pedagogik</h3>
<p>Mengukur kemampuan mengelola pembelajaran.</p>

<h4>Teori Belajar:</h4>
<ul>
<li><strong>Konstruktivisme</strong> (Piaget, Vygotsky) — Siswa membangun pengetahuan sendiri melalui pengalaman. Zone of Proximal Development (ZPD) Vygotsky: area antara kemampuan mandiri dan kemampuan dengan bantuan.</li>
<li><strong>Behaviorisme</strong> (Skinner, Pavlov) — Belajar melalui stimulus-respons. Reinforcement positif/negatif.</li>
<li><strong>Kognitivisme</strong> (Bruner, Ausubel) — Belajar melalui proses berpikir. Discovery learning, meaningful learning.</li>
<li><strong>Humanisme</strong> (Maslow, Rogers) — Belajar yang mempertimbangkan kebutuhan dan emosi siswa. Hierarchy of needs.</li>
</ul>

<h4>Kurikulum Merdeka:</h4>
<ul>
<li><strong>Profil Pelajar Pancasila</strong> — 6 dimensi: Beriman/Bertakwa, Berkebinekaan Global, Gotong Royong, Mandiri, Bernalar Kritis, Kreatif</li>
<li><strong>Proyek Penguatan Profil Pelajar Pancasila (P5)</strong> — Pembelajaran berbasis proyek lintas mata pelajaran</li>
<li><strong>Capaian Pembelajaran (CP)</strong> — Menggantikan KI/KD, berbasis fase (bukan kelas)</li>
<li><strong>Asesmen Diagnostik</strong> — Mengetahui kemampuan awal siswa</li>
<li><strong>Asesmen Formatif</strong> — Memantau proses belajar</li>
<li><strong>Asesmen Sumatif</strong> — Mengevaluasi pencapaian di akhir</li>
</ul>

<h4>Diferensiasi Pembelajaran:</h4>
<ul>
<li><strong>Diferensiasi Konten</strong> — Menyesuaikan materi sesuai level siswa</li>
<li><strong>Diferensiasi Proses</strong> — Menyesuaikan cara belajar (visual, auditori, kinestetik)</li>
<li><strong>Diferensiasi Produk</strong> — Menyesuaikan bentuk tugas/output</li>
</ul>

<h4>Contoh Soal Pedagogik:</h4>
<blockquote>
<p>Seorang guru menemukan bahwa siswa di kelasnya memiliki kemampuan membaca yang beragam. Beberapa siswa sudah lancar membaca teks kompleks, sementara yang lain masih kesulitan memahami teks sederhana. Pendekatan yang paling tepat adalah...<br>
A. Menggunakan satu teks yang sama untuk semua siswa<br>
B. Menyediakan teks dengan tingkat kesulitan berbeda sesuai kemampuan masing-masing siswa<br>
C. Memfokuskan pembelajaran pada siswa yang tertinggal saja<br>
D. Memberikan tugas tambahan hanya untuk siswa yang sudah lancar<br>
E. Meminta siswa yang pandai mengajari temannya tanpa bimbingan guru</p>
</blockquote>
<p><strong>Jawaban: B.</strong> Ini adalah diferensiasi konten — menyesuaikan materi sesuai level kemampuan siswa (teaching at the right level).</p>

<h3>2.2 Kompetensi Profesional</h3>
<p>Menguji penguasaan materi mata pelajaran yang diampu. Soal spesifik per bidang studi:</p>
<ul>
<li><strong>Guru Matematika</strong> — Aljabar, geometri, statistika, kalkulus tingkat SMA</li>
<li><strong>Guru Bahasa Indonesia</strong> — Linguistik, sastra, tata bahasa, EYD/PUEBI</li>
<li><strong>Guru IPA</strong> — Fisika, kimia, biologi sesuai jenjang</li>
<li><strong>Guru Bahasa Inggris</strong> — Grammar, literature, language teaching methodology</li>
</ul>

<h3>2.3 Pedagogical Content Knowledge (PCK)</h3>
<p>PCK menguji kemampuan mengajarkan materi secara efektif:</p>
<ul>
<li>Mengidentifikasi miskonsepsi siswa yang umum terjadi</li>
<li>Merancang aktivitas pembelajaran yang tepat untuk materi tertentu</li>
<li>Memilih representasi/analogi yang efektif untuk menjelaskan konsep abstrak</li>
<li>Merancang asesmen yang mengukur pemahaman konseptual, bukan hafalan</li>
</ul>

<h2>BAB 3: Kompetensi Teknis PPPK Teknis</h2>
<p>Soal disesuaikan dengan jabatan yang dilamar.</p>

<h3>3.1 Administrasi</h3>
<ul>
<li>Tata naskah dinas (Permenpan RB tentang pedoman umum tata naskah dinas)</li>
<li>Kearsipan (UU No. 43/2009 tentang Kearsipan)</li>
<li>Prosedur administrasi pemerintahan</li>
<li>Manajemen perkantoran modern</li>
</ul>

<h3>3.2 Keuangan</h3>
<ul>
<li>Akuntansi pemerintahan (SAP berbasis akrual)</li>
<li>APBN/APBD (UU tentang Keuangan Negara)</li>
<li>Pengelolaan BMN (Barang Milik Negara)</li>
<li>Pengadaan barang/jasa (Perpres No. 12/2021)</li>
</ul>

<h3>3.3 Pranata Komputer/IT</h3>
<ul>
<li>Jaringan komputer (TCP/IP, LAN/WAN, subnetting)</li>
<li>Keamanan informasi (ISO 27001, enkripsi, firewall)</li>
<li>Basis data (SQL, normalisasi, ERD)</li>
<li>Pengembangan aplikasi (SDLC, metodologi agile)</li>
</ul>

<h2>BAB 4: Kompetensi Teknis PPPK Nakes</h2>
<p>Soal menggunakan format <strong>vignette klinis</strong> — skenario kasus yang harus dianalisis.</p>

<h3>Format Vignette:</h3>
<blockquote>
<p>Seorang pasien perempuan, usia 45 tahun, datang ke puskesmas dengan keluhan nyeri dada sebelah kiri yang menjalar ke lengan kiri sejak 2 jam yang lalu. TD: 160/100 mmHg, Nadi: 100x/menit, RR: 24x/menit. Tindakan awal yang paling tepat dilakukan adalah...</p>
</blockquote>
<p>Soal berbeda untuk setiap profesi: dokter, perawat, bidan, apoteker, gizi, kesehatan masyarakat, dll.</p>

<h2>BAB 5: Kompetensi Manajerial — 25 soal, 25 menit</h2>
<p>Passing grade: <strong>130</strong>. Format SJT dengan skor 1-4 per jawaban.</p>

<h3>8 Dimensi Manajerial:</h3>

<h4>1. Integritas</h4>
<p>Konsistensi antara ucapan dan tindakan, kejujuran, ketaatan pada aturan.</p>
<p><strong>Skor 4:</strong> Proaktif menegakkan integritas meskipun ada tekanan. Menolak permintaan yang melanggar aturan dengan sopan tapi tegas.</p>
<p><strong>Skor 1:</strong> Mengikuti tekanan untuk melanggar aturan demi kemudahan.</p>

<h4>2. Kerjasama</h4>
<p>Kolaborasi aktif, kontribusi dalam tim, membantu rekan.</p>
<p><strong>Skor 4:</strong> Menginisiasi kolaborasi lintas unit untuk menyelesaikan masalah bersama.</p>
<p><strong>Skor 1:</strong> Hanya fokus pada tugas sendiri tanpa peduli tim.</p>

<h4>3. Komunikasi</h4>
<p>Penyampaian informasi yang jelas, mendengarkan aktif, mediasi.</p>
<p><strong>Skor 4:</strong> Mengkomunikasikan informasi penting secara proaktif dan menjadi mediator ketika terjadi miscommunication.</p>

<h4>4. Orientasi pada Hasil</h4>
<p>Fokus pada pencapaian target dengan kualitas terbaik.</p>
<p><strong>Skor 4:</strong> Menetapkan target yang menantang, membuat rencana aksi detail, dan konsisten mengevaluasi progress.</p>

<h4>5. Pelayanan Publik</h4>
<p>Sikap melayani, responsif, inovatif dalam pelayanan.</p>
<p><strong>Skor 4:</strong> Mengidentifikasi kebutuhan masyarakat secara proaktif dan mengusulkan perbaikan sistem pelayanan.</p>

<h4>6. Pengembangan Diri dan Orang Lain</h4>
<p>Pembelajaran berkelanjutan dan mentoring.</p>
<p><strong>Skor 4:</strong> Aktif belajar mandiri, berbagi pengetahuan, dan membimbing rekan/bawahan.</p>

<h4>7. Mengelola Perubahan</h4>
<p>Adaptasi dan inisiasi perubahan positif.</p>
<p><strong>Skor 4:</strong> Menjadi agen perubahan, meyakinkan pihak lain tentang pentingnya perubahan.</p>

<h4>8. Pengambilan Keputusan</h4>
<p>Keputusan berdasarkan data, analisis, dan pertimbangan dampak.</p>
<p><strong>Skor 4:</strong> Mengambil keputusan berdasarkan data dan analisis, mempertimbangkan dampak jangka panjang.</p>

<h4>Contoh Soal Manajerial:</h4>
<blockquote>
<p>Anda baru saja dimutasi ke unit kerja baru yang memiliki budaya kerja sangat berbeda dari unit sebelumnya. Beberapa rekan terlihat tidak ramah. Yang Anda lakukan...<br>
A. Meminta mutasi kembali ke unit sebelumnya<br>
B. Bekerja sendiri tanpa banyak berinteraksi<br>
C. Beradaptasi secara bertahap, menunjukkan kinerja baik, dan berinisiatif mengenal rekan satu per satu<br>
D. Melapor ke atasan tentang sikap rekan yang tidak ramah</p>
</blockquote>
<p><strong>Skor 4: C.</strong> Menunjukkan adaptabilitas, inisiatif, dan kerjasama.</p>

<h2>BAB 6: Kompetensi Sosiokultural — 20 soal, 15 menit</h2>
<p>Passing grade: <strong>104</strong>. Format SJT dengan skor 1-4.</p>

<h3>4 Dimensi Sosiokultural:</h3>

<h4>1. Perekat Bangsa</h4>
<p>Menjaga persatuan dalam keberagaman, toleransi aktif.</p>

<h4>2. Nasionalisme</h4>
<p>Cinta tanah air, mengutamakan kepentingan bangsa.</p>

<h4>3. Etika Publik</h4>
<p>Norma dan standar perilaku di ruang publik, akuntabilitas.</p>

<h4>4. Pilar Negara</h4>
<p>Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika.</p>

<h4>Contoh Soal Sosiokultural:</h4>
<blockquote>
<p>Di kantor Anda, terjadi ketegangan antara dua kelompok pegawai dari latar belakang budaya berbeda terkait pelaksanaan kegiatan keagamaan di kantor. Sebagai pegawai, Anda...<br>
A. Membiarkan karena bukan urusan Anda<br>
B. Memihak kelompok yang lebih besar<br>
C. Mengusulkan dialog terbuka untuk mencari solusi yang menghargai semua pihak<br>
D. Melarang semua kegiatan keagamaan di kantor</p>
</blockquote>
<p><strong>Skor 4: C.</strong> Menunjukkan sikap perekat bangsa dan toleransi aktif.</p>

<h2>BAB 7: Wawancara — 10 soal, 10 menit</h2>
<p>Passing grade: <strong>24</strong>. Dilaksanakan dengan CAT (pilihan ganda), bukan tatap muka.</p>

<h3>Aspek yang Diuji:</h3>
<ul>
<li><strong>Motivasi</strong> — Alasan menjadi ASN, komitmen terhadap pelayanan publik</li>
<li><strong>Komitmen</strong> — Kesediaan ditempatkan sesuai formasi, dedikasi jangka panjang</li>
<li><strong>Pengalaman</strong> — Relevansi pengalaman kerja dengan jabatan yang dilamar</li>
<li><strong>Rencana Kontribusi</strong> — Apa yang akan dilakukan untuk instansi</li>
</ul>

<h2>BAB 8: Strategi Persiapan per Formasi</h2>

<h3>PPPK Guru:</h3>
<ol>
<li>Fokus 70% waktu belajar untuk kompetensi teknis (pedagogik + profesional)</li>
<li>Kuasai Kurikulum Merdeka — ini topik terbaru yang pasti keluar</li>
<li>Latih soal PCK: bagaimana mengajarkan konsep X kepada siswa yang salah paham</li>
<li>Manajerial + sosiokultural: pahami pola jawaban skor 4</li>
</ol>

<h3>PPPK Teknis:</h3>
<ol>
<li>Pelajari standar kompetensi jabatan yang dilamar</li>
<li>Kuasai regulasi terkait (UU, PP, Permen yang relevan)</li>
<li>Latih soal-soal teknis sesuai bidang</li>
</ol>

<h3>PPPK Nakes:</h3>
<ol>
<li>Kuasai standar kompetensi profesi</li>
<li>Latih soal vignette klinis sebanyak mungkin</li>
<li>Update protokol terbaru sesuai profesi</li>
</ol>

<h2>Sumber Belajar</h2>
<ul>
<li>Portal SSCASN: sscasn.bkn.go.id</li>
<li>UU ASN No. 20/2023</li>
<li>Modul Kurikulum Merdeka: guru.kemdikbud.go.id</li>
<li>Try out PPPK di platform Toutopia</li>
</ul>
    `,
  },
];

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  });

  if (!admin) {
    console.log("No admin user found. Run main seed first.");
    return;
  }

  console.log(`Using author: ${admin.name ?? admin.email}`);

  for (const ebook of EBOOKS) {
    await prisma.ebook.upsert({
      where: { slug: ebook.slug },
      update: {
        title: ebook.title,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt,
        pageCount: ebook.pageCount,
        authorId: admin.id,
      },
      create: {
        title: ebook.title,
        slug: ebook.slug,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt,
        pageCount: ebook.pageCount,
        authorId: admin.id,
      },
    });
    console.log(`  ✓ ${ebook.title}`);
  }

  console.log(`\nSeeded ${EBOOKS.length} ebooks`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
