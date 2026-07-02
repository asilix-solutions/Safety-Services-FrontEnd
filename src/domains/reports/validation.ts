import { Report } from "./types";

export function canApproveReport(report: Report, userRole: string): { valid: boolean; reason?: string } {
  if (userRole !== "Company Admin" && userRole !== "Super Admin") {
    return { valid: false, reason: "Only administrators can approve reports." };
  }
  if (report.status !== "SUBMITTED") {
    return { valid: false, reason: "Reports must be submitted before approval." };
  }
  return { valid: true };
}

export function canSubmitReport(report: Report, userRole: string): { valid: boolean; reason?: string } {
  if (userRole !== "Consulting Engineer" && userRole !== "Company Admin") {
    return { valid: false, reason: "Only authors or admins can submit reports." };
  }
  if (report.status !== "DRAFT") {
    return { valid: false, reason: "Only draft reports can be submitted." };
  }
  return { valid: true };
}
