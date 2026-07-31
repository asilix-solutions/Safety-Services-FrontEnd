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

export function getContractById(id: string): ClientContract | null {
  const contracts = getContracts();
  return contracts.find((c) => c.id === id) || null;
}

export function getContractByProjectId(projectId: string): ClientContract | null {
  const contracts = getContracts();
  return contracts.find((c) => c.projectId === projectId) || null;
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

