import React, { useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation } from "@/providers/i18n-provider";
import { EmployeeSummary } from "./components/employee-summary";
import { EmployeeFiltersComponent } from "./components/employee-filters";
import { EmployeeTable } from "./components/employee-table";
import { InviteEmployeeDialog } from "./dialogs/invite-employee-dialog";
import { EmployeeDetailsDrawer } from "./drawers/employee-details-drawer";
import { useEmployeeList } from "./hooks/use-employee-list";
import { Employee } from "@/domains/employees/types";
import { ShieldAlert } from "lucide-react";

export function EmployeeList() {
  const { t } = useTranslation();
  const {
    employees,
    filters,
    setFilters,
    kpis,
    permissions,
    handleInviteEmployee,
    handleUpdateEmployee,
    handleToggleStatus,
  } = useEmployeeList();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Scoped authorization gate
  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{t("common:unauthorized")}</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Your role does not have authorization to access employee profiles.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedEmployee(null);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title={t("common:employees.title")}
          description={t("common:employees.desc")}
        />
        {permissions.canManage && (
          <InviteEmployeeDialog onInvite={handleInviteEmployee} />
        )}
      </div>

      {/* KPI stats */}
      <EmployeeSummary kpis={kpis} />

      {/* Filters bar */}
      <EmployeeFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Main Grid/Table */}
      <EmployeeTable
        employees={employees}
        canManage={permissions.canManage}
        onViewDetails={handleOpenDetails}
        onToggleStatus={handleToggleStatus}
      />

      {/* Details side drawer overlay */}
      <EmployeeDetailsDrawer
        employee={selectedEmployee}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetails}
        onSave={handleUpdateEmployee}
        canManage={permissions.canManage}
      />
    </div>
  );
}
