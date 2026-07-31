import React from "react";
import { TIER_LIMITS } from "@/domains/organization/types";
import { SubscriptionMatrixRow } from "@/domains/organization/workflow";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { getStatusBadgeVariant, getStatusLabelKey, getTierLabelKey } from "../helpers/helpers";

interface SubscriptionMatrixTableProps {
  rows: SubscriptionMatrixRow[];
}

export function SubscriptionMatrixTable({ rows }: SubscriptionMatrixTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t("subscriptions:matrix.empty_title")}
        description={t("subscriptions:matrix.empty_desc")}
      />
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-start text-xs text-foreground">
        <thead>
          <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <th className="p-4">{t("subscriptions:matrix.table.tenant")}</th>
            <th className="p-4">{t("subscriptions:matrix.table.tier")}</th>
            <th className="p-4">{t("subscriptions:matrix.table.status")}</th>
            <th className="p-4">{t("subscriptions:matrix.table.projects")}</th>
            <th className="p-4">{t("subscriptions:matrix.table.users")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ company, limitCheck }) => {
            const limits = TIER_LIMITS[company.tier];
            const projectLimitLabel = Number.isFinite(limits.maxProjects)
              ? `${company.projectCount} / ${limits.maxProjects}`
              : `${company.projectCount} / ${t("subscriptions:limit_unlimited")}`;
            const personnelLimitLabel = Number.isFinite(limits.maxPersonnel)
              ? `${company.personnelCount} / ${limits.maxPersonnel}`
              : `${company.personnelCount} / ${t("subscriptions:limit_unlimited")}`;
            return (
              <tr key={company.id} className="hover:bg-secondary/10 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-foreground block">{company.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{company.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{t(getTierLabelKey(company.tier))}</Badge>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusBadgeVariant(company.status)}>
                    {t(getStatusLabelKey(company.status))}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={limitCheck.projectsAtLimit ? "warning" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {projectLimitLabel}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={limitCheck.personnelAtLimit ? "warning" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {personnelLimitLabel}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
