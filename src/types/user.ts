import { UserRole, RolePermissionKey } from "./role";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  avatarUrl?: string;
  permissions: RolePermissionKey[];
  active: boolean;
}

export interface UserSession {
  token: string;
  user: UserProfile;
  expiresAt: string;
}
