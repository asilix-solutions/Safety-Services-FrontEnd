import { InvoiceType, ProcurementDraft, ProcurementRecord, ProcurementSummary, VatBreakdown } from "./types";
import { getProcurementByProject, upsertProcurement } from "./storage";
import { VAT_RATE } from "@/constants/tax";

/** ZATCA-compliant rate — single source of truth defined in constants/tax.ts. */

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Computes the isolated VAT breakdown for a procurement invoice (SRS FR-OPS-04 step 3).
 * Taxable invoices carry a computed 15% VAT amount, isolated from the pre-tax value.
 * Non-taxable invoices always resolve to a zeroed VAT amount.
 */
export function computeProcurementVat(preTaxValue: number, invoiceType: InvoiceType): VatBreakdown {
  const safePreTax = Number.isFinite(preTaxValue) && preTaxValue > 0 ? preTaxValue : 0;

  if (invoiceType === "non_taxable") {
    return {
      invoiceType,
      preTaxValue: safePreTax,
      vatAmount: 0,
      totalValue: safePreTax,
    };
  }

  const vatAmount = roundCurrency(safePreTax * VAT_RATE);
  return {
    invoiceType,
    preTaxValue: safePreTax,
    vatAmount,
    totalValue: roundCurrency(safePreTax + vatAmount),
  };
}

/** SRS FR-OPS-04 step 4: blocks saving any field invoice without a live receipt photo. */
export function assertReceiptPresent(draft: Pick<ProcurementDraft, "receiptImage">): void {
  if (!draft.receiptImage || draft.receiptImage.trim().length === 0) {
    throw new Error("A receipt photo is required before saving a procurement record.");
  }
}

/** ONLY write path for a new procurement record — validates, computes VAT, stamps audit fields. */
export function createProcurementRecord(
  draft: ProcurementDraft,
  createdBy: { id: string; name: string }
): ProcurementRecord {
  assertReceiptPresent(draft);

  if (!draft.projectId) {
    throw new Error("Procurement record requires a projectId.");
  }
  if (!draft.supplierName || draft.supplierName.trim().length < 2) {
    throw new Error("Procurement record requires a valid supplier name.");
  }
  if (!Number.isFinite(draft.preTaxValue) || draft.preTaxValue <= 0) {
    throw new Error("Procurement record requires a positive invoice value.");
  }

  const breakdown = computeProcurementVat(draft.preTaxValue, draft.invoiceType);

  const record: ProcurementRecord = {
    id: `PROC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tenantId: "tenant-1",
    projectId: draft.projectId,
    supplierName: draft.supplierName.trim(),
    siloTag: draft.siloTag,
    invoiceType: breakdown.invoiceType,
    preTaxValue: breakdown.preTaxValue,
    vatAmount: breakdown.vatAmount,
    totalValue: breakdown.totalValue,
    receiptImage: draft.receiptImage,
    createdAt: new Date().toISOString(),
    createdBy: createdBy.name || createdBy.id,
  };

  return upsertProcurement(record);
}

/** ADR-005 — centralized KPI selector; dashboards/ViewModels must call this, never sum records inline. */
export function getProcurementSummary(projectId: string): ProcurementSummary {
  const records = getProcurementByProject(projectId);
  return records.reduce<ProcurementSummary>(
    (acc, record) => ({
      count: acc.count + 1,
      totalTaxable: roundCurrency(acc.totalTaxable + (record.invoiceType === "taxable" ? record.preTaxValue : 0)),
      totalVat: roundCurrency(acc.totalVat + record.vatAmount),
      totalSpend: roundCurrency(acc.totalSpend + record.totalValue),
    }),
    { count: 0, totalTaxable: 0, totalVat: 0, totalSpend: 0 }
  );
}
