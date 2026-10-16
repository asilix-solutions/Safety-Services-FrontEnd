"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest } from "@/domains/requests/types";
import { mapStatusToStage } from "@/domains/requests/workflow";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/components/data-table/data-table";
import { Eye, FileCheck, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Quotation } from "@/domains/quotations/types";
import { getScopedQuotations } from "@/domains/quotations/storage";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { isRole } from "@/constants/permissions";
import { USER_ROLES } from "@/constants/roles";

export default function QuotationApprovalsQueuePage() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common"]);
  const [approvals, setApprovals] = useState<(Quotation & { clientName: string; facilityName: string })[]>([]);

  useEffect(() => {
    const localQuotes = getScopedQuotations(tenantContext);
    const merged = getScopedRequests(tenantContext);
 
    // Merge requests
    const requestsMap = new Map<string, LicensingRequest>();
    merged.forEach((r) => requestsMap.set(r.jobNumber, r));
 
    // Map quotations with client metadata and filter for SUBMITTED_FOR_APPROVAL
    const filteredApprovals = localQuotes
      .filter((q) => q.quotationStatus === "SUBMITTED_FOR_APPROVAL")
      .map((q) => {
        const req = requestsMap.get(q.jobNumber);
        return {
          ...q,
          clientName: req ? req.clientName : t("common:unknown") || "Unknown",
          facilityName: req ? req.facilityName : t("common:unknown") || "Unknown",
        };
      });
 
    setApprovals(filteredApprovals);
  }, [t]);

  if (!user || !isRole(user.role, [USER_ROLES.COMPANY_ADMIN])) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("common:unauthorized") || "Access Denied"}</p>
      </div>
    );
  }

  const columns: ColumnDef<Quotation & { clientName: string; facilityName: string }>[] = [
    {
      header: t("requests:list.columns.jobNumber"),
      accessorKey: "jobNumber",
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold">{row.jobNumber}</span>,
    },
    {
      header: t("requests:quotations.builder.fieldFacilityName"),
      accessorKey: "facilityName",
      sortable: true,
      render: (row) => <span className="text-sm text-foreground">{row.facilityName}</span>,
    },
    {
      header: t("requests:quotations.builder.fieldClientName"),
      accessorKey: "clientName",
      sortable: true,
      render: (row) => <span className="text-sm text-foreground">{row.clientName}</span>,
    },
    {
      header: t("requests:quotations.details.submittedBy"),
      accessorKey: "submittedBy",
      sortable: true,
      render: (row) => <span className="text-xs">{row.submittedBy || "-"}</span>,
    },
    {
      header: t("requests:quotations.details.submittedAt"),
      accessorKey: "submittedAt",
      sortable: true,
      render: (row) => (
        <span className="text-xs">
          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      header: t("requests:quotations.builder.subtotal"),
      accessorKey: "subtotal",
      render: (row) => (
        <span className="text-sm font-semibold">
          {row.subtotal.toLocaleString()} {t("common:sar") || "SAR"}
        </span>
      ),
    },
    {
      header: t("requests:quotations.builder.vat"),
      accessorKey: "vat",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.vat.toLocaleString()} {t("common:sar") || "SAR"}
        </span>
      ),
    },
    {
      header: t("requests:quotations.builder.grandTotal"),
      accessorKey: "grandTotal",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-bold text-primary">
          {row.grandTotal.toLocaleString()} {t("common:sar") || "SAR"}
        </span>
      ),
    },
    {
      header: t("requests:list.columns.actions"),
      render: (row) => (
        <Link href={`/quotations/approvals/${row.jobNumber}`}>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Eye className="h-3.5 w-3.5" />
            {t("requests:quotations.actions.review")}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("requests:quotations.approvals.title")}
        description={t("requests:quotations.approvals.description")}
      />

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {t("requests:quotations.approvals.title")}
              </CardTitle>
              <CardDescription>
                {t("requests:quotations.approvals.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <EmptyState
              title={t("requests:quotations.approvals.emptyTitle")}
              description={t("requests:quotations.approvals.emptyDesc")}
              icon={<FileCheck className="h-8 w-8 text-muted-foreground/60" />}
            />
          ) : (
            <>
              {/* Mobile Card List View (< 768px) */}
              <div className="md:hidden space-y-3">
                {approvals.map((row) => (
                  <Card key={row.jobNumber} className="p-4 border-border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{row.jobNumber}</span>
                      <span className="text-xs font-bold text-primary">
                        {row.grandTotal.toLocaleString()} {t("common:sar") || "SAR"}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="font-medium text-foreground">{row.facilityName}</p>
                      </div>
                      {row.clientName && (
                        <p className="text-xs text-muted-foreground ps-5">{row.clientName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/40 border border-border/50">
                      <div>
                        <span className="block text-[10px] text-muted-foreground">{t("requests:quotations.details.submittedBy")}</span>
                        <span className="font-medium text-foreground">{row.submittedBy || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">{t("requests:quotations.details.submittedAt")}</span>
                        <span className="font-medium text-foreground">
                          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-end">
                      <Link href={`/quotations/approvals/${row.jobNumber}`}>
                        <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                          <Eye className="h-3.5 w-3.5" />
                          {t("requests:quotations.actions.review")}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block">
                <DataTable
                  data={approvals}
                  columns={columns}
                  searchKey="jobNumber"
                  searchPlaceholder={t("dashboard:search_requests_placeholder")}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
