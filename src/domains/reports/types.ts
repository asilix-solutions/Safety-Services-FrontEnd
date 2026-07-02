import { Report, ReportStatus, ReportType, ReportAuditEvent } from "@/types/report";

export type { Report, ReportStatus, ReportType, ReportAuditEvent };

export interface CreateReportInput {
  title: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  jobNumber?: string;
  siteVisitId?: string;
  reportType: ReportType;
  authorId?: string;
  authorName: string;
  sourceDomain: "requests" | "projects" | "site-visits" | "engineering";
  sourceId: string;
  summary: string;
  contentSnapshot: string;
  notes?: string;
}
