import { Project, SiloExecutionData } from "@/types/project";
import { ProjectHealthInfo } from "../types/project-workspace";

export function getProjectHealth(project: Project, silos: SiloExecutionData[]): ProjectHealthInfo {
  const hasBlockedSilo = silos.some((s) => s.status === "blocked");
  const hasOpenCriticalTask = (project.tasks || []).some(
    (task) => !task.completed && task.priority === "Critical"
  );

  if (hasBlockedSilo || hasOpenCriticalTask || project.status === "blocked") {
    return {
      status: "blocked",
      labelKey: "projects:health.blocked",
      color: "border-destructive/20 bg-destructive/15 text-destructive",
    };
  }

  if (project.executionPhase === "READY_FOR_FINAL_INSPECTION" || project.status === "completed") {
    return {
      status: "healthy",
      labelKey: "projects:health.healthy",
      color: "border-success/20 bg-success/15 text-success",
    };
  }

  return {
    status: "attention",
    labelKey: "projects:health.attention",
    color: "border-warning/20 bg-warning/15 text-warning",
  };
}
