import React, { useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation } from "@/providers/i18n-provider";
import { CustomerSummary } from "./components/customer-summary";
import { CustomerFiltersComponent } from "./components/customer-filters";
import { CustomerTable } from "./components/customer-table";
import { AddCustomerDialog } from "./dialogs/add-customer-dialog";
import { CustomerHubDrawer } from "./drawers/customer-hub-drawer";
import { useCustomerList } from "./hooks/use-customer-list";
import { Customer } from "@/domains/customers/types";
import { ShieldAlert } from "lucide-react";

export function CustomerList() {
  const { t } = useTranslation();
  const {
    customers,
    filters,
    setFilters,
    kpis,
    filterOptions,
    permissions,
    handleAddCustomer,
    handleUpdateCustomer,
    handleToggleStatus,
  } = useCustomerList();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEditMode, setDrawerEditMode] = useState(false);

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
            Your role does not have authorization to access customer records.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenDetails = (c: Customer, openForEditing: boolean = false) => {
    setSelectedCustomer(c);
    setDrawerEditMode(openForEditing);
    setIsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedCustomer(null);
      setDrawerEditMode(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title={t("common:customers.title")}
          description={t("common:customers.desc")}
        />
        {permissions.canManageCustomerProfile && (
          <AddCustomerDialog onAdd={handleAddCustomer} />
        )}
      </div>

      {/* KPI stats */}
      <CustomerSummary kpis={kpis} />

      {/* Filters bar */}
      <CustomerFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        industries={filterOptions.industries}
        cities={filterOptions.cities}
      />

      {/* Main Grid/Table */}
      <CustomerTable
        customers={customers}
        permissions={permissions}
        onViewDetails={handleOpenDetails}
        onToggleStatus={handleToggleStatus}
      />

      {/* Details side drawer overlay */}
      <CustomerHubDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetails}
        onSave={handleUpdateCustomer}
        permissions={permissions}
        initialEditMode={drawerEditMode}
      />
    </div>
  );
}
