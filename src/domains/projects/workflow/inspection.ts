import { Project } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject, persistRequest } from "./helpers/persist";
import { appendTimelineEvent } from "./helpers/timeline";
import { synchronizeProjectAndRequest } from "./helpers/sync";

export function approveFinalInspection({
  project,
  request,
  notes,
  engineerName,
}: {
  project: Project;
  request: LicensingRequest | null;
  notes: string;
  engineerName: string;
}): {
  updatedProject: Project;
  updatedRequest: LicensingRequest | null;
} {
  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();

  const isNew = currentWorkspace && 'inspection' in currentWorkspace;

  let updatedWorkspace: any;
  if (isNew) {
    updatedWorkspace = {
      ...currentWorkspace,
      inspection: {
        approved: true,
        notes,
        decisionBy: engineerName,
        completedAt: nowStr,
      }
    };
  } else {
    updatedWorkspace = {
      ...currentWorkspace,
      finalInspectionApproved: true,
      finalInspectionNotes: notes,
      finalInspectionDecisionBy: engineerName,
      finalInspectionCompletedAt: nowStr,
    };
  }

  let updatedProject = { ...project, workspace: updatedWorkspace };
  let updatedRequest = request;

  if (request) {
    const synced = synchronizeProjectAndRequest(
      updatedProject,
      request,
      "completed",
      "COMPLETED" as WorkflowStage
    );
    updatedProject = synced.updatedProject;

    updatedRequest = appendTimelineEvent(
      synced.updatedRequest,
      "completed",
      `Final inspection approved. Project completed. Notes: ${notes}`
    );

    persistRequest(updatedRequest);
  } else {
    updatedProject.executionPhase = "completed";
    updatedProject.status = "completed";
    updatedProject.updatedAt = nowStr;
  }

  persistProject(updatedProject);

  return {
    updatedProject,
    updatedRequest,
  };
}

export function requestFinalInspectionFixes({
  project,
  request,
  notes,
  engineerName,
}: {
  project: Project;
  request: LicensingRequest | null;
  notes: string;
  engineerName: string;
}): {
  updatedProject: Project;
  updatedRequest: LicensingRequest | null;
} {
  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();

  const isNew = currentWorkspace && 'inspection' in currentWorkspace;

  let updatedWorkspace: any;
  if (isNew) {
    updatedWorkspace = {
      ...currentWorkspace,
      completion: {
        ...((currentWorkspace as any).completion || {}),
        readyForFinalInspection: false,
      },
      inspection: {
        approved: false,
        notes,
        decisionBy: engineerName,
        completedAt: nowStr,
      }
    };
  } else {
    updatedWorkspace = {
      ...currentWorkspace,
      readyForFinalInspection: false,
      finalInspectionApproved: false,
      finalInspectionNotes: notes,
      finalInspectionDecisionBy: engineerName,
      finalInspectionCompletedAt: nowStr,
    };
  }

  let updatedProject = { ...project, workspace: updatedWorkspace };
  let updatedRequest = request;

  if (request) {
    const synced = synchronizeProjectAndRequest(
      updatedProject,
      request,
      "active_execution",
      "FIELD_EXECUTION" as WorkflowStage
    );
    updatedProject = synced.updatedProject;

    updatedRequest = appendTimelineEvent(
      synced.updatedRequest,
      "in_execution",
      `Final inspection returned for execution fixes. Notes: ${notes}`
    );

    persistRequest(updatedRequest);
  } else {
    updatedProject.executionPhase = "active_execution";
    updatedProject.status = "active";
    updatedProject.updatedAt = nowStr;
  }

  persistProject(updatedProject);

  return {
    updatedProject,
    updatedRequest,
  };
}
