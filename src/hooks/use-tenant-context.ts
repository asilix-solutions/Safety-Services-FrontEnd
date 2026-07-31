"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { toTenantContext } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

/**
 * The signed-in user's scoping context. Features pass this into storage reads
 * rather than assembling tenantId/companyId/role themselves, so the rules stay
 * in `domains/tenancy`.
 */
export function useTenantContext(): TenantContext {
  const { user } = useAuth();
  return useMemo(() => toTenantContext(user), [user]);
}
