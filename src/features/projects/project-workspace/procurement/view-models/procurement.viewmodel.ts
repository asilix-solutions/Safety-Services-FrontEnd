import { ProcurementRecord } from "@/domains/procurement/types";
import { getProcurementSummary } from "@/domains/procurement/workflow";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Locale } from "@/types/i18n";
import { siloLabelKey, invoiceTypeLabelKey } from "../helpers/helpers";

export interface ProcurementRowViewModel {
  id: string;
  supplierName: string;
  siloLabelKey: string;
  invoiceTypeLabelKey: string;
  preTaxValueLabel: string;
  vatAmountLabel: string;
  totalValueLabel: string;
  createdAtLabel: string;
  receiptImage: string;
}

export interface ProcurementSummaryViewModel {
  count: number;
  totalTaxableLabel: string;
  totalVatLabel: string;
  totalSpendLabel: string;
}

export interface ProcurementViewModel {
  rows: ProcurementRowViewModel[];
  summary: ProcurementSummaryViewModel;
}

/**
 * Shapes procurement records + the ADR-005 domain KPI selector into display-ready values.
 * The summary numbers always come from `getProcurementSummary` — never summed here.
 */
export function buildProcurementViewModel(
  records: ProcurementRecord[],
  projectId: string,
  locale: Locale
): ProcurementViewModel {
  const summary = getProcurementSummary(projectId);

  const rows: ProcurementRowViewModel[] = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((record) => ({
      id: record.id,
      supplierName: record.supplierName,
      siloLabelKey: siloLabelKey(record.siloTag),
      invoiceTypeLabelKey: invoiceTypeLabelKey(record.invoiceType),
      preTaxValueLabel: formatCurrency(record.preTaxValue, locale, "SAR"),
      vatAmountLabel: formatCurrency(record.vatAmount, locale, "SAR"),
      totalValueLabel: formatCurrency(record.totalValue, locale, "SAR"),
      createdAtLabel: formatDate(record.createdAt, locale, { dateStyle: "medium" }),
      receiptImage: record.receiptImage,
    }));

  return {
    rows,
    summary: {
      count: summary.count,
      totalTaxableLabel: formatCurrency(summary.totalTaxable, locale, "SAR"),
      totalVatLabel: formatCurrency(summary.totalVat, locale, "SAR"),
      totalSpendLabel: formatCurrency(summary.totalSpend, locale, "SAR"),
    },
  };
}
