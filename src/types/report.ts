export type ReportStatus = "Draft" | "Pending Review" | "Approved" | "Archived";

export interface Report {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  authorName: string;
  authorId: string;
  projectId?: string;
  fileUrl?: string;
  fileSize?: string;
  createdAt: string;
  updatedAt: string;
}
