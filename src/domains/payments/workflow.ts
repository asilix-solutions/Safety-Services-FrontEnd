import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { createOrUpdateInvoice } from "@/domains/invoices/storage";
import { ClientPayment } from "@/domains/payments/types";
import { getPayments, createOrUpdatePayment } from "@/domains/payments/storage";
import { upsertRequest } from "@/domains/requests/storage";
import { provisionProjectFromRequest } from "@/domains/projects/storage";
import { Project } from "@/types/project";

export function confirmMockPaymentAndInitializeProject({
  request,
  invoice,
}: {
  request: LicensingRequest;
  invoice: ClientInvoice;
}): {
  updatedRequest: LicensingRequest;
  updatedInvoice: ClientInvoice;
  payment: ClientPayment;
  project?: Project;
} {
  const nowStr = new Date().toISOString();

  // 1. Mark Invoice Paid idempotently
  let updatedInvoice = { ...invoice };
  if (invoice.status !== "paid") {
    updatedInvoice = {
      ...invoice,
      status: "paid",
      paidAt: nowStr,
    };
    createOrUpdateInvoice(updatedInvoice);
  }

  // 2. Create / Fetch Payment Record idempotently
  const payments = getPayments();
  let payment = payments.find((p) => p.invoiceId === invoice.id);
  if (!payment) {
    payment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: invoice.id,
      jobNumber: request.jobNumber,
      amountPaid: invoice.grandTotal,
      paymentMethod: "MOCK_PAYMENT",
      transactionReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: nowStr,
      status: "SUCCESS",
    };
    createOrUpdatePayment(payment);
  }

  // 3. Update Request stage to PROJECT_CREATED and append timeline event idempotently
  const updatedTimeline = [...request.timeline];
  const hasTimelineMarker = updatedTimeline.some(
    (t) => t.status === "APPROVED" && t.comment.includes("Payment Confirmed")
  );
  if (!hasTimelineMarker) {
    updatedTimeline.push({
      status: "APPROVED",
      comment: `Payment Confirmed. Ref: ${payment.transactionReference}`,
      date: nowStr,
    });
  }

  const updatedRequest: LicensingRequest = {
    ...request,
    currentStage: "PROJECT_CREATED" as WorkflowStage,
    updatedAt: nowStr,
    timeline: updatedTimeline,
  };

  upsertRequest(updatedRequest);

  // 4. Provision Project Record (uses updatedRequest as approved)
  const project = provisionProjectFromRequest(updatedRequest);

  return {
    updatedRequest,
    updatedInvoice,
    payment,
    project,
  };
}
