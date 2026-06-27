import React from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { useTranslation } from "@/providers/i18n-provider";
import { LayoutDashboard } from "lucide-react";

export function OverviewEmptyState() {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={t("common:noRecords")}
      description={t("common:noRecordsSubMessage")}
      icon={<LayoutDashboard className="h-8 w-8 text-muted-foreground" />}
    />
  );
}
