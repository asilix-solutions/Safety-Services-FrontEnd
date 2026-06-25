import { ProjectStatus } from "./project-status";

export type ProjectType = "license" | "maintenance" | "engineering";

export type ProjectExecutionPhase =
  | "created"
  | "kickoff_ready"
  | "active_execution"
  | "ready_for_final_inspection"
  | "completed";

export type ProjectWorkspaceTemplate =
  | "installation_full"
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

export interface ProjectWorkspaceData {
  kickoffApproved: boolean;
  downPaymentConfirmed: boolean;
  assignedInspector?: string;
  kickoffNotes?: string;
  silos: SiloExecutionData[];
  executionCompletionNotes?: string;
  readyForFinalInspection?: boolean;
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

