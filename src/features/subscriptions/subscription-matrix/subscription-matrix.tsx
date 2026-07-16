import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation } from "@/providers/i18n-provider";
import { TierDistributionSummary } from "./components/tier-distribution-summary";
import { SubscriptionMatrixTable } from "./components/subscription-matrix-table";
import { useSubscriptionMatrix } from "./hooks/use-subscription-matrix";
import { ShieldAlert } from "lucide-react";

export function SubscriptionMatrix() {
  const { t } = useTranslation();
  const { permissions, distribution, matrix } = useSubscriptionMatrix();

  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{t("common:unauthorized")}</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            {t("subscriptions:unauthorized_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("subscriptions:title")} description={t("subscriptions:desc")} />

      <TierDistributionSummary distribution={distribution} />

      <SubscriptionMatrixTable rows={matrix} />
    </div>
  );
}
