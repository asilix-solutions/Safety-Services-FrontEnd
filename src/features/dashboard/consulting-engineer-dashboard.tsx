"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getProjects } from "@/domains/projects/storage";
import { getMergedRequests } from "@/domains/requests/storage";
import { getQuotations } from "@/domains/quotations/storage";
import { getSiteVisits } from "@/domains/site-visits/storage";

import {
  ConsultingEngineerOverview,
  prepareConsultingEngineerOverviewViewModel,
  ConsultingEngineerOverviewViewModel,
} from "@/features/consulting-engineer-overview";

export function ConsultingEngineerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<ConsultingEngineerOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const projects = getProjects();
    const requests = getMergedRequests();
    const quotations = getQuotations();
    const siteVisits = getSiteVisits();

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
