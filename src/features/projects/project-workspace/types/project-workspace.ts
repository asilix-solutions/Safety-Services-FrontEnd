import { Project, ProjectExecutionPhase } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";

export interface ProjectHealthInfo {
  status: string;
  color: string;
  labelKey: string;
}

export interface WorkspaceTotals {
  totalLabor: number;
  totalMaterialsCost: number;
  totalMaterialsCount: number;
}

export interface ProjectWorkspaceViewModel {
  project: Project;
  request: LicensingRequest | null;
  contract: ClientContract | null;
  certificate: ClientCertificate | null;
  isClient: boolean;
  isOperationalRole: boolean;
  health: ProjectHealthInfo;
  totals: WorkspaceTotals;
  currentPhaseIndex: number;
  internalPhases: { id: ProjectExecutionPhase; labelKey: string }[];
}
