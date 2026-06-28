import { TxKey } from "@/types/i18n";
import { ProjectStatus } from "@/types/project-status";
import { LicenseStatus } from "@/types/license";
import { MaintenanceStatus } from "@/types/maintenance";
import { CustomerStatus } from "@/types/customer";

export const PROJECT_STATUS_TX: Record<ProjectStatus, TxKey> = {
  planning: "projects:status.planning",
  active: "projects:status.active",
  scheduled: "projects:status.scheduled",
  blocked: "projects:status.blocked",
  awaiting_signature: "projects:status.awaiting_signature",
  completed: "projects:status.completed",
  closed: "projects:status.closed",
};

export const LICENSE_STATUS_TX: Record<LicenseStatus, TxKey> = {
  Applied: "common:status_Applied",
  "In Review": "common:status_In_Review",
  Approved: "common:status_Approved",
  Active: "common:status_Active",
  Expired: "common:status_Expired",
  Revoked: "common:status_Revoked",
  "Action Required": "common:status_Action_Required",
};

export const MAINTENANCE_STATUS_TX: Record<MaintenanceStatus, TxKey> = {
  Scheduled: "common:status_Scheduled",
  "In Progress": "common:status_In_Progress",
  Completed: "common:status_Completed",
  Overdue: "common:status_Overdue",
};

export const CUSTOMER_STATUS_TX: Record<CustomerStatus, TxKey> = {
  Lead: "common:status_Lead",
  Active: "common:status_Active",
  Inactive: "common:status_Inactive",
  Prospect: "common:status_Prospect",
};
