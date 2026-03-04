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

export const EBOOKS_UTBK: SeedEbook[] = [
  {
    title: "Strategi HOTS UTBK",
    slug: "strategi-hots-utbk-snbt",
    description:
      "Teknik menjawab soal Higher Order Thinking Skills di UTBK",
    contentType: "HTML",
    htmlContent: `<h2>Strategi Menjawab Soal HOTS di UTBK-SNBT</h2>

<p>Soal Higher Order Thinking Skills (HOTS) merupakan komponen utama dalam UTBK-SNBT. Soal jenis ini menguji kemampuan berpikir tingkat tinggi yang mencakup analisis, evaluasi, dan kreasi menurut Taksonomi Bloom. Ebook ini membahas strategi konkret untuk menghadapi soal-soal tersebut.</p>

<h3>Bab 1: Memahami Taksonomi Bloom dalam Konteks UTBK</h3>

<p>Taksonomi Bloom membagi kemampuan kognitif ke dalam enam tingkatan:</p>
<ol>
<li><strong>Mengingat (C1)</strong> — menghafal fakta dan konsep dasar.</li>
<li><strong>Memahami (C2)</strong> — menjelaskan ide atau konsep.</li>
<li><strong>Mengaplikasikan (C3)</strong> — menggunakan informasi dalam situasi baru.</li>
<li><strong>Menganalisis (C4)</strong> — menguraikan informasi menjadi bagian-bagian dan menemukan hubungan.</li>
<li><strong>Mengevaluasi (C5)</strong> — membuat penilaian berdasarkan kriteria tertentu.</li>
<li><strong>Mencipta (C6)</strong> — menghasilkan ide atau produk baru.</li>
</ol>

<p>Soal HOTS di UTBK umumnya berada di level C4 hingga C6. Peserta dituntut tidak sekadar menghafal, melainkan mampu mengolah informasi secara kritis.</p>

<h3>Bab 2: Ciri-Ciri Soal HOTS</h3>

<p>Berikut ciri soal HOTS yang sering muncul di UTBK:</p>
<ul>
<li>Menggunakan <strong>stimulus</strong> berupa teks, grafik, tabel, atau gambar yang harus dianalisis.</li>
<li>Mengharuskan peserta <strong>menarik kesimpulan</strong> yang tidak tersurat langsung.</li>
<li>Memiliki <strong>pengecoh (distractor)</strong> yang sangat mirip dengan jawaban benar.</li>
<li>Menuntut pemahaman <strong>hubungan sebab-akibat</strong> antar variabel.</li>
</ul>

<h3>Bab 3: Strategi Membaca Stimulus</h3>

<p>Langkah efektif membaca stimulus soal HOTS:</p>
<ol>
<li><strong>Baca pertanyaan terlebih dahulu</strong> sebelum membaca stimulus agar fokus terarah.</li>
<li><strong>Identifikasi kata kunci</strong> dalam pertanyaan seperti "penyebab utama", "kesimpulan yang tepat", atau "hubungan antara".</li>
<li><strong>Tandai informasi penting</strong> pada stimulus yang relevan dengan pertanyaan.</li>
<li><strong>Eliminasi jawaban yang jelas salah</strong> terlebih dahulu untuk mempersempit pilihan.</li>
</ol>

<h3>Bab 4: Teknik Eliminasi Distractor</h3>

<p>Distractor pada soal HOTS dirancang menjebak peserta yang hanya membaca sepintas. Gunakan teknik berikut:</p>
<ul>
<li><strong>Periksa kesesuaian dengan stimulus</strong> — jawaban harus didukung data yang tersedia.</li>
<li><strong>Waspadai jawaban yang terlalu absolut</strong> — kata "selalu", "tidak pernah", dan "semua" sering menjadi tanda distractor.</li>
<li><strong>Bandingkan dua jawaban terakhir</strong> — setelah eliminasi, cari perbedaan spesifik di antara keduanya.</li>
</ul>

<h3>Bab 5: Manajemen Waktu untuk Soal HOTS</h3>

<p>Soal HOTS membutuhkan waktu lebih lama dibanding soal hafalan. Strategi manajemen waktu:</p>

<table>
<tr><th>Jenis Soal</th><th>Alokasi Waktu</th><th>Proporsi</th></tr>
<tr><td>Soal mudah (C1-C2)</td><td>1-2 menit/soal</td><td>30%</td></tr>
<tr><td>Soal sedang (C3-C4)</td><td>2-3 menit/soal</td><td>40%</td></tr>
<tr><td>Soal sulit (C5-C6)</td><td>3-4 menit/soal</td><td>30%</td></tr>
</table>

<blockquote>Jangan terjebak pada satu soal terlalu lama. Jika dalam 4 menit belum menemukan jawaban, tandai dan lanjutkan ke soal berikutnya.</blockquote>

<h3>Bab 6: Latihan Pola Pikir Analitis</h3>

<p>Untuk meningkatkan kemampuan menjawab soal HOTS, lakukan latihan berikut secara rutin:</p>
<ul>
<li>Membaca artikel opini dan mengidentifikasi argumen utama serta kelemahan logika.</li>
<li>Menganalisis data statistik dari infografis dan menarik kesimpulan.</li>
<li>Berlatih soal-soal UTBK tahun sebelumnya dengan pembahasan mendalam.</li>
<li>Berdiskusi dengan teman untuk melatih kemampuan mengevaluasi berbagai sudut pandang.</li>
</ul>

<h3>Kesimpulan</h3>

<p>Kunci sukses menghadapi soal HOTS di UTBK adalah kombinasi latihan intensif, pemahaman struktur soal, dan manajemen waktu yang disiplin. Fokuskan persiapan pada kemampuan analisis dan evaluasi, bukan sekadar hafalan.</p>`,
    category: "UTBK",
    tags: ["utbk", "hots", "strategi", "penalaran"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-15"),
    pageCount: 35,
  },
  {
    title: "Literasi Bahasa Inggris UTBK",
    slug: "literasi-bahasa-inggris-utbk",
    description:
      "Panduan reading comprehension dan grammar UTBK",
    contentType: "HTML",
    htmlContent: `<h2>Panduan Literasi Bahasa Inggris UTBK-SNBT</h2>

<p>Subtes Literasi Bahasa Inggris di UTBK-SNBT menguji kemampuan memahami teks akademis berbahasa Inggris. Materi ini mencakup reading comprehension, pemahaman kosakata kontekstual, serta analisis struktur teks. Ebook ini menyajikan strategi lengkap untuk meraih skor maksimal.</p>

<h3>Bab 1: Jenis Teks yang Diujikan</h3>

<p>Teks dalam Literasi Bahasa Inggris UTBK biasanya berupa:</p>
<ul>
<li><strong>Expository text</strong> — menjelaskan suatu topik secara objektif (sains, teknologi, sosial).</li>
<li><strong>Argumentative text</strong> — menyajikan argumen dan kontra-argumen tentang suatu isu.</li>
<li><strong>Narrative/descriptive text</strong> — bercerita atau menggambarkan fenomena.</li>
</ul>

<p>Topik yang sering muncul meliputi lingkungan hidup, kesehatan, teknologi, pendidikan, dan isu sosial global.</p>

<h3>Bab 2: Teknik Skimming dan Scanning</h3>

<h4>Skimming</h4>
<p>Skimming adalah teknik membaca cepat untuk mendapatkan gambaran umum teks. Caranya:</p>
<ol>
<li>Baca judul dan subjudul teks.</li>
<li>Baca kalimat pertama dan terakhir setiap paragraf.</li>
<li>Perhatikan kata-kata yang dicetak tebal atau miring.</li>
</ol>

<h4>Scanning</h4>
<p>Scanning digunakan untuk mencari informasi spesifik. Langkahnya:</p>
<ol>
<li>Tentukan kata kunci dari pertanyaan.</li>
<li>Gerakkan mata secara cepat menyusuri teks untuk menemukan kata kunci tersebut.</li>
<li>Baca kalimat di sekitar kata kunci untuk memahami konteks.</li>
</ol>

<h3>Bab 3: Memahami Main Idea dan Supporting Details</h3>

<p>Pertanyaan tentang main idea adalah yang paling umum. Untuk menentukannya:</p>
<ul>
<li><strong>Main idea</strong> biasanya terdapat di kalimat pertama paragraf (topic sentence).</li>
<li><strong>Supporting details</strong> berupa contoh, data, atau penjelasan lanjutan yang mendukung main idea.</li>
<li>Perhatikan kata transisi seperti <em>furthermore</em>, <em>however</em>, <em>in contrast</em>, dan <em>therefore</em>.</li>
</ul>

<blockquote>Tips: Jika ditanya "What is the passage mainly about?", jawaban yang benar biasanya bersifat umum dan mencakup seluruh isi teks, bukan hanya satu paragraf.</blockquote>

<h3>Bab 4: Vocabulary in Context</h3>

<p>Soal kosakata di UTBK menanyakan makna kata berdasarkan konteks kalimat. Strategi menjawabnya:</p>
<ol>
<li>Baca kalimat lengkap yang mengandung kata tersebut.</li>
<li>Cari petunjuk konteks (context clues) seperti sinonim, antonim, atau definisi dalam kalimat.</li>
<li>Substitusikan setiap pilihan jawaban ke dalam kalimat dan periksa mana yang paling sesuai.</li>
</ol>

<h4>Jenis Context Clues</h4>
<table>
<tr><th>Jenis</th><th>Contoh Penanda</th><th>Contoh Kalimat</th></tr>
<tr><td>Definisi</td><td>is defined as, means, refers to</td><td>Photosynthesis <em>refers to</em> the process by which plants convert sunlight.</td></tr>
<tr><td>Sinonim</td><td>or, also known as, that is</td><td>The child was <em>lethargic</em>, <em>or</em> extremely tired.</td></tr>
<tr><td>Antonim</td><td>but, however, unlike, whereas</td><td>Unlike her <em>timid</em> sister, Anna was bold and outgoing.</td></tr>
<tr><td>Contoh</td><td>such as, for example, including</td><td>Legumes, <em>such as</em> beans and lentils, are rich in protein.</td></tr>
</table>

<h3>Bab 5: Inference Questions</h3>

<p>Soal inferensi meminta peserta menarik kesimpulan yang tidak dinyatakan secara eksplisit. Ciri pertanyaannya menggunakan kata-kata seperti:</p>
<ul>
<li>"It can be inferred that..."</li>
<li>"The author implies that..."</li>
<li>"What can be concluded from the passage?"</li>
</ul>

<p>Untuk menjawab soal inferensi, pastikan kesimpulan Anda didukung oleh informasi dalam teks dan tidak bertentangan dengan pernyataan penulis.</p>

<h3>Bab 6: Grammar Essentials untuk UTBK</h3>

<p>Beberapa poin grammar yang sering diujikan:</p>
<ul>
<li><strong>Subject-verb agreement</strong> — pastikan subjek dan kata kerja sesuai dalam jumlah.</li>
<li><strong>Tenses</strong> — kenali penggunaan simple present, past, present perfect, dan past perfect.</li>
<li><strong>Conditional sentences</strong> — pahami tipe 1 (real condition), tipe 2 (unreal present), dan tipe 3 (unreal past).</li>
<li><strong>Relative clauses</strong> — penggunaan who, which, that, whose, dan where.</li>
<li><strong>Connectors</strong> — although, despite, whereas, nevertheless, consequently.</li>
</ul>

<h3>Kesimpulan</h3>

<p>Literasi Bahasa Inggris UTBK menuntut kombinasi kemampuan membaca cepat, pemahaman kosakata kontekstual, dan kemampuan menarik inferensi. Latihan rutin dengan teks-teks akademis berbahasa Inggris adalah kunci utama keberhasilan.</p>`,
    category: "UTBK",
    tags: ["utbk", "literasi", "bahasa-inggris", "reading"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-20"),
    pageCount: 40,
  },
  {
    title: "Penalaran Matematika UTBK",
    slug: "penalaran-matematika-utbk-snbt",
    description:
      "Materi dan strategi penalaran matematika",
    contentType: "HTML",
    htmlContent: `<h2>Materi dan Strategi Penalaran Matematika UTBK-SNBT</h2>

<p>Subtes Penalaran Matematika di UTBK-SNBT menguji kemampuan peserta dalam menggunakan konsep matematika untuk menyelesaikan masalah. Berbeda dengan matematika konvensional, penalaran matematika lebih menekankan pada kemampuan berpikir logis dan penerapan konsep dalam konteks nyata.</p>

<h3>Bab 1: Ruang Lingkup Materi</h3>

<p>Materi yang diujikan dalam Penalaran Matematika UTBK meliputi:</p>
<ul>
<li><strong>Bilangan dan Operasinya</strong> — bilangan bulat, pecahan, rasio, proporsi, persentase.</li>
<li><strong>Aljabar</strong> — persamaan linear, kuadrat, sistem persamaan, fungsi, barisan dan deret.</li>
<li><strong>Geometri dan Pengukuran</strong> — bangun datar, bangun ruang, transformasi geometri.</li>
<li><strong>Statistika dan Peluang</strong> — ukuran pemusatan, penyebaran, distribusi data, probabilitas.</li>
<li><strong>Logika dan Penalaran</strong> — pola bilangan, penalaran deduktif dan induktif.</li>
</ul>

<h3>Bab 2: Penalaran Numerik</h3>

<p>Soal penalaran numerik menguji kemampuan mengolah angka dan data. Strategi penyelesaiannya:</p>

<h4>Teknik Estimasi</h4>
<p>Dalam banyak soal, estimasi lebih efisien daripada menghitung secara eksak. Contohnya:</p>
<ul>
<li>Bulatkan angka ke kelipatan terdekat sebelum menghitung.</li>
<li>Gunakan perbandingan antar pilihan jawaban untuk mengeliminasi yang tidak masuk akal.</li>
</ul>

<h4>Rasio dan Proporsi</h4>
<p>Rasio dan proporsi sering muncul dalam soal kontekstual. Rumus dasar yang harus dikuasai:</p>
<ul>
<li>Jika a : b = c : d, maka a x d = b x c (cross multiplication).</li>
<li>Persentase: bagian / keseluruhan x 100%.</li>
<li>Perubahan persentase: (nilai baru - nilai lama) / nilai lama x 100%.</li>
</ul>

<h3>Bab 3: Aljabar dalam Konteks UTBK</h3>

<p>Soal aljabar di UTBK sering disajikan dalam bentuk cerita. Langkah penyelesaian:</p>
<ol>
<li><strong>Identifikasi variabel</strong> — tentukan apa yang dicari dan nyatakan sebagai variabel.</li>
<li><strong>Buat model matematika</strong> — ubah informasi dalam soal menjadi persamaan.</li>
<li><strong>Selesaikan persamaan</strong> — gunakan metode yang sesuai (substitusi, eliminasi, atau faktorisasi).</li>
<li><strong>Verifikasi jawaban</strong> — pastikan jawaban memenuhi konteks soal.</li>
</ol>

<h4>Barisan dan Deret</h4>
<table>
<tr><th>Jenis</th><th>Rumus Suku ke-n</th><th>Rumus Jumlah n Suku</th></tr>
<tr><td>Aritmetika</td><td>Un = a + (n-1)b</td><td>Sn = n/2 (2a + (n-1)b)</td></tr>
<tr><td>Geometri</td><td>Un = a . r^(n-1)</td><td>Sn = a(r^n - 1) / (r - 1)</td></tr>
</table>

<h3>Bab 4: Statistika dan Interpretasi Data</h3>

<p>Soal statistika di UTBK biasanya menyajikan data dalam bentuk tabel atau diagram. Konsep penting:</p>

<h4>Ukuran Pemusatan Data</h4>
<ul>
<li><strong>Mean (rata-rata)</strong> — jumlah seluruh data dibagi banyaknya data.</li>
<li><strong>Median</strong> — nilai tengah setelah data diurutkan.</li>
<li><strong>Modus</strong> — nilai yang paling sering muncul.</li>
</ul>

<h4>Ukuran Penyebaran Data</h4>
<ul>
<li><strong>Jangkauan (range)</strong> — selisih data terbesar dan terkecil.</li>
<li><strong>Varians</strong> — rata-rata kuadrat deviasi dari mean.</li>
<li><strong>Simpangan baku</strong> — akar kuadrat dari varians, mengukur dispersi data.</li>
</ul>

<blockquote>Dalam soal UTBK, kemampuan membaca dan menginterpretasi grafik lebih penting daripada sekadar menghitung. Perhatikan label sumbu, satuan, dan tren data.</blockquote>

<h3>Bab 5: Peluang</h3>

<p>Konsep peluang yang sering diujikan:</p>
<ul>
<li><strong>Peluang kejadian tunggal:</strong> P(A) = n(A) / n(S), dengan n(A) = banyak kejadian yang diinginkan dan n(S) = banyak seluruh kemungkinan.</li>
<li><strong>Peluang kejadian majemuk:</strong> P(A atau B) = P(A) + P(B) - P(A dan B).</li>
<li><strong>Peluang kejadian independen:</strong> P(A dan B) = P(A) x P(B) jika A dan B saling bebas.</li>
</ul>

<h3>Bab 6: Tips Manajemen Waktu</h3>

<p>Strategi mengerjakan soal Penalaran Matematika secara efisien:</p>
<ol>
<li>Kerjakan soal yang Anda kuasai terlebih dahulu.</li>
<li>Gunakan teknik eliminasi jawaban jika perhitungan terlalu rumit.</li>
<li>Jangan menghabiskan lebih dari 3 menit pada satu soal di putaran pertama.</li>
<li>Periksa kembali soal-soal yang ditandai jika masih ada waktu tersisa.</li>
</ol>

<h3>Kesimpulan</h3>

<p>Penalaran Matematika UTBK membutuhkan pemahaman konsep yang kuat dan kemampuan menerapkannya dalam konteks masalah. Latihan soal secara rutin dan pemahaman pola soal adalah strategi paling efektif untuk meraih skor tinggi.</p>`,
    category: "UTBK",
    tags: ["utbk", "penalaran-matematika", "numerik", "aljabar"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-25"),
    pageCount: 50,
  },
  {
    title: "Panduan Pemilihan Jurusan & PTN",
    slug: "panduan-pemilihan-jurusan-ptn",
    description:
      "Strategi memilih prodi dan PTN",
    contentType: "HTML",
    htmlContent: `<h2>Panduan Strategis Memilih Jurusan dan PTN di SNBT</h2>

<p>Memilih program studi (prodi) dan Perguruan Tinggi Negeri (PTN) adalah keputusan penting yang mempengaruhi masa depan akademik dan karier. Ebook ini menyajikan panduan komprehensif untuk membuat keputusan yang tepat berdasarkan data, minat, dan peluang.</p>

<h3>Bab 1: Memahami Sistem Seleksi SNBT</h3>

<p>SNBT (Seleksi Nasional Berbasis Tes) adalah jalur seleksi masuk PTN berdasarkan hasil UTBK. Hal-hal penting yang perlu dipahami:</p>
<ul>
<li>Peserta dapat memilih <strong>maksimal 2 prodi</strong> dari 2 PTN yang berbeda, atau 2 prodi dari 1 PTN yang sama.</li>
<li><strong>Urutan pilihan mempengaruhi seleksi</strong> — pilihan pertama diprioritaskan.</li>
<li>Penilaian menggunakan <strong>skor UTBK</strong> yang mencakup seluruh subtes.</li>
<li>Passing grade bersifat dinamis dan berubah setiap tahun berdasarkan persaingan.</li>
</ul>

<h3>Bab 2: Mengenali Minat dan Bakat</h3>

<p>Sebelum memilih jurusan, lakukan introspeksi dengan menjawab pertanyaan berikut:</p>
<ol>
<li>Mata pelajaran apa yang paling Anda nikmati dan kuasai?</li>
<li>Kegiatan apa yang membuat Anda lupa waktu?</li>
<li>Apakah Anda lebih menyukai pekerjaan yang melibatkan data, orang, atau ide?</li>
<li>Bagaimana gaya belajar Anda — visual, auditori, atau kinestetik?</li>
</ol>

<h4>Kelompok Bidang Studi</h4>
<table>
<tr><th>Rumpun</th><th>Contoh Prodi</th><th>Karakteristik</th></tr>
<tr><td>Saintek</td><td>Kedokteran, Teknik, Farmasi, Informatika</td><td>Berpikir analitis, sains dan matematika kuat</td></tr>
<tr><td>Soshum</td><td>Hukum, Ekonomi, Psikologi, Hubungan Internasional</td><td>Komunikasi, analisis sosial, membaca intensif</td></tr>
<tr><td>Campuran</td><td>Arsitektur, Planologi, Manajemen</td><td>Kombinasi kemampuan teknis dan sosial</td></tr>
</table>

<h3>Bab 3: Riset Prodi dan PTN</h3>

<p>Lakukan riset mendalam sebelum menentukan pilihan:</p>

<h4>Faktor yang Perlu Dipertimbangkan</h4>
<ul>
<li><strong>Akreditasi</strong> — pilih prodi dengan akreditasi minimal B (Baik Sekali) atau Unggul dari BAN-PT.</li>
<li><strong>Kurikulum</strong> — pelajari mata kuliah yang akan ditempuh dan pastikan sesuai dengan minat.</li>
<li><strong>Prospek karier</strong> — cari tahu profesi yang bisa dimasuki oleh lulusan prodi tersebut.</li>
<li><strong>Fasilitas kampus</strong> — laboratorium, perpustakaan, dan fasilitas penunjang lainnya.</li>
<li><strong>Lokasi dan biaya hidup</strong> — pertimbangkan UKT dan biaya hidup di kota tempat PTN berada.</li>
<li><strong>Reputasi dosen dan penelitian</strong> — cek publikasi dan track record dosen di prodi tersebut.</li>
</ul>

<h3>Bab 4: Strategi Pemilihan Berdasarkan Data</h3>

<p>Gunakan data historis untuk membuat keputusan strategis:</p>

<h4>Analisis Daya Tampung dan Peminat</h4>
<ol>
<li>Cek <strong>daya tampung</strong> prodi di laman resmi SNPMB setiap tahun.</li>
<li>Bandingkan dengan <strong>jumlah peminat</strong> tahun-tahun sebelumnya.</li>
<li>Hitung <strong>rasio keketatan</strong> = jumlah peminat / daya tampung.</li>
<li>Semakin tinggi rasio, semakin ketat persaingan.</li>
</ol>

<blockquote>Strategi aman: Pilihan 1 untuk prodi impian (boleh ketat), Pilihan 2 untuk prodi dengan rasio keketatan lebih rendah sebagai pengaman.</blockquote>

<h4>Estimasi Skor Minimum</h4>
<p>Meskipun passing grade resmi tidak dipublikasikan, Anda bisa memperkirakan skor minimum dari:</p>
<ul>
<li>Data komunitas alumni dan forum diskusi UTBK.</li>
<li>Hasil try out skala nasional yang menyediakan simulasi ranking.</li>
<li>Rata-rata skor UTBK tahun sebelumnya untuk prodi serupa.</li>
</ul>

<h3>Bab 5: Kesalahan Umum dalam Memilih Jurusan</h3>

<p>Hindari kesalahan berikut yang sering dilakukan calon mahasiswa:</p>
<ul>
<li><strong>Ikut-ikutan teman</strong> — pilih berdasarkan minat sendiri, bukan pengaruh lingkungan.</li>
<li><strong>Hanya melihat gengsi</strong> — prodi populer belum tentu sesuai dengan bakat Anda.</li>
<li><strong>Mengabaikan prospek karier</strong> — pastikan prodi memiliki jalur karier yang jelas.</li>
<li><strong>Tidak riset kurikulum</strong> — banyak mahasiswa kecewa setelah mengetahui isi perkuliahan yang berbeda dari ekspektasi.</li>
<li><strong>Terlalu ambisius tanpa cadangan</strong> — selalu siapkan pilihan kedua yang realistis.</li>
</ul>

<h3>Bab 6: Timeline Persiapan</h3>

<p>Jadwal ideal persiapan pemilihan jurusan dan PTN:</p>

<table>
<tr><th>Waktu</th><th>Aktivitas</th></tr>
<tr><td>12 bulan sebelum UTBK</td><td>Eksplorasi minat dan bakat, mulai riset prodi</td></tr>
<tr><td>9 bulan sebelum</td><td>Tentukan 4-5 prodi kandidat, mulai belajar intensif</td></tr>
<tr><td>6 bulan sebelum</td><td>Persempit menjadi 2-3 prodi, ikuti try out berkala</td></tr>
<tr><td>3 bulan sebelum</td><td>Finalisasi 2 pilihan berdasarkan hasil try out</td></tr>
<tr><td>Saat pendaftaran</td><td>Daftarkan pilihan dengan percaya diri</td></tr>
</table>

<h3>Kesimpulan</h3>

<p>Pemilihan jurusan dan PTN harus didasarkan pada kombinasi minat pribadi, kemampuan akademik, dan analisis data persaingan. Jangan terburu-buru dalam mengambil keputusan. Lakukan riset menyeluruh, konsultasikan dengan guru BK atau mentor, dan gunakan hasil try out sebagai tolok ukur realistis kemampuan Anda.</p>`,
    category: "UTBK",
    tags: ["utbk", "jurusan", "ptn", "snbt", "karier"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-01"),
    pageCount: 30,
  },
];
