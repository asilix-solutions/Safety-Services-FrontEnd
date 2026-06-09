import { z } from "zod";

export const clientRequestSchema = z.object({
  // Step 1: Request Type
  requestType: z.enum(["new_license", "maintenance_contract", "engineering_blueprint", "technical_report"]),

  // Step 2: Facility Details
  facilityName: z.string().min(2, "Facility name must be at least 2 characters"),
  crNumber: z.string().regex(/^\d{10}$/, "CR / 700 Number must be exactly 10 digits"),
  activityName: z.string().min(2, "Activity name is required"),
  isicCode: z.string().min(2, "ISIC code is required"),
  area: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ required_error: "Area must be a number" }).positive("Area must be greater than 0")
  ),
  city: z.string().min(2, "City name is required"),
  district: z.string().min(2, "District name is required"),
  addressDescription: z.string().min(5, "Address details must be at least 5 characters"),
  contactName: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().regex(/^\+?[\d\s-]{9,15}$/, "Contact phone must be a valid phone number"),

  // Step 3: Safety Risk Toggles
  safetyEquipment: z.boolean().default(false),
  fireAlarm: z.boolean().default(false),
  fireExtinguishers: z.boolean().default(false),
  emergencyExits: z.boolean().default(false),
  gasExtensions: z.boolean().default(false),
  hazardousMaterials: z.boolean().default(false),
  riskCategory: z.enum(["low", "medium", "high"]).default("low"),
  notes: z.string().optional(),
});

export type ClientRequestFormValues = z.infer<typeof clientRequestSchema>;
