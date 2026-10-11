"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getScopedProjects } from "@/domains/projects/storage";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getScopedQuotations } from "@/domains/quotations/storage";
import { getSiteVisits } from "@/domains/site-visits/storage";

import {
  ConsultingEngineerOverview,
  prepareConsultingEngineerOverviewViewModel,
  ConsultingEngineerOverviewViewModel,
} from "@/features/consulting-engineer-overview";
import { requestsApi } from "@/domains/requests/api";
import { mapWorkflowSummaryToLicensingRequest } from "@/domains/requests/mappers";
import { LicensingRequest } from "@/domains/requests/types";

export function ConsultingEngineerDashboard() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<ConsultingEngineerOverviewViewModel | null>(null);

  const loadData = async () => {
    if (!user) return;

    const projects = getScopedProjects(tenantContext);
    let requests = getScopedRequests(tenantContext);
    const quotations = getScopedQuotations(tenantContext);
    const siteVisits = getSiteVisits();

    try {
      const wfRes = await requestsApi.getWorkflowInstances();
      if (wfRes.isSuccess && wfRes.data?.items) {
        const liveList = wfRes.data.items.map((i) =>
          mapWorkflowSummaryToLicensingRequest(i, user.tenantId || "COMP-001")
        );
        const map = new Map<string, LicensingRequest>();
        liveList.forEach((r) => map.set(r.jobNumber, r));
        requests.forEach((r) => {
          if (!map.has(r.jobNumber)) map.set(r.jobNumber, r);
        });
        requests = Array.from(map.values());
      }
    } catch {
      // Fallback
    }

    const vm = prepareConsultingEngineerOverviewViewModel(
      {
        name: user.name,
        role: user.role,
      },
      {
        projects,
        requests,
        quotations,
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

  return <ConsultingEngineerOverview viewModel={viewModel} />;
}

export default ConsultingEngineerDashboard;
