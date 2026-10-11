import { UserRole, RolePermissionKey } from "./role";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /**
   * The safety company (SaaS tenant) this user belongs to. Every record the user
   * can reach is scoped to it. Absent only for cross-tenant roles.
   */
  tenantId?: string;
  tenantName?: string;
  subdomain?: string;
  /**
   * For a Client, the customer record they represent (`c-1xx`). A second,
   * narrower layer *inside* a tenant — never a substitute for `tenantId`.
   */
  companyId?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  userType?: string;
  preferredLanguage?: string;
  permissions: RolePermissionKey[];
  active: boolean;
}

export interface UserSession {
  token: string;
  refreshToken?: string;
  user: UserProfile;
  expiresAt?: string;
}
