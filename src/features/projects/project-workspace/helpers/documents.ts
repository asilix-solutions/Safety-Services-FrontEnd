import { LicensingRequest, RequiredDocument } from "@/domains/requests/types";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";

export interface ResolvedDocuments {
  requestDocuments: RequiredDocument[];
  contract: ClientContract | null;
  certificate: ClientCertificate | null;
}

export function resolveProjectDocuments(
  request: LicensingRequest | null,
  contract: ClientContract | null,
  certificate: ClientCertificate | null
): ResolvedDocuments {
  return {
    requestDocuments: request?.documents || [],
    contract,
    certificate
  };
}
