import { ProjectStatus } from "@/types/project-status";

export const ALLOWED_PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  planning: ["scheduled", "closed"],
  scheduled: ["active", "blocked", "closed"],
  active: ["blocked", "awaiting_signature", "completed", "closed"],
  blocked: ["active", "closed"],
  awaiting_signature: ["active", "completed", "closed"],
  completed: ["closed"],
  closed: [],
};

export function isValidProjectTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_PROJECT_TRANSITIONS[from].includes(to);
}
