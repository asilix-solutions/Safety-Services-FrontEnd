import { Quotation } from "../../types";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { Project } from "@/types/project";
import { createOrUpdateQuotation } from "../../storage";
import { upsertRequest } from "@/domains/requests/storage";
import { createOrUpdateInvoice } from "@/domains/invoices/storage";
import { createOrUpdateProject } from "@/domains/projects/storage";

export function persistQuotation(quotation: Quotation): void {
  createOrUpdateQuotation(quotation);
}

export function persistRequest(request: LicensingRequest): void {
  upsertRequest(request);
}

export function persistInvoice(invoice: ClientInvoice): void {
  createOrUpdateInvoice(invoice);
}

export function persistProject(project: Project): void {
  createOrUpdateProject(project);
}
