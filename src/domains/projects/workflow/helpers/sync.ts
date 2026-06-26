import { Project, ProjectExecutionPhase } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";

export function synchronizeProjectAndRequest(
  project: Project,
  request: LicensingRequest,
  executionPhase: ProjectExecutionPhase,
  stage: WorkflowStage
): { updatedProject: Project; updatedRequest: LicensingRequest } {
  const nowStr = new Date().toISOString();

  // Map execution phase to project status
  let projectStatus = project.status;
  if (executionPhase === "active_execution") {
    projectStatus = "active";
  } else if (executionPhase === "completed") {
    projectStatus = "completed";
  }

  const updatedProject: Project = {
    ...project,
    status: projectStatus,
    executionPhase,
    updatedAt: nowStr,
  };

  const updatedRequest: LicensingRequest = {
    ...request,
    currentStage: stage,
    updatedAt: nowStr,
  };

  return {
    updatedProject,
    updatedRequest,
  };
}
