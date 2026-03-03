import { JABATAN_LIST, type Jabatan } from "./jabatan-data";

export interface Specialization {
  id: string;
  nama: string;
}

export const UTBK_JURUSAN: Specialization[] = [
  { id: "saintek", nama: "Saintek (IPA)" },
  { id: "soshum", nama: "Soshum (IPS)" },
  { id: "campuran", nama: "Campuran (Saintek + Soshum)" },
];

export const PPPK_FORMASI: Specialization[] = [
  { id: "guru", nama: "Guru" },
  { id: "nakes", nama: "Tenaga Kesehatan" },
  { id: "teknis", nama: "Tenaga Teknis" },
];

export const KEDINASAN_INSTANSI: Specialization[] = [
  { id: "pkn-stan", nama: "PKN STAN" },
  { id: "stis", nama: "STIS (Politeknik Statistika)" },
  { id: "ipdn", nama: "IPDN" },
  { id: "stin", nama: "STIN" },
];

export type SpecializationType = "jurusan" | "jabatan" | "formasi" | "instansi";

interface SpecializationConfig {
  type: SpecializationType;
  label: string;
  placeholder: string;
  options: Specialization[];
}

export const EXAM_SPECIALIZATION_MAP: Record<string, SpecializationConfig> = {
  UTBK: {
    type: "jurusan",
    label: "Jurusan",
    placeholder: "Pilih jurusan",
    options: UTBK_JURUSAN,
  },
  CPNS: {
    type: "jabatan",
    label: "Jabatan",
    placeholder: "Pilih jabatan (opsional)",
    options: JABATAN_LIST.map((j: Jabatan) => ({ id: j.id, nama: j.nama })),
  },
  BUMN: {
    type: "jabatan",
    label: "Jabatan",
    placeholder: "Pilih jabatan (opsional)",
    options: JABATAN_LIST.map((j: Jabatan) => ({ id: j.id, nama: j.nama })),
  },
  PPPK: {
    type: "formasi",
    label: "Formasi",
    placeholder: "Pilih formasi",
    options: PPPK_FORMASI,
  },
  KEDINASAN: {
    type: "instansi",
    label: "Instansi",
    placeholder: "Pilih instansi",
    options: KEDINASAN_INSTANSI,
  },
};

export function getSpecializationName(examType: string, specializationId: string): string | null {
  const config = EXAM_SPECIALIZATION_MAP[examType];
  if (!config) return null;
  const found = config.options.find((o) => o.id === specializationId);
  return found?.nama ?? null;
}

export function buildSpecializationInstruction(
  examType: string,
  specializationId?: string,
  jabatanNama?: string
): string {
  if (!specializationId && !jabatanNama) return "";

  switch (examType) {
    case "UTBK":
      return buildUtbkJurusanInstruction(specializationId ?? "");

    case "CPNS":
      return buildCpnsJabatanInstruction(jabatanNama ?? resolveJabatanNama(specializationId));

    case "BUMN":
      return buildBumnJabatanInstruction(jabatanNama ?? resolveJabatanNama(specializationId));

    case "PPPK":
      return buildPppkFormasiInstruction(specializationId ?? "", jabatanNama);

    case "KEDINASAN":
      return buildKedinasanInstansiInstruction(specializationId ?? "");

    default:
      return "";
  }
}

function resolveJabatanNama(specializationId?: string): string {
  if (!specializationId) return "";
  const found = JABATAN_LIST.find((j) => j.id === specializationId);
  return found?.nama ?? specializationId;
}

function buildUtbkJurusanInstruction(jurusanId: string): string {
  switch (jurusanId) {
    case "saintek":
      return "Soal ini untuk calon mahasiswa jurusan SAINTEK (IPA). Konteks soal harus relevan dengan bidang sains dan teknologi: gunakan skenario laboratorium, penelitian ilmiah, fenomena alam, data eksperimen fiktif, perhitungan kuantitatif. Untuk subtes TPS/Literasi, gunakan stimulus berupa artikel/bacaan bertema sains, teknologi, kesehatan, lingkungan.";

    case "soshum":
      return "Soal ini untuk calon mahasiswa jurusan SOSHUM (IPS). Konteks soal harus relevan dengan bidang sosial-humaniora: gunakan skenario kebijakan publik fiktif, dinamika sosial, analisis ekonomi, peristiwa sejarah fiktif yang plausibel, data demografi/statistik sosial sintetis. Untuk subtes TPS/Literasi, gunakan stimulus berupa artikel/bacaan bertema ekonomi, politik, budaya, sosiologi.";

    case "campuran":
      return "";

    default:
      return "";
  }
}

function buildCpnsJabatanInstruction(jabatanNama: string): string {
  if (!jabatanNama) return "";
  return `Soal ini untuk calon ASN jabatan ${jabatanNama}. Untuk soal TKP (Tes Karakteristik Pribadi): buat skenario situasi kerja yang SPESIFIK untuk jabatan ${jabatanNama} — gunakan konteks tugas harian, tantangan, dan dilema etika yang realistis untuk posisi ini di instansi pemerintah fiktif. Untuk soal TIU: gunakan konteks data/narasi yang relevan dengan bidang kerja ${jabatanNama}. Untuk soal TWK: tetap gunakan materi standar (Pancasila, UUD 1945, NKRI).`;
}

function buildBumnJabatanInstruction(jabatanNama: string): string {
  if (!jabatanNama) return "";
  return `Soal ini untuk calon pegawai BUMN posisi ${jabatanNama}. Untuk soal AKHLAK/SJT: buat skenario situasi kerja di perusahaan BUMN fiktif yang SPESIFIK untuk posisi ${jabatanNama} — gunakan konteks tugas, proyek, dan interaksi antar-divisi yang relevan dengan bidang ini. Untuk soal Learning Agility: buat situasi yang menguji adaptabilitas dan problem-solving dalam konteks pekerjaan ${jabatanNama} di korporasi BUMN. Untuk soal TKD: gunakan konteks data/narasi relevan dengan bidang kerja ${jabatanNama}.`;
}

function buildPppkFormasiInstruction(formasiId: string, jabatanNama?: string): string {
  let base = "";

  switch (formasiId) {
    case "guru":
      base = "Soal ini untuk seleksi PPPK formasi GURU. Untuk Kompetensi Teknis: fokus pada pedagogik (teori belajar konstruktivis, Kurikulum Merdeka, Capaian Pembelajaran, asesmen diagnostik/formatif/sumatif, diferensiasi pembelajaran, Profil Pelajar Pancasila) dan profesional (penguasaan materi mapel). Untuk Manajerial/SosKul: buat skenario di lingkungan SEKOLAH fiktif — interaksi dengan siswa, orang tua, sesama guru, kepala sekolah. Gunakan nama sekolah dan guru fiktif.";
      break;

    case "nakes":
      base = "Soal ini untuk seleksi PPPK formasi TENAGA KESEHATAN. Untuk Kompetensi Teknis: buat vignette klinis fiktif — presentasi pasien, anamnesis, pemeriksaan fisik, interpretasi lab, diagnosis banding, tatalaksana sesuai standar. Gunakan nama pasien, RS, dan puskesmas fiktif. Untuk Manajerial/SosKul: buat skenario di fasilitas kesehatan fiktif — prioritas triase, komunikasi dengan pasien/keluarga, koordinasi tim medis, etika medis.";
      break;

    case "teknis":
      base = "Soal ini untuk seleksi PPPK formasi TENAGA TEKNIS. Untuk Kompetensi Teknis: fokus pada administrasi pemerintahan, pengelolaan keuangan daerah, IT/sistem informasi, atau hukum — sesuai konteks jabatan fungsional. Untuk Manajerial/SosKul: buat skenario di kantor pemerintah/dinas fiktif — interaksi antar-bidang, pelayanan publik, pengelolaan anggaran.";
      break;

    default:
      return "";
  }

  if (jabatanNama) {
    base += ` Jabatan spesifik: ${jabatanNama}. Sesuaikan konteks soal teknis dengan bidang keahlian ini.`;
  }

  return base;
}

function buildKedinasanInstansiInstruction(instansiId: string): string {
  switch (instansiId) {
    case "pkn-stan":
      return "Soal ini untuk seleksi masuk PKN STAN (Politeknik Keuangan Negara STAN). Konteks soal harus relevan dengan bidang keuangan negara: gunakan skenario perpajakan, kepabeanan & cukai, akuntansi pemerintahan, pengelolaan anggaran negara (APBN/APBD), perbendaharaan. Gunakan data keuangan fiktif yang realistis. Untuk TPA: bobot pada penalaran numerik/kuantitatif yang relevan dengan akuntansi/keuangan. Untuk Bahasa Inggris: gunakan teks bertema ekonomi, keuangan, perdagangan internasional.";

    case "stis":
      return "Soal ini untuk seleksi masuk STIS (Politeknik Statistika). Konteks soal harus relevan dengan bidang statistika dan data: gunakan skenario survei fiktif, sensus, data BPS sintetis, analisis regresi, distribusi probabilitas, sampling methods. Untuk Matematika: tekankan statistika, probabilitas, kalkulus, matriks/aljabar linear. Gunakan dataset fiktif yang konsisten secara statistik.";

    case "ipdn":
      return "Soal ini untuk seleksi masuk IPDN (Institut Pemerintahan Dalam Negeri). Konteks soal harus relevan dengan pemerintahan daerah: gunakan skenario otonomi daerah, administrasi publik, pelayanan masyarakat, kebijakan desentralisasi, hubungan pusat-daerah, pengelolaan desa, musyawarah perencanaan pembangunan (musrenbang). Gunakan nama daerah, desa, dan pejabat fiktif.";

    case "stin":
      return "Soal ini untuk seleksi masuk STIN (Sekolah Tinggi Intelijen Negara). Konteks soal harus relevan dengan keamanan nasional: gunakan skenario analisis intelijen fiktif, keamanan siber, geopolitik, hubungan internasional, kontra-terorisme, analisis ancaman. Tekankan kemampuan analitis, penalaran logis, dan berpikir kritis. Untuk Bahasa Inggris: gunakan teks bertema hubungan internasional, geopolitik, keamanan.";

    default:
      return "";
  }
}
