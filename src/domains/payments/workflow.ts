import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { createOrUpdateInvoice } from "@/domains/invoices/storage";
import { ClientPayment } from "@/domains/payments/types";
import { getPayments, createOrUpdatePayment } from "@/domains/payments/storage";
import { upsertRequest } from "@/domains/requests/storage";


import { provisionProjectWorkspace } from "@/domains/projects/workflow";
import { getMergedRequests } from "@/domains/requests/storage";

export function confirmMockPayment({
  invoice,
  request,
  paidBy,
}: {
  invoice: ClientInvoice;
  request: LicensingRequest;
  paidBy: string;
}): {
  updatedInvoice: ClientInvoice;
  paymentRecord: ClientPayment;
  updatedRequest: LicensingRequest;
} {
  // Step 1: Validate invoice
  if (invoice.status === "paid") {
    throw new Error("Invoice is already paid.");
  }

  // Step 2: Prevent duplicate payments
  const payments = getPayments();
  const existingPayment = payments.find((p) => p.invoiceId === invoice.id);
  if (existingPayment) {
    throw new Error("A payment record already exists for this invoice.");
  }

  const nowStr = new Date().toISOString();

  // Step 3: Create ClientPayment
  const paymentRecord: ClientPayment = {
    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceId: invoice.id,
    jobNumber: request.jobNumber,
    amountPaid: invoice.grandTotal,
    paymentMethod: "MOCK_PAYMENT",
    transactionReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    paidAt: nowStr,
    status: "SUCCESS",
  };
  createOrUpdatePayment(paymentRecord);

  // Step 4: Update Invoice
  const updatedInvoice: ClientInvoice = {
    ...invoice,
    status: "paid",
    paidAt: nowStr,
  };
  createOrUpdateInvoice(updatedInvoice);

  // Step 5: Update Request stage to PAYMENT_CONFIRMED
  const requestWithUpdatedStage: LicensingRequest = {
    ...request,
    currentStage: "PAYMENT_CONFIRMED" as WorkflowStage,
    status: "quotation_created" as const,
    updatedAt: nowStr,
  };

  // Step 6: Timeline Event
  const updatedTimeline = [...requestWithUpdatedStage.timeline];
  updatedTimeline.push({
    status: "quotation_created",
    comment: `Payment Confirmed. Ref: ${paymentRecord.transactionReference} by ${paidBy}`,
    date: nowStr,
  });

  const requestWithPayment: LicensingRequest = {
    ...requestWithUpdatedStage,
    timeline: updatedTimeline,
  };

  // Automatically provision the project workspace (domain orchestration)
  provisionProjectWorkspace({ request: requestWithPayment, payment: paymentRecord });

  // Retrieve the final updated request state from the storage layer
  const updatedRequest = getMergedRequests().find((r) => r.jobNumber === request.jobNumber) || requestWithPayment;

  return {
    updatedInvoice,
    paymentRecord,
    updatedRequest,
  };
}

