import { ReportStatus, ReportType } from "./types";

export function getReportStatusBadgeVariant(status: ReportStatus): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "SUBMITTED":
      return "warning";
    case "REJECTED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    case "ARCHIVED":
      return "outline";
    default:
      return "default";
  }
}

export function getReportStatusDisplayName(status: ReportStatus, t: (key: string) => string): string {
  return t(`reports:status_${status}`) || status;
}

export function getReportTypeDisplayName(type: ReportType, t: (key: string) => string): string {
  return t(`reports:type_${type}`) || type;
}

export function getTimelineActionLabel(action: string, t: (key: string) => string): string {
  return t(`reports:action_${action}`) || action;
}
