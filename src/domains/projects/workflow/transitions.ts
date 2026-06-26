import { Project, ProjectExecutionPhase } from "@/types/project";
import { persistProject } from "./helpers/persist";

export function transitionProjectPhase({
  project,
  phase,
}: {
  project: Project;
  phase: ProjectExecutionPhase;
}): Project {
  const nowStr = new Date().toISOString();
  
  let newStatus = project.status;
  if (phase === "active_execution") {
    newStatus = "active";
  } else if (phase === "completed") {
    newStatus = "completed";
  }

  const updatedProject: Project = {
    ...project,
    status: newStatus,
    executionPhase: phase,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

export function getProjectExecutionPhaseLabel(
  phase: string | undefined,
  t: (key: string) => string
): string {
  if (!phase) return "";
  const keyMap: Record<string, string> = {
    created: "projects:phases.created",
    kickoff_ready: "projects:phases.kickoff_ready",
    active_execution: "projects:phases.active_execution",
    ready_for_final_inspection: "projects:phases.ready_for_final_inspection",
    completed: "projects:phases.completed",
  };
  const key = keyMap[phase];
  return key ? t(key) : phase.replace(/_/g, " ");
}
