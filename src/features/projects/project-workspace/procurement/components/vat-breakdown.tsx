import React from "react";
import { VatBreakdown } from "@/domains/procurement/types";
import { useTranslation } from "@/providers/i18n-provider";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/shared/ui/badge";

interface VatBreakdownCardProps {
  breakdown: VatBreakdown;
}

/** Purely presentational — renders the domain-computed VatBreakdown, does no math. */
export function VatBreakdownCard({ breakdown }: VatBreakdownCardProps) {
  const { t, locale } = useTranslation();
  const isTaxable = breakdown.invoiceType === "taxable";

  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{t("procurement:form.preTaxValue")}</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          {formatCurrency(breakdown.preTaxValue, locale, "SAR")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          {t("procurement:form.vatAmount")}
          <Badge variant={isTaxable ? "warning" : "secondary"} className="text-[10px]">
            {isTaxable ? t("procurement:form.vatIsolatedTag") : t("procurement:invoiceType.non_taxable")}
          </Badge>
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${isTaxable ? "text-foreground" : "text-muted-foreground"}`}
        >
          {formatCurrency(breakdown.vatAmount, locale, "SAR")}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs font-bold text-foreground">{t("procurement:form.totalValue")}</span>
        <span className="text-base font-bold text-primary tabular-nums">
          {formatCurrency(breakdown.totalValue, locale, "SAR")}
        </span>
      </div>
    </div>
  );
}

export default VatBreakdownCard;
