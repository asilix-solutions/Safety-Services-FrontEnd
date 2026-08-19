import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Building2, CheckCircle2, Ban } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { CompaniesSummary } from "@/domains/organization/types";

interface CompanySummaryProps {
  summary: CompaniesSummary;
}

export function CompanySummary({ summary }: CompanySummaryProps) {
  const { t } = useTranslation();

  const cards = [
    {
      key: "total",
      labelKey: "companies:kpi.total",
      value: summary.total,
      icon: Building2,
      color: "text-muted-foreground bg-muted/40 border-border",
    },
    {
      key: "active",
      labelKey: "companies:kpi.active",
      value: summary.active,
      icon: CheckCircle2,
      color: "text-success bg-success/10 border-success/20",
    },
    {
      key: "suspended",
      labelKey: "companies:kpi.suspended",
      value: summary.suspended,
      icon: Ban,
      color: "text-destructive bg-destructive/10 border-destructive/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-muted-foreground">{t(card.labelKey)}</span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
