import { UserRole, RolePermissionKey } from "@/types/role";

/**
 * Mapping of Roles to System Modules they can access.
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionKey[]> = {
  "Super Admin": [
    "users.manage",
    "projects.view",
    "reports.view",
    "licenses.view",
    "customers.view",
    "certificates.view",
    "certificates.manage",
  ],
  "Company Admin": [
    "projects.view",
    "projects.create",
    "projects.edit",
    "projects.delete",
    "reports.view",
    "reports.create",
    "customers.view",
    "customers.manage",
    "contracts.view",
    "contracts.create",
    "contracts.approve",
    "contracts.manage",
    "invoices.view",
    "invoices.create",
    "invoices.approve",
    "invoices.manage",
    "requests.view",
    "certificates.view",
    "certificates.create",
    "certificates.manage",
  ],
  "Consulting Engineer": [
    "projects.view",
    "reports.view",
    "reports.create",
    "licenses.view",
    "licenses.approve",
    "requests.view",
  ],
  "Operations Officer": [
    "projects.view",
    "projects.create",
    "projects.edit",
    "reports.view",
  ],
  "Sales Agent": [
    "customers.view",
    "customers.manage",
    "requests.view",
  ],
  Client: [
    "projects.view",
    "reports.view",
    "licenses.view",
    "licenses.create",
    "contracts.view",
    "contracts.download",
    "invoices.view",
    "invoices.download",
    "requests.view",
    "certificates.view",
  ],
};

/**
 * Helper to check if a user is permitted to perform a specific action key
 */
export function hasPermission(role: UserRole, permission: RolePermissionKey): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
