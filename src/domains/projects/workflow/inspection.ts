import { Project } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject, persistRequest } from "./helpers/persist";
import { appendTimelineEvent } from "./helpers/timeline";
import { synchronizeProjectAndRequest } from "./helpers/sync";
import { canApproveInspection, canReturnInspection } from "@/domains/workflow-validation";

export function passFinalInspection({
  project,
  inspectedBy,
  notes,
}: {
  project: Project;
  inspectedBy: string;
  notes: string;
}): Project {
  if (project.status !== "active" || project.executionPhase !== "ready_for_final_inspection") {
    throw new Error("Cannot pass inspection: Project status must be active and executionPhase must be ready_for_final_inspection.");
  }

  if (!notes || !notes.trim()) {
    throw new Error("Cannot pass inspection: Notes are required.");
  }

  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const updatedWorkspace: typeof currentWorkspace = {
    ...currentWorkspace,
    inspection: {
      approved: true,
      notes,
      decisionBy: inspectedBy,
      completedAt: nowStr,
    },
  };

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Final Inspection Passed",
    description: `Project final inspection passed. Inspected by: ${inspectedBy}. Notes: ${notes}`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "Medium",
  });

  const updatedProject: Project = {
    ...project,
    status: "completed",
    executionPhase: "completed",
    workspace: updatedWorkspace,
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

export function failFinalInspection({
  project,
  inspectedBy,
  notes,
}: {
  project: Project;
  inspectedBy: string;
  notes: string;
}): Project {
  if (project.status !== "active" || project.executionPhase !== "ready_for_final_inspection") {
    throw new Error("Cannot fail inspection: Project status must be active and executionPhase must be ready_for_final_inspection.");
  }

  if (!notes || !notes.trim()) {
    throw new Error("Cannot fail inspection: Notes/corrections are required.");
  }

  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const updatedWorkspace: typeof currentWorkspace = {
    ...currentWorkspace,
    completion: {
      ...currentWorkspace.completion,
      readyForFinalInspection: false,
    },
    inspection: {
      approved: false,
      notes,
      decisionBy: inspectedBy,
      completedAt: nowStr,
    },
  };

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Final Inspection Failed — Corrections Required",
    description: `Project final inspection failed. Inspected by: ${inspectedBy}. Notes/Corrections: ${notes}`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "High",
  });

  const updatedProject: Project = {
    ...project,
    status: "active",
    executionPhase: "active_execution",
    workspace: updatedWorkspace,
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

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
  const validation = canApproveInspection(project, request, notes);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

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

  let updatedProject: Project = { ...project, workspace: updatedWorkspace };
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
  const validation = canReturnInspection(project, request, notes);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

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

  let updatedProject: Project = { ...project, workspace: updatedWorkspace };
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
