"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getProjects } from "@/domains/projects/storage";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getScopedInvoices } from "@/domains/invoices/storage";
import { getScopedContracts } from "@/domains/contracts/storage";
import { getScopedCertificates } from "@/domains/certificates/storage";
import { getScopedQuotations } from "@/domains/quotations/storage";

import {
  CompanyAdminOverview,
  prepareCompanyAdminOverviewViewModel,
  CompanyAdminOverviewViewModel,
} from "@/features/company-admin-overview";

export function CompanyAdminDashboard() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<CompanyAdminOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const projects = getProjects();
    const requests = getScopedRequests(tenantContext);
    const invoices = getScopedInvoices(tenantContext);
    const contracts = getScopedContracts(tenantContext);
    const certificates = getScopedCertificates(tenantContext);
    const quotations = getScopedQuotations(tenantContext);

    const vm = prepareCompanyAdminOverviewViewModel(
      {
        name: user.name,
        role: user.role,
      },
      {
        projects,
        requests,
        invoices,
        contracts,
        certificates,
        quotations,
      }
    );

    setViewModel(vm);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user || !viewModel) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-xs text-muted-foreground">
        {t("common:loading")}
      </div>
    );
  }

  return <CompanyAdminOverview viewModel={viewModel} />;
}

export default CompanyAdminDashboard;
