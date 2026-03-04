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

const twkHtml = `
<h2>Tes Wawasan Kebangsaan (TWK) — Panduan Lengkap CPNS</h2>

<p>Tes Wawasan Kebangsaan (TWK) merupakan salah satu komponen Seleksi Kompetensi Dasar (SKD) dalam seleksi CPNS. TWK menguji pemahaman peserta terhadap nilai-nilai kebangsaan Indonesia, termasuk Pancasila, UUD 1945, Negara Kesatuan Republik Indonesia (NKRI), dan Bhinneka Tunggal Ika. Passing grade TWK adalah 65 dari skor maksimal 150.</p>

<h3>Bab 1: Pancasila sebagai Dasar Negara</h3>

<h4>1.1 Sejarah Perumusan Pancasila</h4>
<p>Pancasila dirumuskan melalui sidang BPUPKI (Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan Indonesia) pada 29 Mei – 1 Juni 1945. Tiga tokoh utama yang menyampaikan gagasan dasar negara:</p>
<ul>
<li><strong>Muhammad Yamin</strong> (29 Mei 1945) — mengusulkan lima asas secara lisan dan tertulis</li>
<li><strong>Soepomo</strong> (31 Mei 1945) — mengusulkan konsep negara integralistik</li>
<li><strong>Soekarno</strong> (1 Juni 1945) — mengusulkan Pancasila dan memberi nama "Pancasila"</li>
</ul>
<p>Tanggal 1 Juni diperingati sebagai Hari Lahir Pancasila berdasarkan Keppres No. 24 Tahun 2016.</p>

<h4>1.2 Piagam Jakarta dan Perubahan Sila Pertama</h4>
<p>Panitia Sembilan menghasilkan Piagam Jakarta (Jakarta Charter) pada 22 Juni 1945. Rumusan awal sila pertama berbunyi "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya." Pada 18 Agustus 1945, atas usulan Mohammad Hatta setelah berkonsultasi dengan tokoh Indonesia Timur, frasa tersebut diubah menjadi <strong>"Ketuhanan Yang Maha Esa"</strong> demi persatuan bangsa.</p>

<h4>1.3 Fungsi dan Kedudukan Pancasila</h4>
<ol>
<li>Dasar negara (<em>philosophische grondslag</em>)</li>
<li>Pandangan hidup bangsa (<em>weltanschauung</em>)</li>
<li>Jiwa dan kepribadian bangsa</li>
<li>Perjanjian luhur bangsa</li>
<li>Sumber dari segala sumber hukum</li>
</ol>

<h3>Bab 2: UUD 1945</h3>

<h4>2.1 Struktur UUD 1945</h4>
<p>UUD 1945 setelah amandemen terdiri dari:</p>
<table>
<tr><th>Bagian</th><th>Keterangan</th></tr>
<tr><td>Pembukaan</td><td>4 alinea, tidak dapat diubah</td></tr>
<tr><td>Batang Tubuh</td><td>21 bab, 73 pasal, 170 ayat</td></tr>
<tr><td>Aturan Peralihan</td><td>3 pasal</td></tr>
<tr><td>Aturan Tambahan</td><td>2 pasal</td></tr>
</table>

<h4>2.2 Empat Kali Amandemen</h4>
<ul>
<li><strong>Amandemen I (1999)</strong> — pembatasan kekuasaan presiden, penguatan DPR</li>
<li><strong>Amandemen II (2000)</strong> — otonomi daerah, HAM (Pasal 28A–28J)</li>
<li><strong>Amandemen III (2001)</strong> — pembentukan MK, DPD, pemilu langsung</li>
<li><strong>Amandemen IV (2002)</strong> — penghapusan DPA, pendidikan dan kebudayaan</li>
</ul>

<h4>2.3 Lembaga Negara Pasca-Amandemen</h4>
<p>Tujuh lembaga negara utama: MPR, DPR, DPD, Presiden, BPK, MA, dan MK. Setelah amandemen, tidak ada lagi lembaga tertinggi negara — semua lembaga setara sesuai fungsi masing-masing.</p>

<h3>Bab 3: NKRI dan Bhinneka Tunggal Ika</h3>

<h4>3.1 Prinsip NKRI</h4>
<p>Pasal 1 ayat (1) UUD 1945 menegaskan bahwa Indonesia adalah negara kesatuan berbentuk republik. Prinsip-prinsip NKRI meliputi:</p>
<ul>
<li>Kedaulatan berada di tangan rakyat (Pasal 1 ayat 2)</li>
<li>Negara hukum (<em>rechtsstaat</em>) bukan negara kekuasaan (Pasal 1 ayat 3)</li>
<li>Otonomi daerah dalam kerangka NKRI (Pasal 18)</li>
<li>Wilayah negara sebagai negara kepulauan (<em>archipelagic state</em>)</li>
</ul>

<h4>3.2 Bhinneka Tunggal Ika</h4>
<p>Semboyan "Bhinneka Tunggal Ika" berasal dari kitab <em>Kakawin Sutasoma</em> karya Mpu Tantular pada masa Kerajaan Majapahit. Artinya "Berbeda-beda tetapi tetap satu." Semboyan ini tertulis pada lambang negara Garuda Pancasila dan menegaskan keberagaman suku, agama, ras, dan budaya dalam bingkai persatuan Indonesia.</p>

<blockquote>
<strong>Tips Ujian TWK:</strong> Hafalkan pasal-pasal kunci UUD 1945 (Pasal 1, 18, 27–34, 28A–28J) dan pahami konteks sejarah setiap amandemen. Soal TWK sering menguji pemahaman kontekstual, bukan sekadar hafalan.
</blockquote>
`;

const tkpHtml = `
<h2>Strategi Skor Maksimal TKP — Tes Karakteristik Pribadi CPNS</h2>

<p>Tes Karakteristik Pribadi (TKP) menguji aspek integritas, semangat berprestasi, kreativitas, orientasi pelayanan, kemampuan beradaptasi, pengendalian diri, kemampuan bekerja mandiri dan dalam tim, kemauan dan kemampuan belajar berkelanjutan, serta kemampuan menggerakkan dan mengkoordinir orang lain. Passing grade TKP adalah 166 dari skor maksimal 225.</p>

<h3>Bab 1: Memahami Sistem Penilaian TKP</h3>

<h4>1.1 Skema Penilaian</h4>
<p>Setiap soal TKP memiliki 5 pilihan jawaban dengan skor bertingkat:</p>
<table>
<tr><th>Skor</th><th>Keterangan</th></tr>
<tr><td>5</td><td>Jawaban paling ideal dan profesional</td></tr>
<tr><td>4</td><td>Jawaban baik namun kurang optimal</td></tr>
<tr><td>3</td><td>Jawaban netral atau cukup</td></tr>
<tr><td>2</td><td>Jawaban kurang tepat</td></tr>
<tr><td>1</td><td>Jawaban paling tidak diharapkan</td></tr>
</table>
<p>Dengan 45 soal, skor maksimal adalah 45 x 5 = 225. Target realistis adalah minimal 37 soal dengan skor 5 dan sisanya skor 4.</p>

<h4>1.2 Perbedaan TKP dengan Tes Lainnya</h4>
<p>Berbeda dengan TIU dan TWK yang memiliki jawaban benar-salah, TKP bersifat <em>situational judgment test</em> (SJT). Tidak ada jawaban yang bernilai 0, sehingga setiap soal berkontribusi minimal 1 poin. Kuncinya adalah konsisten memilih jawaban bernilai 5.</p>

<h3>Bab 2: Pola Jawaban Skor 5</h3>

<h4>2.1 Prinsip Umum Jawaban Skor Tertinggi</h4>
<ul>
<li><strong>Proaktif</strong> — mengambil inisiatif, tidak menunggu perintah</li>
<li><strong>Solutif</strong> — fokus pada penyelesaian masalah, bukan menyalahkan</li>
<li><strong>Profesional</strong> — mendahulukan kepentingan organisasi dan tugas</li>
<li><strong>Kolaboratif</strong> — mengutamakan koordinasi dan kerja tim</li>
<li><strong>Empatik</strong> — menunjukkan kepedulian terhadap orang lain</li>
</ul>

<h4>2.2 Aspek Pelayanan Publik</h4>
<p>Soal pelayanan publik adalah aspek terpenting dalam TKP. Jawaban skor 5 selalu menunjukkan:</p>
<ol>
<li>Mengutamakan kepuasan masyarakat sebagai prioritas utama</li>
<li>Memberikan pelayanan tanpa diskriminasi</li>
<li>Menyelesaikan keluhan dengan cepat dan solutif</li>
<li>Bersikap ramah, sabar, dan profesional dalam segala situasi</li>
<li>Mencari cara inovatif untuk meningkatkan kualitas layanan</li>
</ol>

<h4>2.3 Aspek Integritas dan Kejujuran</h4>
<p>Pada soal integritas, jawaban terbaik selalu mengedepankan:</p>
<ul>
<li>Konsistensi antara ucapan dan tindakan</li>
<li>Menolak segala bentuk gratifikasi dan korupsi</li>
<li>Berani melaporkan pelanggaran melalui jalur yang tepat</li>
<li>Transparan dalam setiap proses kerja</li>
</ul>

<h3>Bab 3: Strategi Menjawab per Situasi</h3>

<h4>3.1 Konflik dengan Rekan Kerja</h4>
<p>Pola jawaban: musyawarah langsung dengan pihak terkait, cari solusi bersama, libatkan atasan hanya jika diperlukan. Hindari jawaban yang mendiamkan masalah atau langsung melaporkan ke atasan tanpa upaya komunikasi terlebih dahulu.</p>

<h4>3.2 Tekanan Pekerjaan</h4>
<p>Pola jawaban: buat prioritas, kelola waktu dengan baik, minta bantuan jika diperlukan tanpa mengabaikan tanggung jawab utama. Jawaban skor rendah biasanya mengeluh, menolak tugas, atau memindahkan tanggung jawab kepada orang lain.</p>

<h4>3.3 Dilema Etika</h4>
<p>Pola jawaban: selalu pilih opsi yang sesuai aturan dan kode etik ASN, bahkan jika itu pilihan yang lebih sulit. Jangan pernah memilih jawaban yang mengambil jalan pintas meskipun tampak praktis.</p>

<blockquote>
<strong>Tips Penting:</strong> Pada TKP, jawaban yang terkesan "terlalu baik" atau idealis justru biasanya bernilai skor 5. Jangan berpikir pragmatis — berpikirlah sebagai ASN ideal yang mengutamakan integritas dan pelayanan.
</blockquote>
`;

const skbHtml = `
<h2>SKB Administrasi Negara — Panduan Seleksi Kompetensi Bidang</h2>

<p>Seleksi Kompetensi Bidang (SKB) merupakan tahap seleksi CPNS setelah peserta lolos SKD. SKB menguji kompetensi teknis, manajerial, dan sosial kultural sesuai formasi jabatan yang dilamar. Untuk formasi administrasi negara, materi mencakup ilmu administrasi publik, kebijakan publik, manajemen ASN, dan tata kelola pemerintahan.</p>

<h3>Bab 1: Dasar-Dasar Administrasi Publik</h3>

<h4>1.1 Pengertian dan Ruang Lingkup</h4>
<p>Administrasi publik adalah proses pengelolaan sumber daya oleh organisasi pemerintah untuk melayani kepentingan publik. Ruang lingkup mencakup:</p>
<ul>
<li><strong>Organisasi publik</strong> — struktur, desain, dan reformasi birokrasi</li>
<li><strong>Manajemen publik</strong> — perencanaan, pelaksanaan, pengawasan program</li>
<li><strong>Kebijakan publik</strong> — formulasi, implementasi, dan evaluasi kebijakan</li>
<li><strong>Pelayanan publik</strong> — standar, inovasi, dan akuntabilitas layanan</li>
<li><strong>Etika administrasi</strong> — kode etik, integritas, dan good governance</li>
</ul>

<h4>1.2 Paradigma Administrasi Publik</h4>
<p>Perkembangan paradigma administrasi publik:</p>
<ol>
<li><strong>Old Public Administration (OPA)</strong> — birokrasi klasik Weber, hierarkis, rule-based</li>
<li><strong>New Public Management (NPM)</strong> — orientasi hasil, efisiensi, privatisasi sebagian layanan</li>
<li><strong>New Public Service (NPS)</strong> — pelayanan publik sebagai prioritas, partisipasi warga negara</li>
<li><strong>Digital Era Governance (DEG)</strong> — transformasi digital, e-government, data-driven policy</li>
</ol>

<h3>Bab 2: Manajemen ASN</h3>

<h4>2.1 Undang-Undang ASN</h4>
<p>UU No. 20 Tahun 2023 tentang ASN menggantikan UU No. 5 Tahun 2014. Perubahan utama meliputi:</p>
<table>
<tr><th>Aspek</th><th>Ketentuan</th></tr>
<tr><td>Jenis Pegawai</td><td>PNS dan PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)</td></tr>
<tr><td>Sistem Merit</td><td>Pengangkatan berdasarkan kompetensi, kualifikasi, dan kinerja</td></tr>
<tr><td>Manajemen Kinerja</td><td>SKP (Sasaran Kinerja Pegawai) berbasis outcome</td></tr>
<tr><td>Pengembangan</td><td>Hak pengembangan kompetensi minimal 20 JP per tahun</td></tr>
<tr><td>Disiplin</td><td>PP No. 94 Tahun 2021 tentang Disiplin PNS</td></tr>
</table>

<h4>2.2 Jabatan ASN</h4>
<p>Klasifikasi jabatan ASN terdiri dari:</p>
<ul>
<li><strong>Jabatan Administrasi</strong> — Pengatur, Pengelola, Analis (JA)</li>
<li><strong>Jabatan Fungsional</strong> — keahlian dan keterampilan tertentu (JF)</li>
<li><strong>Jabatan Pimpinan Tinggi</strong> — pratama, madya, utama (JPT)</li>
</ul>

<h3>Bab 3: Kebijakan dan Pelayanan Publik</h3>

<h4>3.1 Siklus Kebijakan Publik</h4>
<ol>
<li><strong>Agenda setting</strong> — identifikasi masalah publik yang membutuhkan intervensi pemerintah</li>
<li><strong>Formulasi</strong> — penyusunan alternatif solusi dan rancangan kebijakan</li>
<li><strong>Adopsi</strong> — pengesahan kebijakan oleh otoritas berwenang</li>
<li><strong>Implementasi</strong> — pelaksanaan kebijakan oleh birokrasi</li>
<li><strong>Evaluasi</strong> — penilaian dampak dan efektivitas kebijakan</li>
</ol>

<h4>3.2 Standar Pelayanan Publik</h4>
<p>Berdasarkan UU No. 25 Tahun 2009 tentang Pelayanan Publik, setiap penyelenggara wajib menyusun standar pelayanan yang mencakup: persyaratan, prosedur, waktu penyelesaian, biaya, produk layanan, dan penanganan pengaduan. Penilaian kualitas layanan dilakukan melalui Survei Kepuasan Masyarakat (SKM).</p>

<blockquote>
<strong>Tips SKB:</strong> Pelajari regulasi terbaru terkait ASN dan pemerintahan. Soal SKB administrasi sering mengacu pada UU ASN, UU Pelayanan Publik, dan kebijakan reformasi birokrasi terkini. Pahami konsep, bukan sekadar menghafal pasal.
</blockquote>
`;

const catHtml = `
<h2>Panduan Sistem CAT BKN dan Simulasi Ujian CPNS</h2>

<p>Computer Assisted Test (CAT) BKN adalah sistem ujian berbasis komputer yang digunakan untuk seleksi CPNS di Indonesia. Memahami sistem CAT, strategi manajemen waktu, dan tips teknis pelaksanaan sangat penting untuk memaksimalkan performa saat hari ujian.</p>

<h3>Bab 1: Mengenal Sistem CAT BKN</h3>

<h4>1.1 Apa Itu CAT BKN?</h4>
<p>CAT BKN dikembangkan oleh Badan Kepegawaian Negara sebagai sistem seleksi yang transparan, objektif, akuntabel, dan bebas korupsi. Fitur utama sistem CAT:</p>
<ul>
<li>Soal ditampilkan satu per satu di layar komputer</li>
<li>Peserta dapat berpindah soal secara bebas (maju atau mundur)</li>
<li>Jawaban tersimpan otomatis setiap kali peserta memilih opsi</li>
<li>Timer berjalan otomatis dan terlihat di layar</li>
<li>Skor langsung muncul setelah waktu habis atau peserta menyelesaikan ujian</li>
<li>Soal diacak untuk setiap peserta sehingga berbeda urutannya</li>
</ul>

<h4>1.2 Spesifikasi Teknis SKD</h4>
<table>
<tr><th>Komponen</th><th>Jumlah Soal</th><th>Waktu</th><th>Passing Grade</th></tr>
<tr><td>TWK</td><td>30 soal</td><td rowspan="3">100 menit total</td><td>65</td></tr>
<tr><td>TIU</td><td>35 soal</td><td>80</td></tr>
<tr><td>TKP</td><td>45 soal</td><td>166</td></tr>
</table>
<p>Total 110 soal dalam 100 menit. Rata-rata waktu per soal kurang dari 55 detik. Peserta harus memenuhi <strong>semua</strong> passing grade untuk lolos — gagal di satu komponen berarti tidak lolos meskipun total skor tinggi.</p>

<h3>Bab 2: Strategi Manajemen Waktu</h3>

<h4>2.1 Pembagian Waktu Ideal</h4>
<p>Strategi alokasi waktu yang direkomendasikan:</p>
<ol>
<li><strong>TKP (45 soal)</strong> — kerjakan pertama, alokasi 25–30 menit. TKP tidak memerlukan perhitungan rumit, cukup pilih jawaban paling ideal.</li>
<li><strong>TWK (30 soal)</strong> — kerjakan kedua, alokasi 25–30 menit. Soal berbasis pengetahuan, jawab yang yakin langsung.</li>
<li><strong>TIU (35 soal)</strong> — kerjakan terakhir, sisa waktu 40–50 menit. TIU membutuhkan waktu berpikir paling lama karena ada hitungan dan analisis.</li>
</ol>

<h4>2.2 Teknik Pengerjaan Efisien</h4>
<ul>
<li><strong>Aturan 30 detik:</strong> Jika dalam 30 detik belum menemukan jawaban, tandai soal dan lanjut ke berikutnya</li>
<li><strong>Jangan kosongkan jawaban:</strong> Pilih jawaban terbaik meskipun ragu — khususnya TKP yang tidak ada skor 0</li>
<li><strong>Review di akhir:</strong> Gunakan sisa waktu untuk mengecek soal yang ditandai</li>
<li><strong>Jangan terpaku:</strong> Satu soal sulit tidak sebanding dengan 3 soal mudah yang terlewat</li>
</ul>

<h3>Bab 3: Tips Teknis Hari Pelaksanaan</h3>

<h4>3.1 Persiapan Sebelum Ujian</h4>
<ul>
<li>Datang minimal 60 menit sebelum jadwal untuk registrasi dan verifikasi</li>
<li>Bawa kartu peserta ujian, KTP asli, dan dokumen yang diminta</li>
<li>Tidak diperkenankan membawa HP, jam tangan pintar, atau alat elektronik</li>
<li>Istirahat cukup malam sebelumnya dan sarapan yang bergizi</li>
</ul>

<h4>3.2 Saat Mengerjakan</h4>
<ul>
<li>Perhatikan petunjuk penggunaan aplikasi CAT saat briefing</li>
<li>Pastikan mouse dan keyboard berfungsi — laporkan jika ada kendala teknis sebelum ujian dimulai</li>
<li>Fokus pada layar sendiri, jangan terpengaruh peserta lain</li>
<li>Gunakan fitur tandai (flag) untuk soal yang ingin direview</li>
<li>Perhatikan timer yang ditampilkan di pojok layar secara berkala</li>
</ul>

<h4>3.3 Setelah Ujian</h4>
<p>Skor akan ditampilkan langsung di layar setelah ujian selesai. Peserta akan menandatangani berita acara dan hasil skor. Hasil resmi diumumkan melalui portal SSCASN BKN sesuai jadwal yang ditetapkan oleh panitia seleksi nasional.</p>

<blockquote>
<strong>Tips Simulasi:</strong> Manfaatkan simulasi CAT yang tersedia di platform Toutopia untuk membiasakan diri dengan tampilan dan mekanisme sistem. Latihan rutin dengan timer akan membangun kecepatan dan akurasi menjawab soal.
</blockquote>
`;

export const EBOOKS_CPNS: SeedEbook[] = [
  {
    title: "TWK Lengkap CPNS",
    slug: "twk-lengkap-cpns",
    description:
      "Materi Tes Wawasan Kebangsaan: Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika",
    contentType: "HTML",
    htmlContent: twkHtml,
    category: "CPNS",
    tags: ["cpns", "twk", "pancasila", "uud-1945"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-05"),
    pageCount: 45,
  },
  {
    title: "TKP Strategi Skor Maksimal",
    slug: "tkp-strategi-skor-maksimal-cpns",
    description:
      "Tes Karakteristik Pribadi: pola jawaban skor 5",
    contentType: "HTML",
    htmlContent: tkpHtml,
    category: "CPNS",
    tags: ["cpns", "tkp", "karakteristik-pribadi", "sjt"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-10"),
    pageCount: 35,
  },
  {
    title: "SKB Administrasi Negara",
    slug: "skb-administrasi-negara-cpns",
    description:
      "Seleksi Kompetensi Bidang untuk formasi administrasi",
    contentType: "HTML",
    htmlContent: skbHtml,
    category: "CPNS",
    tags: ["cpns", "skb", "administrasi", "pemerintahan"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-15"),
    pageCount: 40,
  },
  {
    title: "Panduan CAT BKN & Simulasi",
    slug: "panduan-cat-bkn-simulasi",
    description:
      "Mengenal sistem CAT, strategi waktu, dan tips teknis",
    contentType: "HTML",
    htmlContent: catHtml,
    category: "CPNS",
    tags: ["cpns", "cat-bkn", "simulasi", "strategi"],
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-20"),
    pageCount: 25,
  },
];
