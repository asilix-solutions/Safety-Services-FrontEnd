import { Project } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject, persistRequest } from "./helpers/persist";
import { appendTimelineEvent } from "./helpers/timeline";
import { synchronizeProjectAndRequest } from "./helpers/sync";

export function completeProjectExecution({
  project,
  request,
  completionNotes,
}: {
  project: Project;
  request: LicensingRequest | null;
  completionNotes: string;
}): {
  updatedProject: Project;
  updatedRequest: LicensingRequest | null;
} {
  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();

  const isNew = currentWorkspace && 'completion' in currentWorkspace && typeof (currentWorkspace as any).completion === 'object';

  let updatedWorkspace: any;
  if (isNew) {
    updatedWorkspace = {
      ...currentWorkspace,
      completion: {
        notes: completionNotes,
        readyForFinalInspection: true,
        completedAt: nowStr,
      }
    };
  } else {
    updatedWorkspace = {
      ...currentWorkspace,
      executionCompletionNotes: completionNotes,
      readyForFinalInspection: true,
    };
  }

  let updatedProject = { ...project, workspace: updatedWorkspace };
  let updatedRequest = request;

  if (request) {
    const synced = synchronizeProjectAndRequest(
      updatedProject,
      request,
      "ready_for_final_inspection",
      "FINAL_INSPECTION" as WorkflowStage
    );
    updatedProject = synced.updatedProject;
    
    updatedRequest = appendTimelineEvent(
      synced.updatedRequest,
      "ready_for_final_inspection",
      `Project execution completed. Ready for final inspection. Notes: ${completionNotes}`
    );

    persistRequest(updatedRequest);
  } else {
    updatedProject.executionPhase = "ready_for_final_inspection";
    updatedProject.updatedAt = nowStr;
  }

  persistProject(updatedProject);

  return {
    updatedProject,
    updatedRequest,
  };
}
