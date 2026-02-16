import { DomainError } from "./domain-error";

export class ExamNotFoundError extends DomainError {
  constructor() {
    super("EXAM_NOT_FOUND", "Paket ujian tidak ditemukan");
  }
}

export class ExamAlreadyInProgressError extends DomainError {
  constructor() {
    super("EXAM_IN_PROGRESS", "Anda masih memiliki sesi ujian yang aktif");
  }
}

export class ExamExpiredError extends DomainError {
  constructor() {
    super("EXAM_EXPIRED", "Waktu ujian telah habis");
  }
}

export class InsufficientCreditsError extends DomainError {
  constructor() {
    super("INSUFFICIENT_CREDITS", "Kredit tidak mencukupi");
  }
}

export class MaxAttemptsReachedError extends DomainError {
  constructor() {
    super("MAX_ATTEMPTS", "Anda telah mencapai batas maksimal percobaan");
  }
}

export class ExamNotAccessibleError extends DomainError {
  constructor() {
    super("EXAM_NOT_ACCESSIBLE", "Anda tidak memiliki akses ke paket ini");
  }
}
