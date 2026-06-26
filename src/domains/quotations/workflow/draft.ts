import { Quotation, QuotationItem } from "../types";

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
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxableSum = items.filter(item => item.taxable).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vat = taxableSum * 0.15; // 15% VAT on taxable items only
  const grandTotal = subtotal + vat;

  return {
    ...quotation,
    items,
    subtotal,
    vat,
    grandTotal,
    updatedAt: new Date().toISOString(),
  };
}
