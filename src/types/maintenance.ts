export type MaintenanceStatus = "Scheduled" | "In Progress" | "Completed" | "Overdue";
export type MaintenancePriority = "Low" | "Medium" | "High" | "Critical";

export interface MaintenanceJob {
  id: string;
  assetName: string;
  facilityLocation: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assignedTechnician?: string;
  scheduledDate: string;
  completedDate?: string;
  safetyNotes?: string;
  createdAt: string;
  updatedAt: string;
}
