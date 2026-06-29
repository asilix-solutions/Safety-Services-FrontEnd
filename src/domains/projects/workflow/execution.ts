import { Project, ProjectExecutionPhase } from "@/types/project";
import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject, persistRequest } from "./helpers/persist";
import { appendTimelineEvent } from "./helpers/timeline";
import { synchronizeProjectAndRequest } from "./helpers/sync";
import { canStartProjectExecution } from "@/domains/workflow-validation";

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
  // 1. If project is already active, return immediately (Idempotency)
  if (project.status === "active" && project.executionPhase === "active_execution") {
    return {
      updatedProject: project,
      updatedRequest: request,
    };
  }

  const validation = canStartProjectExecution(project, request);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const nowStr = new Date().toISOString();


  let updatedProject = { ...project };
  let updatedRequest = request;

  if (request) {
    const synced = synchronizeProjectAndRequest(
      updatedProject,
      request,
      "active_execution",
      "FIELD_EXECUTION" as WorkflowStage
    );
    updatedProject = synced.updatedProject;

    // Check timeline marker
    const hasTimelineMarker = request.timeline.some(
      (t) => t.status === "in_execution" || t.comment.includes("Project Execution Started")
    );
    if (!hasTimelineMarker) {
      updatedRequest = appendTimelineEvent(
        synced.updatedRequest,
        "in_execution",
        `Project Execution Started. Project Ref: ${project.id}`
      );
    } else {
      updatedRequest = synced.updatedRequest;
    }

    persistRequest(updatedRequest);
  } else {
    updatedProject.status = "active";
    updatedProject.executionPhase = "active_execution";
    updatedProject.updatedAt = nowStr;
  }

  persistProject(updatedProject);

  return {
    updatedProject,
    updatedRequest,
  };
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
  
  const isNew = currentWorkspace && 'execution' in currentWorkspace && typeof (currentWorkspace as any).execution === 'object';
  const silos = isNew ? (currentWorkspace as any).execution.silos : (currentWorkspace as any).silos || [];

  const updatedSilos = silos.map((s: any) => {
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

  let updatedWorkspace: any;
  if (isNew) {
    updatedWorkspace = {
      ...currentWorkspace,
      execution: {
        ...((currentWorkspace as any).execution || {}),
        silos: updatedSilos,
      }
    };
  } else {
    updatedWorkspace = {
      ...currentWorkspace,
      silos: updatedSilos,
    };
  }

  const updatedProject: Project = {
    ...project,
    workspace: updatedWorkspace,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

export function startExecutionSilo({
  project,
  siloId,
  startedBy,
}: {
  project: Project;
  siloId: "alarm" | "suppression" | "ventilation";
  startedBy: string;
}): Project {
  if (project.status !== "active" || project.executionPhase !== "active_execution") {
    throw new Error("Cannot start silo: Project status must be active and executionPhase must be active_execution.");
  }

  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const silos = currentWorkspace.execution?.silos || [];
  const targetSilo = silos.find((s) => s.id === siloId);

  if (!targetSilo) {
    throw new Error(`Silo ${siloId} not found in project workspace.`);
  }

  if (targetSilo.status === "in_progress" || targetSilo.status === "completed") {
    throw new Error(`Silo ${siloId} is already in progress or completed.`);
  }

  const updatedSilos = silos.map((s) => {
    if (s.id === siloId) {
      return {
        ...s,
        status: "in_progress" as const,
      };
    }
    return s;
  });

  const nowStr = new Date().toISOString();
  const updatedWorkspace = {
    ...currentWorkspace,
    execution: {
      ...currentWorkspace.execution,
      silos: updatedSilos,
    },
  };

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `Silo ${siloId.toUpperCase()} Started`,
    description: `Execution silo ${siloId} started by ${startedBy}.`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "Medium",
  });

  const updatedProject: Project = {
    ...project,
    workspace: updatedWorkspace,
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

export function completeExecutionSilo({
  project,
  siloId,
  completedBy,
  notes,
}: {
  project: Project;
  siloId: "alarm" | "suppression" | "ventilation";
  completedBy: string;
  notes: string;
}): Project {
  if (project.status !== "active" || project.executionPhase !== "active_execution") {
    throw new Error("Cannot complete silo: Project status must be active and executionPhase must be active_execution.");
  }

  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const silos = currentWorkspace.execution?.silos || [];
  const targetSilo = silos.find((s) => s.id === siloId);

  if (!targetSilo) {
    throw new Error(`Silo ${siloId} not found in project workspace.`);
  }

  if (targetSilo.status !== "in_progress") {
    throw new Error(`Silo ${siloId} is not in progress.`);
  }

  const updatedSilos = silos.map((s) => {
    if (s.id === siloId) {
      return {
        ...s,
        status: "completed" as const,
      };
    }
    return s;
  });

  const nowStr = new Date().toISOString();
  const updatedWorkspace = {
    ...currentWorkspace,
    execution: {
      ...currentWorkspace.execution,
      silos: updatedSilos,
    },
  };

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `Silo ${siloId.toUpperCase()} Completed`,
    description: `Execution silo ${siloId} completed by ${completedBy}. Notes: ${notes}`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "Medium",
  });

  // Check if all silos are now completed
  const allCompleted = updatedSilos.every((s) => s.status === "completed");
  let nextPhase: ProjectExecutionPhase | undefined = project.executionPhase;
  if (allCompleted) {
    nextPhase = "ready_for_final_inspection";
  }

  const updatedProject: Project = {
    ...project,
    executionPhase: nextPhase,
    workspace: updatedWorkspace,
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

