import { Quotation, QuotationItem } from "../types";
import { VAT_RATE } from "@/constants/tax";

export function computeQuotationTotals(items: QuotationItem[]): { subtotal: number; vat: number; grandTotal: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxableSum = items.filter(item => item.taxable).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vat = taxableSum * VAT_RATE;
  const grandTotal = subtotal + vat;
  return { subtotal, vat, grandTotal };
}

export function createQuotationDraft(jobNumber: string): Quotation {
  const nowStr = new Date().toISOString();
  return {
    jobNumber,
    quotationStatus: "DRAFT",
    items: [],
    subtotal: 0,
    vat: 0,
    grandTotal: 0,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
}

export function updateQuotationItems(
  quotation: Quotation,
  items: QuotationItem[]
): Quotation {
  const { subtotal, vat, grandTotal } = computeQuotationTotals(items);

  return {
    ...quotation,
    items,
    subtotal,
    vat,
    grandTotal,
    updatedAt: new Date().toISOString(),
  };
}
