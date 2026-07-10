import { LaborRecord } from "@/domains/labor/types";
import { computeLaborCost, getLaborSummary } from "@/domains/labor/workflow";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Locale } from "@/types/i18n";
import { legalCategoryLabelKey } from "../helpers/helpers";

export interface LaborRowViewModel {
  id: string;
  workerName: string;
  fieldRole: string;
  legalCategoryLabelKey: string;
  costLabel: string;
  settled: boolean;
  settledAtLabel: string | null;
  canSettle: boolean;
}

export interface LaborSummaryViewModel {
  headcount: number;
  internalCount: number;
  outsourceCount: number;
  totalOutsourceCostLabel: string;
  unsettledOutsourceCount: number;
}

export interface LaborViewModel {
  rows: LaborRowViewModel[];
  summary: LaborSummaryViewModel;
}

/**
 * Shapes labor records + the ADR-005 domain KPI selector into display-ready values.
 * The summary numbers always come from `getLaborSummary` — never summed here.
 */
export function buildLaborViewModel(records: LaborRecord[], projectId: string, locale: Locale): LaborViewModel {
  const summary = getLaborSummary(projectId);

  const rows: LaborRowViewModel[] = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((record) => ({
      id: record.id,
      workerName: record.workerName,
      fieldRole: record.fieldRole,
      legalCategoryLabelKey: legalCategoryLabelKey(record.legalCategory),
      costLabel: formatCurrency(computeLaborCost(record.legalCategory, record.agreedWage), locale, "SAR"),
      settled: record.settled,
      settledAtLabel: record.settledAt ? formatDate(record.settledAt, locale, { dateStyle: "medium", timeStyle: "short" }) : null,
      canSettle: record.legalCategory === "outsource" && !record.settled,
    }));

  return {
    rows,
    summary: {
      headcount: summary.headcount,
      internalCount: summary.internalCount,
      outsourceCount: summary.outsourceCount,
      totalOutsourceCostLabel: formatCurrency(summary.totalOutsourceCost, locale, "SAR"),
      unsettledOutsourceCount: summary.unsettledOutsourceCount,
    },
  };
}
