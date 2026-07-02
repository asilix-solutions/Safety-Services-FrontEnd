import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckCircle2, FileText, CheckCircle, Clock, Archive } from "lucide-react";
import { useReportsHub } from "../hooks/use-reports-hub";
import { ReadyToGenerate } from "./ready-to-generate";
import { ReportsTable } from "./reports-table";
import { ReportDrawer } from "./report-drawer";

export function ReportsHub() {
  const {
    user,
    reports,
    readyToGenerateItems,
    selectedReport,
    setSelectedReport,
    alertMsg,
    setAlertMsg,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    kpis,
    isAdmin,
    isClient,
    handleGenerateReport,
    handleSubmitReport,
    handleApproveReport,
    handleRejectReport,
    handleArchiveReport,
    handleDownloadReport,
    t,
  } = useReportsHub();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("reports:title")}
        description={t("reports:subtitle")}
      />

      {/* Alert banner */}
      {alertMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            alertMsg.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-sm font-semibold">{alertMsg.text}</div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer border-none bg-transparent"
          >
            {t("common:dismiss") || "Dismiss"}
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              {t("reports:kpiTotal")}
            </CardTitle>
            <FileText className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              {t("reports:kpiReady")}
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{kpis.readyToGenerate}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              {t("reports:kpiApproved")}
            </CardTitle>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{kpis.approved}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              {t("reports:kpiArchived")}
            </CardTitle>
            <Archive className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Eligible items panel */}
      {!isClient && (
        <ReadyToGenerate
          items={readyToGenerateItems}
          onGenerate={handleGenerateReport}
          t={t}
        />
      )}

      {/* Reports registry table */}
      <ReportsTable
        reports={reports}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onViewDetails={(r) => setSelectedReport(r)}
        onDownload={handleDownloadReport}
        t={t}
      />

      {/* Details drawer */}
      <ReportDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onApprove={handleApproveReport}
        onReject={handleRejectReport}
        onArchive={handleArchiveReport}
        onDownload={handleDownloadReport}
        onSubmit={handleSubmitReport}
        userRole={user.role}
        t={t}
      />
    </div>
  );
}
export default ReportsHub;
