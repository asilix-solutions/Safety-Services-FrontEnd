export type ReportType = 
  | "technical_safety" 
  | "site_inspection" 
  | "project_progress"
  | "installation"
  | "maintenance";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";

export interface ReportAuditEvent {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string; // ISO timestamp
  notes?: string;
}

export interface Report {
  id: string;
  reportNumber: string; // E.g., REP-TSR-2026-0001
  tenantId: string;
  clientId: string;
  projectId?: string;
  jobNumber?: string;
  siteVisitId?: string;
  reportType: ReportType;
  status: ReportStatus;
  title: string;
  authorId?: string;
  authorName: string;
  sourceDomain: "requests" | "projects" | "site-visits" | "engineering";
  sourceId: string;
  summary: string;
  contentSnapshot: string; // Serialized JSON representation
  timeline: ReportAuditEvent[];
  createdAt: string;
  updatedAt: string;
}
