import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { Users, UserCheck, FolderKanban, Receipt } from "lucide-react";

interface CustomerSummaryProps {
  kpis: {
    total: number;
    active: number;
    activeProjects: number;
    unpaidInvoices: number;
  };
}

export function CustomerSummary({ kpis }: CustomerSummaryProps) {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("common:customers.kpi.total"),
      value: kpis.total,
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: t("common:customers.kpi.active"),
      value: kpis.active,
      icon: UserCheck,
      color: "text-success bg-success/10 border-success/20",
    },
    {
      title: t("common:customers.kpi.projects"),
      value: kpis.activeProjects,
      icon: FolderKanban,
      color: "text-warning bg-warning/10 border-warning/20",
    },
    {
      title: t("common:customers.kpi.invoices"),
      value: kpis.unpaidInvoices,
      icon: Receipt,
      color: "text-destructive bg-destructive/10 border-destructive/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
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
