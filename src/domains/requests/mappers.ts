import { LicensingRequest } from "./types";

export function mapRequestToSummary(req: LicensingRequest) {
  return {
    reference: req.id,
    tenant: req.tenantId,
    client: req.clientName,
    state: req.status,
  };
}
