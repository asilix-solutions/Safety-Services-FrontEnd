export * from "./types";
import { SiteVisit } from "./types";

export const MOCK_VISITS: SiteVisit[] = [
  {
    id: "SV-101",
    projectName: "Skyline Tower Fire Certification",
    location: "Skyline Tower, Floor 14-20",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-12T10:00:00Z",
    status: "upcoming",
    notes: "Conduct final water pressure test on the primary wet riser system.",
  },
  {
    id: "SV-102",
    projectName: "Marina Retail Electrical Inspection",
    location: "Marina Mall, Unit B22",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-15T09:00:00Z",
    status: "upcoming",
    notes: "Review automatic transfer switch calibration log.",
  },
  {
    id: "SV-103",
    projectName: "Gulf Industrial Gas Pipe Audit",
    location: "Industrial Sector 4, Depot C",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-08T11:00:00Z",
    status: "completed",
    notes: "Hydrostatic pipe tests verified. Safety certification document signed.",
  },
  {
    id: "SV-104",
    projectName: "Vertex Structural Blueprint Review",
    location: "Vertex HQ site, Zone A",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-05-24T14:30:00Z",
    status: "completed",
    notes: "Core load-bearing columns inspected. Rebar reinforcement approved.",
  },
];

export function getSiteVisits(): SiteVisit[] {
  // Try loading from localStorage, fallback to MOCK_VISITS
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("SSLM_SITE_VISITS");
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize if empty
      localStorage.setItem("SSLM_SITE_VISITS", JSON.stringify(MOCK_VISITS));
    } catch (e) {
      console.error("Failed to load site visits from storage", e);
    }
  }
  return MOCK_VISITS;
}
