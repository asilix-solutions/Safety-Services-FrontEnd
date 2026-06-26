import { Project } from "@/types/project";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { persistProject } from "./helpers/persist";

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

  let updatedWorkspace: any;
  if (currentWorkspace && 'kickoff' in currentWorkspace && typeof (currentWorkspace as any).kickoff === 'object') {
    updatedWorkspace = {
      ...currentWorkspace,
      kickoff: {
        approved: kickoffApproved,
        assignedInspector,
        notes: kickoffNotes,
      }
    };
  } else {
    // Legacy support
    updatedWorkspace = {
      ...currentWorkspace,
      assignedInspector,
      kickoffNotes,
      kickoffApproved,
    };
  }

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

  persistProject(updatedProject);
  return updatedProject;
}
