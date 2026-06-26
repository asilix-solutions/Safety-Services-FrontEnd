import { Quotation } from "../../types";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { Project } from "@/types/project";
import { provisionProjectFromRequest } from "@/domains/projects/storage";

export function syncQuotationAndRequest(
  quotation: Quotation,
  request: LicensingRequest,
  stage: WorkflowStage
): { updatedQuotation: Quotation; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  const updatedQuotation = {
    ...quotation,
    updatedAt: nowStr,
  };

  const updatedRequest = {
    ...request,
    currentStage: stage,
    updatedAt: nowStr,
  };

  return {
    updatedQuotation,
    updatedRequest,
  };
}

export function syncInvoiceAndRequest(
  invoice: ClientInvoice,
  request: LicensingRequest,
  stage: WorkflowStage
): { updatedInvoice: ClientInvoice; updatedRequest: LicensingRequest; project: Project } {
  const nowStr = new Date().toISOString();

  const updatedInvoice: ClientInvoice = {
    ...invoice,
    status: "paid",
    paidAt: nowStr,
  };

  const updatedRequest: LicensingRequest = {
    ...request,
    currentStage: stage,
    updatedAt: nowStr,
  };

  // Delegate project provisioning to sync/storage layers
  const project = provisionProjectFromRequest(updatedRequest);

  return {
    updatedInvoice,
    updatedRequest,
    project,
  };
}
