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
      color: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400",
    };
  }

  if (project.executionPhase === "ready_for_final_inspection" || project.status === "completed") {
    return {
      status: "healthy",
      labelKey: "projects:health.healthy",
      color: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400",
    };
  }

  return {
    status: "attention",
    labelKey: "projects:health.attention",
    color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400",
  };
}
