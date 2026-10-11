import { http } from "@/services/http";

export enum MaintenanceContractStatus {
  Draft = 1,
  Active = 2,
  Completed = 3,
  Cancelled = 4,
}

export enum MaintenanceVisitStatus {
  Scheduled = 1,
  Raised = 2,
  InProgress = 3,
  Completed = 4,
  Missed = 5,
  Cancelled = 6,
}

export interface MaintenanceVisitDto {
  id: string;
  visitNumber: number;
  dueOnUtc: string;
  status: MaintenanceVisitStatus;
  raisedInstanceId?: string | null;
  raisedJobNumber?: string | null;
  raisedAtUtc?: string | null;
  completedAtUtc?: string | null;
  missedReason?: string | null;
}

export interface MaintenanceContractDto {
  id: string;
  instanceId: string;
  sourceJobNumber?: string | null;
  clientUserId?: string | null;
  clientName?: string | null;
  contractNumber: string;
  startsOnUtc: string;
  endsOnUtc: string;
  termMonths: number;
  visitsPerYear: number;
  leadTimeDays: number;
  status: MaintenanceContractStatus;
  cancellationReason?: string | null;
  closedAtUtc?: string | null;
  visitsScheduled: number;
  visitsCompleted: number;
  visitsMissed: number;
  visits: MaintenanceVisitDto[];
}

export interface MaintenanceCalendarEntryDto {
  contractId: string;
  contractNumber: string;
  clientName?: string | null;
  visitId: string;
  visitNumber: number;
  dueOnUtc: string;
  status: MaintenanceVisitStatus;
  raisedJobNumber?: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetMaintenanceContractsQueryParams {
  status?: MaintenanceContractStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface OpenMaintenanceContractPayload {
  instanceId: string;
  startsOnUtc: string;
  termMonths: number;
  visitsPerYear?: number;
  leadTimeDays?: number;
}

export const maintenanceApi = {
  /**
   * Retrieves paginated maintenance contracts.
   * GET /api/v1/maintenance/contracts
   */
  async getContracts(params?: GetMaintenanceContractsQueryParams) {
    return http.get<PaginatedList<MaintenanceContractDto>>("/maintenance/contracts", {
      params,
    });
  },

  /**
   * Retrieves single maintenance contract with complete visit schedule.
   * GET /api/v1/maintenance/contracts/{contractId}
   */
  async getContractById(contractId: string) {
    return http.get<MaintenanceContractDto>(`/maintenance/contracts/${contractId}`);
  },

  /**
   * Retrieves planning board visits due in a date range.
   * GET /api/v1/maintenance/calendar
   */
  async getCalendar(fromUtc?: string, toUtc?: string) {
    return http.get<MaintenanceCalendarEntryDto[]>("/maintenance/calendar", {
      params: { fromUtc, toUtc },
    });
  },

  /**
   * Opens a maintenance contract on an accepted job.
   * POST /api/v1/maintenance/contracts
   */
  async openContract(payload: OpenMaintenanceContractPayload) {
    return http.post<MaintenanceContractDto>("/maintenance/contracts", payload);
  },

  /**
   * Cancels a maintenance contract early with mandatory justification.
   * POST /api/v1/maintenance/contracts/{contractId}/cancel
   */
  async cancelContract(contractId: string, reason: string) {
    return http.post<MaintenanceContractDto>(`/maintenance/contracts/${contractId}/cancel`, {
      reason,
    });
  },

  /**
   * Reschedules an unraised visit.
   * PUT /api/v1/maintenance/visits/{visitId}/schedule
   */
  async rescheduleVisit(visitId: string, dueOnUtc: string) {
    return http.put<MaintenanceContractDto>(`/maintenance/visits/${visitId}/schedule`, {
      dueOnUtc,
    });
  },
};
