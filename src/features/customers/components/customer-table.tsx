import React from "react";
import Link from "next/link";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Customer } from "@/domains/customers/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import {
  Eye,
  Edit2,
  FileText,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
} from "lucide-react";
import { getActiveProjects } from "@/domains/projects/storage";
import { getUnpaidInvoices } from "@/domains/invoices/storage";
import { ROUTES } from "@/constants/routes";
import { formatCity, formatSector } from "@/domains/customers/helpers";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
  permissions: {
    canManageCustomerProfile: boolean;
    canToggleCustomerStatus: boolean;
  };
  onViewDetails: (customer: Customer, openForEditing?: boolean) => void;
  onToggleStatus: (id: string) => void;
}

export function CustomerTable({
  customers,
  permissions,
  onViewDetails,
  onToggleStatus,
}: CustomerTableProps) {
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

  const renderRowActions = (c: Customer) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label={t("common:customers.table.actions")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl p-1.5 space-y-0.5">
        <DropdownMenuItem
          onClick={() => onViewDetails(c, false)}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md text-foreground hover:bg-accent focus:bg-accent"
        >
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{t("common:customers.table.view_details")}</span>
        </DropdownMenuItem>

        {permissions.canManageCustomerProfile && (
          <DropdownMenuItem
            onClick={() => onViewDetails(c, true)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md text-foreground hover:bg-accent focus:bg-accent"
          >
            <Edit2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{t("common:customers.table.edit_profile")}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          asChild
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md text-foreground hover:bg-accent focus:bg-accent"
        >
          <Link href={`${ROUTES.QUOTATIONS}?customerId=${c.id}`} className="w-full flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{t("common:customers.table.create_invoice_quotation")}</span>
          </Link>
        </DropdownMenuItem>

        {permissions.canToggleCustomerStatus && (
          <>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuItem
              onClick={() => onToggleStatus(c.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md",
                c.status === "Active"
                  ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
              )}
            >
              {c.status === "Active" ? (
                <>
                  <ToggleLeft className="h-4 w-4 shrink-0" />
                  <span>{t("common:customers.table.deactivate")}</span>
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4 shrink-0" />
                  <span>{t("common:customers.table.activate")}</span>
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full border-collapse text-start text-xs text-foreground">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th className="p-4 text-start">{t("common:customers.table.name")}</th>
              <th className="p-4 text-start">{t("common:customers.table.cr")}</th>
              <th className="p-4 text-start">{t("common:customers.table.industry")}</th>
              <th className="p-4 text-start">{t("common:customers.table.contact")}</th>
              <th className="p-4 text-start">{t("common:customers.table.city")}</th>
              <th className="p-4 text-start">{t("common:customers.linked_records")}</th>
              <th className="p-4 text-start">{t("common:status")}</th>
              <th className="p-4 text-end">{t("common:customers.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => {
              const activeProjCount = getActiveProjects(tenantContext, undefined, c.id).length;
              const unpaidInvCount = getUnpaidInvoices(tenantContext, undefined, c.id).length;

              return (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                        {c.companyName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-foreground block">{c.companyName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{c.id}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-muted-foreground" dir="ltr">
                    {c.commercialRegistration}
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">
                    {formatSector(c.industry)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{c.primaryContactName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                        {c.primaryContactEmail}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatCity(c.city)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-sans">
                      <Badge
                        variant={activeProjCount > 0 ? "outline" : "secondary"}
                        className={cn(
                          "text-[10px] whitespace-nowrap transition-colors",
                          activeProjCount > 0
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 font-semibold"
                            : "bg-muted/50 text-muted-foreground border-transparent opacity-75 font-normal"
                        )}
                      >
                        {activeProjCount} {t("common:customers.projects")}
                      </Badge>
                      <Badge
                        variant={unpaidInvCount > 0 ? "outline" : "secondary"}
                        className={cn(
                          "text-[10px] whitespace-nowrap transition-colors",
                          unpaidInvCount > 0
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-semibold"
                            : "bg-muted/50 text-muted-foreground border-transparent opacity-75 font-normal"
                        )}
                      >
                        {unpaidInvCount} {t("common:customers.invoices")}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={c.status === "Active" ? "success" : "secondary"}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5",
                        c.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                          : "bg-muted text-muted-foreground border-transparent"
                      )}
                    >
                      {t(`common:customers.status.${c.status}`)}
                    </Badge>
                  </td>
                  <td className="p-4 text-end">
                    {renderRowActions(c)}
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
          const activeProjCount = getActiveProjects(tenantContext, undefined, c.id).length;
          const unpaidInvCount = getUnpaidInvoices(tenantContext, undefined, c.id).length;

          return (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {c.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{c.companyName}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {c.id} • {formatSector(c.industry)}
                    </p>
                  </div>
                </div>
                {renderRowActions(c)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.cr")}</span>
                  <span className="font-mono font-medium text-foreground" dir="ltr">
                    {c.commercialRegistration}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.city")}</span>
                  <span className="font-medium text-foreground">{formatCity(c.city)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:customers.fields.primary_contact")}</span>
                  <span className="font-medium text-foreground truncate block max-w-[140px]">
                    {c.primaryContactName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("common:status")}</span>
                  <Badge
                    variant={c.status === "Active" ? "success" : "secondary"}
                    className={cn(
                      "scale-90 origin-start text-xs font-semibold px-2 py-0.5",
                      c.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    {t(`common:customers.status.${c.status}`)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border font-sans">
                <Badge
                  variant={activeProjCount > 0 ? "outline" : "secondary"}
                  className={cn(
                    "text-[10px] whitespace-nowrap",
                    activeProjCount > 0
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 font-semibold"
                      : "bg-muted/50 text-muted-foreground border-transparent opacity-75 font-normal"
                  )}
                >
                  {activeProjCount} {t("common:customers.projects")}
                </Badge>
                <Badge
                  variant={unpaidInvCount > 0 ? "outline" : "secondary"}
                  className={cn(
                    "text-[10px] whitespace-nowrap",
                    unpaidInvCount > 0
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-semibold"
                      : "bg-muted/50 text-muted-foreground border-transparent opacity-75 font-normal"
                  )}
                >
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

