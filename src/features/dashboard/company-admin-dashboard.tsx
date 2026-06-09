"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { ClipboardCopy, FolderKanban, AlertCircle, FileSignature, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";

export function CompanyAdminDashboard() {
  const { t } = useTranslation();

  const mockRequests = [
    { id: "REQ-0932", name: "Al Hamra Warehouse Fire Review", client: "Al Hamra Retail", status: "awaiting_approval", date: "2026-06-08" },
    { id: "REQ-0891", name: "Modern Offices Safety Certificate", client: "Tamkeen Co.", status: "under_review", date: "2026-06-07" },
    { id: "REQ-0854", name: "Plaza Hotel Ventilation Audit", client: "Plaza Group", status: "quotation_created", date: "2026-06-05" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:company_admin_title")}
        description={t("dashboard:company_admin_desc")}
        actions={
          <Button size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="h-4 w-4" /> {t("dashboard:sync_data")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("dashboard:total_requests")}
          value="42"
          description={t("dashboard:safety_evaluation_requests")}
          icon={<ClipboardCopy className="h-4 w-4 text-indigo-500" />}
        />
        <StatsCard
          title={t("dashboard:active_projects")}
          value="15"
          description={t("dashboard:ongoing_safety_operations")}
          icon={<FolderKanban className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title={t("dashboard:pending_reviews")}
          value="7"
          description="blueprint reviews assigned"
          icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title={t("dashboard:contracts_awaiting_signature")}
          value="4"
          description="pending client execution"
          icon={<FileSignature className="h-4 w-4 text-rose-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">{t("dashboard:recent_requests_queue")}</CardTitle>
            <CardDescription className="text-muted-foreground">{t("dashboard:requests_waiting_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 text-start">ID</th>
                  <th className="py-2.5 text-start">Request Name</th>
                  <th className="py-2.5 text-start">Client</th>
                  <th className="py-2.5 text-start">Status</th>
                  <th className="py-2.5 text-start">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground/80">
                {mockRequests.map((r, i) => (
                  <tr key={i} className="hover:bg-accent/30">
                    <td className="py-3 font-mono text-primary font-semibold">{r.id}</td>
                    <td className="py-3 font-medium text-foreground">{r.name}</td>
                    <td className="py-3">{r.client}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === "awaiting_approval"
                          ? "bg-amber-500/10 text-amber-500"
                          : r.status === "under_review"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title={t("dashboard:kpi_sla_performance")}
          score={97.1}
          description={t("dashboard:kpi_sla_desc")}
        />
      </div>
    </div>
  );
}
export default CompanyAdminDashboard;
