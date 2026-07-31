import { UserRole } from "@/types/role";
import { USER_ROLES } from "@/constants/roles";
import { TenantContext, TenantScoped } from "./types";

/**
 * Super Admin is the only actor allowed to read across tenants (SRS FR-TEN).
 * Kept as an explicit predicate rather than an inline role check so the set of
 * cross-tenant roles has exactly one definition.
 */
export function isCrossTenant(role?: UserRole): boolean {
  return role === USER_ROLES.SUPER_ADMIN;
}

/** Builds a scoping context from a signed-in profile. */
export function toTenantContext(
  user?: { tenantId?: string; companyId?: string; role?: UserRole } | null
): TenantContext {
  return { tenantId: user?.tenantId, companyId: user?.companyId, role: user?.role };
}

/**
 * Restricts a collection to the caller's tenant.
 *
 * Fails closed: without a tenantId the result is empty, never the full set. An
 * unauthenticated or half-initialised context must not be indistinguishable
 * from a super admin — the only way to read across tenants is to satisfy
 * `isCrossTenant`.
 */
export function scopeToTenant<T extends TenantScoped>(records: T[], ctx: TenantContext): T[] {
  if (isCrossTenant(ctx.role)) return records;
  if (!ctx.tenantId) return [];
  return records.filter((record) => record.tenantId === ctx.tenantId);
}

/**
 * Narrows to a single client *within* the tenant, for records carrying a
 * clientId. Applied after `scopeToTenant`, never instead of it: the tenant
 * boundary and the client boundary are separate layers, and collapsing them
 * would let a client read every record its provider owns.
 */
export function scopeToClient<T extends { clientId?: string }>(
  records: T[],
  ctx: TenantContext
): T[] {
  if (ctx.role !== USER_ROLES.CLIENT) return records;
  if (!ctx.companyId) return [];
  return records.filter((record) => record.clientId === ctx.companyId);
}
