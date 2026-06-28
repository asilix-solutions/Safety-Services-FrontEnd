"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getProjects } from "@/domains/projects/storage";
import { getMergedRequests } from "@/domains/requests/storage";
import { getMergedInvoices } from "@/domains/invoices/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getCertificates } from "@/domains/certificates/storage";
import { getQuotations } from "@/domains/quotations/storage";

import {
  CompanyAdminOverview,
  prepareCompanyAdminOverviewViewModel,
  CompanyAdminOverviewViewModel,
} from "@/features/company-admin-overview";

export function CompanyAdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<CompanyAdminOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const projects = getProjects();
    const requests = getMergedRequests();
    const invoices = getMergedInvoices();
    const contracts = getContracts();
    const certificates = getCertificates();
    const quotations = getQuotations();

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
