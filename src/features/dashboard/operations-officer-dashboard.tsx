"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getProjects } from "@/domains/projects/storage";
import { getMergedRequests } from "@/domains/requests/storage";
import { getMergedInvoices } from "@/domains/invoices/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getCertificates } from "@/domains/certificates/storage";
import { getSiteVisits } from "@/domains/site-visits/storage";

import {
  OperationsOverview,
  prepareOperationsOverviewViewModel,
  OperationsOverviewViewModel,
} from "@/features/operations-overview";

export function OperationsOfficerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<OperationsOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const projects = getProjects();
    const requests = getMergedRequests();
    const invoices = getMergedInvoices();
    const contracts = getContracts();
    const certificates = getCertificates();
    const siteVisits = getSiteVisits();

    const vm = prepareOperationsOverviewViewModel(
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
        siteVisits,
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

  return <OperationsOverview viewModel={viewModel} />;
}

export default OperationsOfficerDashboard;
