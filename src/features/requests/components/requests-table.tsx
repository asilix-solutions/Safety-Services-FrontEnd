"use client";

import React from "react";
import { LicensingRequest, RequestType } from "@/domains/requests/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { DataTable, ColumnDef } from "@/shared/components/data-table/data-table";
import { EmptyState } from "@/shared/components/empty-state";
import { Eye, FileText, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import {
  getRequestStatusDisplayName,
  getCanonicalRequestTypeDisplayName,
  getClassificationDisplayName,
} from "@/domains/requests/workflow";
import { Project } from "@/types/project";
import { isRole } from "@/constants/permissions";
import { UserRole } from "@/types/role";

interface RequestsTableProps {
  requests: LicensingRequest[];
  projectsByJobNumber: Map<string | undefined, Project>;
  userRole?: UserRole | string;
  isSalesAgent?: boolean;
}

export function RequestsTable({
  requests,
  projectsByJobNumber,
  userRole,
  isSalesAgent = false,
}: RequestsTableProps) {
  const { t } = useTranslation();

  const getRequestTypeLabel = (type: RequestType) => {
    return getCanonicalRequestTypeDisplayName({ requestType: type }, t);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "submitted":
      case "under_review":
        return "warning";
      case "approved":
      case "completed":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const renderActionNode = (req: LicensingRequest) => {
    const queue =
      req.assignedQueue ||
      (req.classification === "high_hazard_review"
        ? "HIGH_HAZARD"
        : req.classification === "engineering_project"
        ? "ENGINEERING"
        : req.classification === "maintenance_strategy"
        ? "MAINTENANCE"
        : "FAST_TRACK");
    const isEngQueue = queue === "ENGINEERING" || queue === "HIGH_HAZARD";
    const isConsultingEngineer = isRole(userRole as UserRole, ["Consulting Engineer"]);
    const linkedProject = projectsByJobNumber.get(req.jobNumber);

    if (isConsultingEngineer && isEngQueue) {
      if (
        linkedProject &&
        (req.currentStage === "FINAL_INSPECTION" || req.currentStage === "COMPLETED")
      ) {
        return (
          <Link href={`/projects/${linkedProject.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 hover:text-primary font-semibold"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("requests:details.openWorkspace") || "Open Workspace"}
            </Button>
          </Link>
        );
      }

      return (
        <Link href={`/blueprint-review/${req.jobNumber}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("requests:list.actions.openReview")}
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/requests/${req.jobNumber}`}>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" />
          {t("requests:list.actions.auditDetails") || "Audit Details"}
        </Button>
      </Link>
    );
  };

  const columns: ColumnDef<LicensingRequest>[] = [
    {
      header: t("requests:list.columns.jobNumber"),
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono font-bold text-primary">{row.jobNumber}</span>,
    },
    {
      header: t("requests:list.columns.facilityOwner"),
      accessorKey: "facilityName",
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.facilityName}</p>
          <p className="text-[10px] text-muted-foreground">{row.clientName}</p>
        </div>
      ),
    },
    {
      header: t("requests:list.columns.requestType"),
      accessorKey: "requestType",
      render: (row) => <span>{getRequestTypeLabel(row.requestType)}</span>,
    },
    {
      header: t("requests:list.columns.status"),
      accessorKey: "status",
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize">
          {getRequestStatusDisplayName(row.status, t)}
        </Badge>
      ),
    },
    {
      header: t("requests:list.columns.actions"),
      accessorKey: "id",
      render: (row) => renderActionNode(row),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {isSalesAgent
            ? t("dashboard:sales_section_title")
            : t("dashboard:incoming_safety_certificates")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSalesAgent
            ? t("dashboard:sales_section_desc")
            : t("dashboard:saas_compliance_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <EmptyState
            title={t("dashboard:no_active_requests") || "No requests found"}
            description={t("dashboard:verify_submitted_desc") || "Submitted requests will appear here."}
            icon={<FileText className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden space-y-3">
              {requests.map((req) => (
                <Card key={req.id} className="p-4 border-border bg-card space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{req.jobNumber}</span>
                    <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize text-[10px]">
                      {getRequestStatusDisplayName(req.status, t)}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="font-medium text-foreground">{req.facilityName}</p>
                    </div>
                    {req.clientName && (
                      <p className="text-xs text-muted-foreground ps-5">{req.clientName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground p-2 rounded-lg bg-secondary/20 border border-border/50">
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">{t("requests:list.columns.requestType")}</span>
                      <span className="font-medium text-foreground">{getRequestTypeLabel(req.requestType)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">{t("requests:list.fields.classification")}</span>
                      <span className="font-medium text-foreground capitalize">
                        {getClassificationDisplayName(req.classification, t)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <div>{renderActionNode(req)}</div>
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
  );
}

export default RequestsTable;
