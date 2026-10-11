import { http } from "@/services/http";

export enum AuditActionType {
  Create = 1,
  Update = 2,
  Delete = 3,
  Login = 4,
  Logout = 5,
  StateTransition = 6,
  Authorize = 7,
  Export = 8,
}

export interface AuditLogDto {
  id: string;
  tenantId?: string | null;
  userId?: string | null;
  action: AuditActionType;
  entityName: string;
  entityId: string;
  changedColumns?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditLogDetailDto extends AuditLogDto {
  oldValues?: string | null;
  newValues?: string | null;
  performedByEmail?: string | null;
  performedByName?: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetAuditLogsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  entityName?: string;
  action?: AuditActionType;
  searchTerm?: string;
}

export const auditApi = {
  /**
   * Retrieves paginated audit log entries for the active tenant.
   * GET /api/v1/audit-logs
   */
  async getAuditLogs(params?: GetAuditLogsQueryParams) {
    return http.get<PaginatedList<AuditLogDto>>("/audit-logs", { params });
  },

  /**
   * Retrieves full details including OldValues and NewValues state JSON for an audit record.
   * GET /api/v1/audit-logs/{id}
   */
  async getAuditLogById(id: string) {
    return http.get<AuditLogDetailDto>(`/audit-logs/${id}`);
  },

  /**
   * Downloads audit log report as CSV file.
   * GET /api/v1/audit-logs/export
   */
  async exportAuditLogs(params?: GetAuditLogsQueryParams) {
    return http.get<Blob>("/audit-logs/export", {
      params,
      responseType: "blob",
    });
  },
};
