"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";

import { getScopedProjects } from "@/domains/projects/storage";
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
import { requestsApi } from "@/domains/requests/api";
import { invoicesApi } from "@/domains/invoices/api";
import { mapWorkflowSummaryToLicensingRequest } from "@/domains/requests/mappers";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientInvoice } from "@/domains/invoices/types";

export function CompanyAdminDashboard() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();

  const [viewModel, setViewModel] = useState<CompanyAdminOverviewViewModel | null>(null);

  const loadData = async () => {
    if (!user) return;

    const projects = getScopedProjects(tenantContext);
    let requests = getScopedRequests(tenantContext);
    let invoices = getScopedInvoices(tenantContext);
    const contracts = getScopedContracts(tenantContext);
    const certificates = getScopedCertificates(tenantContext);
    const quotations = getScopedQuotations(tenantContext);

    try {
      const [wfRes, invRes] = await Promise.allSettled([
        requestsApi.getWorkflowInstances(),
        invoicesApi.getInvoices(),
      ]);

      if (wfRes.status === "fulfilled" && wfRes.value.isSuccess && wfRes.value.data?.items) {
        const liveList = wfRes.value.data.items.map((i) =>
          mapWorkflowSummaryToLicensingRequest(i, user.tenantId || "COMP-001")
        );
        const map = new Map<string, LicensingRequest>();
        liveList.forEach((r) => map.set(r.jobNumber, r));
        requests.forEach((r) => {
          if (!map.has(r.jobNumber)) map.set(r.jobNumber, r);
        });
        requests = Array.from(map.values());
      }

      if (invRes.status === "fulfilled" && invRes.value.isSuccess && invRes.value.data?.items) {
        const liveInvoices: ClientInvoice[] = invRes.value.data.items.map((inv) => ({
          id: inv.invoiceNumber || inv.id,
          tenantId: user.tenantId || "COMP-001",
          clientId: "c-102",
          jobNumber: inv.jobNumber || `AMX-${inv.invoiceNumber.replace("INV-", "")}`,
          subtotal: inv.subtotalAmount,
          vatAmount: inv.vatAmount,
          grandTotal: inv.totalWithVat,
          currency: "SAR",
          status: "unpaid",
          dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          issuedAt: inv.issuedAtUtc || new Date().toISOString(),
        }));
        const invMap = new Map<string, ClientInvoice>();
        liveInvoices.forEach((i) => invMap.set(i.id, i));
        invoices.forEach((i) => {
          if (!invMap.has(i.id)) invMap.set(i.id, i);
        });
        invoices = Array.from(invMap.values());
      }
    } catch {
      // Fallback
    }

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
