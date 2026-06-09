"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { FileQuestion, FolderOpen, FileText, Receipt, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";

export function ClientDashboard() {
  const { t, dir } = useTranslation();

  const mockTimeline = [
    { title: "Fire Safety Audit Commenced", desc: "Inspection engineer has arrived on Skyline Tower premises.", date: "Today, 10:15 AM" },
    { title: "Quotation Generated", desc: "Quotation for Marina Mall Unit B22 issued and awaiting signature.", date: "Yesterday, 2:30 PM" },
    { title: "Blueprint Review Approved", desc: "Structural load calculations for Vertex HQ site approved by reviewer.", date: "June 05, 2026" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:client_welcome_title")}
        description={t("dashboard:client_welcome_desc")}
        actions={
          <Button className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10">
            <RefreshCw className="h-4 w-4" /> {t("dashboard:refresh_portal")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("dashboard:stats_my_requests")}
          value="3"
          description={t("dashboard:safety_evaluation_requests")}
          icon={<FileQuestion className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title={t("dashboard:stats_my_active_projects")}
          value="2"
          description={t("dashboard:ongoing_safety_audits")}
          icon={<FolderOpen className="h-4 w-4 text-sky-500" />}
        />
        <StatsCard
          title={t("dashboard:stats_my_contracts")}
          value="1"
          description={t("dashboard:signed_service_agreement")}
          icon={<FileText className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title={t("dashboard:stats_my_invoices")}
          value="2"
          description={t("dashboard:outstanding_invoices")}
          icon={<Receipt className="h-4 w-4 text-indigo-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">{t("dashboard:latest_project_updates")}</CardTitle>
            <CardDescription className="text-muted-foreground">{t("dashboard:chronological_history")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative border-s border-border ps-4 ms-2 space-y-6">
              {mockTimeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -start-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{item.title}</span>
                      <span className="text-muted-foreground font-medium">{item.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">{t("dashboard:need_engineering_support")}</CardTitle>
            <CardDescription className="text-muted-foreground">{t("dashboard:assigned_safety_team_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-foreground">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">{t("dashboard:assigned_safety_engineer")}</p>
              <p className="font-medium text-foreground">Eng. Tariq Al-Mansoor</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("dashboard:lead_safety_auditor")}</p>
            </div>
            <Button className="w-full text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              {t("dashboard:submit_safety_inquiry")} <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default ClientDashboard;
