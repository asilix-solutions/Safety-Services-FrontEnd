import React from "react";
import { Company, TierLimitCheck, TIER_LIMITS } from "@/domains/organization/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { ActionMenu } from "@/shared/components/action-menu/action-menu";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { Ban, CheckCircle2, Layers } from "lucide-react";
import { getStatusBadgeVariant, getStatusLabelKey, getTierLabelKey } from "../helpers/helpers";

interface CompanyTableProps {
  companies: Company[];
  tierLimits: Record<string, TierLimitCheck>;
  permissions: { canManage: boolean };
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onOpenChangeTier: (company: Company) => void;
}

export function CompanyTable({
  companies,
  tierLimits,
  permissions,
  onSuspend,
  onActivate,
  onOpenChangeTier,
}: CompanyTableProps) {
  const { t } = useTranslation();

  if (companies.length === 0) {
    return (
      <EmptyState
        title={t("common:companies.empty_title")}
        description={t("common:companies.empty_desc")}
      />
    );
  }

  const getRowActions = (c: Company) => {
    const actions = [];

    if (permissions.canManage) {
      actions.push({
        id: `${c.id}-change-tier`,
        label: t("common:companies.table.change_tier"),
        onClick: () => onOpenChangeTier(c),
        icon: Layers,
      });

      actions.push({
        id: `${c.id}-status`,
        label: c.status === "active" ? t("common:companies.table.suspend") : t("common:companies.table.activate"),
        onClick: () => (c.status === "active" ? onSuspend(c.id) : onActivate(c.id)),
        icon: c.status === "active" ? Ban : CheckCircle2,
      });
    }

    return actions;
  };

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-left text-xs text-foreground">
        <thead>
          <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <th className="p-4">{t("common:companies.table.name")}</th>
            <th className="p-4">{t("common:companies.table.tier")}</th>
            <th className="p-4">{t("common:companies.table.status")}</th>
            <th className="p-4">{t("common:companies.table.projects")}</th>
            <th className="p-4">{t("common:companies.table.personnel")}</th>
            <th className="p-4 text-right">{t("common:companies.table.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.map((c) => {
            const limit = tierLimits[c.id];
            const limits = TIER_LIMITS[c.tier];
            const projectLimitLabel = Number.isFinite(limits.maxProjects)
              ? `${c.projectCount} / ${limits.maxProjects}`
              : `${c.projectCount} / ${t("common:companies.limit_unlimited")}`;
            const personnelLimitLabel = Number.isFinite(limits.maxPersonnel)
              ? `${c.personnelCount} / ${limits.maxPersonnel}`
              : `${c.personnelCount} / ${t("common:companies.limit_unlimited")}`;
            return (
              <tr key={c.id} className="hover:bg-secondary/10 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-foreground block">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{c.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{t(getTierLabelKey(c.tier))}</Badge>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusBadgeVariant(c.status)}>{t(getStatusLabelKey(c.status))}</Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={limit?.projectsAtLimit ? "warning" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {projectLimitLabel}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={limit?.personnelAtLimit ? "warning" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {personnelLimitLabel}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <ActionMenu items={getRowActions(c)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
