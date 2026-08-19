import React from "react";
import { Company, TierLimitCheck } from "@/domains/organization/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { CompanyStatusBadge } from "./company-status-badge";
import { CompanyActionsMenu } from "./company-actions-menu";
import { useCompanyViewModel } from "../view-models/use-company-view-model";

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
  const { rows } = useCompanyViewModel(companies, tierLimits);

  if (companies.length === 0) {
    return (
      <EmptyState
        title={t("companies:empty_title")}
        description={t("companies:empty_desc")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-start text-xs text-foreground">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th className="p-4 text-start">{t("companies:table.name")}</th>
              <th className="p-4 text-start">{t("companies:table.tier")}</th>
              <th className="p-4 text-start">{t("companies:table.status")}</th>
              <th className="p-4 text-start">{t("companies:table.projects")}</th>
              <th className="p-4 text-start">{t("companies:table.personnel")}</th>
              <th className="p-4 text-end">{t("companies:table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(
              ({
                company: c,
                tierLabelKey,
                projectLimitLabel,
                personnelLimitLabel,
                projectsAtLimit,
                personnelAtLimit,
              }) => (
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
                    <Badge variant="outline">{t(tierLabelKey)}</Badge>
                  </td>
                  <td className="p-4">
                    <CompanyStatusBadge status={c.status} />
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={projectsAtLimit ? "warning" : "outline"}
                      className="whitespace-nowrap"
                    >
                      {projectLimitLabel}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={personnelAtLimit ? "warning" : "outline"}
                      className="whitespace-nowrap"
                    >
                      {personnelLimitLabel}
                    </Badge>
                  </td>
                  <td className="p-4 text-end">
                    <CompanyActionsMenu
                      company={c}
                      canManage={permissions.canManage}
                      onSuspend={onSuspend}
                      onActivate={onActivate}
                      onOpenChangeTier={onOpenChangeTier}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {rows.map(
          ({
            company: c,
            tierLabelKey,
            projectLimitLabel,
            personnelLimitLabel,
            projectsAtLimit,
            personnelAtLimit,
          }) => (
            <Card key={c.id} className="border-border bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{c.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <CompanyStatusBadge status={c.status} />
                  <CompanyActionsMenu
                    company={c}
                    canManage={permissions.canManage}
                    onSuspend={onSuspend}
                    onActivate={onActivate}
                    onOpenChangeTier={onOpenChangeTier}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("companies:table.tier")}</span>
                  <Badge variant="outline" className="mt-1">{t(tierLabelKey)}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("companies:table.projects")}</span>
                  <Badge
                    variant={projectsAtLimit ? "warning" : "outline"}
                    className="mt-1 whitespace-nowrap text-[11px]"
                  >
                    {projectLimitLabel}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("companies:table.personnel")}</span>
                  <Badge
                    variant={personnelAtLimit ? "warning" : "outline"}
                    className="mt-1 whitespace-nowrap text-[11px]"
                  >
                    {personnelLimitLabel}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

