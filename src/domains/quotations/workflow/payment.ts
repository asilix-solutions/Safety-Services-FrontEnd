import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { ClientPayment } from "@/domains/payments/types";
import { Project } from "@/types/project";
import { Quotation } from "../types";
import { syncInvoiceAndRequest } from "./helpers/sync";
import { appendTimelineEvent } from "./helpers/timeline";
import { persistInvoice, persistRequest, persistProject } from "./helpers/persist";
import { createOrUpdatePayment } from "@/domains/payments/storage";

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
  const nowStr = new Date().toISOString();

  // Create payment record
  const payment: ClientPayment = {
    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceId: invoice.id,
    jobNumber: request.jobNumber,
    amountPaid,
    paymentMethod,
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

  const updatedRequest = appendTimelineEvent(
    syncedRequest,
    "APPROVED", // status in timeline schema matches Payment APPROVED
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
    tenantId: request.tenantId || "default-tenant",
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

