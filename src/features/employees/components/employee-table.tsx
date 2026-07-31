import React from "react";
import { Employee, EmployeeAvailability } from "@/domains/employees/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { ActionMenu } from "@/shared/components/action-menu";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { Eye, Edit2, ShieldAlert, Award, UserMinus, UserCheck, ShieldClose } from "lucide-react";

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
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      case "Busy":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      case "Unavailable":
        return "bg-muted text-muted-foreground border-border hover:bg-secondary";
    }
  };

  const getRowActions = (emp: Employee) => {
    const actions = [
      {
        id: `${emp.id}-details`,
        label: t("common:employees.table.view_details"),
        onClick: () => onViewDetails(emp),
        icon: Eye,
      },
    ];

    if (canManage) {
      actions.push({
        id: `${emp.id}-status`,
        label: emp.status === "Active"
          ? t("common:employees.table.deactivate")
          : t("common:employees.table.activate"),
        onClick: () => onToggleStatus(emp.id),
        icon: emp.status === "Active" ? UserMinus : UserCheck,
      });
    }

    return actions;
  };

  const getMobileRowActions = (emp: Employee) => {
    const actions = [
      {
        id: `${emp.id}-details-mobile`,
        label: t("common:employees.table.view_details"),
        onClick: () => onViewDetails(emp),
        icon: Eye,
      },
    ];

    if (canManage) {
      actions.push({
        id: `${emp.id}-status-mobile`,
        label: emp.status === "Active"
          ? t("common:employees.table.deactivate")
          : t("common:employees.table.activate"),
        onClick: () => onToggleStatus(emp.id),
        icon: emp.status === "Active" ? UserMinus : UserCheck,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-start text-xs text-foreground">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th className="p-4">{t("common:employees.table.name")}</th>
              <th className="p-4">{t("common:employees.table.number")}</th>
              <th className="p-4">{t("common:employees.table.role")}</th>
              <th className="p-4">{t("common:employees.table.department")}</th>
              <th className="p-4">{t("common:employees.table.email")}</th>
              <th className="p-4">{t("common:employees.table.phone")}</th>
              <th className="p-4">{t("common:employees.table.status")}</th>
              <th className="p-4">{t("common:employees.table.availability")}</th>
              <th className="p-4 text-end">{t("common:employees.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-secondary/10 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={emp.avatarUrl} alt={emp.fullName} />
                    <AvatarFallback>{emp.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground">{emp.fullName}</span>
                </td>
                <td className="p-4 font-mono text-muted-foreground">{emp.employeeNumber}</td>
                <td className="p-4">{t(`common:roles.${emp.role.toLowerCase().replace(" ", "_")}`)}</td>
                <td className="p-4">{t(`common:employees.departments.${emp.department}`)}</td>
                <td className="p-4 text-muted-foreground">{emp.email}</td>
                <td className="p-4 text-muted-foreground">{emp.phone}</td>
                <td className="p-4">
                  <Badge variant={emp.status === "Active" ? "default" : "secondary"}>
                    {t(`common:status_${emp.status}`)}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={getAvailabilityBadgeClass(emp.availabilityStatus)}>
                    {t(`common:employees.availability.${emp.availabilityStatus}`)}
                  </Badge>
                </td>
                <td className="p-4 text-end">
                  <ActionMenu items={getRowActions(emp)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={emp.avatarUrl} alt={emp.fullName} />
                  <AvatarFallback>{emp.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{emp.fullName}</h4>
                  <p className="text-xs text-muted-foreground">{t(`common:roles.${emp.role.toLowerCase().replace(" ", "_")}`)}</p>
                </div>
              </div>
              <ActionMenu items={getMobileRowActions(emp)} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border">
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.number")}</span>
                <span className="font-mono font-medium text-foreground">{emp.employeeNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.department")}</span>
                <span className="font-medium text-foreground">{t(`common:employees.departments.${emp.department}`)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.email")}</span>
                <span className="font-medium text-foreground truncate block max-w-[140px]">{emp.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("common:employees.table.phone")}</span>
                <span className="font-medium text-foreground">{emp.phone}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Badge variant="outline" className={getAvailabilityBadgeClass(emp.availabilityStatus)}>
                {t(`common:employees.availability.${emp.availabilityStatus}`)}
              </Badge>
              <Badge variant={emp.status === "Active" ? "default" : "secondary"}>
                {t(`common:status_${emp.status}`)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
