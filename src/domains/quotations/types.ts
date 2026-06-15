export type QuotationStatus =
  | "DRAFT"
  | "SUBMITTED_FOR_APPROVAL"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

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
  approvedBy?: string;
  approvedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

