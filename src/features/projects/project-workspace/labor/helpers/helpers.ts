import { LegalCategory } from "@/domains/labor/types";

export const LEGAL_CATEGORY_OPTIONS: LegalCategory[] = ["internal", "outsource"];

export function legalCategoryLabelKey(category: LegalCategory): string {
  return `labor:legalCategory.${category}`;
}
