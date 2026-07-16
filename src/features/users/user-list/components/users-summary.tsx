import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { Users, UserCheck, UserX } from "lucide-react";
import { UsersSummary as UsersSummaryData } from "@/domains/users/types";

interface UsersSummaryProps {
  summary: UsersSummaryData | undefined;
}

export function UsersSummaryCards({ summary }: UsersSummaryProps) {
  const { t } = useTranslation();

  const cards = [
    { key: "total", labelKey: "users:summary.total", value: summary?.total ?? 0, icon: Users, color: "text-muted-foreground bg-muted/40 border-border" },
    { key: "active", labelKey: "users:summary.active", value: summary?.activeCount ?? 0, icon: UserCheck, color: "text-success bg-success/10 border-success/20" },
    { key: "inactive", labelKey: "users:summary.inactive", value: summary?.inactiveCount ?? 0, icon: UserX, color: "text-destructive bg-destructive/10 border-destructive/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
