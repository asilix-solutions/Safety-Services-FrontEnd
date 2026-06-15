"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { DataTable, ColumnDef } from "@/shared/components/data-table/data-table";
import { Plus, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";

export default function RequestsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LicensingRequest[]>([]);

  // Load from localStorage and merge with mock requests
  useEffect(() => {
    let localList: LicensingRequest[] = [];
    try {
      const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
      if (local) {
        localList = JSON.parse(local);
      }
    } catch (err) {
      console.error("Failed to read local requests", err);
    }

    const mergedMap = new Map<string, LicensingRequest>();
    MOCK_REQUESTS.forEach((r) => {
      mergedMap.set(r.jobNumber, r);
    });
    localList.forEach((r) => {
      mergedMap.set(r.jobNumber, r);
    });

    setRequests(Array.from(mergedMap.values()));
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

  // Render client-portal layout with friendly visual cards
  if (user.role === "Client") {
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
                  <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize">
                    {req.status.replace("_", " ")}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">{req.facilityName}</CardTitle>
                  <CardDescription className="text-xs">{getRequestTypeLabel(req.requestType)}</CardDescription>
                </div>
                <span className="text-[10px] font-mono font-bold text-primary">{req.jobNumber}</span>
              </CardHeader>
              <CardContent className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground p-2 rounded-lg bg-secondary/35">
                  <div>
                    <span>Area: </span>
                    <span className="font-semibold text-foreground">{req.area} m²</span>
                  </div>
                  <div>
                    <span>Classification: </span>
                    <span className="font-semibold text-foreground capitalize">{req.classification.replace("_", " ")}</span>
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

  // Admin / Operations internal dense table view
  const columns: ColumnDef<LicensingRequest>[] = [
    {
      header: "Job Number",
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono font-bold text-primary">{row.jobNumber}</span>,
    },
    {
      header: "Facility / Owner",
      accessorKey: "facilityName",
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.facilityName}</p>
          <p className="text-[10px] text-muted-foreground">{row.clientName}</p>
        </div>
      ),
    },
    {
      header: "Request Type",
      accessorKey: "requestType",
      render: (row) => <span>{getRequestTypeLabel(row.requestType)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize">
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      render: (row) => {
        const queue = row.assignedQueue || (row.classification === "high_hazard_review" ? "HIGH_HAZARD" : row.classification === "engineering_project" ? "ENGINEERING" : row.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK");
        const isEngQueue = queue === "ENGINEERING" || queue === "HIGH_HAZARD";
        const isConsultingEngineer = user.role === "Consulting Engineer";

        if (isConsultingEngineer && isEngQueue) {
          return (
            <Link href={`/blueprint-review/${row.jobNumber}`}>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 hover:text-primary">
                <Eye className="h-3.5 w-3.5" /> Open Review
              </Button>
            </Link>
          );
        }

        return (
          <Link href={`/requests/${row.jobNumber}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" /> Audit Details
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:licensing_requests_queue")}
        description={t("dashboard:verify_submitted_desc")}
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("dashboard:incoming_safety_certificates")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("dashboard:saas_compliance_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests}
            columns={columns}
            searchKey="facilityName"
            searchPlaceholder={t("dashboard:search_requests_placeholder")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
