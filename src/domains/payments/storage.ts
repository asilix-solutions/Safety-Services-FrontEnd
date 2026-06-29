import { ClientPayment } from "./types";

export function getPayments(): ClientPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_PAYMENTS");
    const list: ClientPayment[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
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
  const index = payments.findIndex((p) => p.id === payment.id || p.invoiceId === payment.invoiceId);
  if (index !== -1) {
    payments[index] = payment;
  } else {
    payments.push(payment);
  }
  savePayments(payments);
}
