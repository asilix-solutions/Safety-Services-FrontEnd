export interface SiteVisit {
  id: string;
  projectName: string;
  location: string;
  inspectorName: string;
  scheduledDate: string;
  status: "upcoming" | "completed" | "cancelled";
  notes: string;
}
