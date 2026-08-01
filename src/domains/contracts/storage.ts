import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { ClientContract } from "./types";

export function getContracts(): ClientContract[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CONTRACTS_V2");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CONTRACTS", err);
    return [];
  }
}

export function saveContracts(contracts: ClientContract[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CONTRACTS_V2", JSON.stringify(contracts));
  } catch (err) {
    console.error("Failed to save SSLM_CONTRACTS", err);
  }
}

/** Contracts visible to the caller's tenant. The getter UI lists must use. */
export function getScopedContracts(ctx: TenantContext): ClientContract[] {
  return scopeToTenant(getContracts(), ctx);
}

export function createOrUpdateContract(contract: ClientContract): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const contracts = getContracts();
  const index = contracts.findIndex((c) => c.id === contract.id);
  if (index !== -1) {
    contracts[index] = contract;
  } else {
    contracts.push(contract);
  }
  saveContracts(contracts);
}

/**
 * A single contract by id, unscoped.
 *
 * Internal: for workflow guards that must see the row whoever owns it — a
 * scoped read would return null for a foreign contract, which is
 * indistinguishable from "does not exist" and would let a cross-tenant sign or
 * archive pass as a plain not-found. UI must use `getScopedContractById`.
 */
export function getContractById(id: string): ClientContract | null {
  const contracts = getContracts();
  return contracts.find((c) => c.id === id) || null;
}

/**
 * A single contract by project, unscoped. Internal, for the duplicate guard in
 * `generateContractFromCompletedProject`. UI must use
 * `getScopedContractByProjectId`.
 */
export function getContractByProjectId(projectId: string): ClientContract | null {
  const contracts = getContracts();
  return contracts.find((c) => c.projectId === projectId) || null;
}

/**
 * The single-record reader every UI surface must use.
 *
 * Same rule as the list readers: a contract outside the caller's tenant comes
 * back as null rather than as a viewable record, so a contract id guessed from
 * the `CON-NNNN` sequence leaks neither the client nor the contract value.
 *
 * Super Admin still reads across tenants — `scopeToTenant` short-circuits on
 * `isCrossTenant` before any filtering.
 */
export function getScopedContractById(
  id: string,
  ctx: TenantContext
): ClientContract | null {
  const found = getContractById(id);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] ?? null;
}

/** The project-bound contract visible to the caller's tenant. The getter the UI must use. */
export function getScopedContractByProjectId(
  projectId: string,
  ctx: TenantContext
): ClientContract | null {
  const found = getContractByProjectId(projectId);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] ?? null;
}

export function getPendingContracts(
  ctx: TenantContext,
  userId?: string,
  companyId?: string
): ClientContract[] {
  const contracts = getScopedContracts(ctx);
  const pending = contracts.filter((c) => c.status === "generated");
  if (companyId) {
    return pending.filter((c) => c.clientId === companyId);
  }
  if (userId) {
    return pending.filter((c) => c.clientId === userId);
  }
  return pending;
}

