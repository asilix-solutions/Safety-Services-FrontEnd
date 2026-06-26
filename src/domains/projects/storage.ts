import { Project, ProjectWorkspaceData, ProjectWorkspaceTemplate, SiloExecutionData } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";

export function migrateProjectWorkspace(project: Project): Project {
  // Ensure root-level jobNumber is preserved or derived
  let jobNumber = project.jobNumber;
  if (!jobNumber) {
    const match = project.name.match(/SSLM-\d+-\d+/);
    jobNumber = match ? match[0] : "";
  }

  const ws = project.workspace;
  if (!ws) {
    return {
      ...project,
      jobNumber,
    };
  }

  // Detect format: If 'kickoff' is defined as an object, it is in the new format.
  const isNewFormat = ws && "kickoff" in ws && typeof (ws as any).kickoff === "object";
  if (isNewFormat) {
    return {
      ...project,
      jobNumber,
    };
  }

  const oldWs = ws as any;
  const migratedWorkspace: ProjectWorkspaceData = {
    kickoff: {
      approved: !!oldWs.kickoffApproved,
      assignedInspector: oldWs.assignedInspector || "",
      notes: oldWs.kickoffNotes || "",
    },
    execution: {
      silos: oldWs.silos || [],
      downPaymentConfirmed: !!oldWs.downPaymentConfirmed,
    },
    completion: {
      notes: oldWs.executionCompletionNotes || "",
      readyForFinalInspection: !!oldWs.readyForFinalInspection,
    },
    inspection: oldWs.finalInspectionNotes || oldWs.finalInspectionApproved
      ? {
          approved: oldWs.finalInspectionApproved,
          notes: oldWs.finalInspectionNotes,
          decisionBy: oldWs.finalInspectionDecisionBy,
          completedAt: oldWs.finalInspectionCompletedAt,
        }
      : undefined,
  };

  return {
    ...project,
    jobNumber,
    workspace: migratedWorkspace,
  };
}

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_PROJECTS");
    const list: Project[] = raw ? JSON.parse(raw) : [];
    return list.map(migrateProjectWorkspace);
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
      kickoff: {
        approved: false,
        assignedInspector: "",
        notes: "",
      },
      execution: {
        silos,
        downPaymentConfirmed: true,
      },
      completion: {
        notes: "",
        readyForFinalInspection: false,
      },
      inspection: undefined,
    }
  };
}

export function createDefaultWorkspace(): ProjectWorkspaceData {
  return buildProjectWorkspaceTemplate("license", "new_license").workspace;
}

export function getProjectTemplateMetadata(
  template: ProjectWorkspaceTemplate,
  t?: (key: string) => string
): {
  projectNameSuffix: string;
  projectDescription: string;
  projectProgramLabel: string;
} {
  const isAr = t ? t("projects:title") === "المشاريع" : false;
  if (template === "maintenance") {
    return {
      projectNameSuffix: isAr ? "مشروع عمليات الصيانة" : "Maintenance Operations Project",
      projectDescription: isAr 
        ? "مشروع إدارة وجدولة عمليات الصيانة الوقائية وفحص أنظمة السلامة الدورية."
        : "Operational program setup for preventative maintenance and periodic system checks.",
      projectProgramLabel: isAr ? "برنامج عمليات الصيانة" : "Maintenance Operations Program",
    };
  }
  if (template === "installation_full") {
    return {
      projectNameSuffix: isAr ? "مشروع تنفيذ وتركيب أنظمة السلامة" : "Installation Compliance Project",
      projectDescription: isAr 
        ? "مشروع تنفيذ وتركيب وفحص أنظمة كشف ومكافحة الحريق والتهوية الميكانيكية بالمنشأة."
        : "Full engineering execution project for installation, wiring, and commissioning of safety systems.",
      projectProgramLabel: isAr ? "برنامج تنفيذ وتركيب أنظمة السلامة" : "Installation Execution Program",
    };
  }
  // compliance_followup
  return {
    projectNameSuffix: isAr ? "مشروع متابعة وتقييم الامتثال" : "Compliance Follow-up Project",
    projectDescription: isAr 
      ? "مشروع فحص ومتابعة الامتثال الفني الخفيف وإعداد تقارير السلامة الميدانية."
      : "Compliance inspection follow-up, evaluation checklist, and safety review program.",
    projectProgramLabel: isAr ? "برنامج متابعة وتقييم الامتثال" : "Compliance Follow-up Program",
  };
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

  // Enforce consistent projectType if template is maintenance
  let finalProjectType = projectType;
  if (template === "maintenance") {
    finalProjectType = "maintenance";
  }

  const meta = getProjectTemplateMetadata(template);

  const newProject: Project = {
    id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: request.tenantId || "default-tenant",
    jobNumber: request.jobNumber,
    name: `${request.facilityName} - ${meta.projectNameSuffix}`,
    description: meta.projectDescription,
    clientName: request.clientName || "Client",
    clientId: request.clientId || "client-id",
    status: "planning",
    executionPhase: "created",
    workspace,
    workspaceTemplate: template,
    startDate: new Date().toISOString().split("T")[0],
    tasks: [],
    category: "Fire Safety",
    projectType: finalProjectType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  createOrUpdateProject(newProject);
  return newProject;
}


