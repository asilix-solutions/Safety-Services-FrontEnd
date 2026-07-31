import { UserRole } from "@/types/role";

/**
 * Who is asking, reduced to what scoping needs. Built once from the signed-in
 * profile and threaded into storage reads.
 */
export interface TenantContext {
  /** The safety company whose records are visible. Undefined for cross-tenant roles. */
  tenantId?: string;
  /** For a Client, the customer they represent — a narrower layer inside the tenant. */
  companyId?: string;
  role?: UserRole;
}

/** Any record that belongs to a tenant. */
export interface TenantScoped {
  tenantId?: string;
}
