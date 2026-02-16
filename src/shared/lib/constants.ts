export const APP_NAME = "Toutopia";
export const APP_DESCRIPTION =
  "Platform try out online premium untuk UTBK, CPNS, BUMN, dan ujian lainnya";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const FREE_CREDITS_ON_SIGNUP = 2;

export const EXAM_CATEGORIES = {
  UTBK: "utbk-snbt",
  CPNS: "cpns",
  BUMN: "bumn",
  KEDINASAN: "kedinasan",
  PPPK: "pppk",
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMITS = {
  AUTH: { max: 5, windowMs: 60_000 },
  API: { max: 100, windowMs: 60_000 },
  EXAM_ANSWER: { max: 30, windowMs: 60_000 },
} as const;

export const ANTI_CHEAT = {
  MAX_VIOLATIONS_DEFAULT: 4,
  ANSWER_MIN_INTERVAL_MS: 2_000,
} as const;

export const TEACHER_EARNINGS = {
  BASE_RATE_PER_ATTEMPT: 500,
  QUALITY_BONUS_THRESHOLD: 4.5,
  QUALITY_BONUS_MULTIPLIER: 1.2,
  VOLUME_BONUS_THRESHOLD: 100,
  VOLUME_BONUS_MULTIPLIER: 1.1,
  MIN_PAYOUT_AMOUNT: 100_000,
} as const;
