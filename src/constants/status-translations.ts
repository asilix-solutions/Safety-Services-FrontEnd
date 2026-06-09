import { TxKey } from "@/types/i18n";
import { ProjectStatus } from "@/types/project";
import { LicenseStatus } from "@/types/license";
import { MaintenanceStatus } from "@/types/maintenance";
import { CustomerStatus } from "@/types/customer";

export const PROJECT_STATUS_TX: Record<ProjectStatus, TxKey> = {
  Draft: "common:status_Draft",
  "Pending Review": "common:status_Pending_Review",
  "In Review": "common:status_In_Review",
  "Action Required": "common:status_Action_Required",
  Approved: "common:status_Approved",
  Rejected: "common:status_Rejected",
  "On Hold": "common:status_On_Hold",
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
