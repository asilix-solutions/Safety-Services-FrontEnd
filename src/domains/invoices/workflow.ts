import { Quotation } from "@/domains/quotations/types";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientInvoice } from "./types";
import { getInvoices, createOrUpdateInvoice } from "./storage";

export function createInvoiceFromApprovedQuotation({
  quotation,
  request,
  approvedBy,
}: {
  quotation: Quotation;
  request: LicensingRequest;
  approvedBy: string;
}): ClientInvoice {
  if (quotation.quotationStatus !== "APPROVED") {
    throw new Error("Quotation must be APPROVED to generate an invoice.");
  }

  // Duplicate prevention check
  const existingInvoices = getInvoices();
  const existingInvoice = existingInvoices.find(
    (inv) => inv.jobNumber === request.jobNumber || inv.quotationJobNumber === request.jobNumber
  );

  if (existingInvoice) {
    return existingInvoice;
  }

  const nowStr = new Date().toISOString();
  
  // Set due date to 30 days from now
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + 30);
  const dueDateStr = dueDateObj.toISOString();

  const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInvoice: ClientInvoice = {
    id: invoiceId,
    tenantId: request.tenantId || "default-tenant",
    jobNumber: request.jobNumber,
    quotationJobNumber: request.jobNumber,
    subtotal: quotation.subtotal || 0,
    vatAmount: quotation.vat || 0,
    grandTotal: quotation.grandTotal || 0,
    currency: "SAR",
    status: "unpaid",
    dueDate: dueDateStr,
    issuedAt: nowStr,
  };

  createOrUpdateInvoice(newInvoice);

  return newInvoice;
}
