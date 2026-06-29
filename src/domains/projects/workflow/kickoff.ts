import { Project, ProjectWorkspaceData } from "@/types/project";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject } from "./helpers/persist";

export function approveKickoff({
  project,
  notes,
  approvedBy,
}: {
  project: Project;
  notes: string;
  approvedBy: string;
}): Project {
  if (project.status !== "planning" || project.executionPhase !== "created") {
    throw new Error("Cannot approve kickoff: Project status must be planning and executionPhase must be created.");
  }

  const nowStr = new Date().toISOString();

  // Create workspace metadata with kickoff notes if supported, preserving existing data
  const currentWorkspace = project.workspace || createDefaultWorkspace();
  const updatedWorkspace: ProjectWorkspaceData = {
    ...currentWorkspace,
    kickoff: {
      ...currentWorkspace.kickoff,
      approved: true,
      notes: notes || "",
    },
  };

  // Add timeline event
  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Kickoff Approved",
    description: `Project kickoff approved by ${approvedBy}. Notes: ${notes}`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "Medium",
  });

  const updatedProject: Project = {
    ...project,
    executionPhase: "kickoff_ready",
    workspace: updatedWorkspace,
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

export function startExecution({
  project,
  startedBy,
}: {
  project: Project;
  startedBy: string;
}): Project {
  if (project.executionPhase !== "kickoff_ready") {
    throw new Error("Cannot start execution: Project executionPhase must be kickoff_ready.");
  }

  const nowStr = new Date().toISOString();

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Execution Started",
    description: `Project execution started by ${startedBy}.`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "Medium",
  });

  const updatedProject: Project = {
    ...project,
    status: "active",
    executionPhase: "active_execution",
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}
