import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CompanyPersonnelUsage } from "@/domains/users/types";

interface PersonnelUsageSummaryProps {
  usage: CompanyPersonnelUsage[];
}

export function PersonnelUsageSummary({ usage }: PersonnelUsageSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{t("users:personnel.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {usage.length === 0 ? (
          <EmptyState
            title={t("users:personnel.empty_title")}
            description={t("users:personnel.empty_desc")}
            compact
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {usage.map((row) => {
              const limitLabel = Number.isFinite(row.maxPersonnel)
                ? `${row.userCount} / ${row.maxPersonnel}`
                : `${row.userCount} / ${t("users:limit_unlimited")}`;
              return (
                <div
                  key={row.companyId}
                  className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-foreground truncate">{row.companyName}</span>
                  <Badge variant={row.atLimit ? "warning" : "outline"} className="whitespace-nowrap">
                    {limitLabel}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
