import { Project, ProjectExecutionPhase, SiloExecutionData, ProjectTask } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";
import { getProjectHealth } from "../helpers/health";
import { calculateExecutionTotals, getCurrentPhaseIndex } from "../helpers/execution";
import { buildProjectTimeline, TimelineItem } from "../helpers/timeline";
import { resolveProjectDocuments, ResolvedDocuments } from "../helpers/documents";
import { groupProjectObstacles } from "../helpers/obstacles";

export interface OverviewViewModel {
  internalPhases: { id: ProjectExecutionPhase; labelKey: string }[];
  currentPhaseIndex: number;
  health: { status: string; color: string; labelKey: string };
  timeline: TimelineItem[];
}

export interface ExecutionViewModel {
  silos: SiloExecutionData[];
  totals: { totalLabor: number; totalMaterialsCost: number; totalMaterialsCount: number };
}

export interface ObstaclesViewModel {
  critical: ProjectTask[];
  standard: ProjectTask[];
  blockedSilos: SiloExecutionData[];
}


export interface ProjectWorkspaceViewModel {
  overview: OverviewViewModel;
  execution: ExecutionViewModel;
  documents: ResolvedDocuments;
  obstacles: ObstaclesViewModel;
  roles: { isClient: boolean; isOperationalRole: boolean };
}

export function prepareProjectWorkspaceViewModel(
  project: Project,
  request: LicensingRequest | null,
  contract: ClientContract | null,
  certificate: ClientCertificate | null,
  userRole: string
): ProjectWorkspaceViewModel {
  const isClient = userRole === "Client" || userRole === "Client Admin";
  const isOperationalRole = !isClient && (userRole === "Operations Officer" || userRole === "Consulting Engineer" || userRole === "Super Admin");
  
  const silos = project.workspace?.execution?.silos || [];
  const totals = calculateExecutionTotals(silos);
  const health = getProjectHealth(project, silos);

  const internalPhases: { id: ProjectExecutionPhase; labelKey: string }[] = [
    { id: "created", labelKey: "projects:phases.created" },
    { id: "kickoff_ready", labelKey: "projects:phases.kickoff_ready" },
    { id: "active_execution", labelKey: "projects:phases.active_execution" },
    { id: "ready_for_final_inspection", labelKey: "projects:phases.ready_for_final_inspection" },
    { id: "completed", labelKey: "projects:phases.completed" }
  ];

  const currentPhaseIndex = getCurrentPhaseIndex(project.executionPhase, internalPhases);
  const timeline = buildProjectTimeline(request);
  const documents = resolveProjectDocuments(request, contract, certificate);
  const { critical, standard } = groupProjectObstacles(project.tasks);
  const blockedSilos = silos.filter((s) => s.status === "blocked");

  return {
    overview: {
      internalPhases,
      currentPhaseIndex,
      health,
      timeline
    },
    execution: {
      silos,
      totals
    },
    documents,
    obstacles: {
      critical,
      standard,
      blockedSilos
    },
    roles: {
      isClient,
      isOperationalRole
    }
  };
}
