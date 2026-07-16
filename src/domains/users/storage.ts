import { User } from "./types";

const STORAGE_KEY = "SSLM_USERS";

export const MOCK_USERS: User[] = [
  { id: "USR-001", name: "Alexander Vance", role: "Super Admin", status: "active", createdAt: "2026-01-05T09:00:00Z" },
  { id: "USR-002", name: "Sarah Jenkins", role: "Company Admin", companyId: "COMP-001", status: "active", createdAt: "2026-05-10T10:15:00Z" },
  { id: "USR-003", name: "Dr. Marcus Vance", role: "Consulting Engineer", companyId: "COMP-001", status: "active", createdAt: "2026-05-12T08:30:00Z" },
  { id: "USR-004", name: "Elena Rostova", role: "Operations Officer", companyId: "COMP-001", status: "active", createdAt: "2026-05-14T11:00:00Z" },
  { id: "USR-005", name: "James Sterling", role: "Sales Agent", companyId: "COMP-001", status: "inactive", createdAt: "2026-05-20T13:45:00Z" },
  { id: "USR-006", name: "Rayyan Al-Mansoor", role: "Client", companyId: "COMP-002", status: "active", createdAt: "2026-05-29T09:20:00Z" },
  { id: "USR-007", name: "Layla Haddad", role: "Company Admin", companyId: "COMP-002", status: "active", createdAt: "2026-05-29T09:25:00Z" },
  { id: "USR-008", name: "Omar Farsi", role: "Operations Officer", companyId: "COMP-002", status: "active", createdAt: "2026-06-02T14:10:00Z" },
  { id: "USR-009", name: "Noura Al-Zahrani", role: "Consulting Engineer", companyId: "COMP-003", status: "inactive", createdAt: "2026-06-01T09:05:00Z" },
  { id: "USR-010", name: "Yousef Barakat", role: "Sales Agent", companyId: "COMP-003", status: "active", createdAt: "2026-06-01T09:10:00Z" },
  { id: "USR-011", name: "Huda Nassar", role: "Company Admin", companyId: "COMP-004", status: "active", createdAt: "2026-06-25T11:05:00Z" },
  { id: "USR-012", name: "Tariq Salem", role: "Client", companyId: "COMP-004", status: "active", createdAt: "2026-06-26T10:00:00Z" },
];

export function getUsers(): User[] {
  if (typeof window === "undefined") return MOCK_USERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
  } catch (e) {
    console.error("Failed to load users from storage", e);
    return MOCK_USERS;
  }
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users to storage", e);
  }
}