import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import {
  Report,
  ReportStatus,
  ReportType,
  getReports,
  createReport,
  approveReport,
  rejectReport,
  archiveReport,
  downloadReport,
  submitReport
} from "@/domains/reports";
import { isRole } from "@/constants/permissions";
import { getProjects } from "@/domains/projects/storage";
import { getSiteVisits } from "@/domains/site-visits/storage";
import { getRequests } from "@/domains/requests/storage";

export interface ReadyToGenerateItem {
  id: string;
  title: string;
  type: ReportType;
  sourceDomain: "requests" | "projects" | "site-visits" | "engineering";
  sourceId: string;
  clientName: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  jobNumber?: string;
  siteVisitId?: string;
}

export function useReportsHub() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    setReports(getReports());
  }, []);

  const refreshReports = () => {
    setReports(getReports());
    if (selectedReport) {
      const fresh = getReports().find((r) => r.id === selectedReport.id);
      setSelectedReport(fresh || null);
    }
  };

  // Roles helpers
  const isAdmin = user ? ["Super Admin", "Company Admin"].includes(user.role) : false;
  const isEngineer = isRole(user?.role, ["Consulting Engineer"]);
  const isOperations = isRole(user?.role, ["Operations Officer"]);
  const isClient = isRole(user?.role, ["Client"]);

  // 1. Compute Ready to Generate items based on other domains
  const readyToGenerateItems = useMemo<ReadyToGenerateItem[]>(() => {
    if (!user) return [];
    
    // Only administrators, engineers, or operations officers can generate reports
    if (isClient) return [];

    const items: ReadyToGenerateItem[] = [];

    // Check Site Visits that do not have a registered report yet
    const visits = getSiteVisits();
    const existingInspections = reports.map((r) => r.siteVisitId).filter(Boolean);
    
    visits.forEach((v) => {
      if (v.status === "completed" && !existingInspections.includes(v.id)) {
        items.push({
          id: `RTG-SV-${v.id}`,
          title: `${t("reports:type_site_inspection")} - ${v.projectName}`,
          type: "site_inspection",
          sourceDomain: "site-visits",
          sourceId: v.id,
          clientName: "Skyline Corporation", // Default mapping for mock
          tenantId: user.companyId || "TNT-001",
          clientId: "CLI-002",
          projectId: v.projectId,
          siteVisitId: v.id
        });
      }
    });

    // Check Projects that need a progress report (no project progress report written yet or in DRAFT)
    const projects = getProjects();
    const existingProgressReportProjectIds = reports
      .filter((r) => r.reportType === "project_progress")
      .map((r) => r.projectId)
      .filter(Boolean);

    projects.forEach((p) => {
      if (
        (p.executionPhase === "ACTIVE_EXECUTION" || p.executionPhase === "READY_FOR_FINAL_INSPECTION") &&
        !existingProgressReportProjectIds.includes(p.id)
      ) {
        items.push({
          id: `RTG-PRG-${p.id}`,
          title: `${t("reports:type_project_progress")} - ${p.name}`,
          type: "project_progress",
          sourceDomain: "projects",
          sourceId: p.id,
          clientName: p.clientName || "Client Company",
          tenantId: p.tenantId,
          clientId: p.clientId,
          projectId: p.id,
          jobNumber: p.jobNumber
        });
      }
    });

    // Check Requests of type technical_report that don't have a report yet
    const requests = getRequests();
    const existingRequestJobNumbers = reports.map((r) => r.jobNumber).filter(Boolean);

    requests.forEach((r) => {
      if (r.requestType === "technical_report" && !existingRequestJobNumbers.includes(r.jobNumber)) {
        items.push({
          id: `RTG-REQ-${r.jobNumber}`,
          title: `${t("reports:type_technical_safety")} - ${r.facilityName || "Technical Assessment"}`,
          type: "technical_safety",
          sourceDomain: "requests",
          sourceId: r.id,
          clientName: r.clientName || "Client Company",
          tenantId: r.tenantId,
          clientId: r.clientId,
          jobNumber: r.jobNumber
        });
      }
    });

    return items;
  }, [reports, user, isClient, t]);

  // 2. Filter Reports based on permissions & inputs
  const filteredReports = useMemo(() => {
    if (!user) return [];

    let list = reports;

    // Tenant enforcement (except Super Admin)
    if (user.role !== "Super Admin" && user.companyId) {
      list = list.filter((r) => r.tenantId === user.companyId);
    }

    // Client restriction (only see approved reports belonging to them)
    if (isClient) {
      list = list.filter((r) => r.clientId === user.companyId && r.status === "APPROVED");
    }

    // Status filter
    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "ALL") {
      list = list.filter((r) => r.reportType === typeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.reportNumber.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      );
    }

    return list;
  }, [reports, user, isClient, statusFilter, typeFilter, searchQuery]);

  const kpis = useMemo(() => {
    const userCompanyId = user?.companyId;
    const tenantReports = user && user.role !== "Super Admin" && userCompanyId
      ? reports.filter((r) => r.tenantId === userCompanyId)
      : reports;

    const visibleReports = isClient && userCompanyId
      ? tenantReports.filter((r) => r.clientId === userCompanyId && r.status === "APPROVED")
      : tenantReports;

    return {
      total: visibleReports.length,
      readyToGenerate: readyToGenerateItems.length,
      approved: visibleReports.filter((r) => r.status === "APPROVED").length,
      archived: visibleReports.filter((r) => r.status === "ARCHIVED").length
    };
  }, [reports, readyToGenerateItems.length, user, isClient]);

  // 4. Operations handlers
  const handleGenerateReport = (item: ReadyToGenerateItem) => {
    try {
      const content = {
        generalInfo: {
          facilityName: item.title.split(" - ")[1] || item.title,
          locationDetails: "SSLM Registered Location",
          scopeOfWork: `Audit review from domain: ${item.sourceDomain}`
        },
        observations: [
          "System initialized from source record data.",
          "Audit parameters verified and logged successfully."
        ],
        findings: [
          "Compliance checks satisfy basic MVP parameters."
        ],
        recommendations: [
          "Proceed with standard operational reviews."
        ]
      };

      createReport({
        title: item.title,
        tenantId: item.tenantId,
        clientId: item.clientId,
        projectId: item.projectId,
        jobNumber: item.jobNumber,
        siteVisitId: item.siteVisitId,
        reportType: item.type,
        authorId: user?.id || "USR-UNKNOWN",
        authorName: user?.name || "System Author",
        sourceDomain: item.sourceDomain,
        sourceId: item.sourceId,
        summary: `Automated generated report for ${item.title}.`,
        contentSnapshot: JSON.stringify(content),
        notes: "Auto-generated report during workflow execution."
      });

      setAlertMsg({ text: `Report successfully registered and added as DRAFT.`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to generate report.", type: "error" });
    }
  };

  const handleSubmitReport = (report: Report) => {
    try {
      submitReport(report.id, user?.name || "Author");
      setAlertMsg({ text: `Report ${report.reportNumber} submitted for admin review.`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to submit report.", type: "error" });
    }
  };

  const handleApproveReport = (report: Report) => {
    try {
      approveReport(report.id, user?.name || "Admin Reviewer");
      setAlertMsg({ text: `Report ${report.reportNumber} approved successfully.`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to approve report.", type: "error" });
    }
  };

  const handleRejectReport = (report: Report, reason?: string) => {
    try {
      rejectReport(report.id, user?.name || "Admin Reviewer", reason);
      setAlertMsg({ text: `Report ${report.reportNumber} rejected.`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to reject report.", type: "error" });
    }
  };

  const handleArchiveReport = (report: Report) => {
    try {
      archiveReport(report.id, user?.name || "User");
      setAlertMsg({ text: `Report ${report.reportNumber} archived.`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to archive report.", type: "error" });
    }
  };

  const handleDownloadReport = (report: Report) => {
    try {
      downloadReport(report.id, user?.name || "Downloader");
      setAlertMsg({ text: `Downloading ${report.reportNumber} (Mock Export PDF)...`, type: "success" });
      refreshReports();
    } catch (e: any) {
      setAlertMsg({ text: e.message || "Failed to download report.", type: "error" });
    }
  };

  return {
    user,
    reports: filteredReports,
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
    isEngineer,
    isOperations,
    isClient,
    handleGenerateReport,
    handleSubmitReport,
    handleApproveReport,
    handleRejectReport,
    handleArchiveReport,
    handleDownloadReport,
    t
  };
}
export default useReportsHub;
