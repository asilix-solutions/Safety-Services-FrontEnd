import { SiteVisit } from "@/domains/site-visits/types";

export function formatVisitDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString() + " at " + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateString;
  }
}

export function filterSiteVisits(visits: SiteVisit[], activeTab: "list" | "calendar" | "upcoming" | "completed"): SiteVisit[] {
  if (activeTab === "upcoming") return visits.filter((v) => v.status === "upcoming");
  if (activeTab === "completed") return visits.filter((v) => v.status === "completed");
  return visits;
}

export function getSiteVisitBadgeVariant(status: string): "warning" | "success" | "default" | "secondary" | "destructive" | "outline" {
  if (status === "upcoming") return "warning";
  if (status === "completed") return "success";
  return "default";
}
