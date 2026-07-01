import { ClientContract } from "./types";

export function getContracts(): ClientContract[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CONTRACTS");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CONTRACTS", err);
    return [];
  }
}

export function saveContracts(contracts: ClientContract[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CONTRACTS", JSON.stringify(contracts));
  } catch (err) {
    console.error("Failed to save SSLM_CONTRACTS", err);
  }
}

export function createOrUpdateContract(contract: ClientContract): void {
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

export function getPendingContracts(userId?: string, companyId?: string): ClientContract[] {
  const contracts = getContracts();
  const pending = contracts.filter((c) => c.status === "generated");
  if (companyId) {
    return pending.filter((c) => c.clientId === companyId);
  }
  if (userId) {
    return pending.filter((c) => c.clientId === userId);
  }
  return pending;
}

