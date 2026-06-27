import React from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { useTranslation } from "@/providers/i18n-provider";
import { LayoutDashboard } from "lucide-react";

interface OverviewEmptyStateProps {
  titleKey?: string;
  titleFallback: string;
  descriptionKey?: string;
  descriptionFallback: string;
}

export function OverviewEmptyState({
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
}: OverviewEmptyStateProps) {
  const { t } = useTranslation();

  const title = titleKey && t(`common:${titleKey}`) !== `common:${titleKey}` ? t(`common:${titleKey}`) : titleFallback;
  const description = descriptionKey && t(`common:${descriptionKey}`) !== `common:${descriptionKey}` ? t(`common:${descriptionKey}`) : descriptionFallback;

  return (
    <EmptyState
      title={title}
      description={description}
      icon={<LayoutDashboard className="h-8 w-8 text-muted-foreground" />}
    />
  );
}
