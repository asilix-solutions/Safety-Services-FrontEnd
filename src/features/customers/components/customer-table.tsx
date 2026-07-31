import { useTenantContext } from "@/hooks/use-tenant-context";
import React from "react";
import { Customer } from "@/domains/customers/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { ActionMenu } from "@/shared/components/action-menu";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { Eye, Edit2, UserMinus, UserCheck } from "lucide-react";
import { getActiveProjects } from "@/domains/projects/storage";
import { getUnpaidInvoices } from "@/domains/invoices/storage";

interface CustomerTableProps {
  customers: Customer[];
  permissions: {
    canManageCustomerProfile: boolean;
    canToggleCustomerStatus: boolean;
  };
  onViewDetails: (customer: Customer, openForEditing?: boolean) => void;
  onToggleStatus: (id: string) => void;
}

export function CustomerTable({ customers, permissions, onViewDetails, onToggleStatus }: CustomerTableProps) {
  const { t } = useTranslation();
  const tenantContext = useTenantContext();

  if (customers.length === 0) {
    return (
      <EmptyState
        title={t("common:customers.empty_title")}
        description={t("common:customers.empty_desc")}
      />
    );
  }

  const getRowActions = (c: Customer) => {
    const actions = [
      {
        id: `${c.id}-details`,
        label: t("common:customers.table.view_details"),
        onClick: () => onViewDetails(c, false),
        icon: Eye,
      },
    ];

    if (permissions.canManageCustomerProfile) {
      actions.push({
        id: `${c.id}-edit`,
        label: t("common:customers.table.edit_profile"),
        onClick: () => onViewDetails(c, true),
        icon: Edit2,
      });
    }

    if (permissions.canToggleCustomerStatus) {
      actions.push({
        id: `${c.id}-status`,
        label: c.status === "Active"
          ? t("common:customers.table.deactivate")
          : t("common:customers.table.activate"),
        onClick: () => onToggleStatus(c.id),
        icon: c.status === "Active" ? UserMinus : UserCheck,
      });
    }

    return actions;
  };

  const getMobileRowActions = (c: Customer) => {
    const actions = [
      {
        id: `${c.id}-details-mobile`,
        label: t("common:customers.table.view_details"),
        onClick: () => onViewDetails(c, false),
        icon: Eye,
      },
    ];

    if (permissions.canManageCustomerProfile) {
      actions.push({
        id: `${c.id}-edit-mobile`,
        label: t("common:customers.table.edit_profile"),
        onClick: () => onViewDetails(c, true),
        icon: Edit2,
      });
    }

    if (permissions.canToggleCustomerStatus) {
      actions.push({
        id: `${c.id}-status-mobile`,
        label: c.status === "Active"
          ? t("common:customers.table.deactivate")
          : t("common:customers.table.activate"),
        onClick: () => onToggleStatus(c.id),
        icon: c.status === "Active" ? UserMinus : UserCheck,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-xs text-foreground">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th className="p-4">{t("common:customers.table.name")}</th>
              <th className="p-4">{t("common:customers.table.cr")}</th>
              <th className="p-4">{t("common:customers.table.industry")}</th>
              <th className="p-4">{t("common:customers.table.contact")}</th>
              <th className="p-4">{t("common:customers.table.city")}</th>
              <th className="p-4">{t("common:customers.linked_records")}</th>
              <th className="p-4">{t("common:status")}</th>
              <th className="p-4 text-right">{t("common:customers.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => {
              const activeProjCount = getActiveProjects(undefined, c.id).length;
              const unpaidInvCount = getUnpaidInvoices(tenantContext, undefined, c.id).length;

              return (
                <tr key={c.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{c.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-foreground block">{c.companyName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{c.id}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-muted-foreground">{c.commercialRegistration}</td>
                  <td className="p-4 text-muted-foreground">{c.industry}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{c.primaryContactName}</span>
                      <span className="text-[10px] text-muted-foreground">{c.primaryContactEmail}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{c.city}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-sans">
                      <Badge variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/15 whitespace-nowrap">
                        {activeProjCount} {t("common:customers.projects")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/15 whitespace-nowrap">
                        {unpaidInvCount} {t("common:customers.invoices")}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={c.status === "Active" ? "default" : "secondary"}>
                      {t(`common:customers.status.${c.status}`)}
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

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {customers.map((c) => {
          const activeProjCount = getActiveProjects(undefined, c.id).length;
          const unpaidInvCount = getUnpaidInvoices(tenantContext, undefined, c.id).length;

          return (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{c.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{c.companyName}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.id} • {c.industry}</p>
                  </div>
                </div>
                <ActionMenu items={getMobileRowActions(c)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.cr")}</span>
                  <span className="font-mono font-medium text-foreground">{c.commercialRegistration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.city")}</span>
                  <span className="font-medium text-foreground">{c.city}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.primary_contact")}</span>
                  <span className="font-medium text-foreground truncate block max-w-[140px]">{c.primaryContactName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:status")}</span>
                  <Badge variant={c.status === "Active" ? "default" : "secondary"} className="scale-90 origin-left">
                    {t(`common:customers.status.${c.status}`)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Badge variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/15">
                  {activeProjCount} {t("common:customers.projects")}
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/15">
                  {unpaidInvCount} {t("common:customers.invoices")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
