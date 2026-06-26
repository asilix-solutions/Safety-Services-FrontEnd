import { Quotation } from "./types";

export function getQuotations(): Quotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_QUOTATIONS");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_QUOTATIONS", err);
    return [];
  }
}

export function saveQuotations(quotations: Quotation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_QUOTATIONS", JSON.stringify(quotations));
  } catch (err) {
    console.error("Failed to save SSLM_QUOTATIONS", err);
  }
}

export function createOrUpdateQuotation(quotation: Quotation): void {
  const quotations = getQuotations();
  const index = quotations.findIndex((q) => q.jobNumber === quotation.jobNumber);
  if (index !== -1) {
    quotations[index] = quotation;
  } else {
    quotations.push(quotation);
  }
  saveQuotations(quotations);
}
