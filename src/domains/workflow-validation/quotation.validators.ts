import { Quotation } from "../quotations/types";
import { LicensingRequest } from "../requests/types";
import { ValidationResult } from "./types";

export function canSubmitQuotation(
  quotation?: Quotation,
  request?: LicensingRequest
): ValidationResult {
  if (!quotation) {
    return { valid: false, reason: "Quotation does not exist." };
  }

  if (!quotation.items || quotation.items.length === 0) {
    return { valid: false, reason: "Quotation must have at least one item." };
  }

  if (quotation.grandTotal <= 0) {
    return { valid: false, reason: "Quotation total must be greater than zero." };
  }

  const allowedStatuses = ["DRAFT", "CHANGES_REQUESTED", "REJECTED"];
  if (!allowedStatuses.includes(quotation.quotationStatus)) {
    return {
      valid: false,
      reason: `Quotation status must be Draft, Changes Requested, or Rejected (current: ${quotation.quotationStatus}).`,
    };
  }

  return { valid: true };
}

export function canApproveQuotation(
  quotation?: Quotation,
  request?: LicensingRequest
): ValidationResult {
  if (!quotation) {
    return { valid: false, reason: "Quotation does not exist." };
  }

  if (quotation.quotationStatus !== "SUBMITTED_FOR_APPROVAL") {
    return {
      valid: false,
      reason: `Quotation must be submitted for approval (current: ${quotation.quotationStatus}).`,
    };
  }

  if (!quotation.items || quotation.items.length === 0) {
    return { valid: false, reason: "Quotation has no items." };
  }

  if (quotation.grandTotal <= 0) {
    return { valid: false, reason: "Quotation grand total must be greater than zero." };
  }

  return { valid: true };
}
