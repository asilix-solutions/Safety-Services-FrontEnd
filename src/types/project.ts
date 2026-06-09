import { ProjectStatus } from "./project-status";

export type ProjectType = "license" | "maintenance" | "engineering";

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
  safetyScore?: number;
  startDate: string;
  endDate?: string;
  tasks: ProjectTask[];
  category: "Fire Safety" | "Structural" | "Electrical" | "Mechanical" | "Plumbing" | "General";
  projectType: ProjectType;
  createdAt: string;
  updatedAt: string;
}
