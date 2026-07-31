export * from "./types";
import { SiteVisit } from "./types";

export const MOCK_VISITS: SiteVisit[] = [
  {
    id: "SV-101",
    projectId: "PRJ-001",
    projectName: "Skyline Tower Fire Certification",
    location: "Skyline Tower, Floor 14-20",
    inspectorId: "USR-006",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-12T10:00:00Z",
    type: "routine",
    status: "completed",
    notes: "Conduct final water pressure test on the primary wet riser system.",
  },
];

export function getSiteVisits(): SiteVisit[] {
  if (typeof window === "undefined") return MOCK_VISITS;
  try {
    const stored = localStorage.getItem("SSLM_SITE_VISITS_V2");
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem("SSLM_SITE_VISITS_V2", JSON.stringify(MOCK_VISITS));
  } catch (e) {
    console.error("Failed to load site visits from storage", e);
  }
  return MOCK_VISITS;
}

export function saveSiteVisits(visits: SiteVisit[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_SITE_VISITS_V2", JSON.stringify(visits));
  } catch (e) {
    console.error("Failed to save site visits to storage", e);
  }
}

export function createOrUpdateSiteVisit(visit: SiteVisit): void {
  const visits = getSiteVisits();
  const idx = visits.findIndex((v) => v.id === visit.id);
  if (idx !== -1) {
    visits[idx] = visit;
  } else {
    visits.push(visit);
  }
  saveSiteVisits(visits);
}

export function getSiteVisitsByProjectId(projectId: string): SiteVisit[] {
  return getSiteVisits().filter((v) => v.projectId === projectId);
}
