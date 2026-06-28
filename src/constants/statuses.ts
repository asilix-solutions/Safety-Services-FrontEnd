import { ProjectStatus } from "@/types/project-status";
import { LicenseStatus } from "@/types/license";
import { MaintenanceStatus } from "@/types/maintenance";
import { CustomerStatus } from "@/types/customer";

export const PROJECT_STATUS_METADATA: Record<
  ProjectStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }
> = {
  planning: { label: "Planning", badgeVariant: "secondary" },
  active: { label: "Active Execution", badgeVariant: "success" },
  scheduled: { label: "Scheduled", badgeVariant: "secondary" },
  blocked: { label: "Blocked", badgeVariant: "destructive" },
  awaiting_signature: { label: "Awaiting Signature", badgeVariant: "warning" },
  completed: { label: "Completed", badgeVariant: "success" },
  closed: { label: "Closed", badgeVariant: "outline" },
};

export const LICENSE_STATUS_METADATA: Record<
  LicenseStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }
> = {
  Applied: { label: "Applied", badgeVariant: "secondary" },
  "In Review": { label: "In Review", badgeVariant: "default" },
  Approved: { label: "Approved", badgeVariant: "success" },
  Active: { label: "Active", badgeVariant: "success" },
  Expired: { label: "Expired", badgeVariant: "destructive" },
  Revoked: { label: "Revoked", badgeVariant: "destructive" },
  "Action Required": { label: "Action Required", badgeVariant: "warning" },
};

export const MAINTENANCE_STATUS_METADATA: Record<
  MaintenanceStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }
> = {
  Scheduled: { label: "Scheduled", badgeVariant: "secondary" },
  "In Progress": { label: "In Progress", badgeVariant: "default" },
  Completed: { label: "Completed", badgeVariant: "success" },
  Overdue: { label: "Overdue", badgeVariant: "destructive" },
};

export const CUSTOMER_STATUS_METADATA: Record<
  CustomerStatus,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }
> = {
  Lead: { label: "Lead", badgeVariant: "secondary" },
  Active: { label: "Active", badgeVariant: "success" },
  Inactive: { label: "Inactive", badgeVariant: "outline" },
  Prospect: { label: "Prospect", badgeVariant: "warning" },
};
