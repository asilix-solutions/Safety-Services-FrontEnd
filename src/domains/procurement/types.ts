export type SiloTag = "alarm" | "suppression" | "ventilation";

export type InvoiceType = "taxable" | "non_taxable";

/** Result of applying the ZATCA-compliant 15% VAT rule to a single procurement invoice. */
export interface VatBreakdown {
  invoiceType: InvoiceType;
  preTaxValue: number;
  vatAmount: number;
  totalValue: number;
}

export interface ProcurementRecord {
  id: string;
  tenantId: string;
  projectId: string;
  supplierName: string;
  siloTag: SiloTag;
  invoiceType: InvoiceType;
  preTaxValue: number;
  vatAmount: number;
  totalValue: number;
  /** Base64 data URI of the live-captured (or uploaded) paper receipt photo. */
  receiptImage: string;
  createdAt: string;
  createdBy: string;
}

/** Input shape submitted by the Procurement form before the domain computes VAT and stamps audit fields. */
export interface ProcurementDraft {
  projectId: string;
  supplierName: string;
  siloTag: SiloTag;
  invoiceType: InvoiceType;
  preTaxValue: number;
  receiptImage: string;
}

/** Centralized KPI shape for the Procurement tab (ADR-005) — never recomputed inline in the UI. */
export interface ProcurementSummary {
  count: number;
  totalTaxable: number;
  totalVat: number;
  totalSpend: number;
}
