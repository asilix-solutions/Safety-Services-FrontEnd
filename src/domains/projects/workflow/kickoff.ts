import { Project } from "@/types/project";
import { persistProject } from "./helpers/persist";
import { createOrUpdateSiteVisit } from "@/domains/site-visits/storage";
import { SiteVisit } from "@/domains/site-visits/types";

/**
 * Operations schedules / initiates a kickoff visit for the project workspace.
 * Transitions Project state: PROJECT_PROVISIONED -> KICKOFF_PENDING
 */
export function initiateKickoffVisit({
  project,
  inspectorId,
  inspectorName,
  notes,
  scheduledDate,
}: {
  project: Project;
  inspectorId: string;
  inspectorName: string;
  notes: string;
  scheduledDate: string;
}): Project {
  if (project.executionPhase !== "PROJECT_PROVISIONED") {
    throw new Error("Cannot initiate kickoff: Project phase must be PROJECT_PROVISIONED.");
  }

  const nowStr = new Date().toISOString();

  // 1. Create a site visit record in pending/scheduled status
  const kickoffVisit: SiteVisit = {
    id: `SV-KICK-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId: project.id,
    projectName: `Kickoff Audit: ${project.name}`,
    location: "Project Site",
    inspectorId,
    inspectorName,
    scheduledDate: scheduledDate || nowStr,
    type: "kickoff",
    status: "scheduled",
    notes: notes || "Initial project site audit for kickoff authorization.",
  };

  createOrUpdateSiteVisit(kickoffVisit);

  // 2. Add operational tasks
  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Kickoff Site Visit Scheduled",
    description: `Kickoff site inspection scheduled with ${inspectorName}.`,
    completed: true,
    dueDate: (scheduledDate || nowStr).split("T")[0],
    priority: "Medium",
    titleKey: "projects:obstacles.events.kickoffScheduled.title",
    descriptionKey: "projects:obstacles.events.kickoffScheduled.desc",
    descriptionParams: { actor: inspectorName },
  });

  const updatedProject: Project = {
    ...project,
    executionPhase: "KICKOFF_PENDING",
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

/**
 * Inspector reviews, and approves/rejects the kickoff visit.
 * Transitions Project state: KICKOFF_PENDING -> KICKOFF_APPROVED (if approved)
 */
export function handleKickoffDecision({
  project,
  visitId,
  approved,
  decisionNotes,
  inspectorName,
}: {
  project: Project;
  visitId: string;
  approved: boolean;
  decisionNotes: string;
  inspectorName: string;
}): Project {
  if (project.executionPhase !== "KICKOFF_PENDING") {
    throw new Error("Cannot record kickoff decision: Project must be in KICKOFF_PENDING phase.");
  }

  const nowStr = new Date().toISOString();

  // 1. Resolve and update the kickoff visit status
  const kickoffVisit: SiteVisit = {
    id: visitId,
    projectId: project.id,
    projectName: `Kickoff Audit: ${project.name}`,
    location: "Project Site",
    inspectorId: "USR-006", // Fixed mock inspector reference or dynamic
    inspectorName,
    scheduledDate: nowStr,
    type: "kickoff",
    status: approved ? "approved" : "rejected",
    notes: decisionNotes,
    approved,
  };

  createOrUpdateSiteVisit(kickoffVisit);

  const updatedTasks = [...(project.tasks || [])];
  updatedTasks.push({
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: approved ? "Kickoff Approved" : "Kickoff Rejected",
    description: `Kickoff inspection ${approved ? "approved" : "rejected"} by ${inspectorName}. Notes: ${decisionNotes}`,
    completed: true,
    dueDate: nowStr.split("T")[0],
    priority: "High",
    titleKey: approved ? "projects:obstacles.events.kickoffApproved.title" : "projects:obstacles.events.kickoffRejected.title",
    descriptionKey: approved ? "projects:obstacles.events.kickoffApproved.desc" : "projects:obstacles.events.kickoffRejected.desc",
    descriptionParams: { actor: inspectorName, notes: decisionNotes },
  });

  const updatedProject: Project = {
    ...project,
    executionPhase: approved ? "KICKOFF_APPROVED" : "PROJECT_PROVISIONED", // rollback to provisioned on reject so ops can schedule again
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}

/**
 * Operations starts the active execution workspace
 * Transitions Project state: KICKOFF_APPROVED -> ACTIVE_EXECUTION
 */
export function startExecution({
  project,
  startedBy,
}: {
  project: Project;
  startedBy: string;
}): Project {
  if (project.executionPhase !== "KICKOFF_APPROVED") {
    throw new Error("Cannot start execution: Project executionPhase must be KICKOFF_APPROVED.");
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
    titleKey: "projects:obstacles.events.executionStarted.title",
    descriptionKey: "projects:obstacles.events.executionStarted.desc",
    descriptionParams: { actor: startedBy },
  });

  const updatedProject: Project = {
    ...project,
    status: "active",
    executionPhase: "ACTIVE_EXECUTION",
    tasks: updatedTasks,
    updatedAt: nowStr,
  };

  persistProject(updatedProject);
  return updatedProject;
}
