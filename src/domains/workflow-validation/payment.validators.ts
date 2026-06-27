import { ClientInvoice } from "../invoices/types";
import { Quotation } from "../quotations/types";
import { ValidationResult } from "./types";

export function canConfirmPayment(
  invoice?: ClientInvoice,
  quotation?: Quotation
): ValidationResult {
  if (!invoice) {
    return { valid: false, reason: "Invoice does not exist." };
  }

  if (invoice.status === "paid") {
    return { valid: false, reason: "Invoice has already been paid." };
  }

  if (!quotation) {
    return { valid: false, reason: "Quotation does not exist." };
  }

  if (quotation.quotationStatus !== "APPROVED") {
    return {
      valid: false,
      reason: `Quotation is not approved (current status: ${quotation.quotationStatus}).`,
    };
  }

  return { valid: true };
}
