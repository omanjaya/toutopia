import { DomainError } from "./domain-error";

export class PaymentNotFoundError extends DomainError {
  constructor() {
    super("PAYMENT_NOT_FOUND", "Transaksi tidak ditemukan");
  }
}

export class PaymentAlreadyProcessedError extends DomainError {
  constructor() {
    super("PAYMENT_PROCESSED", "Transaksi sudah diproses");
  }
}

export class InvalidPaymentSignatureError extends DomainError {
  constructor() {
    super("INVALID_SIGNATURE", "Signature pembayaran tidak valid");
  }
}

export class PaymentExpiredError extends DomainError {
  constructor() {
    super("PAYMENT_EXPIRED", "Transaksi telah kedaluwarsa");
  }
}
