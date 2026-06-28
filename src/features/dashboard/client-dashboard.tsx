"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { PageHeader } from "@/shared/components/page-header";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

import { getMergedRequests } from "@/domains/requests/storage";
import { getProjects } from "@/domains/projects/storage";
import { getMergedInvoices } from "@/domains/invoices/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getCertificates } from "@/domains/certificates/storage";

import { ClientOverview, prepareClientOverviewViewModel, ClientOverviewViewModel } from "@/features/client-overview";

export function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard"]);

  const [viewModel, setViewModel] = useState<ClientOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user || !user.companyId) return;

    const requests = getMergedRequests();
    const projects = getProjects();
    const invoices = getMergedInvoices();
    const contracts = getContracts();
    const certificates = getCertificates();

    const vm = prepareClientOverviewViewModel(
      {
        id: user.id,
        name: user.name,
        companyId: user.companyId,
        companyName: user.name ?? "—",
      },
      {
        requests,
        projects,
        invoices,
        contracts,
        certificates,
      }
    );

    setViewModel(vm);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user || !user.companyId || !viewModel) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-xs text-muted-foreground">
        {t("common:loading")}
      </div>
    );
  }

  return <ClientOverview viewModel={viewModel} />;
}

export default ClientDashboard;
