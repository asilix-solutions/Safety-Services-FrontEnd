import { Project, ProjectExecutionPhase, SiloExecutionData, ProjectTask } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";
import { Quotation } from "@/domains/quotations/types";
import { ClientInvoice } from "@/domains/invoices/types";
import { UserRole } from "@/types/role";
import {
  ProjectWorkspaceTab,
  getVisibleProjectWorkspaceTabs,
  canEditProjectWorkspace,
  getProjectOverviewRoleConfig,
  ProjectOverviewRoleConfig
} from "@/constants/permissions";
import { getProjectHealth } from "../helpers/health";
import { calculateExecutionTotals, getCurrentPhaseIndex } from "../helpers/execution";
import { buildProjectTimeline, TimelineItem } from "../helpers/timeline";
import { resolveProjectDocuments, ResolvedDocuments } from "../helpers/documents";
import { groupProjectObstacles } from "../helpers/obstacles";
import { getProgressPercent, getOpenObstaclesCount, getNextActionLabelKey } from "../helpers/overview";

export interface OverviewViewModel {
  internalPhases: { id: ProjectExecutionPhase; labelKey: string }[];
  currentPhaseIndex: number;
  health: { status: string; color: string; labelKey: string };
  timeline: TimelineItem[];
  progressPercent: number;
  nextActionLabelKey: string;
  openObstaclesCount: number;
  quotation: Quotation | null;
  invoice: ClientInvoice | null;
  roleConfig: ProjectOverviewRoleConfig;
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
  access: { visibleTabs: ProjectWorkspaceTab[]; canEdit: boolean };
}

export function prepareProjectWorkspaceViewModel(
  project: Project,
  request: LicensingRequest | null,
  contract: ClientContract | null,
  certificate: ClientCertificate | null,
  userRole: UserRole | undefined,
  quotation: Quotation | null = null,
  invoice: ClientInvoice | null = null
): ProjectWorkspaceViewModel {
  const visibleTabs = getVisibleProjectWorkspaceTabs(userRole);
  const canEdit = canEditProjectWorkspace(userRole);
  const roleConfig = getProjectOverviewRoleConfig(userRole);

  const silos = project.workspace?.execution?.silos || [];
  const totals = calculateExecutionTotals(silos);
  const health = getProjectHealth(project, silos);

  const internalPhases: { id: ProjectExecutionPhase; labelKey: string }[] = [
    { id: "PROJECT_PROVISIONED", labelKey: "projects:phases.PROJECT_PROVISIONED" },
    { id: "KICKOFF_PENDING", labelKey: "projects:phases.KICKOFF_PENDING" },
    { id: "KICKOFF_APPROVED", labelKey: "projects:phases.KICKOFF_APPROVED" },
    { id: "ACTIVE_EXECUTION", labelKey: "projects:phases.ACTIVE_EXECUTION" },
    { id: "EXECUTION_COMPLETED", labelKey: "projects:phases.EXECUTION_COMPLETED" },
    { id: "READY_FOR_FINAL_INSPECTION", labelKey: "projects:phases.READY_FOR_FINAL_INSPECTION" },
    { id: "FINAL_INSPECTION_APPROVED", labelKey: "projects:phases.FINAL_INSPECTION_APPROVED" },
    { id: "CERTIFICATE_ISSUED", labelKey: "projects:phases.CERTIFICATE_ISSUED" },
    { id: "COMPLETED", labelKey: "projects:phases.COMPLETED" }
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
      timeline,
      progressPercent: getProgressPercent(currentPhaseIndex, internalPhases.length),
      nextActionLabelKey: getNextActionLabelKey(project.executionPhase),
      openObstaclesCount: getOpenObstaclesCount(project.tasks),
      quotation,
      invoice,
      roleConfig
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
    access: {
      visibleTabs,
      canEdit
    }
  };
}
