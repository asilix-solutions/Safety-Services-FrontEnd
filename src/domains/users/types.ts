import { UserRole } from "@/types/role";

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId?: string;
  status: UserStatus;
  createdAt: string;
}

export interface UsersSummary {
  total: number;
  activeCount: number;
  inactiveCount: number;
  byRole: Record<UserRole, number>;
}

export interface CompanyPersonnelUsage {
  companyId: string;
  companyName: string;
  userCount: number;
  maxPersonnel: number;
  atLimit: boolean;
}

// User Profile & Audit Metadata DTOs
export interface SupervisorDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface UserAuditMetadataDTO {
  createdAt: string;
  lastLoginAt: string;
  lastLoginIp: string;
  passwordChangedAt: string;
  currentSessionId: string;
}

export interface UserProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  avatarUrl?: string;
  active: boolean;
  permissions: string[];
  supervisor?: SupervisorDTO | null;
  auditTrail: UserAuditMetadataDTO;
}

export interface UpdateProfileRequestDTO {
  name: string;
  phone?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Tenant Users & Staff Admin DTOs
export type StaffDepartment = "Engineering" | "Operations" | "Sales" | "Management" | "Administration";
export type StaffStatus = "Active" | "Inactive" | "Suspended" | "Invited";

export interface TenantUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department: StaffDepartment;
  role: UserRole;
  status: StaffStatus;
  supervisorId?: string;
  supervisorName?: string;
  lastActiveAt?: string;
  createdAt: string;
}