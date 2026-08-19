"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";

import {
  SuperAdminOverview,
  prepareSuperAdminOverviewViewModel,
  SuperAdminOverviewViewModel,
} from "@/features/super-admin-overview";
import { getCompanies } from "@/domains/organization/storage";

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "companies", "dashboard", "subscriptions"]);

  const [viewModel, setViewModel] = useState<SuperAdminOverviewViewModel | null>(null);

  const loadData = () => {
    if (!user) return;

    const companies = getCompanies();

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
