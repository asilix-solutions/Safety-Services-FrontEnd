import { Project, ProjectWorkspaceData, ProjectWorkspaceTemplate, SiloExecutionData } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_PROJECTS");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_PROJECTS from localStorage", err);
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_PROJECTS", JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to write SSLM_PROJECTS to localStorage", err);
  }
}

export function createOrUpdateProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.jobNumber === project.jobNumber || p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function buildProjectWorkspaceTemplate(
  projectType: string,
  requestType: string,
  classification?: string,
  assignedQueue?: string
): { workspace: ProjectWorkspaceData; template: ProjectWorkspaceTemplate } {
  let template: ProjectWorkspaceTemplate = "compliance_followup";
  
  const pType = (projectType || "").toLowerCase();
  const rType = (requestType || "").toLowerCase();
  const classif = (classification || "").toLowerCase();
  const queue = (assignedQueue || "").toLowerCase();
  
  if (
    classif.includes("maintenance") || 
    queue.includes("maintenance") || 
    rType.includes("maintenance") || 
    pType === "maintenance"
  ) {
    template = "maintenance";
  } else if (
    classif.includes("engineering") ||
    queue.includes("engineering") ||
    rType.includes("new_license") || 
    rType.includes("license") || 
    rType.includes("engineering_execution") ||
    pType === "license"
  ) {
    template = "installation_full";
  } else if (
    classif.includes("high_hazard") || 
    queue.includes("high_hazard")
  ) {
    template = "installation_full";
  } else if (
    classif.includes("fast") ||
    queue.includes("fast") ||
    rType.includes("technical_report") ||
    rType.includes("compliance_report") ||
    rType.includes("fit_report") ||
    pType === "engineering"
  ) {
    template = "compliance_followup";
  }

  const silos: SiloExecutionData[] = template === "installation_full" ? [
    {
      id: "alarm",
      status: "pending",
      laborCount: 0,
      materialsCount: 0,
      pendingItemsCount: 0,
      costSAR: 0,
      obstaclesCount: 0,
      photosCount: 0,
    },
    {
      id: "suppression",
      status: "pending",
      laborCount: 0,
      materialsCount: 0,
      pendingItemsCount: 0,
      costSAR: 0,
      obstaclesCount: 0,
      photosCount: 0,
    },
    {
      id: "ventilation",
      status: "pending",
      laborCount: 0,
      materialsCount: 0,
      pendingItemsCount: 0,
      costSAR: 0,
      obstaclesCount: 0,
      photosCount: 0,
    },
  ] : [];

  return {
    template,
    workspace: {
      kickoffApproved: false,
      downPaymentConfirmed: true,
      assignedInspector: "",
      kickoffNotes: "",
      silos,
    }
  };
}

export function createDefaultWorkspace(): ProjectWorkspaceData {
  return buildProjectWorkspaceTemplate("license", "new_license").workspace;
}

export function provisionProjectFromRequest(request: LicensingRequest): Project {
  // Map RequestType to ProjectType
  let projectType: "license" | "maintenance" | "engineering" = "engineering";
  if (request.requestType === "new_license") {
    projectType = "license";
  } else if (request.requestType === "maintenance_contract") {
    projectType = "maintenance";
  }

  const { workspace, template } = buildProjectWorkspaceTemplate(
    projectType, 
    request.requestType,
    request.classification,
    request.assignedQueue || undefined
  );

  const newProject: Project = {
    id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: request.tenantId || "default-tenant",
    jobNumber: request.jobNumber,
    name: `${request.facilityName} - Compliance Project`,
    description: `Safety compliance execution project initialized for request ${request.jobNumber}`,
    clientName: request.clientName || "Client",
    clientId: request.clientId || "client-id",
    status: "planning",
    executionPhase: "created",
    workspace,
    workspaceTemplate: template,
    startDate: new Date().toISOString().split("T")[0],
    tasks: [],
    category: "Fire Safety",
    projectType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  createOrUpdateProject(newProject);
  return newProject;
}


