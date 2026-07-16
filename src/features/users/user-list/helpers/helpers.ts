import { UserStatus } from "@/domains/users/types";
import { UserRole } from "@/types/role";

export function getStatusBadgeVariant(status: UserStatus): "success" | "destructive" {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "destructive";
  }
}

export function getStatusLabelKey(status: UserStatus): string {
  return `users:status.${status}`;
}

export function getRoleLabelKey(role: UserRole): string {
  return `users:role.${role}`;
}
