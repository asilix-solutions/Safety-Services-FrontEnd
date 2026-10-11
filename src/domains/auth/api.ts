import { http } from "@/services/http";
import {
  LoginCredentials,
  LoginResponseData,
  RefreshTokenResponseData,
  UserProfileResponseData,
  ForgotPasswordRequest,
  ForgotPasswordResponseData,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateMyProfileRequest,
} from "@/types/auth";
import { UserRole } from "@/types/role";
import { UserProfile } from "@/types/user";
import { ROLE_PERMISSIONS } from "@/constants/permissions";

/**
 * Normalizes backend role names (PascalCase) to frontend UserRole types.
 */
export function normalizeBackendRole(backendRole: string): UserRole {
  switch (backendRole) {
    case "SystemSuperAdmin":
      return "Super Admin";
    case "CompanyAdmin":
    case "DeputyAdmin":
      return "Company Admin";
    case "ConsultingEngineer":
      return "Consulting Engineer";
    case "OperationsOfficer":
    case "FieldWorker":
    case "MaintenanceManager":
    case "MaintenanceWorker":
      return "Operations Officer";
    case "SalesRepresentative":
      return "Sales Agent";
    case "Client":
      return "Client";
    default:
      if (backendRole.toLowerCase().includes("admin")) return "Company Admin";
      if (backendRole.toLowerCase().includes("engineer")) return "Consulting Engineer";
      if (backendRole.toLowerCase().includes("client")) return "Client";
      return "Super Admin";
  }
}

/**
 * Maps UserProfileResponseData from GET /api/v1/me into frontend UserProfile.
 */
export function mapBackendProfileToUser(data: UserProfileResponseData): UserProfile {
  const role = normalizeBackendRole(data.role);
  return {
    id: data.id,
    name: data.fullName,
    email: data.email,
    role,
    tenantId: data.tenantId || undefined,
    tenantName: data.tenantName || undefined,
    subdomain: data.subdomain || undefined,
    phoneNumber: data.phoneNumber || undefined,
    userType: data.userType,
    preferredLanguage: data.preferredLanguage,
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.fullName)}`,
    permissions: ROLE_PERMISSIONS[role] || [],
    active: true,
  };
}

/**
 * Auth Domain API service communicating with the Amanix .NET 10 Backend.
 */
export const authApi = {
  /**
   * Authenticate user with email and password.
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials) {
    return http.post<LoginResponseData>("/auth/login", credentials);
  },

  /**
   * Rotate and refresh JWT access token using refresh token.
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(accessToken: string, refreshToken: string) {
    return http.post<RefreshTokenResponseData>("/auth/refresh-token", {
      accessToken,
      refreshToken,
    });
  },

  /**
   * Fetch authenticated user's profile and tenant details.
   * GET /api/v1/me
   */
  async getMe() {
    return http.get<UserProfileResponseData>("/me");
  },

  /**
   * Ends caller's session on the server by revoking the refresh token.
   * POST /api/v1/auth/logout
   */
  async logout() {
    try {
      return await http.post("/auth/logout");
    } catch {
      // Idempotent client-side fallback
      return { isSuccess: true };
    }
  },

  /**
   * Request password recovery OTP.
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(payload: ForgotPasswordRequest) {
    return http.post<ForgotPasswordResponseData>("/auth/forgot-password", payload);
  },

  /**
   * Reset password with verified OTP.
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(payload: ResetPasswordRequest) {
    return http.post("/auth/reset-password", payload);
  },

  /**
   * Change current user password.
   * PUT /api/v1/me/change-password
   */
  async changePassword(payload: ChangePasswordRequest) {
    return http.put<boolean>("/me/change-password", payload);
  },

  /**
   * Update current user profile (name, phone, preferred language).
   * PUT /api/v1/me
   */
  async updateProfile(payload: UpdateMyProfileRequest) {
    return http.put<UserProfileResponseData>("/me", payload);
  },
};
