import { Quotation } from "../types";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { syncQuotationAndRequest } from "./helpers/sync";
import { appendTimelineEvent } from "./helpers/timeline";
import { persistQuotation, persistRequest, persistInvoice } from "./helpers/persist";
import { createInvoiceForQuotation } from "./payment";

export function submitQuotationForApproval({
  quotation,
  request,
  submittedBy,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  submittedBy: string;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  const draftQuote = {
    ...quotation,
    quotationStatus: "SUBMITTED_FOR_APPROVAL" as const,
    submittedBy,
    submittedAt: nowStr,
  };

  // Business decision: Transition to QUOTATION_APPROVAL
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    draftQuote,
    request,
    "QUOTATION_APPROVAL" as WorkflowStage
  );

  const updatedRequest = appendTimelineEvent(
    syncedRequest,
    "submitted",
    `Quotation submitted for client review by ${submittedBy}. Total: SAR ${quotation.grandTotal.toLocaleString()}`
  );

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  return {
    updatedQuotation,
    updatedRequest,
  };
}

export function approveQuotation({
  quotation,
  request,
  approvedBy,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  approvedBy: string;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  const approvedQuote = {
    ...quotation,
    quotationStatus: "APPROVED" as const,
    approvedBy,
    approvedAt: nowStr,
  };

  // Business decision: Transition to PAYMENT_CONFIRMED
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    approvedQuote,
    request,
    "PAYMENT_CONFIRMED" as WorkflowStage
  );

  const updatedRequest = appendTimelineEvent(
    syncedRequest,
    "approved",
    `Quotation approved by client. Awaiting down-payment confirmation.`
  );

  // Generate and save invoice
  const invoice = createInvoiceForQuotation(updatedRequest, updatedQuotation);
  persistInvoice(invoice);

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  return {
    updatedQuotation,
    updatedRequest,
  };
}

export function rejectQuotation({
  quotation,
  request,
  rejectedBy,
  reason,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  rejectedBy: string;
  reason: string;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  const rejectedQuote = {
    ...quotation,
    quotationStatus: "REJECTED" as const,
    rejectedBy,
    rejectedAt: nowStr,
    rejectionReason: reason,
  };

  // Business decision: Move stage back to QUOTATION
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    rejectedQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  const updatedRequest = appendTimelineEvent(
    syncedRequest,
    "under_review",
    `Quotation rejected. Reason: ${reason}`
  );

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  return {
    updatedQuotation,
    updatedRequest,
  };
}

export function requestChangesOnQuotation({
  quotation,
  request,
  reviewedBy,
  comments,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  reviewedBy: string;
  comments: string;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  const reviewedQuote = {
    ...quotation,
    quotationStatus: "CHANGES_REQUESTED" as const,
    reviewedBy,
    reviewedAt: nowStr,
    reviewComments: comments,
  };

  // Business decision: Move stage back to QUOTATION
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    reviewedQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  const updatedRequest = appendTimelineEvent(
    syncedRequest,
    "under_review",
    `Quotation changes requested. Comments: ${comments}`
  );

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  return {
    updatedQuotation,
    updatedRequest,
  };
}

