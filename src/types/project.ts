import { ProjectStatus } from "./project-status";

export type ProjectType = "license" | "maintenance" | "engineering";

export type ProjectExecutionPhase =
  | "PROJECT_PROVISIONED"
  | "KICKOFF_PENDING"
  | "KICKOFF_APPROVED"
  | "ACTIVE_EXECUTION"
  | "EXECUTION_COMPLETED"
  | "READY_FOR_FINAL_INSPECTION"
  | "FINAL_INSPECTION_APPROVED"
  | "CERTIFICATE_ISSUED"
  | "COMPLETED";

export type ProjectWorkspaceTemplate =
  | "installation_full"
  | "installation_fast"
  | "maintenance"
  | "compliance_followup";

export interface SiloExecutionData {
  id: "alarm" | "suppression" | "ventilation";
  status: "pending" | "ready" | "in_progress" | "completed" | "blocked";
  laborCount: number;
  materialsCount: number;
  pendingItemsCount: number;
  costSAR: number;
  obstaclesCount: number;
  photosCount: number;
}

export interface ProjectKickoffData {
  approved: boolean;
  assignedInspector?: string;
  notes?: string;
}

export interface ProjectExecutionData {
  silos: SiloExecutionData[];
  downPaymentConfirmed: boolean;
}

export interface ProjectCompletionData {
  notes?: string;
  readyForFinalInspection?: boolean;
  completedAt?: string;
}

export interface ProjectInspectionData {
  approved?: boolean;
  notes?: string;
  decisionBy?: string;
  completedAt?: string;
}

export interface ProjectWorkspaceData {
  kickoff: ProjectKickoffData;
  execution: ProjectExecutionData;
  completion: ProjectCompletionData;
  inspection?: ProjectInspectionData;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  dueDate: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High" | "Critical";
}

export interface Project {
  id: string;
  tenantId: string;
  jobNumber?: string;
  name: string;
  description: string;
  clientName: string;
  clientId: string;
  assignedEngineerId?: string;
  status: ProjectStatus;
  executionPhase?: ProjectExecutionPhase;
  workspace?: ProjectWorkspaceData;
  workspaceTemplate?: ProjectWorkspaceTemplate;
  safetyScore?: number;
  startDate: string;
  endDate?: string;
  tasks: ProjectTask[];
  category: "Fire Safety" | "Structural" | "Electrical" | "Mechanical" | "Plumbing" | "General";
  projectType: ProjectType;
  createdAt: string;
  updatedAt: string;
}

