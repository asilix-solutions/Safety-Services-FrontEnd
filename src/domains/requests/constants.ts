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
    { name: "Commercial Registration / 700 Document", type: "pdf,image", required: true },
    { name: "Building Permit", type: "pdf", required: true },
    { name: "Deed of Ownership / Rental Contract", type: "pdf", required: true },
    { name: "Site Photos", type: "image,zip", required: true },
  ],
  maintenance_contract: [
    { name: "Old Maintenance Contract (Optional)", type: "pdf", required: false },
    { name: "Current Systems Photos", type: "image,zip", required: true },
    { name: "Site Access/Contact Document (Optional)", type: "pdf,text", required: false },
  ],
  engineering_blueprint: [
    { name: "Blueprint File (PDF/DWG/DXF)", type: "pdf,dwg,zip", required: true },
    { name: "Building Permit", type: "pdf", required: true },
    { name: "Architectural Plan (Optional)", type: "pdf", required: false },
  ],
  technical_report: [
    { name: "Rental Contract", type: "pdf", required: true },
    { name: "Building License", type: "pdf", required: true },
    { name: "Site Photos", type: "image,zip", required: true },
    { name: "Case Documents", type: "pdf,image", required: true },
  ],
};
