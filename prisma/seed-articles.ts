import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  });

  if (!admin) {
    console.log("No admin user found. Run main seed first.");
    return;
  }

  const now = new Date();

  const articles = [
    {
      title: "Panduan Lengkap UTBK-SNBT 2025: Struktur, Tips, dan Strategi",
      slug: "panduan-lengkap-utbk-snbt-struktur-tips-strategi",
      category: "Strategi",
      tags: ["utbk", "snbt", "tips", "strategi"],
      status: "PUBLISHED" as const,
      publishedAt: now,
      excerpt:
        "Panduan komprehensif UTBK-SNBT 2025 meliputi struktur tes, sistem scoring IRT, tips per subtes, strategi manajemen waktu, dan sumber belajar resmi untuk memaksimalkan skor kamu.",
      content: `<h2>Apa Itu UTBK-SNBT?</h2>
<p>Ujian Tulis Berbasis Komputer - Seleksi Nasional Berdasarkan Tes (UTBK-SNBT) adalah jalur seleksi masuk perguruan tinggi negeri (PTN) yang diselenggarakan oleh Badan Pengelola Pendanaan Pendidikan (BPPP) Kemendikbudristek. UTBK-SNBT menjadi jalur utama bagi calon mahasiswa yang ingin diterima di PTN berdasarkan kemampuan akademik yang diukur melalui tes terstandar.</p>
<p>Berbeda dengan jalur SNBP (Seleksi Nasional Berdasarkan Prestasi) yang menggunakan nilai rapor, UTBK-SNBT murni mengukur kemampuan berpikir dan bernalar peserta. Hal ini memberikan kesempatan yang lebih adil bagi seluruh peserta dari berbagai latar belakang pendidikan.</p>
<p>Tujuan utama UTBK-SNBT adalah mengukur potensi kognitif dan kemampuan akademik calon mahasiswa secara objektif. Tes ini dirancang bukan untuk mengukur hafalan materi pelajaran, melainkan kemampuan berpikir kritis, penalaran logis, dan pemahaman konseptual yang menjadi prediktor keberhasilan di perguruan tinggi.</p>

<h2>Struktur Tes UTBK-SNBT 2025</h2>
<p>UTBK-SNBT terdiri dari tiga kelompok tes utama yang mengukur aspek kemampuan berbeda. Berikut rincian lengkapnya:</p>

<h3>1. Tes Potensi Skolastik (TPS)</h3>
<p>TPS mengukur kemampuan kognitif dasar yang dianggap penting untuk keberhasilan di perguruan tinggi. TPS terdiri dari empat subtes:</p>
<table>
<thead>
<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>
</thead>
<tbody>
<tr><td>Penalaran Umum</td><td>20 soal</td><td>25 menit</td><td>Kemampuan berpikir logis, induktif, dan deduktif</td></tr>
<tr><td>Pengetahuan dan Pemahaman Umum (PPU)</td><td>20 soal</td><td>25 menit</td><td>Pemahaman bacaan, kosakata, dan pengetahuan umum</td></tr>
<tr><td>Pemahaman Bacaan dan Menulis (PBM)</td><td>20 soal</td><td>25 menit</td><td>Analisis teks, koherensi, dan kaidah kebahasaan</td></tr>
<tr><td>Pengetahuan Kuantitatif (PK)</td><td>15 soal</td><td>20 menit</td><td>Penalaran kuantitatif dasar dan interpretasi data</td></tr>
</tbody>
</table>

<h3>2. Tes Literasi</h3>
<p>Tes Literasi mengukur kemampuan memahami, menggunakan, dan merespons teks tertulis dalam bahasa Indonesia dan bahasa Inggris.</p>
<table>
<thead>
<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>
</thead>
<tbody>
<tr><td>Literasi Bahasa Indonesia</td><td>30 soal</td><td>35 menit</td><td>Pemahaman teks, analisis argumen, dan evaluasi informasi dalam bahasa Indonesia</td></tr>
<tr><td>Literasi Bahasa Inggris</td><td>20 soal</td><td>25 menit</td><td>Reading comprehension, vocabulary in context, dan analisis teks bahasa Inggris</td></tr>
</tbody>
</table>

<h3>3. Penalaran Matematika</h3>
<table>
<thead>
<tr><th>Subtes</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus Pengukuran</th></tr>
</thead>
<tbody>
<tr><td>Penalaran Matematika</td><td>20 soal</td><td>30 menit</td><td>Kemampuan berpikir matematis, pemecahan masalah, dan interpretasi data kuantitatif</td></tr>
</tbody>
</table>

<h3>Ringkasan Keseluruhan</h3>
<table>
<thead>
<tr><th>Komponen</th><th>Total Soal</th><th>Total Waktu</th></tr>
</thead>
<tbody>
<tr><td>TPS (4 subtes)</td><td>75 soal</td><td>95 menit</td></tr>
<tr><td>Literasi (2 subtes)</td><td>50 soal</td><td>60 menit</td></tr>
<tr><td>Penalaran Matematika</td><td>20 soal</td><td>30 menit</td></tr>
<tr><td><strong>Total</strong></td><td><strong>145 soal</strong></td><td><strong>~195 menit</strong></td></tr>
</tbody>
</table>

<h2>Sistem Scoring: Item Response Theory (IRT)</h2>
<p>UTBK-SNBT menggunakan sistem penilaian Item Response Theory (IRT), bukan sistem penilaian konvensional. Ini berarti skor kamu tidak hanya bergantung pada jumlah jawaban benar, tetapi juga pada tingkat kesulitan soal yang berhasil kamu jawab.</p>
<p>Beberapa hal penting tentang IRT:</p>
<ul>
<li><strong>Tidak ada pengurangan skor untuk jawaban salah.</strong> Jawablah semua soal meskipun kamu tidak yakin, karena tidak ada penalti.</li>
<li><strong>Soal sulit yang dijawab benar memberikan skor lebih tinggi</strong> dibandingkan soal mudah yang dijawab benar.</li>
<li><strong>Konsistensi jawaban diukur.</strong> Jika kamu menjawab soal sulit dengan benar tetapi gagal di soal mudah, sistem akan mendeteksi inkonsistensi ini.</li>
<li><strong>Skor bersifat relatif terhadap kelompok peserta.</strong> Skor akhir mencerminkan posisi kemampuanmu dibandingkan peserta lain.</li>
<li><strong>Rentang skor tiap subtes biasanya antara 200-800</strong>, dengan rata-rata sekitar 500.</li>
</ul>
<p>Implikasi praktis IRT: fokuslah menjawab soal-soal yang kamu yakin terlebih dahulu, lalu kembali ke soal yang lebih sulit. Pastikan kamu menjawab soal mudah dengan benar karena kesalahan di soal mudah sangat merugikan dalam sistem IRT.</p>

<h2>Tips Per Subtes</h2>

<h3>Penalaran Umum</h3>
<ul>
<li>Latih kemampuan mengenali pola dalam deret angka, huruf, dan gambar.</li>
<li>Pelajari silogisme dan logika formal dasar (premis mayor, premis minor, kesimpulan).</li>
<li>Biasakan membaca argumen dan mengidentifikasi asumsi tersembunyi.</li>
<li>Gunakan teknik eliminasi untuk mempersempit pilihan jawaban.</li>
<li>Jangan terpaku pada satu soal lebih dari 90 detik; tandai dan lanjutkan.</li>
</ul>

<h3>Pengetahuan dan Pemahaman Umum (PPU)</h3>
<ul>
<li>Perbanyak membaca artikel ilmiah populer, editorial, dan esai akademik.</li>
<li>Latih kemampuan menentukan ide pokok, gagasan pendukung, dan kesimpulan teks.</li>
<li>Perkaya kosakata dengan membaca dari berbagai genre dan disiplin ilmu.</li>
<li>Perhatikan konteks kalimat untuk memahami makna kata yang belum kamu kenal.</li>
</ul>

<h3>Pemahaman Bacaan dan Menulis (PBM)</h3>
<ul>
<li>Pahami struktur paragraf yang baik: kalimat utama, penjelas, dan kesimpulan.</li>
<li>Latih kemampuan mendeteksi kesalahan ejaan, tanda baca, dan tata bahasa.</li>
<li>Pelajari konjungsi dan kata penghubung untuk memahami koherensi antar paragraf.</li>
<li>Biasakan menulis ringkasan dari teks yang kamu baca untuk melatih pemahaman.</li>
</ul>

<h3>Pengetahuan Kuantitatif (PK)</h3>
<ul>
<li>Kuasai konsep dasar: pecahan, persentase, rasio, dan proporsi.</li>
<li>Latih interpretasi tabel, grafik, dan diagram secara cepat.</li>
<li>Pelajari konsep dasar statistik: mean, median, modus, dan standar deviasi.</li>
<li>Biasakan menghitung tanpa kalkulator untuk meningkatkan kecepatan.</li>
</ul>

<h3>Literasi Bahasa Indonesia</h3>
<ul>
<li>Baca bacaan panjang dengan teknik skimming dan scanning untuk efisiensi waktu.</li>
<li>Identifikasi jenis pertanyaan: tersurat (eksplisit) atau tersirat (implisit).</li>
<li>Perhatikan kata kunci dalam pertanyaan yang mengarahkan ke jawaban.</li>
<li>Latih kemampuan membedakan fakta dan opini dalam teks.</li>
</ul>

<h3>Literasi Bahasa Inggris</h3>
<ul>
<li>Perbanyak membaca teks akademik dalam bahasa Inggris secara rutin.</li>
<li>Tingkatkan vocabulary dengan metode kontekstual, bukan sekadar menghafal daftar kata.</li>
<li>Pelajari common English idioms dan phrasal verbs yang sering muncul.</li>
<li>Latih kemampuan inference: menyimpulkan informasi yang tidak disebutkan secara eksplisit.</li>
</ul>

<h3>Penalaran Matematika</h3>
<ul>
<li>Kuasai aljabar dasar, geometri, dan aritmetika dengan baik.</li>
<li>Fokus pada pemahaman konsep, bukan menghafal rumus.</li>
<li>Latih soal cerita matematika yang membutuhkan pemodelan masalah.</li>
<li>Biasakan mengecek jawaban dengan substitusi atau estimasi cepat.</li>
<li>Pelajari cara membaca dan menginterpretasi data statistik dalam bentuk visual.</li>
</ul>

<h2>Strategi Manajemen Waktu</h2>
<p>Dengan total 145 soal dalam ~195 menit, rata-rata kamu memiliki sekitar 1 menit 20 detik per soal. Namun distribusi waktu sebaiknya tidak merata:</p>
<ol>
<li><strong>Pertama, kerjakan soal yang kamu kuasai.</strong> Jangan kerjakan soal secara berurutan. Baca sekilas semua soal, kerjakan yang mudah dulu.</li>
<li><strong>Tandai soal yang ragu.</strong> Gunakan fitur flag/mark pada aplikasi CAT untuk soal yang ingin kamu kembali ke sana nanti.</li>
<li><strong>Alokasikan waktu review.</strong> Sisakan 5-10 menit di akhir setiap sesi untuk mengecek jawaban yang sudah kamu tandai.</li>
<li><strong>Jangan biarkan soal kosong.</strong> Karena tidak ada penalti, isi semua jawaban meskipun hanya tebakan terpelajar (educated guess).</li>
<li><strong>Gunakan timer pribadi.</strong> Latihan di rumah dengan timer untuk setiap subtes agar terbiasa dengan tekanan waktu.</li>
</ol>

<h2>Persiapan Mental dan Fisik</h2>
<p>Keberhasilan di UTBK-SNBT tidak hanya tentang kemampuan akademik. Persiapan mental dan fisik juga sangat penting:</p>
<ul>
<li>Mulai persiapan setidaknya 3-6 bulan sebelum tes.</li>
<li>Buat jadwal belajar yang konsisten dan realistis, misalnya 2-3 jam per hari.</li>
<li>Lakukan simulasi tes secara berkala untuk mengukur kemajuan.</li>
<li>Jaga pola tidur yang teratur, terutama seminggu sebelum tes.</li>
<li>Makan makanan bergizi dan tetap aktif secara fisik untuk menjaga konsentrasi.</li>
<li>Kelola stres dengan teknik relaksasi seperti deep breathing atau meditasi ringan.</li>
</ul>

<h2>Sumber Belajar Resmi</h2>
<p>Manfaatkan sumber belajar resmi yang disediakan oleh pemerintah:</p>
<ul>
<li><strong>Simulasi Tes BPPP:</strong> Akses simulasi resmi di <strong>simulasi-tes.bppp.kemdikbud.go.id</strong> untuk merasakan format tes yang sebenarnya.</li>
<li><strong>Framework SNPMB:</strong> Pelajari kerangka tes dan kisi-kisi di <strong>framework-snpmb.bppp.kemdikbud.go.id</strong> untuk memahami cakupan materi yang diujikan.</li>
<li><strong>Portal SNPMB:</strong> Pantau informasi terbaru tentang jadwal, persyaratan, dan ketentuan di portal resmi SNPMB.</li>
</ul>
<p>Selain sumber resmi, kamu juga bisa memanfaatkan platform latihan soal seperti Toutopia untuk berlatih dengan soal-soal yang disusun sesuai format UTBK-SNBT terbaru. Latihan yang konsisten dan terarah adalah kunci keberhasilan di UTBK-SNBT.</p>

<h2>Kesalahan Umum yang Harus Dihindari</h2>
<ul>
<li><strong>Terlalu fokus pada satu subtes.</strong> Semua subtes berkontribusi pada skor akhir, jadi persiapkan semuanya secara seimbang.</li>
<li><strong>Mengandalkan hafalan.</strong> UTBK-SNBT mengukur kemampuan berpikir, bukan hafalan. Pahami konsep, jangan hanya menghafal.</li>
<li><strong>Tidak melakukan simulasi.</strong> Latihan soal saja tidak cukup. Lakukan simulasi lengkap dengan timer untuk melatih manajemen waktu.</li>
<li><strong>Panik saat menemui soal sulit.</strong> Ingat, tidak semua peserta bisa menjawab semua soal. Lewati soal sulit dan kembali nanti.</li>
<li><strong>Kurang istirahat menjelang tes.</strong> Begadang belajar malam sebelum tes justru kontraproduktif. Istirahat cukup jauh lebih penting.</li>
</ul>

<h2>Penutup</h2>
<p>UTBK-SNBT adalah tes yang menantang tetapi bisa dihadapi dengan persiapan yang tepat. Kunci keberhasilannya adalah konsistensi dalam belajar, pemahaman terhadap format tes, dan manajemen waktu yang baik. Mulailah persiapanmu dari sekarang, manfaatkan sumber belajar yang tersedia, dan jangan lupa menjaga kesehatan fisik serta mental. Semoga sukses!</p>`,
    },
    {
      title:
        "Persiapan SKD CPNS: Passing Grade, Materi, dan Strategi Lulus",
      slug: "persiapan-skd-cpns-passing-grade-materi-strategi",
      category: "Strategi",
      tags: ["cpns", "skd", "twk", "tiu", "tkp"],
      status: "PUBLISHED" as const,
      publishedAt: now,
      excerpt:
        "Panduan lengkap Seleksi Kompetensi Dasar (SKD) CPNS meliputi struktur tes TWK, TIU, TKP, passing grade terbaru, materi yang diujikan, sistem scoring, dan strategi lulus untuk setiap subtes.",
      content: `<h2>Apa Itu SKD CPNS?</h2>
<p>Seleksi Kompetensi Dasar (SKD) adalah tahap pertama dan paling krusial dalam seleksi Calon Pegawai Negeri Sipil (CPNS). SKD dilaksanakan menggunakan sistem Computer Assisted Test (CAT) yang dikelola oleh Badan Kepegawaian Negara (BKN). Tes ini dirancang untuk mengukur kompetensi dasar yang diperlukan oleh setiap aparatur sipil negara.</p>
<p>SKD menjadi tahap eliminasi utama dalam seleksi CPNS. Dari jutaan pelamar setiap tahunnya, hanya peserta yang memenuhi passing grade di ketiga subtes yang dapat melanjutkan ke tahap Seleksi Kompetensi Bidang (SKB). Oleh karena itu, memahami struktur dan strategi SKD adalah langkah pertama menuju keberhasilan.</p>

<h2>Struktur SKD CPNS</h2>
<p>SKD terdiri dari tiga subtes yang masing-masing memiliki passing grade tersendiri. Peserta harus memenuhi passing grade di <strong>ketiga subtes secara simultan</strong> untuk dinyatakan lulus SKD.</p>

<table>
<thead>
<tr><th>Subtes</th><th>Jumlah Soal</th><th>Passing Grade</th><th>Skor Maksimal</th><th>Waktu</th></tr>
</thead>
<tbody>
<tr><td>Tes Wawasan Kebangsaan (TWK)</td><td>30 soal</td><td>65</td><td>150</td><td rowspan="3">100 menit (gabungan)</td></tr>
<tr><td>Tes Intelegensi Umum (TIU)</td><td>35 soal</td><td>80</td><td>175</td></tr>
<tr><td>Tes Karakteristik Pribadi (TKP)</td><td>45 soal</td><td>166</td><td>225</td></tr>
<tr><td><strong>Total</strong></td><td><strong>110 soal</strong></td><td><strong>311</strong></td><td><strong>550</strong></td><td><strong>100 menit</strong></td></tr>
</tbody>
</table>

<p>Perlu ditekankan bahwa waktu 100 menit adalah waktu gabungan untuk ketiga subtes. Kamu bebas mengalokasikan waktu antar subtes, namun total waktu tidak boleh melebihi 100 menit.</p>

<h2>Sistem Scoring SKD</h2>
<p>Memahami sistem scoring sangat penting untuk menyusun strategi:</p>

<h3>TWK dan TIU</h3>
<ul>
<li>Jawaban benar: <strong>+5 poin</strong></li>
<li>Jawaban salah: <strong>0 poin</strong> (tidak ada pengurangan)</li>
<li>Tidak menjawab: <strong>0 poin</strong></li>
</ul>
<p>Karena tidak ada penalti, <strong>jawablah semua soal TWK dan TIU</strong> tanpa meninggalkan soal kosong.</p>

<h3>TKP</h3>
<ul>
<li>Setiap soal memiliki 5 pilihan jawaban dengan <strong>skor berjenjang: 1, 2, 3, 4, atau 5</strong>.</li>
<li>Tidak ada jawaban yang bernilai 0. Setiap pilihan memberikan skor minimal 1.</li>
<li>Jawaban paling ideal mendapat skor 5, paling tidak ideal mendapat skor 1.</li>
</ul>
<p>Implikasi: Untuk TKP, kamu akan selalu mendapat skor minimal 45 (45 soal x 1 poin) dan maksimal 225 (45 soal x 5 poin). Target minimal untuk lulus passing grade TKP (166) berarti kamu perlu rata-rata skor 3.69 per soal.</p>

<h2>Materi Tes Wawasan Kebangsaan (TWK)</h2>
<p>TWK mengukur penguasaan pengetahuan dan kemampuan implementasi nilai-nilai dasar kebangsaan. Materi TWK meliputi:</p>

<h3>Pancasila</h3>
<ul>
<li>Sejarah perumusan Pancasila (sidang BPUPKI dan PPKI)</li>
<li>Makna dan implementasi setiap sila</li>
<li>Pancasila sebagai dasar negara, ideologi, dan pandangan hidup</li>
<li>Pengamalan Pancasila dalam kehidupan sehari-hari</li>
</ul>

<h3>UUD 1945</h3>
<ul>
<li>Pembukaan UUD 1945 (hafal alinea 1-4)</li>
<li>Pasal-pasal penting: Pasal 1, 27-34 (HAM dan kesejahteraan sosial), Pasal 18 (pemerintahan daerah)</li>
<li>Amandemen UUD 1945 (I-IV) dan perubahannya</li>
<li>Sistem ketatanegaraan: hubungan antar lembaga negara (MPR, DPR, DPD, Presiden, MA, MK, BPK)</li>
</ul>

<h3>NKRI dan Bhinneka Tunggal Ika</h3>
<ul>
<li>Konsep negara kesatuan dan desentralisasi</li>
<li>Wawasan nusantara dan ketahanan nasional</li>
<li>Keberagaman suku, agama, ras, dan budaya</li>
<li>Toleransi dan harmoni dalam masyarakat majemuk</li>
</ul>

<h3>ASN dan Good Governance</h3>
<ul>
<li>UU ASN No. 20 Tahun 2023 (perubahan dari UU No. 5 Tahun 2014)</li>
<li>Nilai dasar ASN: BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif)</li>
<li>Kode etik dan kode perilaku ASN</li>
<li>Anti-korupsi dan integritas</li>
</ul>

<h2>Materi Tes Intelegensi Umum (TIU)</h2>
<p>TIU mengukur kemampuan verbal, numerik, dan logika. Materi TIU meliputi:</p>

<h3>Kemampuan Verbal</h3>
<ul>
<li><strong>Sinonim dan antonim:</strong> Persamaan dan lawan kata dari kosakata baku dan tidak umum.</li>
<li><strong>Analogi:</strong> Hubungan antar kata (sebab-akibat, bagian-keseluruhan, alat-fungsi, dll).</li>
<li><strong>Pengelompokan kata:</strong> Menentukan kata yang tidak sekelompok.</li>
<li><strong>Pemahaman wacana:</strong> Ide pokok, kesimpulan, dan inferensi dari teks pendek.</li>
</ul>

<h3>Kemampuan Numerik</h3>
<ul>
<li><strong>Deret angka:</strong> Menentukan pola dan melanjutkan deret (aritmetika, geometri, fibonacci, campuran).</li>
<li><strong>Hitungan dasar:</strong> Pecahan, persentase, rasio, dan perbandingan.</li>
<li><strong>Soal cerita aritmetika:</strong> Usia, kecepatan-jarak-waktu, untung-rugi, bunga, dan campuran.</li>
<li><strong>Interpretasi data:</strong> Membaca tabel, grafik, dan diagram.</li>
</ul>

<h3>Kemampuan Logika</h3>
<ul>
<li><strong>Silogisme:</strong> Penarikan kesimpulan dari dua premis (semua, sebagian, tidak ada).</li>
<li><strong>Logika proposisi:</strong> Implikasi, konjungsi, disjungsi, negasi, kontraposisi.</li>
<li><strong>Logika analitis:</strong> Penempatan posisi, urutan, dan pengelompokan berdasarkan kondisi.</li>
<li><strong>Pola gambar:</strong> Menentukan gambar selanjutnya dalam suatu pola visual.</li>
</ul>

<h2>Materi Tes Karakteristik Pribadi (TKP)</h2>
<p>TKP mengukur karakteristik pribadi yang diperlukan untuk menjadi ASN yang profesional. Soal TKP berbentuk studi kasus situasional. Dimensi yang diukur meliputi:</p>
<ul>
<li><strong>Pelayanan publik:</strong> Sikap mendahulukan kepentingan masyarakat dan memberikan pelayanan prima.</li>
<li><strong>Jejaring kerja (networking):</strong> Kemampuan membangun dan memelihara hubungan kerja yang produktif.</li>
<li><strong>Sosial budaya:</strong> Kepekaan terhadap keberagaman dan kemampuan beradaptasi dalam lingkungan majemuk.</li>
<li><strong>Teknologi informasi dan komunikasi:</strong> Keterbukaan terhadap perkembangan teknologi dan pemanfaatannya.</li>
<li><strong>Profesionalisme:</strong> Integritas, disiplin, dan orientasi pada kualitas.</li>
<li><strong>Anti-radikalisme:</strong> Sikap moderat dan mendukung nilai-nilai kebangsaan.</li>
</ul>

<h3>Prinsip Menjawab TKP</h3>
<p>Berbeda dengan TWK dan TIU yang memiliki jawaban pasti benar/salah, TKP mengukur kecenderungan sikap. Prinsip utama menjawab TKP:</p>
<ol>
<li><strong>Pilih jawaban yang paling proaktif dan solutif.</strong> Jawaban yang menunjukkan inisiatif untuk menyelesaikan masalah mendapat skor tertinggi.</li>
<li><strong>Hindari jawaban yang bersifat pasif atau menghindar.</strong> Jawaban seperti "diam saja", "menyerahkan ke orang lain", atau "menunggu instruksi" biasanya mendapat skor rendah.</li>
<li><strong>Utamakan kepentingan organisasi dan publik</strong> di atas kepentingan pribadi atau kelompok.</li>
<li><strong>Tunjukkan sikap inklusif dan menghargai perbedaan.</strong></li>
<li><strong>Pilih pendekatan kolaboratif</strong> daripada individualistis.</li>
</ol>

<h2>Strategi Lulus SKD CPNS</h2>

<h3>Strategi Umum: Prioritaskan TKP</h3>
<p>Banyak peserta gagal karena tidak mencapai passing grade TKP (166/225). Padahal TKP memiliki potensi skor tertinggi dan tidak memerlukan hafalan. Strategi yang disarankan:</p>
<ol>
<li><strong>Kerjakan TKP terlebih dahulu</strong> selama 30-35 menit. Pastikan mendapat skor setinggi mungkin.</li>
<li><strong>Lanjutkan dengan TIU</strong> selama 35-40 menit. TIU memiliki passing grade tertinggi secara proporsional.</li>
<li><strong>Terakhir kerjakan TWK</strong> selama 20-25 menit. TWK memiliki passing grade terendah dan banyak soal yang bisa dijawab dengan pengetahuan umum.</li>
</ol>

<h3>Strategi TWK</h3>
<ul>
<li>Hafal Pembukaan UUD 1945 dan pasal-pasal kunci.</li>
<li>Pahami konsep dasar Pancasila dan sejarah perumusannya.</li>
<li>Pelajari nilai-nilai BerAKHLAK ASN secara mendalam.</li>
<li>Baca UU ASN terbaru dan peraturan terkait.</li>
<li>Target: minimal 13 soal benar (65 poin) dari 30 soal.</li>
</ul>

<h3>Strategi TIU</h3>
<ul>
<li>Latihan deret angka setiap hari minimal 20 soal.</li>
<li>Hafal kosakata sinonim-antonim dari kumpulan soal tahun-tahun sebelumnya.</li>
<li>Kuasai teknik silogisme dan diagram Venn.</li>
<li>Latih kecepatan menghitung tanpa kalkulator.</li>
<li>Target: minimal 16 soal benar (80 poin) dari 35 soal.</li>
</ul>

<h3>Strategi TKP</h3>
<ul>
<li>Baca banyak contoh soal untuk memahami pola jawaban ideal.</li>
<li>Ingat prinsip: proaktif > reaktif > pasif.</li>
<li>Selalu pilih jawaban yang berorientasi pada pelayanan dan kolaborasi.</li>
<li>Jangan terburu-buru; baca semua opsi sebelum memilih.</li>
<li>Target: rata-rata skor 3.7+ per soal (minimal 166 dari 225).</li>
</ul>

<h2>Simulasi dan Latihan</h2>
<p>BKN menyediakan simulasi CAT resmi yang bisa diakses di <strong>cat.bkn.go.id/simulasi</strong>. Manfaatkan simulasi ini untuk:</p>
<ul>
<li>Membiasakan diri dengan antarmuka CAT BKN.</li>
<li>Melatih manajemen waktu dalam kondisi yang mendekati tes sesungguhnya.</li>
<li>Mengukur kemampuan awal dan memantau perkembangan.</li>
</ul>
<p>Selain simulasi resmi, gunakan platform latihan seperti Toutopia yang menyediakan bank soal SKD CPNS lengkap dengan pembahasan dan analisis skor per subtes.</p>

<h2>Timeline Persiapan yang Disarankan</h2>
<table>
<thead>
<tr><th>Periode</th><th>Fokus</th><th>Aktivitas</th></tr>
</thead>
<tbody>
<tr><td>3-6 bulan sebelum</td><td>Fondasi</td><td>Pelajari materi dasar TWK, latihan TIU dasar, pahami konsep TKP</td></tr>
<tr><td>2-3 bulan sebelum</td><td>Intensif</td><td>Latihan soal harian (50-100 soal/hari), simulasi mingguan</td></tr>
<tr><td>1 bulan sebelum</td><td>Pemantapan</td><td>Simulasi penuh 2-3x/minggu, review soal-soal yang salah</td></tr>
<tr><td>1 minggu sebelum</td><td>Relaksasi</td><td>Review ringan, jaga kesehatan, persiapan administrasi</td></tr>
</tbody>
</table>

<h2>Tips Hari H Tes</h2>
<ul>
<li>Datang minimal 1 jam sebelum jadwal untuk menghindari kepanikan.</li>
<li>Bawa dokumen yang diperlukan: KTP, kartu peserta, dan dokumen lain sesuai pengumuman.</li>
<li>Sarapan yang cukup namun tidak terlalu berat.</li>
<li>Bawa air minum jika diizinkan.</li>
<li>Berdoa dan percaya pada persiapanmu.</li>
<li>Saat mengerjakan, tenang dan fokus. Jangan terpengaruh oleh peserta lain.</li>
</ul>

<h2>Setelah SKD: Persiapan SKB</h2>
<p>Jika kamu berhasil melewati passing grade SKD, langkah selanjutnya adalah Seleksi Kompetensi Bidang (SKB). SKB berbeda-beda tergantung instansi dan formasi yang dilamar. Mulailah mempersiapkan SKB segera setelah SKD, karena jarak waktu antara keduanya biasanya tidak terlalu lama.</p>
<p>Ingat, persaingan di CPNS sangat ketat dengan rasio pelamar yang sangat tinggi. Namun dengan persiapan yang matang, strategi yang tepat, dan konsistensi dalam belajar, kamu bisa meraih impianmu menjadi ASN. Semangat!</p>`,
    },
    {
      title:
        "Rekrutmen BUMN: Panduan TKD, AKHLAK, dan English Test",
      slug: "rekrutmen-bumn-panduan-tkd-akhlak-english-test",
      category: "Tips Belajar",
      tags: ["bumn", "tkd", "akhlak", "english", "learning-agility"],
      status: "PUBLISHED" as const,
      publishedAt: now,
      excerpt:
        "Panduan lengkap rekrutmen BUMN meliputi tahapan seleksi TKD, tes AKHLAK, TWK, English Test, Learning Agility, passing grade, dan strategi lulus untuk setiap tahap seleksi.",
      content: `<h2>Rekrutmen Bersama BUMN</h2>
<p>Rekrutmen Bersama BUMN adalah program seleksi terpadu untuk mengisi posisi di berbagai Badan Usaha Milik Negara di Indonesia. Program ini dikoordinasikan oleh Forum Human Capital Indonesia (FHCI) dan Kementerian BUMN, sehingga peserta cukup mendaftar satu kali untuk melamar ke berbagai perusahaan BUMN sekaligus.</p>
<p>Seleksi BUMN menjadi salah satu yang paling diminati karena menawarkan stabilitas karir, jenjang karir yang jelas, benefit yang kompetitif, dan kesempatan berkontribusi langsung pada pembangunan nasional. Setiap tahun, ratusan ribu pelamar bersaing untuk ribuan posisi yang tersedia.</p>

<h2>Tahapan Seleksi Rekrutmen BUMN</h2>
<p>Seleksi BUMN terdiri dari beberapa tahap yang harus dilalui secara berurutan. Berikut penjelasan detail setiap tahap:</p>

<h3>Tahap 1: Tes Online (Tes Tertulis)</h3>
<p>Tahap pertama adalah tes online yang terdiri dari tiga komponen utama:</p>

<table>
<thead>
<tr><th>Komponen</th><th>Jumlah Soal</th><th>Passing Grade</th><th>Waktu</th></tr>
</thead>
<tbody>
<tr><td>Tes Kemampuan Dasar (TKD)</td><td>100 soal</td><td>58</td><td>50 menit</td></tr>
<tr><td>Tes AKHLAK</td><td>~50 soal</td><td>65</td><td>30 menit</td></tr>
<tr><td>Tes Wawasan Kebangsaan (TWK)</td><td>~50 soal</td><td>50</td><td>28 menit</td></tr>
<tr><td><strong>Total Tahap 1</strong></td><td><strong>~200 soal</strong></td><td><strong>-</strong></td><td><strong>108 menit</strong></td></tr>
</tbody>
</table>

<h3>Tahap 2: Tes Lanjutan</h3>
<p>Peserta yang lolos Tahap 1 melanjutkan ke tes berikut:</p>

<table>
<thead>
<tr><th>Komponen</th><th>Jumlah Soal</th><th>Waktu</th></tr>
</thead>
<tbody>
<tr><td>English Test</td><td>100 soal</td><td>90 menit</td></tr>
<tr><td>Learning Agility</td><td>50 soal</td><td>30 menit</td></tr>
</tbody>
</table>

<h3>Tahap Selanjutnya</h3>
<p>Setelah tes tertulis, peserta yang lolos masih harus menjalani tahap seleksi tambahan yang bervariasi antar BUMN, seperti wawancara, psikotes, tes kesehatan, dan asesmen lainnya.</p>

<h2>Tes Kemampuan Dasar (TKD)</h2>
<p>TKD BUMN menguji kemampuan dasar yang diperlukan untuk bekerja secara profesional. Dengan 100 soal dalam 50 menit, kamu hanya punya rata-rata 30 detik per soal, sehingga kecepatan dan ketepatan sangat krusial.</p>

<h3>Materi TKD</h3>
<ul>
<li><strong>Penalaran verbal:</strong> Sinonim, antonim, analogi kata, dan pemahaman wacana singkat.</li>
<li><strong>Penalaran numerik:</strong> Deret angka, operasi aritmetika, persentase, rasio, dan interpretasi data numerik.</li>
<li><strong>Penalaran logis:</strong> Silogisme, logika formal, pola gambar, dan penalaran spasial.</li>
<li><strong>Penalaran figural:</strong> Melanjutkan pola gambar, rotasi, dan refleksi bentuk.</li>
</ul>

<h3>Tips TKD</h3>
<ol>
<li>Kerjakan soal yang mudah terlebih dahulu. Dengan rata-rata 30 detik per soal, jangan habiskan waktu di soal yang sulit.</li>
<li>Untuk deret angka, cari pola paling sederhana dahulu (aritmetika, geometri) sebelum mencoba pola kompleks.</li>
<li>Untuk analogi, tentukan hubungan kata pertama sebelum melihat pilihan jawaban.</li>
<li>Untuk penalaran figural, perhatikan rotasi, pencerminan, dan penambahan/pengurangan elemen.</li>
<li>Latihan rutin minimal 100 soal TKD per hari selama masa persiapan.</li>
</ol>

<h2>Tes AKHLAK</h2>
<p>Tes AKHLAK mengukur sejauh mana nilai-nilai inti (core values) BUMN telah terinternalisasi dalam diri peserta. AKHLAK adalah akronim dari enam nilai utama:</p>

<h3>Core Values BUMN - AKHLAK</h3>
<table>
<thead>
<tr><th>Nilai</th><th>Makna</th><th>Perilaku Utama</th></tr>
</thead>
<tbody>
<tr><td><strong>A</strong>manah</td><td>Memegang teguh kepercayaan</td><td>Memenuhi janji, bertanggung jawab, jujur dan transparan</td></tr>
<tr><td><strong>K</strong>ompeten</td><td>Terus belajar dan mengembangkan kapabilitas</td><td>Meningkatkan kompetensi, membantu orang lain belajar, menyelesaikan tugas dengan kualitas terbaik</td></tr>
<tr><td><strong>H</strong>armonis</td><td>Saling peduli dan menghargai perbedaan</td><td>Menghargai perbedaan, tolong-menolong, membangun lingkungan kerja kondusif</td></tr>
<tr><td><strong>L</strong>oyal</td><td>Berdedikasi dan mengutamakan kepentingan organisasi</td><td>Menjaga nama baik organisasi, rela berkorban, patuh pada peraturan</td></tr>
<tr><td><strong>A</strong>daptif</td><td>Terus berinovasi dan antusias menghadapi perubahan</td><td>Cepat menyesuaikan diri, proaktif, terbuka pada ide baru</td></tr>
<tr><td><strong>K</strong>olaboratif</td><td>Membangun kerja sama sinergis</td><td>Memberikan kesempatan pada semua pihak, terbuka pada masukan, menggerakkan pemanfaatan sumber daya</td></tr>
</tbody>
</table>

<h3>Format Soal AKHLAK</h3>
<p>Soal AKHLAK berbentuk situasional judgment test (SJT). Kamu diberikan sebuah skenario kerja dan diminta memilih respons yang paling sesuai dengan nilai-nilai AKHLAK. Soal ini mirip dengan TKP di SKD CPNS namun konteksnya lebih spesifik ke lingkungan korporasi BUMN.</p>

<h3>Tips Menjawab Soal AKHLAK</h3>
<ul>
<li>Hafal dan pahami mendalam setiap nilai AKHLAK beserta perilaku utamanya.</li>
<li>Pilih jawaban yang menunjukkan <strong>inisiatif dan tanggung jawab</strong>, bukan menunggu instruksi.</li>
<li>Utamakan jawaban yang <strong>berorientasi pada kolaborasi tim</strong> daripada kerja individu.</li>
<li>Jawaban yang menunjukkan <strong>keterbukaan terhadap perubahan dan inovasi</strong> cenderung mendapat skor tinggi.</li>
<li>Hindari jawaban yang bersifat defensif, menyalahkan orang lain, atau menghindar dari tanggung jawab.</li>
</ul>

<h2>Tes Wawasan Kebangsaan (TWK) BUMN</h2>
<p>TWK dalam seleksi BUMN mirip dengan TWK di SKD CPNS, namun dengan penekanan tambahan pada wawasan ekonomi dan peran BUMN dalam pembangunan. Materi yang diujikan meliputi:</p>
<ul>
<li>Pancasila dan UUD 1945</li>
<li>NKRI dan Bhinneka Tunggal Ika</li>
<li>Sejarah Indonesia dan pahlawan nasional</li>
<li>Peran BUMN dalam pembangunan nasional</li>
<li>Isu-isu terkini perekonomian Indonesia</li>
<li>Regulasi terkait BUMN (UU BUMN, kebijakan Kementerian BUMN)</li>
</ul>

<h2>English Test</h2>
<p>English Test pada seleksi BUMN mengadopsi format yang mirip dengan TOEFL ITP (Institutional Testing Program). Tes ini mengukur kemampuan bahasa Inggris pasif (membaca dan mendengarkan) yang relevan untuk lingkungan kerja profesional.</p>

<h3>Struktur English Test</h3>
<table>
<thead>
<tr><th>Section</th><th>Jumlah Soal</th><th>Waktu</th><th>Fokus</th></tr>
</thead>
<tbody>
<tr><td>Structure & Written Expression</td><td>~40 soal</td><td>25 menit</td><td>Grammar, sentence completion, error identification</td></tr>
<tr><td>Reading Comprehension</td><td>~50 soal</td><td>55 menit</td><td>Pemahaman teks akademik dan profesional</td></tr>
<tr><td>Listening (jika ada)</td><td>~10 soal</td><td>10 menit</td><td>Pemahaman percakapan dan monolog</td></tr>
<tr><td><strong>Total</strong></td><td><strong>~100 soal</strong></td><td><strong>90 menit</strong></td><td></td></tr>
</tbody>
</table>

<h3>Tips English Test</h3>
<ul>
<li><strong>Structure:</strong> Pelajari grammar rules yang sering diuji: subject-verb agreement, tenses, conditional sentences, relative clauses, parallelism, dan passive voice.</li>
<li><strong>Written Expression:</strong> Latih kemampuan mengidentifikasi kesalahan grammar dalam kalimat. Perhatikan common errors: dangling modifiers, pronoun reference, dan word form.</li>
<li><strong>Reading Comprehension:</strong> Baca pertanyaan terlebih dahulu sebelum membaca teks. Gunakan teknik skimming untuk main idea dan scanning untuk detail spesifik.</li>
<li><strong>Vocabulary:</strong> Perbanyak kosakata akademik dan bisnis. Pelajari prefix dan suffix untuk menebak makna kata yang tidak dikenal.</li>
</ul>

<h2>Learning Agility Test</h2>
<p>Learning Agility mengukur kemampuan seseorang untuk belajar dari pengalaman dan menerapkan pembelajaran tersebut dalam situasi baru. Tes ini relatif baru dalam seleksi BUMN dan semakin penting di era transformasi digital.</p>

<h3>Dimensi Learning Agility</h3>
<ul>
<li><strong>Mental Agility:</strong> Kemampuan berpikir kritis, melihat masalah dari berbagai sudut pandang, dan menemukan solusi kreatif.</li>
<li><strong>People Agility:</strong> Kemampuan memahami orang lain, berkomunikasi efektif, dan beradaptasi dengan berbagai tipe kepribadian.</li>
<li><strong>Change Agility:</strong> Kenyamanan dengan ambiguitas, eksperimentasi, dan kemampuan memimpin perubahan.</li>
<li><strong>Results Agility:</strong> Kemampuan menghasilkan kinerja tinggi dalam situasi yang menantang dan pertama kali dihadapi.</li>
<li><strong>Self-Awareness:</strong> Pemahaman tentang kekuatan dan kelemahan diri sendiri serta komitmen untuk terus berkembang.</li>
</ul>

<h3>Tips Learning Agility</h3>
<ul>
<li>Jawab secara jujur dan konsisten. Tes ini memiliki validity check untuk mendeteksi jawaban yang tidak konsisten.</li>
<li>Pilih jawaban yang menunjukkan keterbukaan terhadap pengalaman baru dan kemampuan belajar dari kesalahan.</li>
<li>Tunjukkan bahwa kamu nyaman dengan ketidakpastian dan mampu beradaptasi.</li>
<li>Hindari jawaban yang menunjukkan rigiditas atau ketakutan terhadap perubahan.</li>
</ul>

<h2>Strategi Keseluruhan Rekrutmen BUMN</h2>

<h3>Persiapan Jangka Panjang (3-6 bulan)</h3>
<ol>
<li>Tingkatkan kemampuan bahasa Inggris secara konsisten. Baca artikel berbahasa Inggris setiap hari.</li>
<li>Latihan soal TKD secara rutin untuk meningkatkan kecepatan dan akurasi.</li>
<li>Pelajari dan internalisasi nilai-nilai AKHLAK.</li>
<li>Perkuat wawasan kebangsaan dengan membaca berita dan regulasi terkini.</li>
</ol>

<h3>Persiapan Jangka Pendek (1-2 bulan)</h3>
<ol>
<li>Fokus pada latihan soal dengan timer untuk simulasi kondisi tes sesungguhnya.</li>
<li>Lakukan simulasi penuh minimal seminggu sekali.</li>
<li>Review dan analisis kesalahan dari setiap simulasi.</li>
<li>Pelajari tips-tips spesifik untuk setiap jenis soal.</li>
</ol>

<h3>Prioritas Persiapan</h3>
<table>
<thead>
<tr><th>Prioritas</th><th>Komponen</th><th>Alasan</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>TKD</td><td>Passing grade ketat, butuh latihan intensif untuk kecepatan</td></tr>
<tr><td>2</td><td>English Test</td><td>Butuh waktu lama untuk meningkatkan kemampuan bahasa</td></tr>
<tr><td>3</td><td>AKHLAK</td><td>Perlu pemahaman mendalam, bukan sekadar hafalan</td></tr>
<tr><td>4</td><td>TWK</td><td>Materi overlap dengan CPNS, relatif mudah disiapkan</td></tr>
<tr><td>5</td><td>Learning Agility</td><td>Sulit dipersiapkan secara spesifik, lebih ke karakter personal</td></tr>
</tbody>
</table>

<h2>Perbedaan Seleksi BUMN dan CPNS</h2>
<table>
<thead>
<tr><th>Aspek</th><th>BUMN</th><th>CPNS</th></tr>
</thead>
<tbody>
<tr><td>Penyelenggara</td><td>FHCI / Kementerian BUMN</td><td>BKN / Kemenpan-RB</td></tr>
<tr><td>Status</td><td>Pegawai BUMN (non-PNS)</td><td>PNS (Aparatur Sipil Negara)</td></tr>
<tr><td>Gaji</td><td>Mengikuti standar korporasi</td><td>Mengikuti peraturan pemerintah</td></tr>
<tr><td>English Test</td><td>Ada (wajib)</td><td>Tidak ada di SKD</td></tr>
<tr><td>Tes Karakteristik</td><td>AKHLAK + Learning Agility</td><td>TKP</td></tr>
<tr><td>Variasi seleksi</td><td>Lebih bervariasi antar perusahaan</td><td>Lebih terstandar</td></tr>
</tbody>
</table>

<h2>Penutup</h2>
<p>Rekrutmen BUMN adalah proses seleksi yang menuntut persiapan menyeluruh. Tidak hanya kemampuan akademik yang diuji, tetapi juga karakter, kemampuan berbahasa Inggris, dan kesiapan menghadapi perubahan. Kunci utamanya adalah memulai persiapan sedini mungkin, berlatih secara konsisten, dan memahami format serta ekspektasi dari setiap tahap seleksi.</p>
<p>Gunakan platform latihan seperti Toutopia untuk berlatih soal-soal TKD, AKHLAK, dan TWK dengan format yang sesuai standar seleksi BUMN terbaru. Dengan persiapan yang matang, peluangmu untuk bergabung dengan BUMN akan semakin besar.</p>`,
    },
    {
      title:
        "Seleksi Sekolah Kedinasan: STAN, STIS, IPDN, STIN",
      slug: "seleksi-sekolah-kedinasan-stan-stis-ipdn-stin",
      category: "Tips Belajar",
      tags: ["kedinasan", "stan", "stis", "ipdn", "stin"],
      status: "PUBLISHED" as const,
      publishedAt: now,
      excerpt:
        "Panduan lengkap seleksi sekolah kedinasan populer: PKN STAN, STIS, IPDN, dan STIN. Meliputi persyaratan, tahapan seleksi, passing grade, struktur tes, dan tips persiapan untuk setiap sekolah.",
      content: `<h2>Apa Itu Sekolah Kedinasan?</h2>
<p>Sekolah kedinasan adalah perguruan tinggi yang diselenggarakan oleh kementerian atau lembaga pemerintah non-kementerian. Keunggulan utama sekolah kedinasan adalah mahasiswanya mendapatkan ikatan dinas, yang berarti setelah lulus akan langsung diangkat menjadi Aparatur Sipil Negara (ASN) atau pegawai di instansi terkait tanpa perlu mengikuti seleksi CPNS lagi.</p>
<p>Selain ikatan dinas, banyak sekolah kedinasan yang membebaskan biaya pendidikan (gratis) dan bahkan memberikan uang saku bulanan kepada mahasiswanya. Hal ini menjadikan sekolah kedinasan sangat diminati, dengan rasio seleksi yang sangat ketat.</p>

<h2>Tahapan Seleksi Umum</h2>
<p>Sejak beberapa tahun terakhir, seleksi sekolah kedinasan menggunakan pola terpadu yang dikoordinasikan oleh BKN. Tahapan umumnya meliputi:</p>
<ol>
<li><strong>Pendaftaran online</strong> melalui portal resmi (dikdin.bkn.go.id)</li>
<li><strong>Seleksi Kompetensi Dasar (SKD)</strong> menggunakan CAT BKN (sama seperti CPNS)</li>
<li><strong>Seleksi lanjutan</strong> yang berbeda-beda setiap sekolah kedinasan</li>
<li><strong>Tes kesehatan dan kesamaptaan</strong> (untuk sekolah tertentu)</li>
<li><strong>Wawancara dan/atau psikotes</strong></li>
</ol>

<h2>PKN STAN (Politeknik Keuangan Negara STAN)</h2>

<h3>Profil Singkat</h3>
<p>PKN STAN adalah sekolah kedinasan di bawah Kementerian Keuangan yang mencetak ahli di bidang keuangan negara, perpajakan, akuntansi, bea cukai, dan penilai. Lulusan PKN STAN ditempatkan di lingkungan Kementerian Keuangan dan instansi terkait seperti Direktorat Jenderal Pajak, Bea Cukai, Perbendaharaan, dan BPKP.</p>

<h3>Program Studi</h3>
<ul>
<li>D-III Akuntansi</li>
<li>D-III Pajak</li>
<li>D-III Kepabeanan dan Cukai</li>
<li>D-III Kebendaharaan Negara</li>
<li>D-III Manajemen Aset</li>
<li>D-I Pajak</li>
<li>D-I Kebendaharaan Negara</li>
</ul>

<h3>Struktur Seleksi PKN STAN</h3>
<table>
<thead>
<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK (30 soal), TIU (35 soal), TKP (45 soal) - Passing grade sama dengan CPNS</td></tr>
<tr><td>2a</td><td>Tes Potensi Akademik (TPA)</td><td>45 soal, ada penalti (jawaban salah mengurangi skor)</td></tr>
<tr><td>2b</td><td>Tes Bahasa Inggris (TBI)</td><td>30 soal, ada penalti (jawaban salah mengurangi skor)</td></tr>
<tr><td>3</td><td>Tes Kesehatan & Kebugaran</td><td>Untuk prodi Kepabeanan dan Cukai (ada tes fisik)</td></tr>
</tbody>
</table>

<h3>Hal Penting PKN STAN</h3>
<ul>
<li><strong>Sistem penalti di TPA dan TBI:</strong> Berbeda dengan SKD, jawaban salah di TPA dan TBI akan mengurangi skor. Strategi: hanya jawab soal yang yakin benar, kosongkan soal yang benar-benar tidak tahu.</li>
<li><strong>TPA menguji:</strong> Penalaran verbal, numerik, dan logis dengan tingkat kesulitan lebih tinggi dari TIU SKD.</li>
<li><strong>TBI menguji:</strong> Grammar (structure), vocabulary, dan reading comprehension level menengah ke atas.</li>
<li><strong>Persaingan ketat:</strong> Rasio penerimaan bisa mencapai 1:50 hingga 1:100.</li>
</ul>

<h3>Tips PKN STAN</h3>
<ul>
<li>Persiapkan SKD secara matang karena ini tahap eliminasi pertama.</li>
<li>Untuk TPA, latih terutama deret angka dan logika karena bobotnya besar.</li>
<li>Untuk TBI, fokus pada grammar rules dan reading comprehension. Level soal mendekati TOEFL PBT.</li>
<li>Manajemen risiko: karena ada penalti, lebih baik menjawab 25 soal dengan benar daripada 30 soal tapi 10 di antaranya salah.</li>
</ul>

<h2>STIS (Politeknik Statistika STIS)</h2>

<h3>Profil Singkat</h3>
<p>STIS adalah sekolah kedinasan di bawah Badan Pusat Statistik (BPS) yang mencetak ahli statistik dan komputasi statistik. Lulusan STIS ditempatkan di BPS pusat dan daerah di seluruh Indonesia.</p>

<h3>Program Studi</h3>
<ul>
<li>D-IV Statistika</li>
<li>D-IV Komputasi Statistik</li>
</ul>

<h3>Struktur Seleksi STIS</h3>
<table>
<thead>
<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK, TIU, TKP - Passing grade standar</td></tr>
<tr><td>2</td><td>Tes Matematika</td><td>60 soal - Level SMA/MA kelas 10-12, tingkat kesulitan tinggi</td></tr>
<tr><td>3</td><td>Tes Bahasa Inggris</td><td>60 soal - Lebih sulit dari PKN STAN</td></tr>
<tr><td>4</td><td>Psikotes & Wawancara</td><td>Tes psikologi dan wawancara panel</td></tr>
</tbody>
</table>

<h3>Hal Penting STIS</h3>
<ul>
<li><strong>Matematika level tinggi:</strong> Soal matematika STIS terkenal sulit, mencakup kalkulus dasar, statistika, probabilitas, aljabar linear, dan trigonometri.</li>
<li><strong>Bahasa Inggris advanced:</strong> Level soal lebih tinggi dari PKN STAN, mencakup academic reading dan scientific English.</li>
<li><strong>Cocok untuk:</strong> Siswa yang kuat di matematika dan memiliki minat pada data dan statistik.</li>
</ul>

<h3>Tips STIS</h3>
<ul>
<li>Kuasai matematika SMA secara mendalam, terutama kalkulus, statistika, dan probabilitas.</li>
<li>Latih kemampuan berhitung cepat dan akurat tanpa kalkulator.</li>
<li>Untuk bahasa Inggris, perbanyak baca jurnal ilmiah dan teks akademik.</li>
<li>Jangan remehkan psikotes: latih tes krepelin, wartegg, dan tes kepribadian lainnya.</li>
</ul>

<h2>IPDN (Institut Pemerintahan Dalam Negeri)</h2>

<h3>Profil Singkat</h3>
<p>IPDN adalah sekolah kedinasan di bawah Kementerian Dalam Negeri yang mencetak kader pamong praja. Lulusan IPDN ditempatkan di pemerintah daerah (provinsi, kabupaten/kota) di seluruh Indonesia. IPDN menggunakan sistem semi-militer dengan pendidikan berasrama.</p>

<h3>Struktur Seleksi IPDN</h3>
<table>
<thead>
<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK passing grade lebih tinggi: 75 (vs 65 di CPNS), TIU 80, TKP 166</td></tr>
<tr><td>2</td><td>Tes Kesehatan</td><td>Pemeriksaan kesehatan menyeluruh, termasuk mata, telinga, jantung</td></tr>
<tr><td>3</td><td>Tes Kesamaptaan (Fisik)</td><td>Lari 12 menit, pull-up, push-up, sit-up, shuttle run, renang</td></tr>
<tr><td>4</td><td>Psikotes</td><td>Tes psikologi tertulis dan wawancara psikolog</td></tr>
<tr><td>5</td><td>Wawancara</td><td>Panel wawancara pejabat Kemendagri</td></tr>
</tbody>
</table>

<h3>Hal Penting IPDN</h3>
<ul>
<li><strong>Passing grade TWK lebih tinggi (75):</strong> IPDN menuntut wawasan kebangsaan yang lebih kuat karena lulusannya akan menjadi pemimpin di pemerintahan daerah.</li>
<li><strong>Tes fisik berat:</strong> Kesamaptaan adalah tahap yang mengeliminasi banyak peserta. Persiapan fisik harus dimulai jauh-jauh hari.</li>
<li><strong>Sistem semi-militer:</strong> Kehidupan di kampus IPDN sangat disiplin. Pastikan kamu siap mental untuk lingkungan seperti ini.</li>
<li><strong>Persyaratan fisik:</strong> Tinggi badan minimal (pria: 160 cm, wanita: 155 cm), tidak berkacamata (ketajaman mata tertentu).</li>
</ul>

<h3>Tips IPDN</h3>
<ul>
<li>Tingkatkan skor TWK di atas rata-rata. Hafal UUD 1945, sejarah Indonesia, dan pemerintahan daerah.</li>
<li>Mulai latihan fisik 6 bulan sebelum seleksi: lari rutin, latihan kekuatan tubuh bagian atas.</li>
<li>Latih renang jika belum bisa. Banyak peserta gugur di tes renang.</li>
<li>Jaga postur dan penampilan tubuh. IPDN memperhatikan aspek fisik secara keseluruhan.</li>
</ul>

<h2>STIN (Sekolah Tinggi Intelijen Negara)</h2>

<h3>Profil Singkat</h3>
<p>STIN adalah sekolah kedinasan di bawah Badan Intelijen Negara (BIN) yang mencetak agen dan analis intelijen. STIN adalah sekolah kedinasan yang paling kompetitif dan selektif karena sifat pekerjaannya yang sensitif dan rahasia.</p>

<h3>Struktur Seleksi STIN</h3>
<table>
<thead>
<tr><th>Tahap</th><th>Komponen</th><th>Detail</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>SKD (CAT BKN)</td><td>TWK, TIU, TKP dengan passing grade standar</td></tr>
<tr><td>2</td><td>Tes Kesehatan Tahap 1</td><td>Pemeriksaan kesehatan umum</td></tr>
<tr><td>3</td><td>Tes Kesamaptaan</td><td>Tes fisik intensif (lebih berat dari IPDN)</td></tr>
<tr><td>4</td><td>Psikotes Mendalam</td><td>Tes psikologi komprehensif dan berlapis</td></tr>
<tr><td>5</td><td>Tes Kesehatan Tahap 2</td><td>Pemeriksaan kesehatan lanjutan (jiwa, narkoba)</td></tr>
<tr><td>6</td><td>Wawancara</td><td>Wawancara oleh pejabat BIN</td></tr>
<tr><td>7</td><td>Pantukhir</td><td>Penilaian akhir dan penetapan kelulusan</td></tr>
</tbody>
</table>

<h3>Hal Penting STIN</h3>
<ul>
<li><strong>Seleksi paling kompetitif:</strong> Rasio penerimaan bisa mencapai 1:500 atau lebih.</li>
<li><strong>Tes fisik paling berat:</strong> Standar kesamaptaan STIN lebih tinggi dari sekolah kedinasan lainnya.</li>
<li><strong>Psikotes mendalam:</strong> Tes psikologi berlapis untuk memastikan stabilitas mental dan kesesuaian karakter.</li>
<li><strong>Background check:</strong> Penelusuran latar belakang yang mendalam terhadap peserta dan keluarga.</li>
<li><strong>Kerahasiaan:</strong> Banyak aspek seleksi dan pendidikan STIN yang bersifat rahasia.</li>
</ul>

<h3>Tips STIN</h3>
<ul>
<li>Persiapkan fisik secara ekstrem: lari jarak jauh, renang, dan latihan ketahanan.</li>
<li>Jaga rekam jejak digital dan sosial media. STIN memeriksa profil online peserta.</li>
<li>Pastikan tidak ada riwayat hukum yang bermasalah pada diri sendiri maupun keluarga inti.</li>
<li>Kembangkan kemampuan analitis dan berpikir kritis.</li>
<li>Kuasai minimal satu bahasa asing selain bahasa Inggris sebagai nilai tambah.</li>
</ul>

<h2>Tabel Perbandingan Sekolah Kedinasan</h2>
<table>
<thead>
<tr><th>Aspek</th><th>PKN STAN</th><th>STIS</th><th>IPDN</th><th>STIN</th></tr>
</thead>
<tbody>
<tr><td>Kementerian/Lembaga</td><td>Kemenkeu</td><td>BPS</td><td>Kemendagri</td><td>BIN</td></tr>
<tr><td>Passing Grade TWK</td><td>65</td><td>65</td><td>75</td><td>65</td></tr>
<tr><td>Passing Grade TIU</td><td>80</td><td>80</td><td>80</td><td>80</td></tr>
<tr><td>Passing Grade TKP</td><td>166</td><td>166</td><td>166</td><td>166</td></tr>
<tr><td>Tes Akademik Lanjutan</td><td>TPA (45, penalti) + TBI (30, penalti)</td><td>Matematika (60) + B. Inggris (60)</td><td>Tidak ada</td><td>Tidak ada</td></tr>
<tr><td>Tes Fisik</td><td>Hanya Bea Cukai</td><td>Tidak ada</td><td>Ya (berat)</td><td>Ya (sangat berat)</td></tr>
<tr><td>Biaya Pendidikan</td><td>Gratis</td><td>Gratis + uang saku</td><td>Gratis + uang saku</td><td>Gratis + uang saku</td></tr>
<tr><td>Tingkat Kompetisi</td><td>Sangat tinggi</td><td>Tinggi</td><td>Tinggi</td><td>Paling tinggi</td></tr>
<tr><td>Penempatan</td><td>Kemenkeu & instansi terkait</td><td>BPS seluruh Indonesia</td><td>Pemda seluruh Indonesia</td><td>BIN</td></tr>
</tbody>
</table>

<h2>Strategi Umum untuk Semua Sekolah Kedinasan</h2>
<ol>
<li><strong>Persiapkan SKD sejak dini.</strong> SKD adalah tahap eliminasi pertama yang berlaku untuk semua sekolah kedinasan.</li>
<li><strong>Pilih sekolah yang sesuai minat dan kemampuan.</strong> Jangan memilih hanya karena gengsi. Pertimbangkan karir setelah lulus.</li>
<li><strong>Daftar di lebih dari satu sekolah</strong> jika memungkinkan, untuk memperbesar peluang diterima.</li>
<li><strong>Jaga kesehatan fisik.</strong> Bahkan sekolah yang tidak memiliki tes fisik tetap mensyaratkan tes kesehatan.</li>
<li><strong>Bangun mental yang kuat.</strong> Proses seleksi yang panjang membutuhkan ketahanan mental.</li>
<li><strong>Manfaatkan sumber belajar yang tepat.</strong> Gunakan platform latihan soal seperti Toutopia untuk berlatih SKD dan tes akademik lainnya.</li>
</ol>

<h2>Penutup</h2>
<p>Sekolah kedinasan menawarkan jalur karir yang menjanjikan dengan jaminan penempatan kerja setelah lulus. Namun, persaingannya sangat ketat dan membutuhkan persiapan yang serius dan komprehensif. Mulailah persiapanmu sedini mungkin, kenali kekuatan dan kelemahanmu, dan fokuskan upaya pada area yang perlu ditingkatkan. Dengan tekad dan kerja keras, impianmu untuk diterima di sekolah kedinasan pilihanmu bisa terwujud.</p>`,
    },
    {
      title:
        "Panduan Seleksi PPPK: Kompetensi Teknis hingga Wawancara",
      slug: "panduan-seleksi-pppk-kompetensi-teknis-wawancara",
      category: "Strategi",
      tags: ["pppk", "guru", "teknis", "manajerial", "sosiokultural"],
      status: "PUBLISHED" as const,
      publishedAt: now,
      excerpt:
        "Panduan lengkap seleksi PPPK meliputi struktur tes kompetensi teknis, manajerial, sosiokultural, dan wawancara. Termasuk tips untuk PPPK Guru, Tenaga Teknis, dan Tenaga Kesehatan.",
      content: `<h2>Apa Itu PPPK?</h2>
<p>Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) adalah pegawai ASN yang diangkat berdasarkan perjanjian kerja untuk jangka waktu tertentu. PPPK diperkenalkan melalui UU ASN sebagai alternatif dari PNS, dengan tujuan mempercepat pemenuhan kebutuhan tenaga profesional di instansi pemerintah, terutama di bidang pendidikan dan kesehatan.</p>
<p>Berbeda dengan PNS yang diangkat secara permanen, PPPK bekerja berdasarkan kontrak yang dapat diperpanjang sesuai kebutuhan dan kinerja. Meskipun demikian, PPPK mendapatkan hak-hak yang setara dengan PNS dalam banyak aspek, termasuk gaji, tunjangan, cuti, dan perlindungan sosial.</p>
<p>Seleksi PPPK memiliki karakteristik unik yang berbeda dari CPNS. Pemahaman yang baik tentang struktur seleksi, sistem penilaian, dan strategi persiapan akan sangat membantu dalam meraih keberhasilan.</p>

<h2>Struktur Seleksi PPPK</h2>
<p>Seleksi PPPK terdiri dari empat komponen utama yang masing-masing memiliki bobot dan sistem penilaian berbeda:</p>

<table>
<thead>
<tr><th>Komponen</th><th>Jumlah Soal</th><th>Sistem Skor</th><th>Skor Maks</th><th>Waktu</th></tr>
</thead>
<tbody>
<tr><td>Kompetensi Teknis</td><td>90 soal</td><td>Benar = 5, Salah = 0</td><td>450</td><td>90 menit</td></tr>
<tr><td>Kompetensi Manajerial</td><td>25 soal</td><td>Skor 1-4 per soal</td><td>100</td><td>25 menit</td></tr>
<tr><td>Kompetensi Sosiokultural</td><td>20 soal</td><td>Skor 1-4 per soal</td><td>80</td><td>15 menit</td></tr>
<tr><td>Wawancara</td><td>10 soal</td><td>Skor 1-4 per soal</td><td>40</td><td>10 menit (tertulis via CAT)</td></tr>
<tr><td><strong>Total</strong></td><td><strong>145 soal</strong></td><td></td><td><strong>670</strong></td><td><strong>~130 menit</strong></td></tr>
</tbody>
</table>

<h3>Perbedaan Kunci dengan CPNS</h3>
<ul>
<li><strong>Tidak ada passing grade per komponen.</strong> PPPK menggunakan <strong>sistem peringkat</strong>, bukan ambang batas (passing grade).</li>
<li><strong>Kompetisi berbasis ranking.</strong> Peserta dirangking berdasarkan total skor, dan yang diterima adalah peserta dengan ranking tertinggi sesuai jumlah formasi.</li>
<li><strong>Bobot teknis dominan.</strong> Kompetensi Teknis memiliki bobot paling besar (450 dari 670 poin), sehingga menjadi penentu utama keberhasilan.</li>
</ul>

<h2>Kompetensi Teknis</h2>
<p>Kompetensi Teknis adalah komponen terpenting dengan kontribusi 67% dari total skor. Materi yang diujikan sangat berbeda tergantung jenis formasi yang dilamar.</p>

<h3>PPPK Guru</h3>
<p>Seleksi kompetensi teknis untuk PPPK Guru menguji tiga aspek utama:</p>

<h3>1. Kompetensi Pedagogik</h3>
<ul>
<li><strong>Teori belajar dan pembelajaran:</strong> Konstruktivisme, behaviorisme, kognitivisme, humanisme.</li>
<li><strong>Kurikulum:</strong> Pemahaman Kurikulum Merdeka, profil pelajar Pancasila, asesmen diagnostik.</li>
<li><strong>Perencanaan pembelajaran:</strong> Menyusun modul ajar, alur tujuan pembelajaran (ATP), dan capaian pembelajaran (CP).</li>
<li><strong>Asesmen:</strong> Asesmen formatif dan sumatif, asesmen autentik, rubrik penilaian.</li>
<li><strong>Pengelolaan kelas:</strong> Diferensiasi pembelajaran, pembelajaran inklusif, manajemen kelas.</li>
</ul>

<h3>2. Kompetensi Profesional</h3>
<ul>
<li>Penguasaan materi bidang studi sesuai jenjang dan mata pelajaran yang dilamar.</li>
<li>Kemampuan menganalisis dan mengevaluasi konten pembelajaran.</li>
<li>Pemahaman perkembangan terkini dalam bidang studi.</li>
</ul>

<h3>3. Pedagogical Content Knowledge (PCK)</h3>
<ul>
<li>Integrasi antara pengetahuan pedagogik dan konten mata pelajaran.</li>
<li>Kemampuan menjelaskan konsep yang sulit dengan cara yang mudah dipahami siswa.</li>
<li>Identifikasi miskonsepsi siswa dan strategi remedial.</li>
<li>Pemilihan metode dan media pembelajaran yang tepat untuk materi tertentu.</li>
</ul>

<h3>PPPK Tenaga Teknis</h3>
<p>Untuk formasi tenaga teknis (non-guru, non-kesehatan), materi kompetensi teknis disesuaikan dengan jabatan fungsional yang dilamar. Contoh:</p>
<ul>
<li><strong>Pranata Komputer:</strong> Pemrograman, database, jaringan, keamanan siber.</li>
<li><strong>Analis Kebijakan:</strong> Analisis kebijakan publik, formulasi kebijakan, evaluasi program.</li>
<li><strong>Perencana:</strong> Perencanaan pembangunan, RPJM, analisis data pembangunan.</li>
<li><strong>Pustakawan:</strong> Ilmu perpustakaan, katalogisasi, manajemen koleksi, literasi informasi.</li>
<li><strong>Arsiparis:</strong> Kearsipan, records management, preservasi dokumen.</li>
</ul>

<h3>PPPK Tenaga Kesehatan (Nakes)</h3>
<p>Seleksi untuk PPPK Nakes memiliki karakteristik khusus dengan penggunaan soal vignette klinis:</p>
<ul>
<li><strong>Format vignette:</strong> Soal berbentuk kasus klinis lengkap (anamnesis, pemeriksaan fisik, data penunjang) yang harus dianalisis untuk menentukan diagnosis dan tatalaksana.</li>
<li><strong>Bidang yang diuji:</strong> Sesuai profesi (dokter, perawat, bidan, apoteker, dll).</li>
<li><strong>Standar kompetensi:</strong> Mengacu pada standar kompetensi profesi masing-masing yang ditetapkan oleh organisasi profesi.</li>
<li><strong>Level soal:</strong> Setara dengan uji kompetensi profesi kesehatan.</li>
</ul>

<h2>Kompetensi Manajerial</h2>
<p>Kompetensi Manajerial menguji kemampuan manajerial yang diperlukan dalam menjalankan tugas jabatan. Terdapat delapan dimensi manajerial yang diukur:</p>

<h3>8 Dimensi Manajerial</h3>
<ol>
<li><strong>Integritas:</strong> Konsistensi antara perkataan dan perbuatan, kejujuran, dan kepatuhan pada norma dan etika.</li>
<li><strong>Kerja Sama:</strong> Kemampuan bekerja dalam tim, menghargai kontribusi orang lain, dan membangun sinergi.</li>
<li><strong>Komunikasi:</strong> Kemampuan menyampaikan dan menerima informasi secara efektif, baik lisan maupun tulisan.</li>
<li><strong>Orientasi pada Hasil:</strong> Fokus pada pencapaian target dan peningkatan kualitas kerja secara berkelanjutan.</li>
<li><strong>Pelayanan Publik:</strong> Komitmen memberikan pelayanan terbaik kepada masyarakat.</li>
<li><strong>Pengembangan Diri dan Orang Lain:</strong> Kemauan untuk terus belajar dan membantu pengembangan rekan kerja.</li>
<li><strong>Mengelola Perubahan:</strong> Kemampuan beradaptasi dan memimpin perubahan dalam organisasi.</li>
<li><strong>Pengambilan Keputusan:</strong> Kemampuan mengambil keputusan yang tepat berdasarkan data dan analisis.</li>
</ol>

<h3>Format dan Tips Menjawab</h3>
<p>Soal manajerial berbentuk situasional judgment test. Setiap soal menyajikan skenario dan kamu diminta memilih respons yang paling tepat. Skor 1-4 diberikan berdasarkan kualitas respons:</p>
<ul>
<li><strong>Skor 4:</strong> Respons paling proaktif, strategis, dan berorientasi pada hasil jangka panjang.</li>
<li><strong>Skor 3:</strong> Respons yang tepat namun kurang strategis atau hanya berorientasi jangka pendek.</li>
<li><strong>Skor 2:</strong> Respons yang netral atau pasif, menunggu instruksi.</li>
<li><strong>Skor 1:</strong> Respons yang menghindari masalah, menyalahkan orang lain, atau kontraproduktif.</li>
</ul>
<p>Tips utama: Selalu pilih jawaban yang menunjukkan inisiatif, kepemimpinan, dan orientasi pada solusi. Jawaban yang proaktif hampir selalu mendapat skor tertinggi.</p>

<h2>Kompetensi Sosiokultural</h2>
<p>Kompetensi Sosiokultural mengukur kemampuan berinteraksi dalam masyarakat yang beragam dan kemampuan memahami konteks sosial budaya dalam menjalankan tugas pemerintahan.</p>

<h3>Aspek yang Diukur</h3>
<ul>
<li><strong>Perekat Bangsa:</strong> Kemampuan mempromosikan dan menjaga persatuan dalam keberagaman.</li>
<li><strong>Empati dan Kepekaan Sosial:</strong> Kemampuan memahami dan merespons kebutuhan masyarakat yang beragam.</li>
<li><strong>Kolaborasi Lintas Budaya:</strong> Kemampuan bekerja efektif dengan orang dari latar belakang yang berbeda.</li>
<li><strong>Nasionalisme:</strong> Cinta tanah air dan komitmen pada nilai-nilai kebangsaan.</li>
</ul>

<h3>Tips Menjawab Sosiokultural</h3>
<ul>
<li>Pilih jawaban yang menunjukkan penghargaan terhadap perbedaan dan keberagaman.</li>
<li>Utamakan pendekatan inklusif yang melibatkan semua pihak.</li>
<li>Hindari jawaban yang diskriminatif atau favoritisme terhadap kelompok tertentu.</li>
<li>Tunjukkan kemampuan menjadi jembatan antar kelompok yang berbeda.</li>
</ul>

<h2>Wawancara (Tertulis via CAT)</h2>
<p>Uniknya, wawancara dalam seleksi PPPK dilakukan secara tertulis melalui sistem CAT, bukan tatap muka. Format ini menyajikan pertanyaan situasional yang harus dijawab dengan memilih respons tertulis.</p>

<h3>Topik Wawancara</h3>
<ul>
<li>Motivasi melamar jabatan dan komitmen terhadap pelayanan publik.</li>
<li>Pengalaman relevan dan bagaimana menerapkannya dalam jabatan yang dilamar.</li>
<li>Skenario penyelesaian masalah dalam konteks jabatan.</li>
<li>Visi dan rencana pengembangan diri.</li>
</ul>

<h3>Tips Wawancara</h3>
<ul>
<li>Jawab dengan konsisten sesuai profil jabatan yang dilamar.</li>
<li>Tunjukkan pemahaman tentang tugas dan tanggung jawab jabatan.</li>
<li>Pilih jawaban yang menunjukkan motivasi intrinsik, bukan ekstrinsik (motivasi pelayanan, bukan gaji atau status).</li>
</ul>

<h2>Strategi Menyeluruh Seleksi PPPK</h2>

<h3>Prioritas Persiapan</h3>
<ol>
<li><strong>Kompetensi Teknis (prioritas utama):</strong> Dengan bobot 67% dari total skor, teknis adalah penentu utama. Alokasikan 60-70% waktu persiapan untuk komponen ini.</li>
<li><strong>Kompetensi Manajerial (prioritas kedua):</strong> Dengan 100 poin, manajerial adalah penentu kedua. Pahami 8 dimensi dan pola jawaban ideal.</li>
<li><strong>Kompetensi Sosiokultural (prioritas ketiga):</strong> Dengan 80 poin, sosiokultural memiliki pola yang mirip dengan manajerial.</li>
<li><strong>Wawancara (prioritas keempat):</strong> Dengan 40 poin, wawancara memiliki bobot terkecil namun tetap bisa menjadi pembeda.</li>
</ol>

<h3>Strategi untuk PPPK Guru</h3>
<ul>
<li><strong>Kuasai Kurikulum Merdeka:</strong> Pelajari capaian pembelajaran (CP), alur tujuan pembelajaran (ATP), modul ajar, dan asesmen.</li>
<li><strong>Perdalam pedagogik:</strong> Fokus pada teori belajar, diferensiasi, dan asesmen formatif.</li>
<li><strong>Update materi bidang studi:</strong> Pastikan penguasaan materi sesuai dengan jenjang dan mata pelajaran.</li>
<li><strong>Latih PCK:</strong> Hubungkan pengetahuan pedagogik dengan konten mata pelajaran.</li>
<li><strong>Pelajari profil pelajar Pancasila</strong> dan implementasinya dalam pembelajaran.</li>
</ul>

<h3>Strategi untuk PPPK Teknis</h3>
<ul>
<li>Pelajari standar kompetensi jabatan fungsional yang dilamar.</li>
<li>Baca regulasi dan pedoman terkini yang relevan dengan jabatan.</li>
<li>Latih soal-soal yang spesifik sesuai bidang jabatan.</li>
<li>Pahami konteks penerapan kompetensi dalam instansi yang dituju.</li>
</ul>

<h3>Strategi untuk PPPK Nakes</h3>
<ul>
<li>Latih soal vignette klinis secara intensif.</li>
<li>Review standar kompetensi profesi masing-masing.</li>
<li>Pelajari pedoman klinis dan protokol terbaru.</li>
<li>Latih kemampuan analisis kasus klinis secara sistematis.</li>
</ul>

<h2>Manajemen Waktu Saat Tes</h2>
<table>
<thead>
<tr><th>Komponen</th><th>Waktu</th><th>Rata-rata per Soal</th><th>Strategi</th></tr>
</thead>
<tbody>
<tr><td>Teknis</td><td>90 menit</td><td>60 detik</td><td>Jawab yang yakin dulu, tandai yang ragu</td></tr>
<tr><td>Manajerial</td><td>25 menit</td><td>60 detik</td><td>Baca semua opsi, pilih yang paling proaktif</td></tr>
<tr><td>Sosiokultural</td><td>15 menit</td><td>45 detik</td><td>Pilih yang inklusif dan kolaboratif</td></tr>
<tr><td>Wawancara</td><td>10 menit</td><td>60 detik</td><td>Jawab konsisten dengan profil jabatan</td></tr>
</tbody>
</table>

<h2>Kesalahan Umum yang Harus Dihindari</h2>
<ul>
<li><strong>Hanya fokus pada manajerial/sosiokultural.</strong> Banyak peserta menghabiskan waktu persiapan untuk soal manajerial karena mirip TKP CPNS, padahal bobotnya jauh lebih kecil dari teknis.</li>
<li><strong>Mengabaikan update materi.</strong> Materi teknis, terutama untuk guru (Kurikulum Merdeka) dan nakes (protokol klinis), terus berubah. Gunakan sumber terbaru.</li>
<li><strong>Tidak memahami sistem peringkat.</strong> Banyak peserta berpikir ada passing grade tertentu. Padahal yang menentukan adalah posisi ranking dibanding peserta lain di formasi yang sama.</li>
<li><strong>Terlalu lama di satu soal teknis.</strong> Dengan 90 soal dalam 90 menit, setiap detik berharga. Lewati soal yang sulit dan kembali nanti.</li>
</ul>

<h2>Penutup</h2>
<p>Seleksi PPPK memiliki karakteristik unik dengan dominasi kompetensi teknis dan sistem peringkat yang kompetitif. Kunci keberhasilannya adalah penguasaan materi teknis yang mendalam sesuai formasi yang dilamar, dipadukan dengan pemahaman yang baik tentang kompetensi manajerial dan sosiokultural. Mulailah persiapan sedini mungkin, fokus pada area yang memberikan dampak terbesar pada skor, dan manfaatkan platform latihan seperti Toutopia untuk mengasah kemampuanmu. Semoga berhasil dalam seleksi PPPK!</p>`,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: { ...article, authorId: admin.id },
      create: { ...article, authorId: admin.id },
    });
    console.log(`Seeded: ${article.title}`);
  }

  console.log(`\nSeeded ${articles.length} articles successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
