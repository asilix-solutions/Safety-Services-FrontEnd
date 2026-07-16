import { UserWithCompany } from "@/domains/users/workflow";
import { UserStatus } from "@/domains/users/types";
import { UserRole } from "@/types/role";
import { getRoleLabelKey, getStatusLabelKey, getStatusBadgeVariant } from "../helpers/helpers";

export interface UserRow {
  id: string;
  name: string;
  role: UserRole;
  roleLabelKey: string;
  companyName: string | undefined;
  status: UserStatus;
  statusLabelKey: string;
  statusBadgeVariant: "success" | "destructive";
}

export function toUserRows(usersWithCompany: UserWithCompany[]): UserRow[] {
  return usersWithCompany.map(({ user, company }) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    roleLabelKey: getRoleLabelKey(user.role),
    companyName: company?.name,
    status: user.status,
    statusLabelKey: getStatusLabelKey(user.status),
    statusBadgeVariant: getStatusBadgeVariant(user.status),
  }));
}
