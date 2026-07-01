import { SERVICE_REGISTRY } from "./service-config";
import { RequestType, RequiredDocument } from "./types";

export const DEFAULT_REQUEST_CATEGORY = "General Safety";

export const HIGH_HAZARD_KEYWORDS = [
  "kitchen",
  "buffet",
  "gas",
  "workshop",
  "oil",
  "chemical",
  "compressed",
  "heavy",
  "storage",
  "factory",
  "manufacturing",
  "welding",
];

export const HIGH_HAZARD_ISIC_CODES = [
  "5610", // Restaurants and mobile food service activities (often have kitchens)
  "2011", // Manufacture of basic chemicals
  "4520", // Maintenance and repair of motor vehicles (workshops)
  "4730", // Retail sale of automotive fuel in specialized stores
];

export const DEFAULT_REQUIRED_DOCUMENTS: Record<RequestType, Omit<RequiredDocument, "uploaded">[]> = {
  new_license: SERVICE_REGISTRY.new_license.documents,
  maintenance_contract: SERVICE_REGISTRY.maintenance_contract.documents,
  engineering_blueprint: SERVICE_REGISTRY.engineering_blueprint.documents,
  technical_report: SERVICE_REGISTRY.technical_report.documents,
};
