import { http } from "@/services/http";
import { BackendWorkflowStatus } from "@/domains/requests/api";

export enum PunchListItemStatus {
  Pending = 1,
  Passed = 2,
  Failed = 3,
  NotApplicable = 4,
}

export interface PunchListItemDto {
  id: string;
  sectionId?: string | null;
  sectionName?: string | null;
  description: string;
  standardReference?: string | null;
  displayOrder: number;
  status: PunchListItemStatus;
  inspectorNotes?: string | null;
  inspectedByName?: string | null;
  inspectedAtUtc?: string | null;
  blocksClosure: boolean;
}

export interface ClosureReadinessDto {
  instanceId: string;
  jobNumber?: string;
  status: BackendWorkflowStatus;
  outstandingTasks: number;
  outstandingPunchListItems: number;
  expensesAwaitingClearance: number;
  isClientSigned: boolean;
  isManagerSigned: boolean;
  isSealed: boolean;
  canSeal: boolean;
  blockers: string[];
}

export interface ClosureCertificateDto {
  id: string;
  instanceId: string;
  certificateNumber: string;
  clientRepresentativeName?: string | null;
  clientSignedAtUtc?: string | null;
  clientStampPhotoUrl?: string | null;
  managerName?: string | null;
  managerSignedAtUtc?: string | null;
  isClientSigned: boolean;
  isManagerSigned: boolean;
  isSealed: boolean;
  sealedAtUtc?: string | null;
  finalContractNet: number;
  finalTotalCost: number;
  finalNetMarginAmount: number;
  finalNetMarginPercent: number;
  masterArchivePath?: string | null;
  archivedPhotoCount: number;
  archivedTaskCount: number;
  archivedExpenseCount: number;
}

export interface SavePunchListItemCommand {
  itemId?: string;
  sectionId?: string;
  description: string;
  standardReference?: string;
}

export interface SignClosureAsClientCommand {
  signatureBase64: string;
  representativeName: string;
  stampPhotoPath?: string;
}

export interface SignClosureAsManagerCommand {
  signatureBase64: string;
}

export const closureApi = {
  /**
   * Retrieves closure readiness status and blockers list.
   * GET /api/v1/workflow-instances/{instanceId}/closure/readiness
   */
  async getReadiness(instanceId: string) {
    return http.get<ClosureReadinessDto>(
      `/workflow-instances/${instanceId}/closure/readiness`
    );
  },

  /**
   * Retrieves punch list safety inspection items.
   * GET /api/v1/workflow-instances/{instanceId}/closure/punch-list
   */
  async getPunchList(instanceId: string) {
    return http.get<PunchListItemDto[]>(
      `/workflow-instances/${instanceId}/closure/punch-list`
    );
  },

  /**
   * Adds or updates one line of the punch list inspection.
   * PUT /api/v1/workflow-instances/{instanceId}/closure/punch-list
   */
  async savePunchListItem(instanceId: string, command: SavePunchListItemCommand) {
    return http.put<PunchListItemDto>(
      `/workflow-instances/${instanceId}/closure/punch-list`,
      command
    );
  },

  /**
   * Drops standard SBC 801 checklist onto the project.
   * POST /api/v1/workflow-instances/{instanceId}/closure/punch-list/apply-standard
   */
  async applyStandardPunchList(instanceId: string) {
    return http.post<PunchListItemDto[]>(
      `/workflow-instances/${instanceId}/closure/punch-list/apply-standard`,
      {}
    );
  },

  /**
   * Records inspector verdict on an individual punch list item.
   * POST /api/v1/punch-list-items/{id}/inspect
   */
  async inspectPunchListItem(
    itemId: string,
    verdict: PunchListItemStatus,
    notes?: string
  ) {
    return http.post<PunchListItemDto>(`/punch-list-items/${itemId}/inspect`, {
      verdict,
      notes,
    });
  },

  /**
   * Opens closure certificate and allocates CRT-YYYY-NNNNN reference.
   * POST /api/v1/workflow-instances/{instanceId}/closure/certificate
   */
  async openCertificate(instanceId: string) {
    return http.post<ClosureCertificateDto>(
      `/workflow-instances/${instanceId}/closure/certificate`,
      {}
    );
  },

  /**
   * Retrieves closure certificate details and signatures.
   * GET /api/v1/workflow-instances/{instanceId}/closure/certificate
   */
  async getCertificate(instanceId: string) {
    return http.get<ClosureCertificateDto>(
      `/workflow-instances/${instanceId}/closure/certificate`
    );
  },

  /**
   * Records Client representative signature (Party A) with stamp photo.
   * POST /api/v1/workflow-instances/{instanceId}/closure/sign/client
   */
  async signAsClient(instanceId: string, command: SignClosureAsClientCommand) {
    return http.post<ClosureCertificateDto>(
      `/workflow-instances/${instanceId}/closure/sign/client`,
      command
    );
  },

  /**
   * Records Company manager countersignature (Party B).
   * POST /api/v1/workflow-instances/{instanceId}/closure/sign/manager
   */
  async signAsManager(instanceId: string, command: SignClosureAsManagerCommand) {
    return http.post<ClosureCertificateDto>(
      `/workflow-instances/${instanceId}/closure/sign/manager`,
      command
    );
  },

  /**
   * Permanently seals project into immutability vault with write-lock.
   * POST /api/v1/workflow-instances/{instanceId}/closure/seal
   */
  async sealProject(instanceId: string) {
    return http.post<ClosureCertificateDto>(
      `/workflow-instances/${instanceId}/closure/seal`,
      {}
    );
  },
};
