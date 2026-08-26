import { ProjectStatus } from "@/types/project-status";
import { LicenseStatus } from "@/types/license";
import { MaintenanceStatus } from "@/types/maintenance";
import { CustomerStatus } from "@/types/customer";

export const PROJECT_STATUS_METADATA: Record<
  ProjectStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" }
> = {
  planning: { label: "Planning", badgeVariant: "secondary" },
  active: { label: "Active Execution", badgeVariant: "success" },
  scheduled: { label: "Scheduled", badgeVariant: "info" },
  blocked: { label: "Blocked", badgeVariant: "destructive" },
  awaiting_signature: { label: "Awaiting Signature", badgeVariant: "warning" },
  completed: { label: "Completed", badgeVariant: "success" },
  closed: { label: "Closed", badgeVariant: "secondary" },
};

export const LICENSE_STATUS_METADATA: Record<
  LicenseStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" }
> = {
  Applied: { label: "Applied", badgeVariant: "secondary" },
  "In Review": { label: "In Review", badgeVariant: "warning" },
  Approved: { label: "Approved", badgeVariant: "success" },
  Active: { label: "Active", badgeVariant: "success" },
  Expired: { label: "Expired", badgeVariant: "destructive" },
  Revoked: { label: "Revoked", badgeVariant: "destructive" },
  "Action Required": { label: "Action Required", badgeVariant: "warning" },
};

export const MAINTENANCE_STATUS_METADATA: Record<
  MaintenanceStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" }
> = {
  Scheduled: { label: "Scheduled", badgeVariant: "info" },
  "In Progress": { label: "In Progress", badgeVariant: "info" },
  Completed: { label: "Completed", badgeVariant: "success" },
  Overdue: { label: "Overdue", badgeVariant: "destructive" },
};

export const CUSTOMER_STATUS_METADATA: Record<
  CustomerStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" }
> = {
  Lead: { label: "Lead", badgeVariant: "secondary" },
  Active: { label: "Active", badgeVariant: "success" },
  Inactive: { label: "Inactive", badgeVariant: "secondary" },
  Prospect: { label: "Prospect", badgeVariant: "warning" },
};
