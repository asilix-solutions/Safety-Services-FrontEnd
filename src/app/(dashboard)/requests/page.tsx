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
import { Plus, Eye, Calendar, HardHat, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const { user } = useAuth();
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
    setRequests([...localList, ...MOCK_REQUESTS]);
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
          title="My Safety Requests"
          description="Submit and track your commercial licensing compliance review requests."
          actions={
            <Link href="/requests/new">
              <Button size="sm" className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10">
                <Plus className="h-4 w-4" /> Submit Safety Request
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize">
                    {req.status.replace("_", " ")}
                  </Badge>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">{req.facilityName}</CardTitle>
                  <CardDescription className="text-xs">{getRequestTypeLabel(req.requestType)}</CardDescription>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-500">{req.jobNumber}</span>
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

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/requests/${req.jobNumber}`}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && (
            <div className="col-span-2 text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-border/80 text-muted-foreground">
              No active safety requests found. Click the button above to start your first request.
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
      render: (row) => <span className="font-mono font-bold text-indigo-400">{row.jobNumber}</span>,
    },
    {
      header: "Facility / Owner",
      accessorKey: "facilityName",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-200">{row.facilityName}</p>
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
      render: (row) => (
        <Link href={`/requests/${row.jobNumber}`}>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Audit Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licensing Requests Queue"
        description="Verify submitted blueprints, audit technical hazard specifications, and approve compliance certifications."
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Incoming Safety Certificates</CardTitle>
          <CardDescription>SaaS compliance queue for active tenant reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests}
            columns={columns}
            searchKey="facilityName"
            searchPlaceholder="Search requests by facility..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
