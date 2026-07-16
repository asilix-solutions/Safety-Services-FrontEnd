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