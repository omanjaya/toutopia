import { DomainError } from "./domain-error";

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("INVALID_CREDENTIALS", "Email atau password salah");
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor() {
    super("EMAIL_EXISTS", "Email sudah terdaftar");
  }
}

export class AccountSuspendedError extends DomainError {
  constructor() {
    super("ACCOUNT_SUSPENDED", "Akun Anda telah ditangguhkan");
  }
}

export class AccountBannedError extends DomainError {
  constructor() {
    super("ACCOUNT_BANNED", "Akun Anda telah diblokir");
  }
}

export class EmailNotVerifiedError extends DomainError {
  constructor() {
    super("EMAIL_NOT_VERIFIED", "Silakan verifikasi email Anda terlebih dahulu");
  }
}
