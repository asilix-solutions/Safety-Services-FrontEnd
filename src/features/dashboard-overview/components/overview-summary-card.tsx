import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { OverviewStatCard } from "../types";
import { getOverviewIcon, getOverviewBadgeClass } from "../helpers/overview-helpers";
import Link from "next/link";

interface OverviewSummaryCardProps {
  card: OverviewStatCard;
}

export function OverviewSummaryCard({ card }: OverviewSummaryCardProps) {
  const { t } = useTranslation();

  const label = t(`common:${card.labelKey}`) !== `common:${card.labelKey}` ? t(`common:${card.labelKey}`) : card.labelFallback;
  const desc = card.descriptionKey
    ? t(`common:${card.descriptionKey}`) !== `common:${card.descriptionKey}` ? t(`common:${card.descriptionKey}`) : card.descriptionFallback
    : "";

  const content = (
    <Card className="border-border bg-card shadow-sm hover:border-primary/20 transition-all">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs text-muted-foreground font-semibold truncate">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight text-foreground truncate">{card.value}</h3>
          {desc && <p className="text-[10px] text-muted-foreground truncate">{desc}</p>}
        </div>
        {card.iconName && (
          <div className={`p-2.5 rounded-xl border ${getOverviewBadgeClass(card.variant || "default")} shrink-0`}>
            {getOverviewIcon(card.iconName)}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="block cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
