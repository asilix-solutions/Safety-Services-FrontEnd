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
  new_license: [
    { name: "Commercial Registration / 700 Document", type: "pdf,image" },
    { name: "Building Permit", type: "pdf" },
    { name: "Deed of Ownership / Rental Contract", type: "pdf" },
    { name: "Site Photos", type: "image,zip" },
  ],
  maintenance_contract: [
    { name: "Existing Maintenance Agreement (if any)", type: "pdf" },
    { name: "Safety Systems Photos", type: "image,zip" },
    { name: "Site access details", type: "pdf,text" },
  ],
  engineering_blueprint: [
    { name: "Blueprint Design PDF", type: "pdf" },
    { name: "DWG / DXF CAD Files (optional)", type: "dwg,zip" },
    { name: "Building Permit", type: "pdf" },
  ],
  technical_report: [
    { name: "Rental/Lease Contract", type: "pdf" },
    { name: "Building Permit", type: "pdf" },
    { name: "Facility Photos", type: "image,zip" },
  ],
};
