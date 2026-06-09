import * as z from "zod";

export const reportSchema = z.object({
  title: z.string().min(5, { message: "Report title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  projectId: z.string().optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
