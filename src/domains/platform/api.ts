import { http } from "@/services/http";

export enum TenantActivationStatus {
  Draft = 1,
  PendingVerification = 2,
  Active = 3,
  Suspended = 4,
  Rejected = 5,
}

export interface PlatformTenantSummaryDto {
  id: string;
  companyNameAr: string;
  companyNameEn?: string | null;
  subdomain: string;
  customDomain?: string | null;
  commercialRegistrationNumber?: string | null;
  isActive: boolean;
  activationStatus: TenantActivationStatus;
  subscriptionPlanName?: string | null;
  subscriptionExpiryDate: string;
  suspensionReason?: string | null;
  suspendedAtUtc?: string | null;
  staffCount: number;
  createdAt: string;
}

export interface PendingTenantActivationDto {
  tenantId: string;
  companyNameAr: string;
  companyNameEn?: string;
  subdomain: string;
  commercialRegistrationNumber: string;
  planCode: string;
  submittedAtUtc: string;
}

export interface SubscriptionPlanDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly: number;
  maxStaffAccounts?: number | null;
  maxMonthlyRequests?: number | null;
  storageQuotaGb?: number | null;
  isRetired: boolean;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PlatformTenantsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
  activationStatus?: TenantActivationStatus;
  searchTerm?: string;
}

export const platformApi = {
  /**
   * Retrieves paginated list of all companies on the platform.
   * GET /api/v1/platform/tenants
   */
  async getTenants(params?: PlatformTenantsQueryParams) {
    return http.get<PaginatedList<PlatformTenantSummaryDto>>("/platform/tenants", {
      params,
    });
  },

  /**
   * Retrieves pending tenant activation queue.
   * GET /api/v1/platform/tenants/pending-activation
   */
  async getPendingActivations() {
    return http.get<PendingTenantActivationDto[]>("/platform/tenants/pending-activation");
  },

  /**
   * Approves or rejects tenant registration.
   * POST /api/v1/platform/tenants/{tenantId}/approve-activation
   */
  async approveActivation(tenantId: string, approve: boolean, rejectionReason?: string) {
    return http.post<boolean>(`/platform/tenants/${tenantId}/approve-activation`, {
      approve,
      rejectionReason,
    });
  },

  /**
   * Suspends a company account with an audit-logged reason.
   * POST /api/v1/platform/tenants/{tenantId}/suspend
   */
  async suspendTenant(tenantId: string, reason: string) {
    return http.post<boolean>(`/platform/tenants/${tenantId}/suspend`, { reason });
  },

  /**
   * Reactivates a suspended company account.
   * POST /api/v1/platform/tenants/{tenantId}/reactivate
   */
  async reactivateTenant(tenantId: string) {
    return http.post<boolean>(`/platform/tenants/${tenantId}/reactivate`);
  },

  /**
   * Retrieves all subscription plans in catalog.
   * GET /api/v1/platform/subscription-plans
   */
  async getSubscriptionPlans() {
    return http.get<SubscriptionPlanDto[]>("/platform/subscription-plans");
  },
};
