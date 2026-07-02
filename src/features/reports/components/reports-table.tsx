import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { ActionButton } from "@/shared/components/action-button";
import { Badge } from "@/shared/ui/badge";
import { Eye, Download } from "lucide-react";
import { Report, ReportStatus, ReportType } from "@/domains/reports/types";
import { getReportStatusBadgeVariant, getReportStatusDisplayName, getReportTypeDisplayName } from "@/domains/reports/helpers";

interface ReportsTableProps {
  reports: Report[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  onViewDetails: (report: Report) => void;
  onDownload: (report: Report) => void;
  t: (key: string) => string;
}

export function ReportsTable({
  reports,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onViewDetails,
  onDownload,
  t,
}: ReportsTableProps) {
  const columns: ColumnDef<Report>[] = [
    {
      header: t("reports:fieldReportNumber") || "Report Number",
      accessorKey: "reportNumber",
      render: (row) => <span className="font-mono text-xs font-bold text-foreground">{row.reportNumber}</span>,
    },
    {
      header: t("reports:reportTitle") || "Report Title",
      accessorKey: "title",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{t(row.title) || row.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{t(row.summary) || row.summary}</span>
        </div>
      ),
    },
    {
      header: t("reports:status") || "Status",
      accessorKey: "status",
      render: (row) => (
        <Badge variant={getReportStatusBadgeVariant(row.status)} className="uppercase text-[10px]">
          {getReportStatusDisplayName(row.status, t)}
        </Badge>
      ),
    },
    {
      header: t("reports:type") || "Type",
      accessorKey: "reportType",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {getReportTypeDisplayName(row.reportType, t)}
        </span>
      ),
    },
    {
      header: t("reports:fieldAuthor") || "Author",
      accessorKey: "authorName",
      render: (row) => <span className="text-xs text-foreground">{row.authorName}</span>,
    },
    {
      header: t("reports:fieldDate") || "Date",
      accessorKey: "createdAt",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: t("reports:fieldActions") || "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            label={t("reports:btnView") || t("common:view") || "View"}
            icon={Eye}
            onClick={() => onViewDetails(row)}
            className="h-8 text-xs cursor-pointer bg-secondary/80 text-foreground hover:bg-secondary border-none"
          />
          <ActionButton
            label=""
            icon={Download}
            onClick={() => onDownload(row)}
            className="h-8 w-8 p-0 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border-none flex items-center justify-center"
          />
        </div>
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="pt-6 space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder={t("reports:filterSearch")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="w-full sm:w-[150px]">
              <option value="ALL">{t("reports:filterStatus")}</option>
              <option value="DRAFT">{t("reports:status_DRAFT")}</option>
              <option value="SUBMITTED">{t("reports:status_SUBMITTED")}</option>
              <option value="APPROVED">{t("reports:status_APPROVED")}</option>
              <option value="REJECTED">{t("reports:status_REJECTED")}</option>
              <option value="ARCHIVED">{t("reports:status_ARCHIVED")}</option>
            </Select>

            <Select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)} className="w-full sm:w-[160px]">
              <option value="ALL">{t("reports:filterType")}</option>
              <option value="technical_safety">{t("reports:type_technical_safety")}</option>
              <option value="site_inspection">{t("reports:type_site_inspection")}</option>
              <option value="project_progress">{t("reports:type_project_progress")}</option>
              <option value="installation">{t("reports:type_installation")}</option>
              <option value="maintenance">{t("reports:type_maintenance")}</option>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={reports}
          columns={columns}
          searchKey="title"
        />
      </CardContent>
    </Card>
  );
}
export default ReportsTable;
