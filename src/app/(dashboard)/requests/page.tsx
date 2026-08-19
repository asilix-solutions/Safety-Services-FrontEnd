"use client";
 
import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { LicensingRequest, RequestType } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Plus, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import {
  getClassificationDisplayName,
  getCanonicalRequestTypeDisplayName,
  getWorkflowStageDisplayName,
} from "@/domains/requests/workflow";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getProjects } from "@/domains/projects/storage";
import { Project } from "@/types/project";
import { isRole } from "@/constants/permissions";
import { RequestsTable } from "@/features/requests/components/requests-table";
 
export default function RequestsPage() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LicensingRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
 
  // Load from localStorage and merge with mock requests
  useEffect(() => {
    const list = getScopedRequests(tenantContext);
    if (isRole(user?.role, ["Client"])) {
      const filtered = list.filter((r) => r.clientId === user!.companyId);
      setRequests(filtered);
    } else {
      setRequests(list);
    }
    setProjects(getProjects());
  }, [user]);
 
  if (!user) return null;

  const projectsByJobNumber = new Map(
    projects.map((project) => [project.jobNumber, project])
  );

  const getRequestTypeLabel = (type: RequestType) => {
    return getCanonicalRequestTypeDisplayName({ requestType: type }, t);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "submitted":
        return "warning";
      case "under_review":
        return "warning";
      case "approved":
        return "success";
      case "completed":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStageBadgeLabel = (stage: string) => {
    return getWorkflowStageDisplayName(stage, t);
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case "DRAFT":
        return "secondary";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "warning";
      case "QUOTATION":
      case "QUOTATION_APPROVAL":
        return "warning";
      case "PAYMENT_CONFIRMED":
      case "PROJECT_CREATED":
      case "FIELD_EXECUTION":
      case "FINAL_INSPECTION":
      case "COMPLETED":
        return "success";
      default:
        return "secondary";
    }
  };

  // Render client-portal layout with friendly visual cards
  if (isRole(user.role, ["Client"])) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("dashboard:my_safety_requests")}
          description={t("dashboard:submit_and_track_desc")}
          actions={
            <Link href="/requests/new">
              <Button size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="h-4 w-4" /> {t("dashboard:submit_safety_request")}
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <Card key={req.id} className="border-border bg-card hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <Badge variant={getStageBadgeVariant(req.currentStage)} className="capitalize">
                    {getStageBadgeLabel(req.currentStage)}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">{req.facilityName}</CardTitle>
                  <CardDescription className="text-xs">{getRequestTypeLabel(req.requestType)}</CardDescription>
                </div>
                <span className="text-[10px] font-mono font-bold text-primary">{req.jobNumber}</span>
              </CardHeader>
              <CardContent className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground p-2 rounded-lg bg-secondary/35">
                  <div>
                    <span>{t("requests:list.fields.area")} </span>
                    <span className="font-semibold text-foreground">{req.area} m²</span>
                  </div>
                  <div>
                    <span>{t("requests:list.fields.classification")} </span>
                    <span className="font-semibold text-foreground capitalize">
                      {getClassificationDisplayName(req.classification, t)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/requests/${req.jobNumber}`}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary">
                      <Eye className="h-3.5 w-3.5" /> {t("dashboard:view_details")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && (
            <div className="col-span-2 text-center py-16 bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
              {t("dashboard:no_active_requests")}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isSalesAgent = isRole(user.role, ["Sales Agent"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isSalesAgent ? t("dashboard:sales_requests_title") : t("dashboard:licensing_requests_queue")}
        description={isSalesAgent ? t("dashboard:sales_requests_subtitle") : t("dashboard:verify_submitted_desc")}
      />

      <RequestsTable
        requests={requests}
        projectsByJobNumber={projectsByJobNumber}
        userRole={user.role}
        isSalesAgent={isSalesAgent}
      />
    </div>
  );
}
