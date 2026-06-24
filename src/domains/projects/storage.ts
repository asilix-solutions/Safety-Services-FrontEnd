import { Project } from "@/types/project";
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

export function provisionProjectFromRequest(request: LicensingRequest): Project {
  // Map RequestType to ProjectType
  let projectType: "license" | "maintenance" | "engineering" = "engineering";
  if (request.requestType === "new_license") {
    projectType = "license";
  } else if (request.requestType === "maintenance_contract") {
    projectType = "maintenance";
  }

  const newProject: Project = {
    id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: request.tenantId || "default-tenant",
    jobNumber: request.jobNumber,
    name: `${request.facilityName} - Compliance Project`,
    description: `Safety compliance execution project initialized for request ${request.jobNumber}`,
    clientName: request.clientName || "Client",
    clientId: request.clientId || "client-id",
    status: "planning",
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
