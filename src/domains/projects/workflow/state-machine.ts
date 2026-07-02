import { Project, ProjectExecutionPhase } from "@/types/project";

/**
 * Ordered canonical list of execution phases
 */
export const PROJECT_PHASE_SEQUENCE: ProjectExecutionPhase[] = [
  "PROJECT_PROVISIONED",
  "KICKOFF_PENDING",
  "KICKOFF_APPROVED",
  "ACTIVE_EXECUTION",
  "EXECUTION_COMPLETED",
  "READY_FOR_FINAL_INSPECTION",
  "FINAL_INSPECTION_APPROVED",
  "CERTIFICATE_ISSUED",
  "COMPLETED",
];

/**
 * The transition matrix defines the only allowed next stages.
 * Skipping stages is strictly forbidden.
 */
const ALLOWED_TRANSITIONS: Record<ProjectExecutionPhase, ProjectExecutionPhase[]> = {
  PROJECT_PROVISIONED: ["KICKOFF_PENDING"],
  KICKOFF_PENDING: ["KICKOFF_APPROVED"],
  KICKOFF_APPROVED: ["ACTIVE_EXECUTION"],
  ACTIVE_EXECUTION: ["EXECUTION_COMPLETED"],
  EXECUTION_COMPLETED: ["READY_FOR_FINAL_INSPECTION"],
  READY_FOR_FINAL_INSPECTION: ["FINAL_INSPECTION_APPROVED"],
  FINAL_INSPECTION_APPROVED: ["CERTIFICATE_ISSUED"],
  CERTIFICATE_ISSUED: ["COMPLETED"],
  COMPLETED: [],
};

/**
 * Checks if a transition between current stage and target stage is valid in the state machine matrix
 */
export function canTransition(current: ProjectExecutionPhase, target: ProjectExecutionPhase): boolean {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Validates a transition and returns translation-friendly validation errors.
 * Returns null if the transition is allowed and satisfies all guard conditions.
 */
export function validateTransition(
  project: Project,
  target: ProjectExecutionPhase,
  t: (key: string) => string
): string | null {
  const current = project.executionPhase || "PROJECT_PROVISIONED";

  // 1. Check matrix
  if (!canTransition(current, target)) {
    return t("projects:workflow_invalid_transition") || "Invalid state transition.";
  }

  // 2. Check Guard Conditions
  switch (target) {
    case "KICKOFF_PENDING":
      // Requires assigned inspector
      if (!project.workspace?.kickoff?.assignedInspector) {
        return t("projects:workflow_error_missing_inspector") || "An inspector must be assigned to initiate kickoff.";
      }
      break;

    case "KICKOFF_APPROVED":
      // Requires kickoff checklist approved / signature verified
      if (!project.workspace?.kickoff?.approved) {
        return t("projects:workflow_error_kickoff_unapproved") || "Kickoff must be approved by the inspector.";
      }
      break;

    case "ACTIVE_EXECUTION":
      // Requires kickoff approval completed
      if (!project.workspace?.kickoff?.approved) {
        return t("projects:workflow_error_kickoff_unapproved") || "Kickoff must be approved before starting execution.";
      }
      break;

    case "EXECUTION_COMPLETED":
      // Requires all safety silos completed
      const silos = project.workspace?.execution?.silos || [];
      const hasUnfinishedSilos = silos.length === 0 || silos.some((s) => s.status !== "completed");
      if (hasUnfinishedSilos) {
        return t("projects:workflow_error_silos_incomplete") || "All safety system installation silos must be completed.";
      }
      break;

    case "READY_FOR_FINAL_INSPECTION":
      // No critical open obstacles should block inspection
      if (project.status === "blocked") {
        return t("projects:workflow_error_project_blocked") || "Project is currently blocked by obstacles.";
      }
      break;

    case "FINAL_INSPECTION_APPROVED":
      // Final inspection approved
      if (!project.workspace?.inspection?.approved) {
        return t("projects:workflow_error_inspection_unapproved") || "Inspection must be approved by the engineer.";
      }
      break;

    case "CERTIFICATE_ISSUED":
      // Inspection approved
      if (!project.workspace?.inspection?.approved) {
        return t("projects:workflow_error_inspection_unapproved") || "Certificate cannot be issued without approved inspection.";
      }
      break;

    case "COMPLETED":
      // Safety score registered
      if (project.safetyScore === undefined || project.safetyScore === null) {
        return t("projects:workflow_error_missing_safety_score") || "Safety compliance score must be registered.";
      }
      break;

    default:
      break;
  }

  return null;
}

/**
 * Returns the next sequential stage in the workflow sequence
 */
export function getNextProjectStage(current: ProjectExecutionPhase): ProjectExecutionPhase | null {
  const currentIndex = PROJECT_PHASE_SEQUENCE.indexOf(current);
  if (currentIndex === -1 || currentIndex === PROJECT_PHASE_SEQUENCE.length - 1) {
    return null;
  }
  return PROJECT_PHASE_SEQUENCE[currentIndex + 1];
}
