/**
 * Authentication DTO models matching the Amanix .NET 10 Backend API.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  refreshToken: string;
  userName: string;
  email: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponseData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  userType: string;
  preferredLanguage: string;
  tenantId: string | null;
  tenantName: string | null;
  subdomain: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  otp?: string; // Returned in staging/dev mode for testing affordance
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMyProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  preferredLanguage: string;
}

export interface RegisterClientRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface RegisterClientResponseData {
  userId: string;
  nextStep: string;
  devOnlyOtp?: string | null;
}

export interface VerifyClientOtpRequest {
  userId: string;
  otp: string;
}

export interface VerifyClientOtpResponseData {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface AcceptTenantInvitationRequest {
  userId: string;
  invitationToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AcceptPlatformInvitationRequest {
  userId: string;
  invitationToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AcceptInvitationResponseData {
  accessToken: string;
  refreshToken: string;
  role: string;
  userType: string;
}
