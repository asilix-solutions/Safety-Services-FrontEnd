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
import { Eye, DollarSign } from "lucide-react";
import Link from "next/link";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Quotation } from "@/domains/quotations/types";
import { getQuotations } from "@/domains/quotations/workflow";
import { getMergedRequests } from "@/domains/requests/storage";

type DerivedQuotationStatus =
  | "NOT_STARTED"
  | "DRAFT"
  | "SUBMITTED_FOR_APPROVAL"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

export default function QuotationsQueuePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "dashboard", "common"]);
  const [requests, setRequests] = useState<(LicensingRequest & { derivedStatus: DerivedQuotationStatus })[]>([]);

  // Load and merge requests
  useEffect(() => {
    const merged = getMergedRequests();
    const localQuotes = getQuotations();

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
        <Badge variant={row.assignedQueue === "HIGH_HAZARD" ? "destructive" : "secondary"}>
          {getQueueDisplayName(row.assignedQueue, t)}
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/quotations/${row.jobNumber}`}>
            <Button size="sm" className="h-8 gap-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <DollarSign className="h-3.5 w-3.5" />
              {getActionButtonLabel(row.derivedStatus)}
            </Button>
          </Link>
          <Link href={`/requests/${row.jobNumber}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Eye className="h-3.5 w-3.5" />
              {t("requests:quotations.queue.viewRequest")}
            </Button>
          </Link>
        </div>
      ),
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
            <DataTable
              data={requests}
              columns={columns}
              searchKey="facilityName"
              searchPlaceholder={t("dashboard:search_requests_placeholder")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
