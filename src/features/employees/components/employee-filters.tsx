import React from "react";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/providers/i18n-provider";
import { Search } from "lucide-react";
import { EmployeeFilters } from "../types";

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
}

export function EmployeeFiltersComponent({ filters, onFiltersChange }: EmployeeFiltersProps) {
  const { t } = useTranslation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, department: e.target.value as any });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, role: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value as any });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, availabilityStatus: e.target.value as any });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border">
      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common:employees.filter.search_placeholder")}
          value={filters.search}
          onChange={handleSearchChange}
          className="ps-9 h-9 text-xs"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto justify-end">
        {/* Department Filter */}
        <Select value={filters.department} onChange={handleDeptChange} className="w-full md:w-40 h-9 text-xs">
          <option value="All">{t("common:employees.filter.department")}</option>
          <option value="Engineering">{t("common:employees.departments.Engineering")}</option>
          <option value="Operations">{t("common:employees.departments.Operations")}</option>
          <option value="Sales">{t("common:employees.departments.Sales")}</option>
          <option value="Administration">{t("common:employees.departments.Administration")}</option>
        </Select>

        {/* Role Filter */}
        <Select value={filters.role} onChange={handleRoleChange} className="w-full md:w-40 h-9 text-xs">
          <option value="All">{t("common:employees.filter.role")}</option>
          <option value="Company Admin">{t("common:roles.company_admin")}</option>
          <option value="Consulting Engineer">{t("common:roles.consulting_engineer")}</option>
          <option value="Operations Officer">{t("common:roles.operations_officer")}</option>
          <option value="Sales Agent">{t("common:roles.sales_agent")}</option>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onChange={handleStatusChange} className="w-full md:w-36 h-9 text-xs">
          <option value="All">{t("common:employees.filter.status")}</option>
          <option value="Active">{t("common:active")}</option>
          <option value="Inactive">{t("common:inactive")}</option>
        </Select>

        {/* Availability Filter */}
        <Select value={filters.availabilityStatus} onChange={handleAvailabilityChange} className="w-full md:w-36 h-9 text-xs">
          <option value="All">{t("common:employees.filter.availability")}</option>
          <option value="Available">{t("common:employees.availability.Available")}</option>
          <option value="Busy">{t("common:employees.availability.Busy")}</option>
          <option value="Unavailable">{t("common:employees.availability.Unavailable")}</option>
        </Select>
      </div>
    </div>
  );
}
