// Exam type to section templates mapping
// Each template has: title, durationMinutes, totalQuestions
// These are default values admin can modify

export type ExamType = "UTBK" | "CPNS" | "BUMN" | "PPPK" | "KEDINASAN"

export interface SectionTemplate {
  title: string
  durationMinutes: number
  totalQuestions: number
}

export const EXAM_TEMPLATES: Record<ExamType, SectionTemplate[]> = {
  UTBK: [
    { title: "TPS - Penalaran Umum", durationMinutes: 30, totalQuestions: 30 },
    { title: "TPS - Penalaran Matematika", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Indonesia", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],
  CPNS: [
    { title: "TWK - Tes Wawasan Kebangsaan", durationMinutes: 35, totalQuestions: 30 },
    { title: "TIU - Tes Intelegensia Umum", durationMinutes: 40, totalQuestions: 35 },
    { title: "TKP - Tes Karakteristik Pribadi", durationMinutes: 35, totalQuestions: 45 },
  ],
  BUMN: [
    { title: "TKD Verbal", durationMinutes: 20, totalQuestions: 25 },
    { title: "TKD Numerik", durationMinutes: 20, totalQuestions: 20 },
    { title: "AKHLAK - Core Values", durationMinutes: 20, totalQuestions: 30 },
    { title: "Bahasa Inggris", durationMinutes: 15, totalQuestions: 20 },
    { title: "Learning Agility", durationMinutes: 10, totalQuestions: 15 },
  ],
  PPPK: [
    { title: "Kompetensi Teknis", durationMinutes: 90, totalQuestions: 80 },
    { title: "Kompetensi Manajerial", durationMinutes: 25, totalQuestions: 25 },
    { title: "Kompetensi Sosio-Kultural", durationMinutes: 20, totalQuestions: 20 },
    { title: "Wawancara", durationMinutes: 10, totalQuestions: 10 },
  ],
  KEDINASAN: [
    { title: "SKD - TWK", durationMinutes: 35, totalQuestions: 30 },
    { title: "SKD - TIU", durationMinutes: 40, totalQuestions: 35 },
    { title: "SKD - TKP", durationMinutes: 35, totalQuestions: 45 },
    { title: "Tes Potensi Akademik", durationMinutes: 60, totalQuestions: 50 },
  ],
}

// Specialization-specific template variants
// UTBK Saintek/Soshum use the same TPS sections (penalaran-based, not subject-specific)
// PPPK formasi may have different section names for Teknis section
// KEDINASAN instansi have different tes khusus per institution

const SPECIALIZATION_TEMPLATES: Record<string, SectionTemplate[]> = {
  // UTBK variants — same TPS sections for all jurusan (UTBK is penalaran-based)
  "UTBK:saintek": [
    { title: "TPS - Penalaran Umum", durationMinutes: 30, totalQuestions: 30 },
    { title: "TPS - Penalaran Matematika", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Indonesia", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],
  "UTBK:soshum": [
    { title: "TPS - Penalaran Umum", durationMinutes: 30, totalQuestions: 30 },
    { title: "TPS - Penalaran Matematika", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Indonesia", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],
  "UTBK:campuran": [
    { title: "TPS - Penalaran Umum", durationMinutes: 30, totalQuestions: 30 },
    { title: "TPS - Penalaran Matematika", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Indonesia", durationMinutes: 25, totalQuestions: 20 },
    { title: "TPS - Literasi dalam Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],

  // PPPK variants
  "PPPK:guru": [
    { title: "Kompetensi Teknis - Pedagogik", durationMinutes: 45, totalQuestions: 40 },
    { title: "Kompetensi Teknis - Profesional", durationMinutes: 45, totalQuestions: 40 },
    { title: "Kompetensi Manajerial", durationMinutes: 25, totalQuestions: 25 },
    { title: "Kompetensi Sosio-Kultural", durationMinutes: 20, totalQuestions: 20 },
    { title: "Wawancara", durationMinutes: 10, totalQuestions: 10 },
  ],
  "PPPK:nakes": [
    { title: "Kompetensi Teknis - Klinis", durationMinutes: 90, totalQuestions: 80 },
    { title: "Kompetensi Manajerial", durationMinutes: 25, totalQuestions: 25 },
    { title: "Kompetensi Sosio-Kultural", durationMinutes: 20, totalQuestions: 20 },
    { title: "Wawancara", durationMinutes: 10, totalQuestions: 10 },
  ],
  "PPPK:teknis": [
    { title: "Kompetensi Teknis", durationMinutes: 90, totalQuestions: 80 },
    { title: "Kompetensi Manajerial", durationMinutes: 25, totalQuestions: 25 },
    { title: "Kompetensi Sosio-Kultural", durationMinutes: 20, totalQuestions: 20 },
    { title: "Wawancara", durationMinutes: 10, totalQuestions: 10 },
  ],

  // KEDINASAN variants — different tes khusus per institution
  "KEDINASAN:pkn-stan": [
    { title: "SKD - TWK", durationMinutes: 35, totalQuestions: 30 },
    { title: "SKD - TIU", durationMinutes: 40, totalQuestions: 35 },
    { title: "SKD - TKP", durationMinutes: 35, totalQuestions: 45 },
    { title: "TPA - Tes Potensi Akademik", durationMinutes: 30, totalQuestions: 25 },
    { title: "Bahasa Inggris", durationMinutes: 20, totalQuestions: 25 },
  ],
  "KEDINASAN:stis": [
    { title: "SKD - TWK", durationMinutes: 35, totalQuestions: 30 },
    { title: "SKD - TIU", durationMinutes: 40, totalQuestions: 35 },
    { title: "SKD - TKP", durationMinutes: 35, totalQuestions: 45 },
    { title: "Matematika Dasar", durationMinutes: 30, totalQuestions: 25 },
    { title: "Matematika IPA", durationMinutes: 30, totalQuestions: 25 },
    { title: "Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],
  "KEDINASAN:ipdn": [
    { title: "SKD - TWK", durationMinutes: 35, totalQuestions: 30 },
    { title: "SKD - TIU", durationMinutes: 40, totalQuestions: 35 },
    { title: "SKD - TKP", durationMinutes: 35, totalQuestions: 45 },
    { title: "Pengetahuan Umum", durationMinutes: 25, totalQuestions: 25 },
    { title: "Bahasa Indonesia", durationMinutes: 20, totalQuestions: 20 },
    { title: "Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
  ],
  "KEDINASAN:stin": [
    { title: "SKD - TWK", durationMinutes: 35, totalQuestions: 30 },
    { title: "SKD - TIU", durationMinutes: 40, totalQuestions: 35 },
    { title: "SKD - TKP", durationMinutes: 35, totalQuestions: 45 },
    { title: "Pengetahuan Umum", durationMinutes: 25, totalQuestions: 20 },
    { title: "Matematika", durationMinutes: 25, totalQuestions: 20 },
    { title: "Bahasa Inggris", durationMinutes: 20, totalQuestions: 20 },
    { title: "Bahasa Indonesia", durationMinutes: 15, totalQuestions: 15 },
  ],
}

export function getTemplateForExam(examType: ExamType, specializationId?: string): SectionTemplate[] {
  if (specializationId) {
    const key = `${examType}:${specializationId}`
    const variant = SPECIALIZATION_TEMPLATES[key]
    if (variant) return variant
  }
  return EXAM_TEMPLATES[examType] ?? []
}

// Category name patterns to detect exam type
export const CATEGORY_TO_EXAM_TYPE: Record<string, ExamType> = {
  utbk: "UTBK",
  snbt: "UTBK",
  cpns: "CPNS",
  bumn: "BUMN",
  pppk: "PPPK",
  kedinasan: "KEDINASAN",
  stan: "KEDINASAN",
  stis: "KEDINASAN",
  ipdn: "KEDINASAN",
}

export function detectExamTypeFromCategory(categoryName: string): ExamType | null {
  const lower = categoryName.toLowerCase()
  for (const [key, type] of Object.entries(CATEGORY_TO_EXAM_TYPE)) {
    if (lower.includes(key)) return type
  }
  return null
}
