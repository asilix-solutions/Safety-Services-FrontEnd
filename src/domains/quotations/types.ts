export type QuotationStatus =
  | "DRAFT"
  | "SUBMITTED_FOR_APPROVAL";

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
}

export interface Quotation {
  tenantId?: string;
  jobNumber: string;
  quotationStatus: QuotationStatus;
  items: QuotationItem[];
  subtotal: number;
  vat: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  submittedBy?: string;
  submittedAt?: string;
}
