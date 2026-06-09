import * as z from "zod";

export const licenseSchema = z.object({
  title: z.string().min(5, { message: "License title must be at least 5 characters." }),
  type: z.enum(
    [
      "Occupancy Permit",
      "Fire Safety License",
      "Hazardous Materials Permit",
      "Elevator Certification",
      "Environmental Clearance",
    ],
    {
      message: "Select a valid license type.",
    }
  ),
  projectId: z.string().min(1, { message: "Select an associated project." }),
  issuer: z.string().min(2, { message: "Issuing authority name is required." }),
});

export type LicenseFormValues = z.infer<typeof licenseSchema>;
