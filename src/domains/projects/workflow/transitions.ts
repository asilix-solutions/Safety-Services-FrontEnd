export function getProjectExecutionPhaseLabel(
  phase: string | undefined,
  t: (key: string) => string
): string {
  if (!phase) return "";
  const keyMap: Record<string, string> = {
    PROJECT_PROVISIONED: "projects:phases.PROJECT_PROVISIONED",
    KICKOFF_PENDING: "projects:phases.KICKOFF_PENDING",
    KICKOFF_APPROVED: "projects:phases.KICKOFF_APPROVED",
    ACTIVE_EXECUTION: "projects:phases.ACTIVE_EXECUTION",
    EXECUTION_COMPLETED: "projects:phases.EXECUTION_COMPLETED",
    READY_FOR_FINAL_INSPECTION: "projects:phases.READY_FOR_FINAL_INSPECTION",
    FINAL_INSPECTION_APPROVED: "projects:phases.FINAL_INSPECTION_APPROVED",
    CERTIFICATE_ISSUED: "projects:phases.CERTIFICATE_ISSUED",
    COMPLETED: "projects:phases.COMPLETED",
  };
  const key = keyMap[phase];
  return key ? t(key) : phase.replace(/_/g, " ");
}
