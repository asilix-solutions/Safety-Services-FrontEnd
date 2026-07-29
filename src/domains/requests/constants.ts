import { SERVICE_REGISTRY } from "./service-config";
import { RequestType, RequiredDocument } from "./types";

export const DEFAULT_REQUEST_CATEGORY = "General Safety";

// The FR-RUL-04 hazard matrix (keywords + ISIC codes) now lives in
// `constants/classification.ts` and is read only by
// `domains/requests/workflow.ts#classifyRequest`.

export const DEFAULT_REQUIRED_DOCUMENTS: Record<RequestType, Omit<RequiredDocument, "uploaded">[]> = {
  new_license: SERVICE_REGISTRY.new_license.documents,
  maintenance_contract: SERVICE_REGISTRY.maintenance_contract.documents,
  engineering_blueprint: SERVICE_REGISTRY.engineering_blueprint.documents,
  technical_report: SERVICE_REGISTRY.technical_report.documents,
};
