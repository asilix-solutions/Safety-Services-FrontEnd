import { Quotation } from "../types";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { syncQuotationAndRequest } from "./helpers/sync";
import { appendTimelineEvent } from "./helpers/timeline";
import { persistQuotation, persistRequest } from "./helpers/persist";
import { canSubmitQuotation, canApproveQuotation } from "@/domains/workflow-validation";

export function submitQuotationForApproval({
  quotation,
  request,
  submittedBy,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  submittedBy: string;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const validation = canSubmitQuotation(quotation, request);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const nowStr = new Date().toISOString();

  const draftQuote = {
    ...quotation,
    quotationStatus: "SUBMITTED_FOR_APPROVAL" as const,
    submittedBy,
    submittedAt: nowStr,
  };

  // Keep in QUOTATION stage
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    draftQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  // Explicitly update request status to quotation_created
  const requestWithUpdatedStatus = {
    ...syncedRequest,
    status: "quotation_created" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "quotation_created",
    `Quotation submitted for review by ${submittedBy}. Total: SAR ${quotation.grandTotal.toLocaleString()}`
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
  const validation = canApproveQuotation(quotation, request);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const nowStr = new Date().toISOString();

  const approvedQuote = {
    ...quotation,
    quotationStatus: "APPROVED" as const,
    approvedBy,
    approvedAt: nowStr,
  };

  // Keep in QUOTATION stage
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    approvedQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  // Explicitly update request status to quotation_created
  const requestWithUpdatedStatus = {
    ...syncedRequest,
    status: "quotation_created" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "quotation_created",
    `Quotation approved internally by ${approvedBy}.`
  );

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

  // Keep in QUOTATION stage
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    rejectedQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  // Explicitly update request status to closed
  const requestWithUpdatedStatus = {
    ...syncedRequest,
    status: "closed" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "closed",
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

  // Keep in QUOTATION stage
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    reviewedQuote,
    request,
    "QUOTATION" as WorkflowStage
  );

  // Explicitly update request status to quotation_created
  const requestWithUpdatedStatus = {
    ...syncedRequest,
    status: "quotation_created" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "quotation_created",
    `Quotation changes requested. Comments: ${comments}`
  );

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  return {
    updatedQuotation,
    updatedRequest,
  };
}

