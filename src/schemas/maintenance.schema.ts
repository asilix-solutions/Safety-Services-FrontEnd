import * as z from "zod";

export const maintenanceSchema = z.object({
  assetName: z.string().min(2, { message: "Asset name must be at least 2 characters." }),
  facilityLocation: z.string().min(2, { message: "Location details are required." }),
  description: z.string().min(8, { message: "Description must be at least 8 characters." }),
  priority: z.enum(["Low", "Medium", "High", "Critical"], {
    message: "Select a valid priority level.",
  }),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Scheduled date must be YYYY-MM-DD." }),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
