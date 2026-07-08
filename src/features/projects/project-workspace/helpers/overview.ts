import { ProjectExecutionPhase, ProjectTask } from "@/types/project";

export function getProgressPercent(currentPhaseIndex: number, totalPhases: number): number {
  if (totalPhases <= 1 || currentPhaseIndex < 0) return 0;
  return Math.round((currentPhaseIndex / (totalPhases - 1)) * 100);
}

export function getOpenObstaclesCount(tasks: ProjectTask[]): number {
  return (tasks || []).filter((task) => !task.completed).length;
}

const NEXT_ACTION_LABEL_KEYS: Record<ProjectExecutionPhase, string> = {
  PROJECT_PROVISIONED: "projects:overview.nextAction.scheduleKickoff",
  KICKOFF_PENDING: "projects:overview.nextAction.awaitingKickoffApproval",
  KICKOFF_APPROVED: "projects:overview.nextAction.startExecution",
  ACTIVE_EXECUTION: "projects:overview.nextAction.completeSilos",
  EXECUTION_COMPLETED: "projects:overview.nextAction.markReadyForInspection",
  READY_FOR_FINAL_INSPECTION: "projects:overview.nextAction.awaitingFinalInspection",
  FINAL_INSPECTION_APPROVED: "projects:overview.nextAction.issueCertificate",
  CERTIFICATE_ISSUED: "projects:overview.nextAction.closeProject",
  COMPLETED: "projects:overview.nextAction.none",
};

export function getNextActionLabelKey(phase: ProjectExecutionPhase | undefined): string {
  return NEXT_ACTION_LABEL_KEYS[phase || "PROJECT_PROVISIONED"];
}
