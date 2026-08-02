import { Quotation } from "../types";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { syncQuotationAndRequest } from "./helpers/sync";
import { appendTimelineEvent } from "./helpers/timeline";
import { persistQuotation, persistRequest } from "./helpers/persist";
import { canSubmitQuotation, canApproveQuotation } from "@/domains/workflow-validation";
import { createInvoiceFromApprovedQuotation } from "@/domains/invoices/workflow";
import { isCrossTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

/**
 * Refuses a cross-tenant decision on a quotation.
 *
 * Rejects rather than returning not-found — the mirror of the scoped *readers*.
 * A reader is handed an id and cannot tell a foreign record from a missing one,
 * so it fails closed to null. A decision function is handed a resolved record,
 * so a tenant mismatch is an attempt to act on another company's quotation and
 * must be refused explicitly. Same shape as `resolveClosableProject`
 * (`domains/closure/workflow.ts`).
 *
 * Keyed on the request's `tenantId`, which is required by the type; the
 * quotation's is optional and only checked when present, so pre-tenancy rows
 * still decide correctly instead of dead-locking.
 *
 * Super Admin passes through via `isCrossTenant`, matching `scopeToTenant`.
 */
function assertTenantMayDecide(
  quotation: Quotation,
  request: LicensingRequest,
  ctx: TenantContext
): void {
  if (isCrossTenant(ctx.role)) return;
  // Fails closed: an unauthenticated or half-initialised context must never be
  // indistinguishable from a super admin.
  if (!ctx.tenantId) {
    throw new Error("A quotation decision requires the acting user's tenant.");
  }
  if (request.tenantId !== ctx.tenantId) {
    throw new Error("A quotation may only be decided by its owning tenant.");
  }
  if (quotation.tenantId && quotation.tenantId !== ctx.tenantId) {
    throw new Error("A quotation may only be decided by its owning tenant.");
  }
}


export function submitQuotationForApproval({
  quotation,
  request,
  submittedBy,
  ctx,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  submittedBy: string;
  /** Acting user's tenant. Required — a submission cannot be attributed without it. */
  ctx: TenantContext;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  assertTenantMayDecide(quotation, request, ctx);

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
  ctx,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  approvedBy: string;
  /** Acting user's tenant. Required — a decision cannot be attributed without it. */
  ctx: TenantContext;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  assertTenantMayDecide(quotation, request, ctx);

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

  // Transition to READY_FOR_PAYMENT stage
  const { updatedQuotation, updatedRequest: syncedRequest } = syncQuotationAndRequest(
    approvedQuote,
    request,
    "READY_FOR_PAYMENT" as WorkflowStage
  );

  // Explicitly update request status to awaiting_payment
  const requestWithUpdatedStatus = {
    ...syncedRequest,
    status: "awaiting_payment" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "awaiting_payment",
    "Invoice issued / awaiting client payment"
  );

  persistQuotation(updatedQuotation);
  persistRequest(updatedRequest);

  // Generate unpaid invoice through Invoice Domain workflow
  createInvoiceFromApprovedQuotation({
    quotation: updatedQuotation,
    request: updatedRequest,
    approvedBy,
  });

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
  ctx,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  rejectedBy: string;
  reason: string;
  /** Acting user's tenant. Required — a decision cannot be attributed without it. */
  ctx: TenantContext;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  assertTenantMayDecide(quotation, request, ctx);

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
  ctx,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  reviewedBy: string;
  comments: string;
  /** Acting user's tenant. Required — a decision cannot be attributed without it. */
  ctx: TenantContext;
}): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  assertTenantMayDecide(quotation, request, ctx);

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

