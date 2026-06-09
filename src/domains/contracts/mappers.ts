import { ClientContract } from "./types";

export function mapContractToSummary(contract: ClientContract) {
  return {
    contractId: contract.id,
    tenant: contract.tenantId,
    client: contract.clientId,
    valueFormatted: `$${contract.value.toLocaleString()}`,
    status: contract.status.toUpperCase(),
  };
}
