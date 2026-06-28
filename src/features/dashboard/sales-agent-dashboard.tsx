"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getMergedRequests } from "@/domains/requests/storage";

import {
  SalesAgentOverview,
  prepareSalesAgentOverviewViewModel,
  SalesAgentOverviewViewModel,
} from "@/features/sales-agent-overview";

export function SalesAgentDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<SalesAgentOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const requests = getMergedRequests();

    const vm = prepareSalesAgentOverviewViewModel(
      {
        name: user.name,
        role: user.role,
      },
      {
        requests,
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

  return <SalesAgentOverview viewModel={viewModel} />;
}

export default SalesAgentDashboard;
