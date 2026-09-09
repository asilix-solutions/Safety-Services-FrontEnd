import { Employee } from "./types";
import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

export const MOCK_EMPLOYEES: Employee[] = [
  // COMP-002 — present so switching tenants visibly changes the roster.
  {
    id: "EMP-101",
    tenantId: "COMP-002",
    userId: "u-8",
    employeeNumber: "EMP-0101",
    fullName: "ليلى الحداد",
    email: "layla.h@safetyshield.sa",
    phone: "+966 50 555 0101",
    role: "Company Admin",
    department: "Administration",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Layla",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "EMP-002-SHIELD",
    tenantId: "COMP-002",
    userId: "u-9",
    employeeNumber: "EMP-0102",
    fullName: "م. عمر الفارسي",
    email: "omar.f@safetyshield.sa",
    phone: "+966 50 555 0102",
    role: "Operations Officer",
    department: "Operations",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Omar",
    createdAt: "2026-02-03T08:00:00Z",
    updatedAt: "2026-02-03T08:00:00Z",
  },
  {
    id: "EMP-001",
    tenantId: "COMP-001",
    userId: "u-2",
    employeeNumber: "EMP-0001",
    fullName: "م. سارة القحطاني",
    email: "sarah.q@vertexindustrial.sa",
    phone: "+966 50 123 4561",
    role: "Company Admin",
    department: "Administration",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "EMP-002",
    tenantId: "COMP-001",
    userId: "u-4",
    employeeNumber: "EMP-0002",
    fullName: "م. فهد السبيعي",
    email: "fahad.s@vertexindustrial.sa",
    phone: "+966 50 123 4562",
    role: "Operations Officer",
    department: "Operations",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Fahad",
    createdAt: "2026-01-15T09:30:00Z",
    updatedAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "EMP-003",
    tenantId: "COMP-001",
    userId: "u-3",
    employeeNumber: "EMP-0003",
    fullName: "د. فيصل الدوسري",
    email: "faisal.d@vertexindustrial.sa",
    phone: "+966 50 123 4563",
    role: "Consulting Engineer",
    department: "Engineering",
    status: "Active",
    availabilityStatus: "Busy",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Faisal",
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "EMP-004",
    tenantId: "COMP-001",
    userId: "u-5",
    employeeNumber: "EMP-0004",
    fullName: "م. تركي العتيبي",
    email: "turki.o@vertexindustrial.sa",
    phone: "+966 50 123 4564",
    role: "Sales Agent",
    department: "Sales",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Turki",
    createdAt: "2026-02-10T14:15:00Z",
    updatedAt: "2026-02-10T14:15:00Z",
  },
  {
    id: "EMP-005",
    tenantId: "COMP-001",
    userId: "u-6",
    employeeNumber: "EMP-0005",
    fullName: "م. عبدالله المنصور",
    email: "abdullah.m@vertexindustrial.sa",
    phone: "+966 50 123 4565",
    role: "Consulting Engineer",
    department: "Engineering",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Abdullah",
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "EMP-006",
    tenantId: "COMP-001",
    userId: "u-7",
    employeeNumber: "EMP-0006",
    fullName: "نورة الشهري",
    email: "noura.s@vertexindustrial.sa",
    phone: "+966 50 123 4566",
    role: "Operations Officer",
    department: "Operations",
    status: "Inactive",
    availabilityStatus: "Unavailable",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Noura",
    createdAt: "2026-02-20T11:30:00Z",
    updatedAt: "2026-02-20T11:30:00Z",
  },
];

const STORAGE_KEY = "SSLM_EMPLOYEES_V3";

/**
 * Every employee on record, unscoped. Internal to this module: writes must
 * read the whole collection or a save would drop the other tenants' rows.
 */
function readAllEmployees(): Employee[] {
  if (typeof window === "undefined") return MOCK_EMPLOYEES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EMPLOYEES));
    return MOCK_EMPLOYEES;
  } catch (e) {
    console.error("Failed to load employees from storage", e);
    return MOCK_EMPLOYEES;
  }
}

export function getEmployees(ctx: TenantContext): Employee[] {
  if (typeof window === "undefined") return [];
  return scopeToTenant(readAllEmployees(), ctx);
}

export function saveEmployees(employees: Employee[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (e) {
    console.error("Failed to save employees to storage", e);
  }
}

export function createOrUpdateEmployee(employee: Employee): void {
  const list = readAllEmployees();
  const idx = list.findIndex((emp) => emp.id === employee.id);
  if (idx !== -1) {
    list[idx] = employee;
  } else {
    list.push(employee);
  }
  saveEmployees(list);
}
