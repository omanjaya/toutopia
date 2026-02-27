import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// QUESTION BANK — organized by subject slug
// ============================================================

interface SeedQuestion {
  content: string;
  explanation: string;
  difficulty: "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: { label: string; content: string; isCorrect: boolean }[];
}

// Helper to create 5 options
function opts(a: string, b: string, c: string, d: string, e: string, correct: number): SeedQuestion["options"] {
  return ["A", "B", "C", "D", "E"].map((label, i) => ({
    label,
    content: [a, b, c, d, e][i],
    isCorrect: i === correct,
  }));
}

// We'll store questions keyed by subject slug
const QUESTIONS: Record<string, SeedQuestion[]> = {
  // === UTBK TPS ===
  "penalaran-umum": [
    { content: "Di negara fiktif Eldoria, semua diplomat harus menguasai minimal 3 bahasa. Sebagian diplomat yang menguasai lebih dari 4 bahasa ditempatkan di divisi khusus. Diplomat bernama Kaelen menguasai 5 bahasa.\n\nManakah simpulan yang PASTI BENAR?", explanation: "Kaelen menguasai 5 bahasa (>3, memenuhi syarat diplomat). Karena 5 > 4, Kaelen termasuk diplomat yang menguasai lebih dari 4 bahasa. Namun hanya 'sebagian' yang ditempatkan di divisi khusus, jadi Kaelen MUNGKIN ditempatkan di divisi khusus. Jawaban C adalah implikasi yang pasti benar: jika Kaelen di divisi khusus, ia pasti menguasai lebih dari 4 bahasa.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Kaelen pasti ditempatkan di divisi khusus", "Semua diplomat menguasai 5 bahasa", "Jika Kaelen di divisi khusus, ia menguasai lebih dari 4 bahasa", "Kaelen adalah satu-satunya diplomat dengan 5 bahasa", "Tidak ada diplomat yang menguasai kurang dari 3 bahasa", 2) },
    { content: "Perusahaan fiktif Nexora memiliki aturan: Semua manajer wajib mengikuti pelatihan kepemimpinan. Sebagian peserta pelatihan kepemimpinan mendapat sertifikasi internasional. Tidak ada karyawan bersertifikasi internasional yang boleh dipindahkan ke cabang daerah. Rina adalah seorang manajer.\n\nManakah pernyataan yang PASTI BENAR?", explanation: "Rina manajer → wajib ikut pelatihan. Sebagian peserta pelatihan → sertifikasi internasional. Sertifikasi → tidak boleh dipindah cabang daerah. Jika Rina mendapat sertifikasi, ia tidak boleh dipindah. Ini implikasi logis yang pasti benar (C).", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Rina pasti mendapat sertifikasi internasional", "Rina tidak boleh dipindahkan ke cabang daerah", "Jika Rina bersertifikasi internasional, ia tidak boleh dipindah ke cabang daerah", "Semua manajer mendapat sertifikasi internasional", "Rina adalah satu-satunya manajer yang ikut pelatihan", 2) },
    { content: "Perhatikan pola berikut:\n2, 6, 18, 54, ...\n\nBerapakah angka selanjutnya?", explanation: "Pola: setiap angka dikalikan 3. 2×3=6, 6×3=18, 18×3=54, 54×3=162.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("108", "162", "148", "172", "186", 1) },
    { content: "Di kota fiktif Velmara, terdapat 5 gedung berturut-turut: A, B, C, D, E. Gedung perpustakaan berada tepat di antara kantor pos dan rumah sakit. Kantor pos tidak berada di ujung deretan. Museum berada di sebelah kanan rumah sakit. Gedung E adalah sekolah yang berada di posisi paling kiri.\n\nDi gedung mana perpustakaan berada?", explanation: "E = sekolah (paling kiri/posisi 1). Kantor pos tidak di ujung, jadi di posisi 2, 3, atau 4. Museum di kanan rumah sakit. Perpustakaan di antara kantor pos dan rumah sakit. Dengan trial: E(sekolah) - B(kantor pos) - C(perpustakaan) - D(rumah sakit) - A(museum). Perpustakaan = C.", difficulty: "HARD", type: "SINGLE_CHOICE", options: opts("A", "B", "C", "D", "Tidak dapat ditentukan", 2) },
    { content: "Pola angka: 3, 5, 9, 15, 23, ...\n\nBerapakah angka selanjutnya?", explanation: "Selisih: 2, 4, 6, 8, ... (bertambah 2). Selisih berikutnya = 10. Jadi 23 + 10 = 33.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("29", "31", "33", "35", "37", 2) },
    { content: "Sebuah survei fiktif di Kota Meridian menunjukkan:\n- 60% penduduk menggunakan transportasi umum\n- 45% menggunakan kendaraan pribadi\n- 20% menggunakan keduanya\n\nBerapa persen penduduk yang tidak menggunakan transportasi umum maupun kendaraan pribadi?", explanation: "P(A∪B) = P(A) + P(B) - P(A∩B) = 60% + 45% - 20% = 85%. Yang tidak menggunakan keduanya = 100% - 85% = 15%.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("5%", "10%", "15%", "20%", "25%", 2) },
    { content: "Di organisasi fiktif Celestia, berlaku aturan:\n1. Jika seseorang adalah anggota senior, maka ia memiliki hak suara\n2. Jika seseorang memiliki hak suara, maka ia boleh menghadiri rapat tahunan\n3. Arya bukan anggota senior\n\nManakah yang PASTI BENAR?", explanation: "Premis 1: Senior → hak suara. Premis 2: Hak suara → boleh rapat. Arya bukan senior. Dari aturan 1, kita tidak bisa menyimpulkan bahwa Arya TIDAK punya hak suara (karena mungkin ada cara lain mendapat hak suara). Jawaban D benar: kita tidak bisa menyimpulkan apakah Arya punya hak suara atau tidak.", difficulty: "HARD", type: "SINGLE_CHOICE", options: opts("Arya tidak memiliki hak suara", "Arya tidak boleh menghadiri rapat tahunan", "Arya pasti memiliki hak suara dari sumber lain", "Tidak dapat dipastikan apakah Arya memiliki hak suara", "Arya adalah anggota junior", 3) },
    { content: "Jika semua kucing adalah hewan dan sebagian hewan berbulu, manakah kesimpulan yang VALID?", explanation: "Semua kucing = hewan (pasti). Sebagian hewan berbulu. Maka sebagian kucing MUNGKIN berbulu. Tidak semua kucing pasti berbulu. Jawaban C tepat.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Semua kucing berbulu", "Tidak ada kucing yang berbulu", "Sebagian kucing mungkin berbulu", "Semua hewan berbulu adalah kucing", "Tidak ada hubungan kucing dengan bulu", 2) },
    { content: "Perhatikan deret: 1, 1, 2, 3, 5, 8, 13, ...\n\nBerapakah dua angka selanjutnya?", explanation: "Ini adalah deret Fibonacci: setiap angka adalah jumlah dari dua angka sebelumnya. 8+13=21, 13+21=34.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("20, 33", "21, 34", "19, 32", "21, 35", "22, 36", 1) },
    { content: "Di Planet fiktif Zytorix, terdapat 4 spesies: Alpha, Beta, Gamma, Delta.\n- Semua Alpha bisa terbang\n- Sebagian Beta bisa bernapas di air\n- Tidak ada Gamma yang bisa terbang\n- Semua Delta adalah turunan dari Alpha\n\nManakah yang PASTI BENAR?", explanation: "Delta turunan Alpha → Delta bisa terbang (karena semua Alpha bisa terbang). Tidak ada Gamma bisa terbang → Delta bukan Gamma. Jawaban B pasti benar.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Semua Beta bisa bernapas di air", "Semua Delta bisa terbang", "Tidak ada Beta yang bisa terbang", "Semua Alpha adalah Delta", "Gamma bisa bernapas di air", 1) },
  ],
  "pengetahuan-kuantitatif": [
    { content: "Sebuah toko fiktif 'Galaksi Mart' memberikan diskon bertingkat: diskon 20% untuk pembelian di atas Rp500.000, dan tambahan diskon 10% dari harga setelah diskon pertama untuk pembelian di atas Rp1.000.000. Jika Andi membeli barang senilai Rp1.200.000, berapa yang harus dibayar?", explanation: "Diskon 20%: 1.200.000 × 0.8 = 960.000. Karena harga awal > 1.000.000, dapat diskon tambahan 10%: 960.000 × 0.9 = 864.000.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Rp 840.000", "Rp 864.000", "Rp 960.000", "Rp 900.000", "Rp 880.000", 1) },
    { content: "Rasio luas kebun jeruk dan kebun mangga di Desa Harmoni adalah 3:5. Jika luas kebun jeruk 1.200 m², berapakah luas total kedua kebun?", explanation: "Jeruk:Mangga = 3:5. Jeruk = 1.200 m². 1 bagian = 1.200/3 = 400 m². Mangga = 5 × 400 = 2.000 m². Total = 1.200 + 2.000 = 3.200 m².", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("2.800 m²", "3.000 m²", "3.200 m²", "3.400 m²", "3.600 m²", 2) },
    { content: "Populasi bakteri fiktif Xenobium berlipat ganda setiap 3 jam. Jika populasi awal adalah 500, berapa populasi setelah 12 jam?", explanation: "12 jam / 3 jam = 4 kali lipat ganda. 500 × 2⁴ = 500 × 16 = 8.000.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("4.000", "6.000", "8.000", "10.000", "16.000", 2) },
    { content: "Jika rata-rata nilai 5 siswa adalah 78, dan nilai tertinggi dihapus maka rata-rata menjadi 75. Berapakah nilai tertinggi?", explanation: "Total 5 siswa = 5 × 78 = 390. Total 4 siswa = 4 × 75 = 300. Nilai tertinggi = 390 - 300 = 90.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("85", "88", "90", "92", "95", 2) },
    { content: "Perusahaan Orbit Corp membeli 3 mesin A seharga Rp2.400.000/unit dan 5 mesin B. Total pembelian Rp19.200.000. Berapa harga per unit mesin B?", explanation: "3 × 2.400.000 = 7.200.000. Sisa = 19.200.000 - 7.200.000 = 12.000.000. Harga B = 12.000.000 / 5 = 2.400.000.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Rp 2.000.000", "Rp 2.200.000", "Rp 2.400.000", "Rp 2.600.000", "Rp 2.800.000", 2) },
    { content: "Sebuah tangki air fiktif berbentuk tabung memiliki diameter 2 meter dan tinggi 3 meter. Jika 1 m³ = 1.000 liter, berapa kapasitas tangki? (gunakan π = 3,14)", explanation: "r = 1m. Volume = π × r² × t = 3,14 × 1 × 3 = 9,42 m³. Kapasitas = 9.420 liter.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("6.280 liter", "9.420 liter", "12.560 liter", "18.840 liter", "3.140 liter", 1) },
    { content: "Data penjualan Toko Nebula selama 6 hari: 45, 52, 38, 61, 47, 55. Berapakah median penjualan?", explanation: "Urutkan: 38, 45, 47, 52, 55, 61. Median (data genap) = (47+52)/2 = 49,5.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("47", "49,5", "50", "52", "48", 1) },
    { content: "Sebuah pinjaman Rp10.000.000 dengan bunga sederhana 12% per tahun. Berapa total yang harus dibayar setelah 2,5 tahun?", explanation: "Bunga = 10.000.000 × 12% × 2,5 = 3.000.000. Total = 10.000.000 + 3.000.000 = 13.000.000.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Rp 12.000.000", "Rp 12.400.000", "Rp 13.000.000", "Rp 13.200.000", "Rp 14.000.000", 2) },
  ],
  "penalaran-matematika": [
    { content: "Fungsi f(x) = 2x² - 8x + 6 memiliki nilai minimum. Tentukan nilai minimum tersebut.", explanation: "f(x) = 2(x² - 4x) + 6 = 2(x² - 4x + 4 - 4) + 6 = 2(x-2)² - 8 + 6 = 2(x-2)² - 2. Nilai minimum = -2 saat x = 2.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("-4", "-2", "0", "2", "6", 1) },
    { content: "Sebuah dadu dilempar 2 kali. Berapa peluang jumlah mata dadu lebih dari 10?", explanation: "Kemungkinan jumlah > 10: (5,6), (6,5), (6,6) = 3 kejadian. Total = 36. Peluang = 3/36 = 1/12.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("1/6", "1/9", "1/12", "1/18", "1/36", 2) },
    { content: "Barisan aritmatika memiliki suku ke-3 = 11 dan suku ke-7 = 23. Tentukan suku ke-15.", explanation: "U3 = a + 2b = 11, U7 = a + 6b = 23. Selisih: 4b = 12, b = 3. a = 11 - 6 = 5. U15 = 5 + 14(3) = 47.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("41", "44", "47", "50", "53", 2) },
    { content: "Jika log₂(x) + log₂(x-2) = 3, tentukan nilai x.", explanation: "log₂(x(x-2)) = 3 → x(x-2) = 8 → x² - 2x - 8 = 0 → (x-4)(x+2) = 0. x = 4 (x = -2 tidak valid karena log negatif).", difficulty: "HARD", type: "SINGLE_CHOICE", options: opts("2", "3", "4", "5", "6", 2) },
    { content: "Sebuah kotak berisi 4 bola merah dan 6 bola biru. Diambil 2 bola sekaligus. Berapa peluang terambil 1 merah dan 1 biru?", explanation: "C(4,1) × C(6,1) / C(10,2) = (4 × 6) / 45 = 24/45 = 8/15.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("4/15", "8/15", "2/5", "1/3", "12/45", 1) },
    { content: "Diketahui f(x) = 3x - 2 dan g(x) = x² + 1. Tentukan (f ∘ g)(2).", explanation: "g(2) = 4 + 1 = 5. f(g(2)) = f(5) = 15 - 2 = 13.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("11", "13", "15", "17", "19", 1) },
    { content: "Jika sin α = 3/5 dan α di kuadran I, tentukan nilai cos 2α.", explanation: "cos α = 4/5. cos 2α = 1 - 2sin²α = 1 - 2(9/25) = 1 - 18/25 = 7/25.", difficulty: "HARD", type: "SINGLE_CHOICE", options: opts("7/25", "24/25", "-7/25", "14/25", "16/25", 0) },
    { content: "Tentukan jumlah 20 suku pertama deret aritmatika: 5, 9, 13, 17, ...", explanation: "a = 5, b = 4, n = 20. S20 = 20/2 × (2(5) + 19(4)) = 10 × (10 + 76) = 10 × 86 = 860.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("800", "830", "860", "890", "920", 2) },
  ],
  "literasi-bahasa-indonesia": [
    { content: "Bacalah teks berikut.\n\nPeneliti dari Institut Oceanis Nusantara menemukan bahwa terumbu karang di perairan fiktif Kepulauan Azura mengalami pemutihan massal. Data menunjukkan 67% terumbu terdampak dalam 2 tahun terakhir. Dr. Maharani, ketua tim peneliti, menyatakan bahwa kenaikan suhu permukaan laut sebesar 1,5°C menjadi faktor utama. Namun, aktivitas penangkapan ikan menggunakan bom dan sianida turut memperparah kondisi.\n\nPemerintah setempat berencana menetapkan zona perlindungan laut seluas 5.000 hektar. Kebijakan ini mendapat dukungan dari nelayan tradisional yang merasakan penurunan hasil tangkapan hingga 40% dalam setahun.\n\nManakah gagasan utama paragraf pertama?", explanation: "Paragraf 1 membahas temuan pemutihan terumbu karang di Kepulauan Azura dengan penyebab utama kenaikan suhu laut. Gagasan utama = pemutihan massal terumbu karang dan faktor penyebabnya.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Pemerintah menetapkan zona perlindungan laut", "Pemutihan massal terumbu karang dan faktor penyebabnya", "Penurunan hasil tangkapan nelayan tradisional", "Aktivitas penangkapan ikan menggunakan bom", "Dr. Maharani memimpin penelitian terumbu karang", 1) },
    { content: "Berdasarkan teks di atas, manakah INFERENSI yang paling tepat?", explanation: "Dari fakta: 67% terumbu terdampak + suhu naik 1,5°C + penangkapan destruktif → tanpa intervensi, kerusakan akan berlanjut. Ini inferensi logis yang didukung data.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Semua nelayan mendukung zona perlindungan", "Tanpa intervensi, ekosistem terumbu karang akan terus memburuk", "Kenaikan suhu laut hanya terjadi di Kepulauan Azura", "Penangkapan ikan bom adalah satu-satunya penyebab kerusakan", "Zona perlindungan akan mengembalikan semua terumbu", 1) },
    { content: "Kalimat berikut yang PALING EFEKTIF adalah...", explanation: "Kalimat efektif harus memenuhi: kepaduan, kehematan, ketepatan, dan kelogisan. Pilihan A redundan ('sangat amat'). B benar. C bertele-tele. D ambigu. E tidak baku.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Hasil penelitian itu sangat amat penting bagi pengembangan ilmu pengetahuan", "Hasil penelitian itu penting bagi pengembangan ilmu pengetahuan", "Hasil penelitian yang telah dilakukan itu sangat penting sekali untuk pengembangan ilmu pengetahuan", "Bagi ilmu pengetahuan, penelitian itu punya hasil penting", "Penelitian itu hasilnya penting banget untuk ilmu pengetahuan", 1) },
    { content: "Bacalah teks berikut.\n\nLembaga riset fiktif Zenith Research mempublikasikan temuan tentang dampak media sosial terhadap produktivitas kerja. Studi terhadap 2.500 pekerja kantoran di 5 kota besar menunjukkan bahwa rata-rata pekerja menghabiskan 2,3 jam per hari untuk media sosial selama jam kerja. Namun, 35% responden mengklaim bahwa media sosial membantu networking profesional mereka.\n\nProf. Aditya dari Universitas Nusantara Timur menilai bahwa dampak media sosial bersifat dual: meningkatkan konektivitas namun berpotensi menurunkan fokus kerja. \"Yang diperlukan bukan pelarangan total, melainkan literasi digital yang tepat,\" ujarnya.\n\nManakah pernyataan yang sesuai pendapat Prof. Aditya?", explanation: "Prof. Aditya menyebut dampak 'dual' dan solusinya 'literasi digital yang tepat, bukan pelarangan total'. Jawaban D sesuai.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Media sosial harus dilarang di tempat kerja", "Media sosial hanya berdampak negatif bagi pekerja", "Semua pekerja menghabiskan waktu terlalu banyak di media sosial", "Solusinya adalah literasi digital, bukan pelarangan total", "Media sosial tidak berpengaruh pada produktivitas", 3) },
    { content: "Penggunaan tanda baca yang BENAR terdapat pada kalimat...", explanation: "Kalimat B menggunakan tanda baca dengan benar: koma setelah keterangan waktu di awal kalimat, titik di akhir.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Ibu pergi ke pasar, untuk membeli sayur dan buah.", "Pada hari Senin, kami mengadakan rapat koordinasi.", "\"Kapan kamu datang\" tanya Rina.", "Dia membeli: buku, pensil, dan penghapus.", "Kami berkunjung ke Museum Nasional Jakarta.", 1) },
    { content: "Sebuah paragraf argumentasi yang baik harus memiliki...", explanation: "Paragraf argumentasi yang baik memiliki: klaim/pernyataan, data/bukti pendukung, dan simpulan logis. Jawaban C paling lengkap.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Hanya opini penulis tanpa bukti", "Fakta saja tanpa kesimpulan", "Klaim yang didukung data dan simpulan logis", "Kutipan dari tokoh terkenal saja", "Narasi kronologis peristiwa", 2) },
    { content: "Kata 'mengecek' dalam kalimat 'Tim auditor mengecek laporan keuangan' termasuk kata...", explanation: "'Mengecek' = kata kerja transitif (memerlukan objek: 'laporan keuangan').", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Kata benda", "Kata kerja intransitif", "Kata kerja transitif", "Kata sifat", "Kata keterangan", 2) },
  ],
  "literasi-bahasa-inggris": [
    { content: "Read the following passage.\n\nA research team from the fictional Stellaris Institute has developed a new biodegradable plastic made from algae extracts. Unlike traditional plastics that take hundreds of years to decompose, this material breaks down within 90 days in marine environments. The team, led by Dr. Elena Voss, conducted trials in controlled ocean simulations over 18 months.\n\nHowever, production costs remain 3 times higher than conventional plastics. Critics argue that without government subsidies, widespread adoption is unlikely. Dr. Voss counters that economies of scale will reduce costs by 60% within five years.\n\nWhat is the main idea of the passage?", explanation: "The passage introduces a new biodegradable plastic from algae, its benefits, cost challenges, and future cost projections. Main idea = a new eco-friendly plastic has been developed but faces cost challenges.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Government subsidies are essential for all innovations", "A new algae-based biodegradable plastic has potential but faces cost barriers", "Dr. Voss has solved the plastic pollution crisis", "Traditional plastics are superior to new alternatives", "Marine environments cannot break down any plastics", 1) },
    { content: "Based on the passage above, the word 'counters' is closest in meaning to...", explanation: "'Counters' dalam konteks ini berarti 'responds with an opposing argument' = argues against / responds in opposition.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("agrees with", "calculates", "argues against", "ignores", "supports", 2) },
    { content: "Choose the correct sentence.", explanation: "A: correct subject-verb agreement and grammar. B: 'informations' is uncountable. C: 'more better' is double comparative. D: 'didn't went' incorrect. E: 'is goes' incorrect.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Neither the teacher nor the students were aware of the change.", "She gave me many informations about the project.", "This solution is more better than the previous one.", "He didn't went to the meeting yesterday.", "The committee is goes to vote tomorrow.", 0) },
    { content: "If she _____ harder, she would have passed the exam.", explanation: "Third conditional: If + past perfect, would have + past participle. 'Had studied' is the correct form.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("studies", "studied", "had studied", "has studied", "would study", 2) },
    { content: "Read the passage.\n\nThe fictional city of Avalon Bay has implemented a 'smart grid' energy system that uses AI to distribute electricity based on real-time demand. Initial data from the first quarter shows a 23% reduction in energy waste and a 15% decrease in consumer bills. The system prioritizes renewable sources during peak sunlight hours, switching to stored battery power at night.\n\nIt can be inferred from the passage that...", explanation: "The passage states the system prioritizes renewables during sunlight and switches to battery at night, implying the city has significant renewable energy infrastructure.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Avalon Bay has no renewable energy sources", "The smart grid has increased energy waste", "The city likely has significant solar energy infrastructure", "Consumer bills have increased by 15%", "AI cannot effectively manage energy distribution", 2) },
    { content: "The report, _____ was submitted last week, contains critical findings about climate change.", explanation: "Non-restrictive relative clause referring to 'report' (thing) → 'which'.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("who", "whom", "which", "where", "whose", 2) },
    { content: "Choose the best word to complete the sentence: The company's decision to expand overseas was considered _____ by most analysts.", explanation: "'Prudent' means showing care and thought for the future, which fits the context of analysts evaluating a business decision.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("reckless", "prudent", "mundane", "obsolete", "ambiguous", 1) },
  ],
  // === CPNS ===
  "twk": [
    { content: "Pancasila sebagai dasar negara tercantum dalam Pembukaan UUD 1945 alinea ke...", explanation: "Pancasila tercantum dalam Pembukaan UUD 1945 alinea keempat.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Pertama", "Kedua", "Ketiga", "Keempat", "Kelima", 3) },
    { content: "Asas yang menyatakan bahwa kekuasaan tertinggi ada di tangan rakyat disebut...", explanation: "Kedaulatan rakyat berarti kekuasaan tertinggi ada di tangan rakyat, sesuai Pasal 1 ayat (2) UUD 1945.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Kedaulatan hukum", "Kedaulatan rakyat", "Kedaulatan negara", "Kedaulatan parlementer", "Kedaulatan tuhan", 1) },
    { content: "Seorang pegawai negeri menyaksikan rekan kerjanya melakukan pungli. Sesuai nilai Pancasila, tindakan yang paling tepat adalah...", explanation: "Sesuai sila ke-5 (keadilan sosial) dan integritas ASN, melaporkan ke atasan atau pengawas internal adalah tindakan yang tepat.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Mengabaikan karena bukan urusan pribadi", "Ikut melakukan karena sudah menjadi kebiasaan", "Melaporkan kepada atasan atau unit pengawas internal", "Membicarakan di media sosial", "Meminta bagian dari hasil pungli", 2) },
    { content: "Bhinneka Tunggal Ika berasal dari kitab...", explanation: "Semboyan Bhinneka Tunggal Ika diambil dari kitab Sutasoma karangan Mpu Tantular.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Negarakertagama", "Sutasoma", "Pararaton", "Arjunawiwaha", "Bharatayuddha", 1) },
    { content: "Pasal 33 UUD 1945 mengatur tentang...", explanation: "Pasal 33 UUD 1945 mengatur tentang perekonomian nasional dan kesejahteraan sosial.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Hak Asasi Manusia", "Pertahanan dan Keamanan", "Perekonomian Nasional", "Pendidikan dan Kebudayaan", "Agama", 2) },
    { content: "Lembaga negara yang bertugas mengawasi pengelolaan dan tanggung jawab keuangan negara adalah...", explanation: "BPK (Badan Pemeriksa Keuangan) bertugas memeriksa pengelolaan dan tanggung jawab keuangan negara (Pasal 23E UUD 1945).", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("DPR", "MPR", "BPK", "MA", "MK", 2) },
    { content: "Sistem pemerintahan yang dianut Indonesia berdasarkan UUD 1945 adalah...", explanation: "Indonesia menganut sistem pemerintahan presidensial, di mana Presiden sebagai kepala negara sekaligus kepala pemerintahan.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Parlementer", "Presidensial", "Semi-presidensial", "Monarki konstitusional", "Federal", 1) },
  ],
  "tiu": [
    { content: "PANDAI : BODOH = RAJIN : ...", explanation: "Pandai >< Bodoh (antonim). Rajin >< Malas (antonim).", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Cerdas", "Tekun", "Malas", "Lambat", "Cepat", 2) },
    { content: "Jika 3x + 7 = 22, maka nilai x adalah...", explanation: "3x = 22 - 7 = 15. x = 15/3 = 5.", difficulty: "VERY_EASY", type: "SINGLE_CHOICE", options: opts("3", "4", "5", "6", "7", 2) },
    { content: "Deret: 2, 5, 11, 23, 47, ...\n\nAngka selanjutnya adalah...", explanation: "Pola: ×2+1, ×2+1, ... 2→5(×2+1), 5→11(×2+1), 11→23(×2+1), 23→47(×2+1), 47→95(×2+1).", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("91", "93", "95", "97", "99", 2) },
    { content: "Semua dokter adalah lulusan universitas. Sebagian lulusan universitas adalah peneliti. Manakah kesimpulan yang BENAR?", explanation: "Semua dokter = lulusan universitas. Sebagian lulusan univ = peneliti. Maka sebagian dokter MUNGKIN peneliti (bukan pasti semua).", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Semua dokter adalah peneliti", "Semua peneliti adalah dokter", "Sebagian dokter mungkin peneliti", "Tidak ada dokter yang peneliti", "Semua lulusan universitas adalah dokter", 2) },
    { content: "Jika harga 5 buku dan 3 pensil adalah Rp47.000, sedangkan harga 3 buku dan 5 pensil adalah Rp37.000, berapakah harga 1 buku?", explanation: "5b + 3p = 47.000 ... (1)\n3b + 5p = 37.000 ... (2)\n5×(1): 25b + 15p = 235.000\n3×(2): 9b + 15p = 111.000\nSelisih: 16b = 124.000 → b = 7.750.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Rp 6.500", "Rp 7.000", "Rp 7.500", "Rp 7.750", "Rp 8.000", 3) },
    { content: "SINKRON : SELARAS = ANOMALI : ...", explanation: "Sinkron = selaras (sinonim). Anomali = penyimpangan (sinonim).", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Normal", "Penyimpangan", "Perubahan", "Keselarasan", "Konsistensi", 1) },
    { content: "15% dari 240 adalah...", explanation: "15/100 × 240 = 36.", difficulty: "VERY_EASY", type: "SINGLE_CHOICE", options: opts("32", "34", "36", "38", "40", 2) },
  ],
  "tkp": [
    { content: "Anda seorang ASN yang mendapat tugas mendadak saat sedang mengerjakan tugas rutin yang hampir selesai. Sikap Anda adalah...", explanation: "ASN profesional harus bisa mengatur prioritas. Menyelesaikan tugas rutin yang hampir selesai terlebih dahulu (jika masih dalam batas waktu) lalu mengerjakan tugas mendadak menunjukkan kemampuan manajemen waktu.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Mengabaikan tugas mendadak dan fokus pada tugas rutin", "Menyelesaikan tugas rutin yang hampir selesai, lalu segera mengerjakan tugas mendadak", "Langsung mengerjakan tugas mendadak dan meninggalkan tugas rutin", "Mendelegasikan kedua tugas ke rekan kerja", "Mengeluh kepada atasan tentang beban kerja", 1) },
    { content: "Seorang warga datang ke kantor Anda dengan keluhan yang bukan termasuk wewenang instansi Anda. Sikap terbaik Anda adalah...", explanation: "Pelayanan publik yang baik: menjelaskan dengan sopan dan mengarahkan ke instansi yang tepat menunjukkan orientasi pelayanan.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Menolak melayani karena bukan wewenang", "Menjelaskan dengan sopan dan mengarahkan ke instansi yang berwenang", "Mencoba menangani sendiri meskipun bukan wewenang", "Menyuruh warga datang lagi esok hari", "Mengabaikan dan melanjutkan pekerjaan", 1) },
    { content: "Rekan kerja Anda sering datang terlambat, sehingga mengganggu kinerja tim. Anda akan...", explanation: "Berkomunikasi langsung secara privat menunjukkan integritas dan kemampuan menyelesaikan masalah secara profesional.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Mengikuti kebiasaan rekan tersebut", "Berbicara secara privat dan menanyakan kendala yang dihadapi", "Langsung melaporkan ke atasan", "Menegur keras di depan rekan lain", "Diam saja karena bukan urusan", 1) },
    { content: "Atasan Anda meminta Anda mengerjakan tugas yang menurut Anda kurang efisien. Sikap terbaik Anda adalah...", explanation: "Mengerjakan tugas sambil memberikan saran perbaikan menunjukkan loyalitas sekaligus sikap adaptif dan kompeten.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Menolak dengan alasan tidak efisien", "Mengerjakan sambil memberikan saran perbaikan secara sopan", "Mengerjakan tanpa protes apapun", "Menceritakan ketidaksetujuan ke rekan kerja", "Meminta rekan lain yang mengerjakannya", 1) },
    { content: "Anda diminta memimpin tim lintas-divisi untuk proyek baru. Langkah pertama Anda adalah...", explanation: "Mengadakan pertemuan untuk mengenal anggota tim dan menyusun rencana kerja bersama menunjukkan kemampuan kolaborasi dan kepemimpinan.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Langsung membagi tugas tanpa diskusi", "Mengadakan pertemuan untuk mengenal anggota dan menyusun rencana bersama", "Menyerahkan kepemimpinan ke orang yang lebih senior", "Mengerjakan sendiri tanpa melibatkan tim", "Menunggu instruksi detail dari atasan", 1) },
  ],
  // === BUMN ===
  "tkd": [
    { content: "Deret: 3, 7, 15, 31, 63, ...\n\nAngka selanjutnya adalah...", explanation: "Pola: ×2+1. 3→7, 7→15, 15→31, 31→63, 63→127.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("125", "126", "127", "128", "129", 2) },
    { content: "EFISIEN : BOROS = JUJUR : ...", explanation: "Efisien >< Boros (antonim). Jujur >< Curang (antonim).", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Benar", "Curang", "Baik", "Adil", "Lurus", 1) },
    { content: "Jika A = 2, B = 4, C = 6, maka Z = ...", explanation: "Pola: huruf ke-n = 2n. Z = huruf ke-26, jadi Z = 52.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("48", "50", "52", "54", "56", 2) },
    { content: "Rata-rata gaji 10 karyawan adalah Rp5.000.000. Jika 2 karyawan baru bergabung dengan gaji masing-masing Rp7.000.000 dan Rp8.000.000, berapa rata-rata gaji sekarang?", explanation: "Total lama = 10 × 5.000.000 = 50.000.000. Total baru = 50.000.000 + 7.000.000 + 8.000.000 = 65.000.000. Rata-rata = 65.000.000/12 ≈ 5.416.667.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Rp 5.200.000", "Rp 5.416.667", "Rp 5.500.000", "Rp 5.750.000", "Rp 6.000.000", 1) },
    { content: "Sebuah proyek membutuhkan 12 pekerja untuk selesai dalam 15 hari. Jika hanya tersedia 9 pekerja, berapa hari yang dibutuhkan?", explanation: "12 × 15 = 180 orang-hari. 180/9 = 20 hari.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("16", "18", "20", "22", "24", 2) },
  ],
  "core-values": [
    { content: "Anda ditugaskan mengelola anggaran proyek perusahaan BUMN. Teman dekat Anda meminta agar vendor miliknya dipilih meskipun harganya lebih mahal. Sesuai nilai AKHLAK (Amanah), Anda akan...", explanation: "Amanah = memegang teguh kepercayaan. Memilih vendor berdasarkan kualitas dan harga terbaik sesuai prosedur menunjukkan sikap amanah.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Memilih vendor teman karena sudah kenal baik", "Tetap memilih vendor berdasarkan prosedur dan kualitas terbaik", "Meminta teman menurunkan harga agar bisa dipilih", "Menolak mengelola anggaran", "Membagi proyek ke dua vendor", 1) },
    { content: "Perusahaan BUMN Anda sedang melakukan transformasi digital. Beberapa karyawan senior menolak perubahan. Sebagai pemimpin tim, sesuai nilai Adaptif Anda akan...", explanation: "Nilai Adaptif = terus berinovasi dan antusias menghadapi perubahan. Melakukan pendekatan dan pelatihan bertahap menunjukkan kepemimpinan adaptif.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Memaksa semua karyawan langsung beradaptasi", "Melakukan pendekatan personal dan pelatihan bertahap", "Mengabaikan mereka yang menolak", "Memecat karyawan yang tidak mau berubah", "Menunda transformasi digital", 1) },
    { content: "Dalam rapat tim, rekan kerja dari divisi lain mengusulkan ide yang berbeda dari rencana Anda. Sesuai nilai Kolaboratif, tindakan terbaik adalah...", explanation: "Kolaboratif = membangun kerja sama sinergis. Mendiskusikan kedua ide secara terbuka untuk menemukan solusi terbaik menunjukkan semangat kolaborasi.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Mempertahankan ide sendiri karena lebih baik", "Mendiskusikan kedua ide secara terbuka untuk menemukan solusi terbaik", "Mengalah agar tidak terjadi konflik", "Meminta atasan memutuskan", "Mengabaikan usulan rekan tersebut", 1) },
    { content: "Anda mengetahui bahwa data laporan tahunan mengandung kesalahan kecil yang mungkin tidak akan terdeteksi. Sesuai nilai Kompeten, Anda akan...", explanation: "Kompeten = terus belajar dan mengembangkan kapabilitas. Memperbaiki kesalahan meskipun kecil menunjukkan profesionalisme dan kompetensi.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Membiarkan karena kesalahan kecil", "Memperbaiki kesalahan dan memastikan laporan akurat", "Menyampaikan ke rekan tapi tidak memperbaiki", "Menunggu orang lain yang menemukan", "Melaporkan ke atasan tanpa memperbaiki", 1) },
  ],
  "english-bumn": [
    { content: "The company's annual report _____ that revenue increased by 15% compared to the previous year.", explanation: "'Indicates' is the correct verb form for third person singular present tense.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("indicate", "indicates", "indicating", "indicated", "has indicate", 1) },
    { content: "Choose the most appropriate response:\nManager: \"Can you finish the quarterly report by Friday?\"\nEmployee: \"_____\"", explanation: "The most professional response acknowledges the request and commits to delivery.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("I'm too busy right now.", "Yes, I'll make sure it's ready by Thursday afternoon.", "Maybe, I don't know.", "That's not my responsibility.", "I'll try my best but no promises.", 1) },
    { content: "Read the email excerpt:\n\n'Dear Team, Following our discussion, I would like to _____ that the deadline for the proposal has been extended to March 15th.'\n\nChoose the best word.", explanation: "'Confirm' is the most appropriate business English word for officially verifying information.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("say", "confirm", "tell", "speak", "express", 1) },
  ],
  // === Kedinasan ===
  "tpa-stan": [
    { content: "KONVERSI : PERUBAHAN = KOMPENSASI : ...", explanation: "Konversi = perubahan (sinonim). Kompensasi = ganti rugi (sinonim).", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Pembayaran", "Ganti Rugi", "Hukuman", "Pengorbanan", "Penghargaan", 1) },
    { content: "Jika semua pegawai pajak wajib lulus ujian sertifikasi, dan Budi tidak lulus ujian sertifikasi, maka...", explanation: "Premis: Pegawai pajak → lulus sertifikasi. Budi tidak lulus → Budi bukan pegawai pajak (modus tollens).", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Budi mungkin pegawai pajak", "Budi pasti pegawai pajak", "Budi bukan pegawai pajak", "Budi akan mengulang ujian", "Budi tidak perlu sertifikasi", 2) },
    { content: "Deret: 1, 4, 9, 16, 25, ...\n\nAngka selanjutnya adalah...", explanation: "Pola: 1², 2², 3², 4², 5² → 6² = 36.", difficulty: "VERY_EASY", type: "SINGLE_CHOICE", options: opts("30", "34", "36", "38", "42", 2) },
  ],
  "tbi-stan": [
    { content: "The government _____ new tax regulations next month.", explanation: "'Will implement' is the correct future tense for a planned action.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("implement", "implements", "will implement", "implementing", "implemented", 2) },
    { content: "Choose the correct sentence.", explanation: "C is grammatically correct with proper subject-verb agreement and structure.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("The datas shows significant improvement.", "Each of the students have completed their assignment.", "The number of applicants has increased dramatically.", "Neither the manager nor the employees was satisfied.", "The committee have made their decision.", 2) },
    { content: "The word 'fiscal' is closest in meaning to...", explanation: "'Fiscal' relates to government revenue, especially taxes = financial/budgetary.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("physical", "financial", "medical", "digital", "annual", 1) },
  ],
  // === PPPK ===
  "kompetensi-teknis": [
    { content: "Seorang guru PPPK diminta menyusun Rencana Pelaksanaan Pembelajaran (RPP). Komponen yang WAJIB ada dalam RPP meliputi...", explanation: "RPP wajib memuat: tujuan pembelajaran, materi, metode, kegiatan pembelajaran, dan penilaian.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Hanya tujuan dan materi pembelajaran", "Tujuan, materi, metode, kegiatan, dan penilaian", "Hanya kegiatan pembelajaran", "Materi dan soal ujian saja", "Absensi dan jadwal mengajar", 1) },
    { content: "Dalam konteks ASN, kompetensi teknis mengacu pada...", explanation: "Kompetensi teknis = pengetahuan, keterampilan, dan sikap yang diperlukan untuk melaksanakan tugas jabatan.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Kemampuan berkomunikasi dengan atasan", "Pengetahuan dan keterampilan sesuai bidang tugas jabatan", "Kemampuan mengoperasikan komputer saja", "Keterampilan berorganisasi", "Pengetahuan umum tentang pemerintahan", 1) },
  ],
  "kompetensi-manajerial": [
    { content: "Anda seorang PPPK yang memimpin tim kecil. Salah satu anggota tim berkinerja buruk. Langkah pertama yang paling tepat adalah...", explanation: "Melakukan diskusi pribadi untuk memahami masalah menunjukkan kemampuan manajerial dan komunikasi yang baik.", difficulty: "MEDIUM", type: "SINGLE_CHOICE", options: opts("Langsung memberikan surat peringatan", "Melakukan diskusi pribadi untuk memahami kendala yang dihadapi", "Mengabaikan dan berharap membaik sendiri", "Memindahkan ke tim lain", "Melaporkan langsung ke atasan", 1) },
    { content: "Prinsip pengambilan keputusan yang baik dalam organisasi pemerintah meliputi...", explanation: "Pengambilan keputusan yang baik harus berbasis data, mempertimbangkan stakeholder, dan sesuai regulasi.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Berdasarkan intuisi pemimpin saja", "Berbasis data, mempertimbangkan stakeholder, dan sesuai regulasi", "Mengikuti keputusan pemimpin tanpa diskusi", "Berdasarkan voting mayoritas saja", "Menunda keputusan selama mungkin", 1) },
    { content: "Integritas dalam pelayanan publik berarti...", explanation: "Integritas = konsistensi antara perkataan dan perbuatan, jujur, dan bertanggung jawab dalam menjalankan tugas.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Selalu patuh pada atasan tanpa pertanyaan", "Konsistensi antara perkataan dan perbuatan serta jujur dalam bertugas", "Menyelesaikan tugas secepat mungkin", "Tidak pernah membuat kesalahan", "Bekerja lembur setiap hari", 1) },
  ],
  "kompetensi-sosio-kultural": [
    { content: "Di kantor pemerintah daerah, Anda bekerja dengan rekan dari berbagai suku dan agama. Cara terbaik menjaga keharmonisan adalah...", explanation: "Menghormati perbedaan dan membangun komunikasi inklusif sesuai nilai perekat bangsa.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Menghindari diskusi tentang perbedaan", "Menghormati perbedaan dan membangun komunikasi yang inklusif", "Membentuk kelompok berdasarkan kesamaan suku", "Mengabaikan perbedaan seolah tidak ada", "Meminta semua orang mengikuti budaya mayoritas", 1) },
    { content: "Perekat bangsa dalam konteks ASN berarti...", explanation: "Perekat bangsa = kemampuan dalam mempromosikan toleransi, keterbukaan, dan tidak diskriminatif dalam pelayanan.", difficulty: "EASY", type: "SINGLE_CHOICE", options: opts("Menyeragamkan semua budaya menjadi satu", "Mempromosikan toleransi dan tidak diskriminatif dalam pelayanan", "Mengutamakan suku tertentu dalam pelayanan", "Menghindari kontak dengan masyarakat yang berbeda", "Hanya melayani masyarakat dari daerah sendiri", 1) },
  ],
};

// ============================================================
// EXAM PACKAGES DEFINITION
// ============================================================

interface PackageDef {
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  isFree: boolean;
  price: number;
  discountPrice?: number;
  durationMinutes: number;
  totalQuestions: number;
  maxAttempts: number;
  sections: {
    title: string;
    subjectSlug: string;
    subCategorySlug: string;
    durationMinutes: number;
    totalQuestions: number;
    order: number;
  }[];
}

const PACKAGES: PackageDef[] = [
  // === UTBK ===
  { title: "Try Out UTBK Gratis - TPS Mini", slug: "to-utbk-gratis-tps-mini", description: "Paket gratis TPS UTBK-SNBT untuk latihan awal. Berisi soal penalaran umum dan kuantitatif.", categorySlug: "utbk-snbt", isFree: true, price: 0, durationMinutes: 30, totalQuestions: 20, maxAttempts: 3, sections: [
    { title: "Penalaran Umum", subjectSlug: "penalaran-umum", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 10, order: 1 },
    { title: "Pengetahuan Kuantitatif", subjectSlug: "pengetahuan-kuantitatif", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 10, order: 2 },
  ]},
  { title: "Try Out UTBK Gratis - Literasi", slug: "to-utbk-gratis-literasi", description: "Paket gratis Literasi UTBK-SNBT. Latihan membaca dan memahami teks.", categorySlug: "utbk-snbt", isFree: true, price: 0, durationMinutes: 30, totalQuestions: 14, maxAttempts: 3, sections: [
    { title: "Literasi Bahasa Indonesia", subjectSlug: "literasi-bahasa-indonesia", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 7, order: 1 },
    { title: "Literasi Bahasa Inggris", subjectSlug: "literasi-bahasa-inggris", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 7, order: 2 },
  ]},
  { title: "Try Out UTBK TPS Lengkap #1", slug: "to-utbk-tps-1", description: "Paket lengkap TPS UTBK-SNBT. Simulasi ujian sesungguhnya dengan soal-soal HOTS.", categorySlug: "utbk-snbt", isFree: false, price: 29900, durationMinutes: 90, totalQuestions: 50, maxAttempts: 2, sections: [
    { title: "Penalaran Umum", subjectSlug: "penalaran-umum", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 1 },
    { title: "Pengetahuan Kuantitatif", subjectSlug: "pengetahuan-kuantitatif", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 2 },
    { title: "Penalaran Matematika", subjectSlug: "penalaran-matematika", subCategorySlug: "tps", durationMinutes: 25, totalQuestions: 10, order: 3 },
    { title: "Literasi Bahasa Indonesia", subjectSlug: "literasi-bahasa-indonesia", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 10, order: 4 },
    { title: "Literasi Bahasa Inggris", subjectSlug: "literasi-bahasa-inggris", subCategorySlug: "tps", durationMinutes: 10, totalQuestions: 10, order: 5 },
  ]},
  { title: "Try Out UTBK TPS Lengkap #2", slug: "to-utbk-tps-2", description: "Paket TPS UTBK-SNBT seri kedua dengan soal-soal baru dan berbeda.", categorySlug: "utbk-snbt", isFree: false, price: 29900, durationMinutes: 90, totalQuestions: 50, maxAttempts: 2, sections: [
    { title: "Penalaran Umum", subjectSlug: "penalaran-umum", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 1 },
    { title: "Pengetahuan Kuantitatif", subjectSlug: "pengetahuan-kuantitatif", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 2 },
    { title: "Penalaran Matematika", subjectSlug: "penalaran-matematika", subCategorySlug: "tps", durationMinutes: 25, totalQuestions: 10, order: 3 },
    { title: "Literasi Bahasa Indonesia", subjectSlug: "literasi-bahasa-indonesia", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 10, order: 4 },
    { title: "Literasi Bahasa Inggris", subjectSlug: "literasi-bahasa-inggris", subCategorySlug: "tps", durationMinutes: 10, totalQuestions: 10, order: 5 },
  ]},
  { title: "Paket Hemat UTBK 3-in-1", slug: "to-utbk-hemat-3", description: "Paket hemat berisi 3 Try Out UTBK lengkap dengan harga spesial.", categorySlug: "utbk-snbt", isFree: false, price: 79900, discountPrice: 59900, durationMinutes: 90, totalQuestions: 50, maxAttempts: 5, sections: [
    { title: "Penalaran Umum", subjectSlug: "penalaran-umum", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 1 },
    { title: "Pengetahuan Kuantitatif", subjectSlug: "pengetahuan-kuantitatif", subCategorySlug: "tps", durationMinutes: 20, totalQuestions: 10, order: 2 },
    { title: "Penalaran Matematika", subjectSlug: "penalaran-matematika", subCategorySlug: "tps", durationMinutes: 25, totalQuestions: 10, order: 3 },
    { title: "Literasi Bahasa Indonesia", subjectSlug: "literasi-bahasa-indonesia", subCategorySlug: "tps", durationMinutes: 15, totalQuestions: 10, order: 4 },
    { title: "Literasi Bahasa Inggris", subjectSlug: "literasi-bahasa-inggris", subCategorySlug: "tps", durationMinutes: 10, totalQuestions: 10, order: 5 },
  ]},

  // === CPNS ===
  { title: "Try Out CPNS SKD Gratis", slug: "to-cpns-gratis", description: "Paket gratis SKD CPNS untuk latihan awal. Berisi soal TWK, TIU, dan TKP.", categorySlug: "cpns", isFree: true, price: 0, durationMinutes: 60, totalQuestions: 19, maxAttempts: 3, sections: [
    { title: "TWK - Tes Wawasan Kebangsaan", subjectSlug: "twk", subCategorySlug: "skd", durationMinutes: 20, totalQuestions: 7, order: 1 },
    { title: "TIU - Tes Intelegensi Umum", subjectSlug: "tiu", subCategorySlug: "skd", durationMinutes: 20, totalQuestions: 7, order: 2 },
    { title: "TKP - Tes Karakteristik Pribadi", subjectSlug: "tkp", subCategorySlug: "skd", durationMinutes: 20, totalQuestions: 5, order: 3 },
  ]},
  { title: "Try Out CPNS SKD Lengkap #1", slug: "to-cpns-skd-1", description: "Simulasi SKD CPNS lengkap. Soal sesuai standar BKN terbaru.", categorySlug: "cpns", isFree: false, price: 19900, durationMinutes: 90, totalQuestions: 19, maxAttempts: 2, sections: [
    { title: "TWK", subjectSlug: "twk", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 1 },
    { title: "TIU", subjectSlug: "tiu", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 2 },
    { title: "TKP", subjectSlug: "tkp", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 5, order: 3 },
  ]},
  { title: "Try Out CPNS SKD Lengkap #2", slug: "to-cpns-skd-2", description: "Simulasi SKD CPNS seri kedua dengan soal-soal berbeda.", categorySlug: "cpns", isFree: false, price: 19900, durationMinutes: 90, totalQuestions: 19, maxAttempts: 2, sections: [
    { title: "TWK", subjectSlug: "twk", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 1 },
    { title: "TIU", subjectSlug: "tiu", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 2 },
    { title: "TKP", subjectSlug: "tkp", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 5, order: 3 },
  ]},
  { title: "Paket Hemat CPNS 5x Try Out", slug: "to-cpns-hemat-5", description: "Paket hemat 5 kali Try Out CPNS SKD. Latihan intensif menuju tes.", categorySlug: "cpns", isFree: false, price: 89900, discountPrice: 69900, durationMinutes: 90, totalQuestions: 19, maxAttempts: 10, sections: [
    { title: "TWK", subjectSlug: "twk", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 1 },
    { title: "TIU", subjectSlug: "tiu", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 7, order: 2 },
    { title: "TKP", subjectSlug: "tkp", subCategorySlug: "skd", durationMinutes: 30, totalQuestions: 5, order: 3 },
  ]},

  // === BUMN ===
  { title: "Try Out BUMN Gratis", slug: "to-bumn-gratis", description: "Paket gratis tes rekrutmen BUMN. Berisi TKD dan Core Values.", categorySlug: "bumn", isFree: true, price: 0, durationMinutes: 45, totalQuestions: 12, maxAttempts: 3, sections: [
    { title: "TKD - Tes Kemampuan Dasar", subjectSlug: "tkd", subCategorySlug: "tkd-bumn", durationMinutes: 20, totalQuestions: 5, order: 1 },
    { title: "Core Values AKHLAK", subjectSlug: "core-values", subCategorySlug: "tkd-bumn", durationMinutes: 15, totalQuestions: 4, order: 2 },
    { title: "English", subjectSlug: "english-bumn", subCategorySlug: "tkd-bumn", durationMinutes: 10, totalQuestions: 3, order: 3 },
  ]},
  { title: "Try Out BUMN Lengkap #1", slug: "to-bumn-1", description: "Simulasi tes rekrutmen bersama BUMN lengkap.", categorySlug: "bumn", isFree: false, price: 24900, durationMinutes: 75, totalQuestions: 12, maxAttempts: 2, sections: [
    { title: "TKD", subjectSlug: "tkd", subCategorySlug: "tkd-bumn", durationMinutes: 30, totalQuestions: 5, order: 1 },
    { title: "Core Values AKHLAK", subjectSlug: "core-values", subCategorySlug: "tkd-bumn", durationMinutes: 25, totalQuestions: 4, order: 2 },
    { title: "English", subjectSlug: "english-bumn", subCategorySlug: "tkd-bumn", durationMinutes: 20, totalQuestions: 3, order: 3 },
  ]},
  { title: "Paket Hemat BUMN 3x Try Out", slug: "to-bumn-hemat-3", description: "Paket hemat 3 kali Try Out BUMN dengan harga spesial.", categorySlug: "bumn", isFree: false, price: 64900, discountPrice: 49900, durationMinutes: 75, totalQuestions: 12, maxAttempts: 6, sections: [
    { title: "TKD", subjectSlug: "tkd", subCategorySlug: "tkd-bumn", durationMinutes: 30, totalQuestions: 5, order: 1 },
    { title: "Core Values AKHLAK", subjectSlug: "core-values", subCategorySlug: "tkd-bumn", durationMinutes: 25, totalQuestions: 4, order: 2 },
    { title: "English", subjectSlug: "english-bumn", subCategorySlug: "tkd-bumn", durationMinutes: 20, totalQuestions: 3, order: 3 },
  ]},

  // === Kedinasan ===
  { title: "Try Out Kedinasan Gratis - STAN", slug: "to-kedinasan-gratis-stan", description: "Paket gratis untuk latihan masuk PKN STAN.", categorySlug: "kedinasan", isFree: true, price: 0, durationMinutes: 30, totalQuestions: 6, maxAttempts: 3, sections: [
    { title: "TPA", subjectSlug: "tpa-stan", subCategorySlug: "pkn-stan", durationMinutes: 15, totalQuestions: 3, order: 1 },
    { title: "TBI", subjectSlug: "tbi-stan", subCategorySlug: "pkn-stan", durationMinutes: 15, totalQuestions: 3, order: 2 },
  ]},
  { title: "Try Out PKN STAN Lengkap", slug: "to-stan-1", description: "Simulasi tes masuk PKN STAN lengkap TPA + TBI.", categorySlug: "kedinasan", isFree: false, price: 19900, durationMinutes: 60, totalQuestions: 6, maxAttempts: 2, sections: [
    { title: "TPA", subjectSlug: "tpa-stan", subCategorySlug: "pkn-stan", durationMinutes: 30, totalQuestions: 3, order: 1 },
    { title: "TBI", subjectSlug: "tbi-stan", subCategorySlug: "pkn-stan", durationMinutes: 30, totalQuestions: 3, order: 2 },
  ]},

  // === PPPK ===
  { title: "Try Out PPPK Gratis", slug: "to-pppk-gratis", description: "Paket gratis tes PPPK. Latihan kompetensi dasar.", categorySlug: "pppk", isFree: true, price: 0, durationMinutes: 45, totalQuestions: 7, maxAttempts: 3, sections: [
    { title: "Kompetensi Teknis", subjectSlug: "kompetensi-teknis", subCategorySlug: "kompetensi-pppk", durationMinutes: 15, totalQuestions: 2, order: 1 },
    { title: "Kompetensi Manajerial", subjectSlug: "kompetensi-manajerial", subCategorySlug: "kompetensi-pppk", durationMinutes: 15, totalQuestions: 3, order: 2 },
    { title: "Kompetensi Sosio-Kultural", subjectSlug: "kompetensi-sosio-kultural", subCategorySlug: "kompetensi-pppk", durationMinutes: 15, totalQuestions: 2, order: 3 },
  ]},
  { title: "Try Out PPPK Lengkap #1", slug: "to-pppk-1", description: "Simulasi tes PPPK lengkap dengan 3 kompetensi.", categorySlug: "pppk", isFree: false, price: 24900, durationMinutes: 75, totalQuestions: 7, maxAttempts: 2, sections: [
    { title: "Kompetensi Teknis", subjectSlug: "kompetensi-teknis", subCategorySlug: "kompetensi-pppk", durationMinutes: 25, totalQuestions: 2, order: 1 },
    { title: "Kompetensi Manajerial", subjectSlug: "kompetensi-manajerial", subCategorySlug: "kompetensi-pppk", durationMinutes: 25, totalQuestions: 3, order: 2 },
    { title: "Kompetensi Sosio-Kultural", subjectSlug: "kompetensi-sosio-kultural", subCategorySlug: "kompetensi-pppk", durationMinutes: 25, totalQuestions: 2, order: 3 },
  ]},
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log("Seeding content data...\n");

  // Get admin user
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) {
    console.error("Admin user not found. Run base seed first.");
    process.exit(1);
  }

  // Create sample students for leaderboard
  const students: { id: string; name: string }[] = [];
  const studentNames = [
    "Aisyah Putri", "Budi Santoso", "Citra Dewi", "Dimas Prayoga", "Eka Wulandari",
    "Farhan Akbar", "Gita Nurjanah", "Hadi Firmansyah", "Indah Permata", "Joko Widodo P.",
    "Kartika Sari", "Lukman Hakim", "Maya Anggraeni", "Naufal Rizky", "Olivia Rahman",
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const email = `student${i + 1}@toutopia.id`;
    const student = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: studentNames[i],
        role: "STUDENT",
        emailVerified: new Date(),
        credits: { create: { balance: 0, freeCredits: 2 } },
      },
    });
    students.push({ id: student.id, name: student.name });
  }
  console.log(`  Created ${students.length} sample students`);

  // ---- SEED QUESTIONS ----
  console.log("\nSeeding questions...");
  // Collect all subject IDs mapped by slug
  const subjectMap = new Map<string, string>();
  const allSubjects = await prisma.subject.findMany({ select: { id: true, slug: true } });
  for (const s of allSubjects) subjectMap.set(s.slug, s.id);

  // Get topic map
  const topicMap = new Map<string, { id: string; subjectSlug: string }[]>();
  const allTopics = await prisma.topic.findMany({
    select: { id: true, subjectId: true },
    orderBy: { order: "asc" },
  });
  for (const t of allTopics) {
    const subjectSlug = [...subjectMap.entries()].find(([, id]) => id === t.subjectId)?.[0];
    if (subjectSlug) {
      if (!topicMap.has(subjectSlug)) topicMap.set(subjectSlug, []);
      topicMap.get(subjectSlug)!.push({ id: t.id, subjectSlug });
    }
  }

  // Track created question IDs per subject slug
  const questionsBySubject = new Map<string, string[]>();
  let totalQuestions = 0;

  for (const [subjectSlug, seedQuestions] of Object.entries(QUESTIONS)) {
    const topics = topicMap.get(subjectSlug);
    if (!topics || topics.length === 0) {
      console.log(`  Skipping ${subjectSlug} — no topics found`);
      continue;
    }

    const qIds: string[] = [];

    for (let i = 0; i < seedQuestions.length; i++) {
      const sq = seedQuestions[i];
      const topic = topics[i % topics.length]; // round-robin across topics

      const question = await prisma.question.create({
        data: {
          topicId: topic.id,
          createdById: admin.id,
          type: sq.type,
          status: "APPROVED",
          difficulty: sq.difficulty,
          content: sq.content,
          explanation: sq.explanation,
          source: "Seed Data",
          options: {
            create: sq.options.map((opt, idx) => ({
              label: opt.label,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: idx,
            })),
          },
        },
      });

      qIds.push(question.id);
      totalQuestions++;
    }

    questionsBySubject.set(subjectSlug, qIds);
    console.log(`  ${subjectSlug}: ${seedQuestions.length} questions`);
  }
  console.log(`  Total: ${totalQuestions} questions created`);

  // ---- SEED PACKAGES + SECTIONS + SECTION_QUESTIONS ----
  console.log("\nSeeding packages...");

  const categoryMap = new Map<string, string>();
  const allCategories = await prisma.examCategory.findMany({ select: { id: true, slug: true } });
  for (const c of allCategories) categoryMap.set(c.slug, c.id);

  // Build subCategory map: `categorySlug:subCategorySlug` → id
  const subCategoryMap = new Map<string, string>();
  const allSubCategories = await prisma.examSubCategory.findMany({
    select: { id: true, slug: true, categoryId: true },
  });
  for (const sc of allSubCategories) {
    const catSlug = [...categoryMap.entries()].find(([, id]) => id === sc.categoryId)?.[0];
    if (catSlug) subCategoryMap.set(`${catSlug}:${sc.slug}`, sc.id);
  }

  // Build subject by subCategory map
  const subjectBySubCat = new Map<string, Map<string, string>>();
  const allSubjectsRaw = await prisma.subject.findMany({
    select: { id: true, slug: true, subCategoryId: true },
  });
  for (const s of allSubjectsRaw) {
    if (!subjectBySubCat.has(s.subCategoryId)) subjectBySubCat.set(s.subCategoryId, new Map());
    subjectBySubCat.get(s.subCategoryId)!.set(s.slug, s.id);
  }

  const packageIds: string[] = [];

  for (const pkg of PACKAGES) {
    const categoryId = categoryMap.get(pkg.categorySlug);
    if (!categoryId) {
      console.log(`  Skipping ${pkg.slug} — category not found`);
      continue;
    }

    // Delete existing if exists (cascade: attempts, leaderboard, sections)
    const existing = await prisma.examPackage.findUnique({ where: { slug: pkg.slug } });
    if (existing) {
      await prisma.leaderboardEntry.deleteMany({ where: { packageId: existing.id } });
      await prisma.examAnswer.deleteMany({ where: { attempt: { packageId: existing.id } } });
      await prisma.examAttempt.deleteMany({ where: { packageId: existing.id } });
      await prisma.examSectionQuestion.deleteMany({ where: { section: { packageId: existing.id } } });
      await prisma.examSection.deleteMany({ where: { packageId: existing.id } });
      await prisma.examPackage.delete({ where: { slug: pkg.slug } });
    }

    const examPackage = await prisma.examPackage.create({
      data: {
        categoryId,
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        price: pkg.price,
        discountPrice: pkg.discountPrice ?? null,
        durationMinutes: pkg.durationMinutes,
        totalQuestions: pkg.totalQuestions,
        isFree: pkg.isFree,
        status: "PUBLISHED",
        maxAttempts: pkg.maxAttempts,
        createdById: admin.id,
      },
    });

    packageIds.push(examPackage.id);

    // Create sections with questions
    for (const sec of pkg.sections) {
      const subCatId = subCategoryMap.get(`${pkg.categorySlug}:${sec.subCategorySlug}`);
      if (!subCatId) continue;

      const subjectIdMap = subjectBySubCat.get(subCatId);
      if (!subjectIdMap) continue;

      const subjectId = subjectIdMap.get(sec.subjectSlug);
      if (!subjectId) continue;

      const section = await prisma.examSection.create({
        data: {
          packageId: examPackage.id,
          subjectId,
          title: sec.title,
          durationMinutes: sec.durationMinutes,
          totalQuestions: sec.totalQuestions,
          order: sec.order,
        },
      });

      // Link questions to section
      const availableQs = questionsBySubject.get(sec.subjectSlug) ?? [];
      const qsToLink = availableQs.slice(0, sec.totalQuestions);

      for (let i = 0; i < qsToLink.length; i++) {
        await prisma.examSectionQuestion.create({
          data: {
            sectionId: section.id,
            questionId: qsToLink[i],
            order: i + 1,
          },
        });
      }
    }

    const freeLabel = pkg.isFree ? " (FREE)" : ` (Rp ${pkg.price.toLocaleString("id-ID")})`;
    console.log(`  ${pkg.title}${freeLabel} — ${pkg.sections.length} sections`);
  }

  // ---- SEED SAMPLE ATTEMPTS + LEADERBOARD ----
  console.log("\nSeeding sample attempts & leaderboard...");

  let attemptCount = 0;
  let leaderboardCount = 0;

  for (const pkgId of packageIds) {
    const pkg = await prisma.examPackage.findUnique({
      where: { id: pkgId },
      select: { id: true, durationMinutes: true, totalQuestions: true, title: true },
    });
    if (!pkg) continue;

    // 3-8 random students per package
    const numStudents = 3 + Math.floor(Math.random() * 6);
    const shuffled = [...students].sort(() => Math.random() - 0.5).slice(0, numStudents);

    for (const student of shuffled) {
      const score = 40 + Math.random() * 55; // 40-95
      const totalCorrect = Math.round((score / 100) * pkg.totalQuestions);
      const totalIncorrect = Math.round(pkg.totalQuestions * 0.6 * (1 - score / 100));
      const totalUnanswered = pkg.totalQuestions - totalCorrect - totalIncorrect;

      const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // last 30 days
      const finishedAt = new Date(startedAt.getTime() + (pkg.durationMinutes * 0.7 + Math.random() * pkg.durationMinutes * 0.3) * 60 * 1000);
      const serverDeadline = new Date(startedAt.getTime() + pkg.durationMinutes * 60 * 1000);

      const attempt = await prisma.examAttempt.create({
        data: {
          userId: student.id,
          packageId: pkg.id,
          status: "COMPLETED",
          score: Math.round(score * 100) / 100,
          totalCorrect: Math.max(0, totalCorrect),
          totalIncorrect: Math.max(0, totalIncorrect),
          totalUnanswered: Math.max(0, totalUnanswered),
          percentile: 30 + Math.random() * 65,
          startedAt,
          finishedAt,
          serverStartedAt: startedAt,
          serverDeadline,
          violations: 0,
        },
      });

      attemptCount++;

      // Leaderboard entry (best score per user per package)
      const existingEntry = await prisma.leaderboardEntry.findUnique({
        where: { packageId_userId: { packageId: pkg.id, userId: student.id } },
      });

      if (!existingEntry) {
        await prisma.leaderboardEntry.create({
          data: {
            packageId: pkg.id,
            userId: student.id,
            attemptId: attempt.id,
            score: Math.round(score * 100) / 100,
          },
        });
        leaderboardCount++;
      }
    }
  }

  console.log(`  ${attemptCount} attempts created`);
  console.log(`  ${leaderboardCount} leaderboard entries created`);

  // Update leaderboard ranks
  console.log("\nUpdating leaderboard ranks...");
  for (const pkgId of packageIds) {
    const entries = await prisma.leaderboardEntry.findMany({
      where: { packageId: pkgId },
      orderBy: { score: "desc" },
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }
  }

  console.log("\nContent seeding complete!");
  console.log(`  ${totalQuestions} questions`);
  console.log(`  ${packageIds.length} packages`);
  console.log(`  ${attemptCount} attempts`);
  console.log(`  ${leaderboardCount} leaderboard entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
