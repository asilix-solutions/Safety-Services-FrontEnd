"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import {
  SuperAdminOverview,
  prepareSuperAdminOverviewViewModel,
  SuperAdminOverviewViewModel,
  MOCK_COMPANIES,
} from "@/features/super-admin-overview";

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<SuperAdminOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    // Use isolated mock company domain mapping
    const companies = MOCK_COMPANIES;

    const vm = prepareSuperAdminOverviewViewModel(
      {
        name: user.name,
        role: user.role,
      },
      {
        companies,
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

  return <SuperAdminOverview viewModel={viewModel} />;
}

export default SuperAdminDashboard;
