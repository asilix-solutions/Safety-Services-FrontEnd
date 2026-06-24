import { ClientPayment } from "./types";

export function getPayments(): ClientPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_PAYMENTS");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_PAYMENTS from localStorage", err);
    return [];
  }
}

export function savePayments(payments: ClientPayment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_PAYMENTS", JSON.stringify(payments));
  } catch (err) {
    console.error("Failed to write SSLM_PAYMENTS to localStorage", err);
  }
}

export function createOrUpdatePayment(payment: ClientPayment): void {
  const payments = getPayments();
  const index = payments.findIndex((p) => p.invoiceId === payment.invoiceId);
  if (index !== -1) {
    payments[index] = payment;
  } else {
    payments.push(payment);
  }
  savePayments(payments);
}
