import { ClientInvoice } from "./types";

export function getInvoices(): ClientInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_INVOICES");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_INVOICES from localStorage", err);
    return [];
  }
}

export function saveInvoices(invoices: ClientInvoice[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_INVOICES", JSON.stringify(invoices));
  } catch (err) {
    console.error("Failed to write SSLM_INVOICES to localStorage", err);
  }
}

export function createOrUpdateInvoice(invoice: ClientInvoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.jobNumber === invoice.jobNumber);
  if (index !== -1) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  saveInvoices(invoices);
}
