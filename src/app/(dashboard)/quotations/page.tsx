"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType } from "@/domains/requests/types";
import { mapStatusToStage, getQueueDisplayName, getClassificationDisplayName, getCanonicalRequestTypeDisplayName, getReviewPathDisplayName } from "@/domains/requests/workflow";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/components/data-table/data-table";
import { Eye, DollarSign, Building2 } from "lucide-react";
import Link from "next/link";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { ActionMenu } from "@/shared/components/action-menu";
import { Quotation } from "@/domains/quotations/types";
import { getScopedQuotations } from "@/domains/quotations/storage";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";

type DerivedQuotationStatus =
  | "NOT_STARTED"
  | "DRAFT"
  | "SUBMITTED_FOR_APPROVAL"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

export default function QuotationsQueuePage() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common"]);
  const [requests, setRequests] = useState<(LicensingRequest & { derivedStatus: DerivedQuotationStatus })[]>([]);

  // Load and merge requests
  useEffect(() => {
    const merged = getScopedRequests(tenantContext);
    const localQuotes = getScopedQuotations(tenantContext);

    const quoteStatusMap = new Map<string, DerivedQuotationStatus>();
    localQuotes.forEach((q) => {
      quoteStatusMap.set(q.jobNumber, q.quotationStatus as DerivedQuotationStatus);
    });

    const normalizedList = merged.map((r) => {
      const derivedStatus = quoteStatusMap.get(r.jobNumber) || "NOT_STARTED";
      return {
        ...r,
        derivedStatus
      };
    });

    // Filter only those in QUOTATION or QUOTATION_APPROVAL stage
    const quotationsQueue = normalizedList.filter((r) => r.currentStage === "QUOTATION" || r.currentStage === "QUOTATION_APPROVAL");
    setRequests(quotationsQueue);
  }, []);

  if (!user) return null;

  const getRequestTypeLabel = (type: RequestType) => {
    const map: Record<RequestType, string> = {
      new_license: "New Safety License",
      maintenance_contract: "Maintenance Contract",
      engineering_blueprint: "Blueprint Review",
      technical_report: "Technical Safety Report",
    };
    return map[type] || type;
  };

  const getQuotationStatusBadge = (status: DerivedQuotationStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="warning">
            {t("requests:quotations.status.draft")}
          </Badge>
        );
      case "SUBMITTED_FOR_APPROVAL":
        return (
          <Badge variant="success">
            {t("requests:quotations.status.submitted")}
          </Badge>
        );
      case "CHANGES_REQUESTED":
        return (
          <Badge variant="warning">
            {t("requests:quotations.status.changesRequested")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success">
            {t("requests:quotations.status.approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            {t("requests:quotations.status.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {t("requests:quotations.status.notStarted")}
          </Badge>
        );
    }
  };

  const getActionButtonLabel = (status: DerivedQuotationStatus) => {
    switch (status) {
      case "DRAFT":
      case "CHANGES_REQUESTED":
        return t("requests:quotations.actions.continueDraft");
      case "SUBMITTED_FOR_APPROVAL":
      case "APPROVED":
      case "REJECTED":
        return t("requests:quotations.actions.viewSubmission");
      default:
        return t("requests:quotations.queue.prepareQuote");
    }
  };

  const columns: ColumnDef<LicensingRequest & { derivedStatus: DerivedQuotationStatus }>[] = [
    {
      header: t("requests:quotations.columns.jobNumber"),
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono font-bold text-primary">{row.jobNumber}</span>,
    },
    {
      header: t("requests:quotations.columns.facilityOwner"),
      accessorKey: "facilityName",
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.facilityName}</p>
          <p className="text-[10px] text-muted-foreground">{row.clientName}</p>
        </div>
      ),
    },
    {
      header: t("requests:quotations.columns.requestType"),
      accessorKey: "requestType",
      render: (row) => <span>{getCanonicalRequestTypeDisplayName(row, t)}</span>,
    },
    {
      header: t("requests:quotations.columns.classification"),
      accessorKey: "classification",
      render: (row) => (
        <span className="capitalize font-medium">
          {getReviewPathDisplayName(row, t)}
        </span>
      ),
    },
    {
      header: t("requests:quotations.columns.assignedQueue"),
      accessorKey: "assignedQueue",
      render: (row) => (
        <Badge variant={row.currentStage === "QUOTATION" || row.currentStage === "QUOTATION_APPROVAL" ? "default" : (row.assignedQueue === "HIGH_HAZARD" ? "destructive" : "secondary")}>
          {row.currentStage === "QUOTATION" || row.currentStage === "QUOTATION_APPROVAL"
            ? (t("requests:queue.quotation") || "Quotation Queue")
            : getQueueDisplayName(row.assignedQueue, t)}
        </Badge>
      ),
    },
    {
      header: t("requests:quotations.columns.area"),
      accessorKey: "area",
      render: (row) => <span>{row.area} m²</span>,
    },
    {
      header: t("requests:quotations.columns.quotationStatus"),
      accessorKey: "derivedStatus",
      render: (row) => getQuotationStatusBadge(row.derivedStatus),
    },
    {
      header: t("requests:quotations.columns.actions"),
      accessorKey: "id",
      render: (row) => {
        const menuItems = [
          {
            id: "action-button",
            label: getActionButtonLabel(row.derivedStatus),
            icon: DollarSign,
            href: `/quotations/${row.jobNumber}`,
          },
          {
            id: "view-request",
            label: t("requests:quotations.queue.viewRequest"),
            icon: Eye,
            href: `/requests/${row.jobNumber}`,
          },
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("requests:quotations.queue.title")}
        description={t("requests:quotations.queue.description")}
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t("requests:quotations.queue.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("requests:quotations.queue.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <EmptyState
              title={t("requests:quotations.queue.emptyTitle")}
              description={t("requests:quotations.queue.emptyDescription")}
              icon={<DollarSign className="h-6 w-6 text-muted-foreground" />}
            />
          ) : (
            <>
              {/* Mobile Card List View (< 768px) */}
              <div className="md:hidden space-y-3">
                {requests.map((row) => (
                  <Card key={row.id} className="p-4 border-border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{row.jobNumber}</span>
                      {getQuotationStatusBadge(row.derivedStatus)}
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
                        <span className="block text-[10px] text-muted-foreground uppercase">{t("requests:quotations.columns.requestType")}</span>
                        <span className="font-medium text-foreground">{getRequestTypeLabel(row.requestType)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground uppercase">{t("requests:quotations.columns.area")}</span>
                        <span className="font-medium text-foreground">{row.area} m²</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {getReviewPathDisplayName(row, t)}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/quotations/${row.jobNumber}`}>
                          <Button size="sm" className="h-8 gap-1.5 text-xs">
                            <DollarSign className="h-3.5 w-3.5" />
                            {getActionButtonLabel(row.derivedStatus)}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block">
                <DataTable
                  data={requests}
                  columns={columns}
                  searchKey="facilityName"
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
