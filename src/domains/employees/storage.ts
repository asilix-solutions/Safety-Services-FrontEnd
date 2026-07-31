import { Employee } from "./types";
import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    tenantId: "COMP-001",
    userId: "u-2",
    employeeNumber: "EMP-0001",
    fullName: "Sarah Jenkins",
    email: "sarah.j@vertexindustrial.com",
    phone: "+966501234561",
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
    fullName: "Elena Rostova",
    email: "elena.r@vertexindustrial.com",
    phone: "+966501234562",
    role: "Operations Officer",
    department: "Operations",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Elena",
    createdAt: "2026-01-15T09:30:00Z",
    updatedAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "EMP-003",
    tenantId: "COMP-001",
    userId: "u-3",
    employeeNumber: "EMP-0003",
    fullName: "Dr. Marcus Vance",
    email: "marcus.v@safetysystem.com",
    phone: "+966501234563",
    role: "Consulting Engineer",
    department: "Engineering",
    status: "Active",
    availabilityStatus: "Busy",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "EMP-004",
    tenantId: "COMP-001",
    userId: "u-5",
    employeeNumber: "EMP-0004",
    fullName: "James Sterling",
    email: "james.s@safetysystem.com",
    phone: "+966501234564",
    role: "Sales Agent",
    department: "Sales",
    status: "Active",
    availabilityStatus: "Available",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=James",
    createdAt: "2026-02-10T14:15:00Z",
    updatedAt: "2026-02-10T14:15:00Z",
  },
];

/**
 * Every employee on record, unscoped. Internal to this module: writes must
 * read the whole collection or a save would drop the other tenants' rows.
 */
function readAllEmployees(): Employee[] {
  if (typeof window === "undefined") return MOCK_EMPLOYEES;
  try {
    const stored = localStorage.getItem("SSLM_EMPLOYEES_V2");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("SSLM_EMPLOYEES_V2", JSON.stringify(MOCK_EMPLOYEES));
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
    localStorage.setItem("SSLM_EMPLOYEES_V2", JSON.stringify(employees));
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
