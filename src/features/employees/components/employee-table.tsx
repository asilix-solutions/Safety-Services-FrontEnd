import React from "react";
import { Employee, EmployeeAvailability } from "@/domains/employees/types";
import { formatSaudiPhone, formatEmployeeRole, formatEmployeeDepartment } from "@/domains/employees/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
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
import { Eye, MoreHorizontal, UserMinus, UserCheck, Shield, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeTableProps {
  employees: Employee[];
  canManage: boolean;
  onViewDetails: (emp: Employee) => void;
  onToggleStatus: (id: string) => void;
}

export function EmployeeTable({ employees, canManage, onViewDetails, onToggleStatus }: EmployeeTableProps) {
  const { t } = useTranslation();

  if (employees.length === 0) {
    return (
      <EmptyState
        title={t("common:employees.empty_title")}
        description={t("common:employees.empty_desc")}
      />
    );
  }

  const getAvailabilityBadgeClass = (status: EmployeeAvailability) => {
    switch (status) {
      case "Available":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      case "Busy":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      case "Unavailable":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const renderRowActions = (emp: Employee) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label={t("common:employees.table.actions")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl p-1.5 space-y-0.5">
        <DropdownMenuItem
          onClick={() => onViewDetails(emp)}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md text-foreground hover:bg-accent focus:bg-accent"
        >
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{t("common:employees.table.view_details")}</span>
        </DropdownMenuItem>

        {canManage && (
          <>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuItem
              onClick={() => onToggleStatus(emp.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-md",
                emp.status === "Active"
                  ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
              )}
            >
              {emp.status === "Active" ? (
                <>
                  <UserMinus className="h-4 w-4 shrink-0" />
                  <span>{t("common:employees.table.deactivate")}</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 shrink-0" />
                  <span>{t("common:employees.table.activate")}</span>
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
              <th className="p-4 text-start">{t("common:employees.table.name")}</th>
              <th className="p-4 text-start">{t("common:employees.table.number")}</th>
              <th className="p-4 text-start">{t("common:employees.table.role")}</th>
              <th className="p-4 text-start">{t("common:employees.table.department")}</th>
              <th className="p-4 text-start">{t("common:employees.table.email")}</th>
              <th className="p-4 text-start">{t("common:employees.table.phone")}</th>
              <th className="p-4 text-start">{t("common:employees.table.status")}</th>
              <th className="p-4 text-start">{t("common:employees.table.availability")}</th>
              <th className="p-4 text-end">{t("common:employees.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                {/* Name & Avatar */}
                <td className="p-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border/80">
                    <AvatarImage src={emp.avatarUrl} alt={emp.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {emp.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-foreground block">{emp.fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{emp.id}</span>
                  </div>
                </td>

                {/* Employee Number */}
                <td className="p-4 font-mono text-muted-foreground text-xs" dir="ltr">
                  {emp.employeeNumber}
                </td>

                {/* Role */}
                <td className="p-4 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{formatEmployeeRole(emp.role)}</span>
                  </div>
                </td>

                {/* Department */}
                <td className="p-4 text-muted-foreground">
                  {formatEmployeeDepartment(emp.department)}
                </td>

                {/* Email */}
                <td className="p-4 text-muted-foreground font-mono text-xs" dir="ltr">
                  {emp.email}
                </td>

                {/* Phone */}
                <td className="p-4 font-mono text-foreground text-xs" dir="ltr">
                  {formatSaudiPhone(emp.phone)}
                </td>

                {/* Employment Status Badge */}
                <td className="p-4">
                  <Badge
                    variant={emp.status === "Active" ? "success" : "secondary"}
                    className={cn(
                      "text-[10px] font-semibold",
                      emp.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    {emp.status === "Active"
                      ? t("common:employees.status.Active")
                      : t("common:employees.status.Inactive")}
                  </Badge>
                </td>

                {/* Availability Badge */}
                <td className="p-4">
                  <Badge variant="outline" className={cn("text-[10px]", getAvailabilityBadgeClass(emp.availabilityStatus))}>
                    {t(`common:employees.availability.${emp.availabilityStatus}`)}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="p-4 text-end">
                  {renderRowActions(emp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-xs">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/80">
                  <AvatarImage src={emp.avatarUrl} alt={emp.fullName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {emp.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{emp.fullName}</h4>
                  <p className="text-xs text-muted-foreground">{formatEmployeeRole(emp.role)}</p>
                </div>
              </div>
              {renderRowActions(emp)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border">
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.number")}</span>
                <span className="font-mono font-medium text-foreground" dir="ltr">{emp.employeeNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.department")}</span>
                <span className="font-medium text-foreground">{formatEmployeeDepartment(emp.department)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.email")}</span>
                <span className="font-medium font-mono text-foreground truncate block max-w-[140px]" dir="ltr">{emp.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.phone")}</span>
                <span className="font-medium font-mono text-foreground block" dir="ltr">
                  {formatSaudiPhone(emp.phone)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Badge variant="outline" className={cn("text-[10px]", getAvailabilityBadgeClass(emp.availabilityStatus))}>
                {t(`common:employees.availability.${emp.availabilityStatus}`)}
              </Badge>
              <Badge
                variant={emp.status === "Active" ? "success" : "secondary"}
                className={cn(
                  "text-[10px] font-semibold",
                  emp.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                    : "bg-muted text-muted-foreground border-transparent"
                )}
              >
                {emp.status === "Active"
                  ? t("common:employees.status.Active")
                  : t("common:employees.status.Inactive")}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeTable;
