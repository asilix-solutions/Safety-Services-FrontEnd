import { http } from "@/services/http";

export enum TenantActivationMethod {
  ManualPlatformApproval = 1,
  ElectronicPayment = 2,
  BankTransferReceipt = 3,
}

export enum TenantActivationStatus {
  PendingEmailVerification = 1,
  PendingManualApproval = 2,
  PendingPaymentConfirmation = 3,
  PendingReceiptReview = 4,
  Activated = 5,
  Rejected = 6,
}

export interface SubdomainCheckResultDto {
  isAvailable: boolean;
  normalizedSlug: string;
  message: string;
}

export interface RegisterTenantPayload {
  companyNameAr: string;
  companyNameEn?: string;
  commercialRegistrationNumber: string;
  nationalUnifiedNumber700: string;
  subdomain: string;
  adminFullName: string;
  adminEmail: string;
  adminPhoneNumber: string;
  password: string;
  activationMethod: TenantActivationMethod;
}

export interface RegisterTenantResponse {
  tenantId: string;
  adminUserId: string;
  nextStep: string;
  devOnlyOtp?: string | null;
}

export interface VerifyTenantOtpPayload {
  userId: string;
  otpCode: string;
}

export interface VerifyTenantOtpResponse {
  token: string;
  fullName: string;
  subdomain: string;
  activationStatus: TenantActivationStatus;
}

export const tenantOnboardingApi = {
  /**
   * Checks if a requested company subdomain is available for registration.
   * GET /api/v1/tenants/subdomains/{subdomain}/availability
   */
  async checkSubdomainAvailability(subdomain: string) {
    return http.get<SubdomainCheckResultDto>(
      `/tenants/subdomains/${encodeURIComponent(subdomain)}/availability`
    );
  },

  /**
   * Registers a new safety company (Tenant) and primary administrator account.
   * POST /api/v1/tenants/register
   */
  async registerCompany(payload: RegisterTenantPayload) {
    return http.post<RegisterTenantResponse>("/tenants/register", payload);
  },

  /**
   * Verifies the OTP sent to tenant admin, activates account, and issues JWT.
   * POST /api/v1/tenants/verify-otp
   */
  async verifyTenantOtp(payload: VerifyTenantOtpPayload) {
    return http.post<VerifyTenantOtpResponse>("/tenants/verify-otp", payload);
  },
};
