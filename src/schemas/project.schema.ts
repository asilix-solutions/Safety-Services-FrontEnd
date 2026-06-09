import * as z from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  clientName: z.string().min(2, { message: "Client name is required." }),
  clientId: z.string().min(1, { message: "Client ID is required." }),
  category: z.enum(["Fire Safety", "Structural", "Electrical", "Mechanical", "Plumbing", "General"], {
    message: "Select a valid project discipline.",
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be YYYY-MM-DD." }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be YYYY-MM-DD." }).optional().or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
