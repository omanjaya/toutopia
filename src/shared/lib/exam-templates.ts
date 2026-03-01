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
