export interface PracticeTopic {
  id: string;
  name: string;
}

export interface PracticeSubject {
  id: string;
  name: string;
  topics: PracticeTopic[];
}

export interface PracticeSubCategory {
  id: string;
  name: string;
  subjects: PracticeSubject[];
}

export interface PracticeCategory {
  id: string;
  name: string;
  subCategories: PracticeSubCategory[];
}

export interface PracticeOption {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  isCorrect: boolean;
}

export interface PracticeQuestion {
  id: string;
  index: number;
  content: string;
  type: string;
  imageUrl: string | null;
  explanation: string | null;
  topicName: string;
  subjectName: string;
  options: PracticeOption[];
}

export const DIFFICULTY_OPTIONS = [
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
] as const;

export const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50] as const;
