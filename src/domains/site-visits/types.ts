export interface SiteVisit {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  inspectorId: string;
  inspectorName: string;
  scheduledDate: string;
  type: "kickoff" | "routine" | "final";
  status: "upcoming" | "completed" | "cancelled" | "scheduled" | "in_progress" | "approved" | "rejected";
  notes: string;
  approved?: boolean;
}
