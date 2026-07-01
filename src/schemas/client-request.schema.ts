import { z } from "zod";

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
  if (data.requestType === "new_license") {
    if (!data.landPlotNumber || data.landPlotNumber.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Land plot number is required",
        path: ["landPlotNumber"],
      });
    }
    if (!data.buildingStatus || data.buildingStatus.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Building status is required",
        path: ["buildingStatus"],
      });
    }
    if (!data.licensePurpose || data.licensePurpose.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "License purpose is required",
        path: ["licensePurpose"],
      });
    }
  } else if (data.requestType === "maintenance_contract") {
    if (!data.existingSafetySystems || data.existingSafetySystems.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Existing safety systems description is required",
        path: ["existingSafetySystems"],
      });
    }
    if (!data.preferredVisitDate || data.preferredVisitDate.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preferred visit date is required",
        path: ["preferredVisitDate"],
      });
    }
    if (!data.onSiteCoordinatorName || data.onSiteCoordinatorName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "On-site coordinator name is required",
        path: ["onSiteCoordinatorName"],
      });
    }
    if (!data.onSiteCoordinatorPhone || data.onSiteCoordinatorPhone.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "On-site coordinator phone is required",
        path: ["onSiteCoordinatorPhone"],
      });
    }
  } else if (data.requestType === "engineering_blueprint") {
    if (!data.blueprintScope || data.blueprintScope.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Blueprint scope description is required",
        path: ["blueprintScope"],
      });
    }
    if (!data.buildingFloors || data.buildingFloors <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Building floors must be greater than 0",
        path: ["buildingFloors"],
      });
    }
    if (!data.constructionStatus || data.constructionStatus.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Construction status is required",
        path: ["constructionStatus"],
      });
    }
  } else if (data.requestType === "technical_report") {
    if (!data.reportType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Report type is required",
        path: ["reportType"],
      });
    }
    if (!data.caseDescription || data.caseDescription.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Case description is required",
        path: ["caseDescription"],
      });
    }
  }
});

export type ClientRequestFormValues = z.infer<typeof clientRequestSchema>;
