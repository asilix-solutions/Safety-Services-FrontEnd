import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { Layers, Package, Crown } from "lucide-react";
import { TierDistribution } from "@/domains/organization/workflow";
import { getTierLabelKey } from "../helpers/helpers";

interface TierDistributionSummaryProps {
  distribution: TierDistribution[];
}

const TIER_ICON: Record<TierDistribution["tier"], typeof Layers> = {
  Trial: Package,
  Basic: Layers,
  Professional: Crown,
};

const TIER_COLOR: Record<TierDistribution["tier"], string> = {
  Trial: "text-muted-foreground bg-muted/40 border-border",
  Basic: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Professional: "text-success bg-success/10 border-success/20",
};

export function TierDistributionSummary({ distribution }: TierDistributionSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {distribution.map((row) => {
        const Icon = TIER_ICON[row.tier];
        return (
          <Card key={row.tier} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t(getTierLabelKey(row.tier))}
              </span>
              <div className={`p-2 rounded-xl border ${TIER_COLOR[row.tier]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{row.count}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
