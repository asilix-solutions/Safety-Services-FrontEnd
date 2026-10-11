import { http } from "@/services/http";

export enum TaxInvoiceStatus {
  Draft = 1,
  Issued = 2,
  Voided = 3,
}

export interface TaxInvoiceDto {
  id: string;
  instanceId: string;
  jobNumber?: string;
  quotationId: string;
  invoiceNumber: string;
  status: TaxInvoiceStatus;
  sellerName: string;
  sellerVatNumber: string;
  buyerName: string;
  buyerVatNumber?: string;
  subtotalAmount: number;
  vatRateApplied: number;
  vatAmount: number;
  totalWithVat: number;
  currencyCode: string;
  issuedAtUtc?: string;
  qrCodePayload?: string;
  invoiceHash?: string;
  previousInvoiceHash?: string;
  voidReason?: string;
  voidedAtUtc?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InvoicesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: TaxInvoiceStatus;
  searchTerm?: string;
}

export interface IssueInvoicePayload {
  buyerVatNumber?: string;
}

export interface VatReturnSummaryDto {
  periodStartUtc: string;
  periodEndUtc: string;
  currencyCode: string;
  invoicesIssued: number;
  outputTaxableAmount: number;
  outputVat: number;
  invoicesVoided: number;
  voidedTaxableAmount: number;
  voidedVat: number;
  netOutputVat: number;
  expensesRecorded: number;
  inputTaxableAmount: number;
  reclaimableInputVat: number;
  nonReclaimableInputVat: number;
  unsupportedInputVat: number;
  expensesMissingVendorVatNumber: number;
  netVatPayable: number;
}

export interface InvoiceChainStatusDto {
  isIntact: boolean;
  invoicesVerified: number;
  firstBrokenInvoiceNumber?: string;
  reason?: string;
}

export const invoicesApi = {
  /**
   * Retrieves paginated list of ZATCA tax invoices.
   * GET /api/v1/invoices
   */
  async getInvoices(params?: InvoicesQueryParams) {
    return http.get<PaginatedList<TaxInvoiceDto>>("/invoices", { params });
  },

  /**
   * Retrieves single invoice details with TLV QR payload and hash.
   * GET /api/v1/invoices/{id}
   */
  async getInvoiceById(id: string) {
    return http.get<TaxInvoiceDto>(`/invoices/${id}`);
  },

  /**
   * Raises and cryptographically chains a ZATCA tax invoice for an accepted job.
   * POST /api/v1/workflow-instances/{instanceId}/invoice
   */
  async issueInvoice(instanceId: string, payload?: IssueInvoicePayload) {
    return http.post<TaxInvoiceDto>(
      `/workflow-instances/${instanceId}/invoice`,
      payload || {}
    );
  },

  /**
   * Voids an issued invoice, preserving the audit ledger and hash chain.
   * POST /api/v1/workflow-instances/{instanceId}/invoice/void
   */
  async voidInvoice(instanceId: string, reason: string) {
    return http.post<TaxInvoiceDto>(`/workflow-instances/${instanceId}/invoice/void`, {
      reason,
    });
  },

  /**
   * Summarizes VAT return position (output tax, input tax, net payable).
   * GET /api/v1/invoices/vat-summary
   */
  async getVatSummary(fromUtc: string, toUtc: string) {
    return http.get<VatReturnSummaryDto>("/invoices/vat-summary", {
      params: { fromUtc, toUtc },
    });
  },

  /**
   * Cryptographically verifies the unbroken SHA-256 integrity of the invoice ledger.
   * GET /api/v1/invoices/chain-verification
   */
  async verifyChain() {
    return http.get<InvoiceChainStatusDto>("/invoices/chain-verification");
  },
};
