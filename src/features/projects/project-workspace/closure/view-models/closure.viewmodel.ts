import { ClosureRecord } from "@/domains/closure/types";
import { getClosureStatus } from "@/domains/closure/workflow";
import { formatDate } from "@/lib/formatters";
import { Locale } from "@/types/i18n";
import { methodLabelKey } from "../helpers/helpers";

export interface ClosureStatusViewModel {
  isClosed: boolean;
  closedAtLabel: string | null;
  closedBy: string | null;
  methodLabelKey: string | null;
  signatureImage: string | null;
}

/**
 * Shapes the domain's ADR-005 status selector into display-ready values.
 * Summary fields (isClosed/closedAt/closedBy/method) always come from `getClosureStatus` —
 * never derived inline here. `signatureImage` is passed through from the fetched record as
 * an opaque bound asset, not a derived summary figure.
 */
export function buildClosureViewModel(
  record: ClosureRecord | null,
  projectId: string,
  locale: Locale
): ClosureStatusViewModel {
  const status = getClosureStatus(projectId);

  return {
    isClosed: status.isClosed,
    closedAtLabel: status.closedAt ? formatDate(status.closedAt, locale, { dateStyle: "medium", timeStyle: "short" }) : null,
    closedBy: status.closedBy,
    methodLabelKey: status.method ? methodLabelKey(status.method) : null,
    signatureImage: record?.signatureImage ?? null,
  };
}
