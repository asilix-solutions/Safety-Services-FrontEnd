import { Report, ReportStatus, ReportType, ReportAuditEvent, CreateReportInput } from "./types";
import { createOrUpdateReport, getReportById, getReports } from "./storage";

export function generateReportNumber(type: ReportType): string {
  const year = new Date().getFullYear();
  let typeCode = "GEN";
  switch (type) {
    case "technical_safety":
      typeCode = "TSR";
      break;
    case "site_inspection":
      typeCode = "INS";
      break;
    case "project_progress":
      typeCode = "PRG";
      break;
    case "installation":
      typeCode = "INT";
      break;
    case "maintenance":
      typeCode = "MNT";
      break;
  }
  const prefix = `REP-${typeCode}-${year}-`;
  const reports = getReports();
  const matching = reports.filter((r) => r.reportNumber.startsWith(prefix));
  
  let nextSeq = 1;
  if (matching.length > 0) {
    const seqs = matching.map((r) => {
      const parts = r.reportNumber.split("-");
      const seqStr = parts[parts.length - 1];
      const parsed = parseInt(seqStr, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    nextSeq = Math.max(...seqs) + 1;
  }
  
  const seqStr = String(nextSeq).padStart(4, "0");
  return `${prefix}${seqStr}`;
}

export function createReport(input: CreateReportInput): Report {
  const now = new Date().toISOString();
  const reportNumber = generateReportNumber(input.reportType);
  const id = reportNumber;

  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "created",
    performedBy: input.authorName,
    performedAt: now,
    notes: input.notes || "Report registry record initialized."
  };

  const report: Report = {
    id,
    reportNumber,
    tenantId: input.tenantId,
    clientId: input.clientId,
    projectId: input.projectId,
    jobNumber: input.jobNumber,
    siteVisitId: input.siteVisitId,
    reportType: input.reportType,
    status: "DRAFT",
    title: input.title,
    authorId: input.authorId,
    authorName: input.authorName,
    sourceDomain: input.sourceDomain,
    sourceId: input.sourceId,
    summary: input.summary,
    contentSnapshot: input.contentSnapshot,
    timeline: [event],
    createdAt: now,
    updatedAt: now
  };

  createOrUpdateReport(report);
  return report;
}

export function submitReport(id: string, userName: string): Report {
  const report = getReportById(id);
  if (!report) throw new Error("Report not found");
  if (report.status !== "DRAFT") throw new Error("Report can only be submitted from draft status.");

  const now = new Date().toISOString();
  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "submitted",
    performedBy: userName,
    performedAt: now,
    notes: "Submitted for approval review."
  };

  const updated: Report = {
    ...report,
    status: "SUBMITTED",
    timeline: [...report.timeline, event],
    updatedAt: now
  };

  createOrUpdateReport(updated);
  return updated;
}

export function approveReport(id: string, adminName: string): Report {
  const report = getReportById(id);
  if (!report) throw new Error("Report not found");
  if (report.status !== "SUBMITTED") throw new Error("Report can only be approved when submitted.");

  const now = new Date().toISOString();
  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "approved",
    performedBy: adminName,
    performedAt: now,
    notes: "Official compliance report approved."
  };

  const updated: Report = {
    ...report,
    status: "APPROVED",
    timeline: [...report.timeline, event],
    updatedAt: now
  };

  createOrUpdateReport(updated);
  return updated;
}

export function rejectReport(id: string, adminName: string, reason?: string): Report {
  const report = getReportById(id);
  if (!report) throw new Error("Report not found");
  if (report.status !== "SUBMITTED") throw new Error("Report can only be rejected when submitted.");

  const now = new Date().toISOString();
  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "rejected",
    performedBy: adminName,
    performedAt: now,
    notes: reason || "Report request rejected during audit review."
  };

  const updated: Report = {
    ...report,
    status: "REJECTED",
    timeline: [...report.timeline, event],
    updatedAt: now
  };

  createOrUpdateReport(updated);
  return updated;
}

export function archiveReport(id: string, userName: string): Report {
  const report = getReportById(id);
  if (!report) throw new Error("Report not found");

  const now = new Date().toISOString();
  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "archived",
    performedBy: userName,
    performedAt: now,
    notes: "Report archived."
  };

  const updated: Report = {
    ...report,
    status: "ARCHIVED",
    timeline: [...report.timeline, event],
    updatedAt: now
  };

  createOrUpdateReport(updated);
  return updated;
}

export function downloadReport(id: string, userName: string): Report {
  const report = getReportById(id);
  if (!report) throw new Error("Report not found");

  const now = new Date().toISOString();
  const event: ReportAuditEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    action: "downloaded",
    performedBy: userName,
    performedAt: now,
    notes: "PDF copy downloaded for verification."
  };

  const updated: Report = {
    ...report,
    timeline: [...report.timeline, event],
    updatedAt: now
  };

  createOrUpdateReport(updated);
  return updated;
}
