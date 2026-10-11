"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { PageHeader } from "@/shared/components/page-header";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getScopedProjects } from "@/domains/projects/storage";
import { getScopedInvoices } from "@/domains/invoices/storage";
import { getScopedContracts } from "@/domains/contracts/storage";
import { getScopedCertificates } from "@/domains/certificates/storage";

import { ClientOverview, prepareClientOverviewViewModel, ClientOverviewViewModel } from "@/features/client-overview";
import { requestsApi } from "@/domains/requests/api";
import { mapClientRequestSummaryToLicensingRequest } from "@/domains/requests/mappers";
import { LicensingRequest } from "@/domains/requests/types";

export function ClientDashboard() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard"]);

  const [viewModel, setViewModel] = useState<ClientOverviewViewModel | null>(null);

  const loadData = async () => {
    if (!user || !user.companyId) return;

    let requests = getScopedRequests(tenantContext);
    const projects = getScopedProjects(tenantContext);
    const invoices = getScopedInvoices(tenantContext);
    const contracts = getScopedContracts(tenantContext);
    const certificates = getScopedCertificates(tenantContext);

    try {
      const clientRes = await requestsApi.getMyRequests();
      if (clientRes.isSuccess && clientRes.data?.items) {
        const liveItems = clientRes.data.items.map((item) =>
          mapClientRequestSummaryToLicensingRequest(
            item,
            user.tenantId || "COMP-001",
            user.name || "Client",
            user.companyId || "client-id"
          )
        );
        const map = new Map<string, LicensingRequest>();
        liveItems.forEach((r) => map.set(r.jobNumber, r));
        requests.forEach((r) => {
          if (!map.has(r.jobNumber)) map.set(r.jobNumber, r);
        });
        requests = Array.from(map.values());
      }
    } catch {
      // Fallback
    }

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
