import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { Users, ShieldAlert, Award, CheckCircle2 } from "lucide-react";

interface EmployeeSummaryProps {
  kpis: {
    total: number;
    engineers: number;
    operations: number;
    available: number;
  };
}

export function EmployeeSummary({ kpis }: EmployeeSummaryProps) {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("common:employees.kpi.total"),
      value: kpis.total,
      icon: <Users className="h-5 w-5 text-primary" />,
      bg: "bg-primary/5 border-primary/10",
    },
    {
      title: t("common:employees.kpi.engineers"),
      value: kpis.engineers,
      icon: <ShieldAlert className="h-5 w-5 text-warning" />,
      bg: "bg-warning/5 border-warning/10",
    },
    {
      title: t("common:employees.kpi.operations"),
      value: kpis.operations,
      icon: <Award className="h-5 w-5 text-info" />,
      bg: "bg-info/5 border-info/10",
    },
    {
      title: t("common:employees.kpi.available"),
      value: kpis.available,
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      bg: "bg-success/5 border-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="border-border bg-card shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">{c.title}</span>
              <span className="text-2xl font-bold tracking-tight text-foreground">{c.value}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${c.bg} shrink-0`}>
              {c.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
