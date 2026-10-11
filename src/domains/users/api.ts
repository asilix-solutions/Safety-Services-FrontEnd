import { http } from "@/services/http";

/**
 * Matches backend Amanix.Domain.Enums.UserRole:
 * CompanyAdmin = 200,
 * DeputyAdmin = 201,
 * ConsultingEngineer = 202,
 * OperationsOfficer = 203,
 * FieldWorker = 204,
 * MaintenanceManager = 205,
 * SalesRepresentative = 206,
 * Client = 207,
 * MaintenanceWorker = 208
 */
export enum BackendUserRole {
  SystemSuperAdmin = 100,
  PlatformSupport = 101,
  PlatformFinance = 102,
  CompanyAdmin = 200,
  DeputyAdmin = 201,
  ConsultingEngineer = 202,
  OperationsOfficer = 203,
  FieldWorker = 204,
  MaintenanceManager = 205,
  SalesRepresentative = 206,
  Client = 207,
  MaintenanceWorker = 208,
}

export interface TenantUserDto {
  id: string;
  fullName: string;
  email: string;
  role: string | number;
  phoneNumber?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateTenantUserPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: BackendUserRole;
  preferredLanguage?: string;
}

export interface InviteTenantStaffResponse {
  invitationToken: string;
  recipientEmail: string;
  recipientName: string;
  assignedRole: string;
  expiresAtUtc: string;
}

export interface UpdateTenantUserPayload {
  fullName: string;
  phoneNumber?: string;
  role: BackendUserRole;
}

export interface PermissionCatalogCategoryDto {
  category: string;
  permissions: {
    name: string;
    description: string;
  }[];
}

export interface UserPermissionsDto {
  userId: string;
  role: string;
  rolePermissions: string[];
  customGrantedPermissions: string[];
  effectivePermissions: string[];
}

export interface TenantUsersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: BackendUserRole;
  isActive?: boolean;
}

export const usersApi = {
  /**
   * Retrieves paginated list of employees within tenant.
   * GET /api/v1/tenant-users
   */
  async getUsers(params?: TenantUsersQueryParams) {
    return http.get<PaginatedList<TenantUserDto>>("/tenant-users", { params });
  },

  /**
   * Retrieves single employee details by ID.
   * GET /api/v1/tenant-users/{id}
   */
  async getUserById(id: string) {
    return http.get<TenantUserDto>(`/tenant-users/${id}`);
  },

  /**
   * Invites new employee to the tenant.
   * POST /api/v1/tenant-users
   */
  async createUser(payload: CreateTenantUserPayload) {
    return http.post<InviteTenantStaffResponse>("/tenant-users", payload);
  },

  /**
   * Updates employee name, phone, or role.
   * PUT /api/v1/tenant-users/{id}
   */
  async updateUser(id: string, payload: UpdateTenantUserPayload) {
    return http.put<boolean>(`/tenant-users/${id}`, payload);
  },

  /**
   * Suspends or activates employee account.
   * PATCH /api/v1/tenant-users/{id}/toggle-status
   */
  async toggleUserStatus(id: string, isActive: boolean) {
    return http.patch<boolean>(`/tenant-users/${id}/toggle-status`, { isActive });
  },

  /**
   * Soft-deletes employee from roster.
   * DELETE /api/v1/tenant-users/{id}
   */
  async deleteUser(id: string) {
    return http.delete<boolean>(`/tenant-users/${id}`);
  },

  /**
   * Retrieves global permissions catalog grouped by domain.
   * GET /api/v1/tenant-users/permissions-catalog
   */
  async getPermissionsCatalog() {
    return http.get<PermissionCatalogCategoryDto[]>("/tenant-users/permissions-catalog");
  },

  /**
   * Retrieves employee specific permission overrides and effective claims.
   * GET /api/v1/tenant-users/{id}/permissions
   */
  async getUserPermissions(id: string) {
    return http.get<UserPermissionsDto>(`/tenant-users/${id}/permissions`);
  },

  /**
   * Sets custom granted permissions overrides for employee.
   * PUT /api/v1/tenant-users/{id}/permissions
   */
  async updateUserPermissions(id: string, grantedPermissions: string[]) {
    return http.put<boolean>(`/tenant-users/${id}/permissions`, { grantedPermissions });
  },
};
