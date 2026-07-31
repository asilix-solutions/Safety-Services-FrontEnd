import { Company } from "./types";

const STORAGE_KEY = "SSLM_COMPANIES_V2";

export const MOCK_COMPANIES: Company[] = [
  {
    id: "COMP-001",
    name: "Apex Safety Ltd",
    owner: "Fahad Qasim",
    plan: "Enterprise Premium",
    tier: "Professional",
    status: "active",
    projectCount: 18,
    personnelCount: 45,
    expiresAt: "2026-12-31T00:00:00Z",
    registeredAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "COMP-002",
    name: "Safety Shield Co.",
    owner: "Salim Obaid",
    plan: "Basic Business",
    tier: "Basic",
    status: "active",
    projectCount: 9,
    personnelCount: 12,
    expiresAt: "2026-07-15T00:00:00Z",
    registeredAt: "2026-05-28T14:30:00Z",
  },
  {
    id: "COMP-003",
    name: "Gulf Fire Engineering",
    owner: "Khalid Issa",
    plan: "Standard Growth",
    tier: "Trial",
    status: "suspended",
    projectCount: 3,
    personnelCount: 22,
    expiresAt: "2026-06-01T00:00:00Z",
    registeredAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "COMP-004",
    name: "Red Sea Compliance",
    owner: "Ahmed Jamil",
    plan: "Standard Growth",
    tier: "Trial",
    status: "pending_verification",
    projectCount: 1,
    personnelCount: 5,
    expiresAt: "2026-08-20T00:00:00Z",
    registeredAt: "2026-06-25T11:00:00Z",
  },
];

export function getCompanies(): Company[] {
  if (typeof window === "undefined") return MOCK_COMPANIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMPANIES));
      return MOCK_COMPANIES;
    }
  } catch (e) {
    console.error("Failed to load companies from storage", e);
    return MOCK_COMPANIES;
  }
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function saveCompanies(companies: Company[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (e) {
    console.error("Failed to save companies to storage", e);
  }
}
