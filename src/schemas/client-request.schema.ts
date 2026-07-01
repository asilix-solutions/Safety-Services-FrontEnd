import { z } from "zod";
import { SERVICE_REGISTRY } from "@/domains/requests/service-config";

export const clientRequestSchema = z.object({
  // Step 1: Request Type
  requestType: z.enum(["new_license", "maintenance_contract", "engineering_blueprint", "technical_report"]),

  // Step 2: Facility Details
  facilityName: z.string().min(2, "Facility name must be at least 2 characters"),
  crNumber: z.string().regex(/^\d{10}$/, "CR / 700 Number must be exactly 10 digits"),
  activityName: z.string().min(2, "Activity name is required"),
  isicCode: z.string().min(2, "ISIC code is required"),
  area: z.coerce.number().positive("Area must be greater than 0"),
  city: z.string().min(2, "City name is required"),
  district: z.string().min(2, "District name is required"),
  addressDescription: z.string().min(5, "Address details must be at least 5 characters"),
  contactName: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().regex(/^(05\d{8}|\+9665\d{8}|\+?[1-9]\d{6,14})$/, "Contact phone must start with 05 (10 digits) or +9665 (13 characters) or be a valid international format"),

  // Step 3: Dynamic/Service-Specific Fields
  // New Safety License
  landPlotNumber: z.string().optional(),
  gpsCoordinates: z.string().optional(),
  currentSafetyEquipment: z.string().optional(),
  buildingStatus: z.string().optional(),
  licensePurpose: z.string().optional(),

  // Maintenance Contract
  existingSafetySystems: z.string().optional(),
  lastMaintenanceDate: z.string().optional(),
  preferredVisitDate: z.string().optional(),
  onSiteCoordinatorName: z.string().optional(),
  onSiteCoordinatorPhone: z.string().optional(),
  oldContractAvailable: z.boolean().optional(),

  // Blueprint Review
  blueprintScope: z.string().optional(),
  buildingFloors: z.coerce.number().optional(),
  constructionStatus: z.string().optional(),
  requiredSystems: z.string().optional(),
  engineeringNotes: z.string().optional(),

  // Technical Safety Report
  reportType: z.enum(["instant", "non_instant", "compliance"]).optional(),
  caseDescription: z.string().optional(),
  buildingLicenseContext: z.string().optional(),
  inspectionNeeded: z.boolean().optional(),

  // Safety Risk Toggles (Common fallback)
  safetyEquipment: z.boolean().default(false),
  fireAlarm: z.boolean().default(false),
  fireExtinguishers: z.boolean().default(false),
  emergencyExits: z.boolean().default(false),
  gasExtensions: z.boolean().default(false),
  hazardousMaterials: z.boolean().default(false),
  riskCategory: z.enum(["low", "medium", "high"]).default("low"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  const config = SERVICE_REGISTRY[data.requestType];
  if (config) {
    config.fields.forEach((field) => {
      if (field.required) {
        const val = data[field.key];
        if (val === undefined || val === null || (typeof val === "string" && val.trim().length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.key} is required`,
            path: [field.key],
          });
        } else if (field.type === "number" && typeof val === "number" && val <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.key} must be greater than 0`,
            path: [field.key],
          });
        }
      }
    });
  }
});

export type ClientRequestFormValues = z.infer<typeof clientRequestSchema>;
