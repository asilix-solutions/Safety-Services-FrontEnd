import { Project, ProjectExecutionPhase } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { createOrUpdateProject, createDefaultWorkspace } from "@/domains/projects/storage";
import { upsertRequest } from "@/domains/requests/storage";

export function startProjectExecution({
  project,
  request,
}: {
  project: Project;
  request: LicensingRequest | null;
}): {
  updatedProject: Project;
  updatedRequest: LicensingRequest | null;
} {
  const nowStr = new Date().toISOString();

  // 1. If project is already active, return immediately (Idempotency)
  if (project.status === "active" && project.executionPhase === "active_execution") {
    return {
      updatedProject: project,
      updatedRequest: request,
    };
  }

  // 2. Update Project Status to active, executionPhase to active_execution and persist
  const updatedProject: Project = {
    ...project,
    status: "active",
    executionPhase: "active_execution",
    updatedAt: nowStr,
  };
  createOrUpdateProject(updatedProject);

  // 3. Transition Request Stage to FIELD_EXECUTION and persist
  let updatedRequest: LicensingRequest | null = null;
  if (request) {
    const updatedTimeline = [...request.timeline];
    const hasTimelineMarker = updatedTimeline.some(
      (t) => t.status === "in_execution" || t.comment.includes("Project Execution Started")
    );
    if (!hasTimelineMarker) {
      updatedTimeline.push({
        status: "in_execution",
        comment: `Project Execution Started. Project Ref: ${project.id}`,
        date: nowStr,
      });
    }

    updatedRequest = {
      ...request,
      currentStage: "FIELD_EXECUTION" as WorkflowStage,
      updatedAt: nowStr,
      timeline: updatedTimeline,
    };

    upsertRequest(updatedRequest);
  }

  return {
    updatedProject,
    updatedRequest,
  };
}

export function updateProjectKickoffDetails({
  project,
  assignedInspector,
  kickoffNotes,
  kickoffApproved,
}: {
  project: Project;
  assignedInspector: string;
  kickoffNotes: string;
  kickoffApproved: boolean;
}): Project {
  const nowStr = new Date().toISOString();
  
  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const updatedWorkspace = {
    ...currentWorkspace,
    assignedInspector,
    kickoffNotes,
    kickoffApproved,
  };

  // If kickoff is approved and we are in "created" phase, advance to "kickoff_ready"
  let newPhase = project.executionPhase || "created";
  if (kickoffApproved && newPhase === "created") {
    newPhase = "kickoff_ready";
  } else if (!kickoffApproved && newPhase === "kickoff_ready") {
    newPhase = "created";
  }

  const updatedProject: Project = {
    ...project,
    executionPhase: newPhase,
    workspace: updatedWorkspace,
    updatedAt: nowStr,
  };

  createOrUpdateProject(updatedProject);
  return updatedProject;
}

export function updateProjectSiloStatus({
  project,
  siloId,
  status,
  laborCount,
  materialsCount,
  costSAR,
}: {
  project: Project;
  siloId: "alarm" | "suppression" | "ventilation";
  status: "pending" | "ready" | "in_progress" | "completed" | "blocked";
  laborCount: number;
  materialsCount: number;
  costSAR: number;
}): Project {
  const nowStr = new Date().toISOString();
  const currentWorkspace = project.workspace || createDefaultWorkspace();
  
  const updatedSilos = currentWorkspace.silos.map((s) => {
    if (s.id === siloId) {
      return {
        ...s,
        status,
        laborCount,
        materialsCount,
        costSAR,
      };
    }
    return s;
  });

  const updatedProject: Project = {
    ...project,
    workspace: {
      ...currentWorkspace,
      silos: updatedSilos,
    },
    updatedAt: nowStr,
  };

  createOrUpdateProject(updatedProject);
  return updatedProject;
}

export function transitionProjectPhase({
  project,
  phase,
}: {
  project: Project;
  phase: ProjectExecutionPhase;
}): Project {
  const nowStr = new Date().toISOString();
  
  // Map project execution phase to status updates where logical
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

  createOrUpdateProject(updatedProject);
  return updatedProject;
}

