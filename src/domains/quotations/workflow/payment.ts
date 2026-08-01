import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientPayment } from "@/domains/payments/types";
import { Project } from "@/types/project";
import { Quotation } from "../types";
import { syncInvoiceAndRequest } from "./helpers/sync";
import { appendTimelineEvent } from "./helpers/timeline";
import { persistInvoice, persistRequest, persistProject } from "./helpers/persist";
import { createOrUpdatePayment } from "@/domains/payments/storage";
import { canConfirmPayment } from "@/domains/workflow-validation";
import { getQuotations } from "../storage";

export function confirmPaymentAndCreateProject({
  request,
  invoice,
  transactionReference,
  amountPaid,
  paymentMethod,
}: {
  request: LicensingRequest;
  invoice: ClientInvoice;
  transactionReference: string;
  amountPaid: number;
  paymentMethod: string;
}): {
  updatedRequest: LicensingRequest;
  updatedInvoice: ClientInvoice;
  payment: ClientPayment;
  project: Project;
} {
  const quotations = getQuotations();
  const quotation = quotations.find((q) => q.jobNumber === request.jobNumber);

  const validation = canConfirmPayment(invoice, quotation);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const nowStr = new Date().toISOString();


  // Create payment record
  const payment: ClientPayment = {
    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceId: invoice.id,
    jobNumber: request.jobNumber,
    amountPaid,
    paymentMethod: paymentMethod as "MOCK_PAYMENT",
    transactionReference,
    paidAt: nowStr,
    status: "SUCCESS",
  };
  createOrUpdatePayment(payment);

  // Business decision: Transition to PROJECT_CREATED
  const { updatedInvoice, updatedRequest: syncedRequest, project } = syncInvoiceAndRequest(
    invoice,
    request,
    "PROJECT_CREATED" as WorkflowStage
  );

  // `syncInvoiceAndRequest` writes `currentStage` only, so the paired `status`
  // has to be set here — exactly as the four `syncQuotationAndRequest` callers
  // in approval.ts do. `appendTimelineEvent` below does NOT do it: its status
  // argument labels the timeline entry and never touches the field, so relying
  // on it left the request persisted at PROJECT_CREATED while `status` still
  // read `awaiting_payment` — a paid, provisioned request displaying as
  // awaiting payment, since `status` drives the badges and the active filter.
  //
  // `approved` is the pairing `provisionProjectWorkspace` uses for
  // PROJECT_CREATED, so both provisioning paths agree.
  const requestWithUpdatedStatus: LicensingRequest = {
    ...syncedRequest,
    status: "approved" as const,
  };

  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStatus,
    "approved", // status in timeline schema matches Payment approved
    `Payment Confirmed. Ref: ${transactionReference}`
  );

  persistInvoice(updatedInvoice);
  persistRequest(updatedRequest);
  persistProject(project);

  return {
    updatedRequest,
    updatedInvoice,
    payment,
    project,
  };
}

export function createInvoiceForQuotation(
  request: LicensingRequest,
  quotation: Quotation
): ClientInvoice {
  const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

  return {
    id: invoiceId,
    tenantId: request.tenantId,
    clientId: request.clientId,
    jobNumber: request.jobNumber,
    quotationJobNumber: request.jobNumber,
    subtotal: quotation.subtotal || 0,
    vatAmount: quotation.vat || 0,
    grandTotal: quotation.grandTotal || 0,
    currency: "SAR",
    status: "unpaid",
    dueDate: dueDate.toISOString(),
    issuedAt: new Date().toISOString(),
  };
}

