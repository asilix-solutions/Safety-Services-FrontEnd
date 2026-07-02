import { Customer } from "./types";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c-101",
    tenantId: "c-101",
    companyName: "Vertex Development Ltd",
    commercialRegistration: "CR-908122",
    industry: "Real Estate Development",
    status: "Active",
    primaryContactName: "Sarah Jenkins",
    primaryContactEmail: "sarah.j@vertexindustrial.com",
    primaryContactPhone: "+971-50-1234567",
    city: "Dubai",
    address: "Vertex Tower, Marina Heights",
    representatives: [
      { id: "rep-1", name: "Sarah Jenkins", email: "sarah.j@vertexindustrial.com", phone: "+971-50-1234567", role: "Facility Manager" },
      { id: "rep-2", name: "Ahmed Al-Mansoori", email: "a.mansoori@vertexindustrial.com", phone: "+971-50-7654321", role: "Safety Inspector" }
    ],
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "c-102",
    tenantId: "c-102",
    companyName: "Gulf Petroleum",
    commercialRegistration: "CR-774431",
    industry: "Oil & Gas",
    status: "Active",
    primaryContactName: "Rayyan Al-Mansoor",
    primaryContactEmail: "rayyan@gulfpetroleum.com",
    primaryContactPhone: "+971-55-7654321",
    city: "Abu Dhabi",
    address: "Gulf Oil Tower, Corniche Road",
    representatives: [
      { id: "rep-3", name: "Rayyan Al-Mansoor", email: "rayyan@gulfpetroleum.com", phone: "+971-55-7654321", role: "Operations Director" }
    ],
    createdAt: "2024-06-10T11:00:00Z",
    updatedAt: "2026-06-03T11:20:00Z",
  },
  {
    id: "c-103",
    tenantId: "c-103",
    companyName: "Emaar Properties PJSC",
    commercialRegistration: "CR-334412",
    industry: "Real Estate & Infrastructure",
    status: "Active",
    primaryContactName: "David Sterling",
    primaryContactEmail: "d.sterling@emaar.ae",
    primaryContactPhone: "+971-4-3673333",
    city: "Dubai",
    address: "Emaar Square, Building 3",
    representatives: [
      { id: "rep-4", name: "David Sterling", email: "d.sterling@emaar.ae", phone: "+971-4-3673333", role: "Project Manager" }
    ],
    createdAt: "2023-09-01T08:00:00Z",
    updatedAt: "2026-06-01T14:30:00Z",
  },
  {
    id: "c-104",
    tenantId: "c-104",
    companyName: "Marina Mall LLC",
    commercialRegistration: "CR-882290",
    industry: "Retail & Leisure",
    status: "Active",
    primaryContactName: "Fatima Al-Hashimi",
    primaryContactEmail: "f.alhashimi@marinamall.com",
    primaryContactPhone: "+971-2-6812310",
    city: "Abu Dhabi",
    address: "Marina Mall Admin Office",
    representatives: [
      { id: "rep-5", name: "Fatima Al-Hashimi", email: "f.alhashimi@marinamall.com", phone: "+971-2-6812310", role: "Leasing Director" }
    ],
    createdAt: "2026-04-01T14:00:00Z",
    updatedAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "c-105",
    tenantId: "c-105",
    companyName: "City Transit Authority",
    commercialRegistration: "CR-110022",
    industry: "Public Transportation",
    status: "Inactive",
    primaryContactName: "Robert Miller",
    primaryContactEmail: "r.miller@citytransit.gov",
    primaryContactPhone: "+971-4-2844444",
    city: "Dubai",
    address: "Transit HQ, Al Garhoud",
    representatives: [
      { id: "rep-6", name: "Robert Miller", email: "r.miller@citytransit.gov", phone: "+971-4-2844444", role: "Safety Coordinator" }
    ],
    createdAt: "2026-05-10T10:00:00Z",
    updatedAt: "2026-05-15T10:45:00Z",
  }
];

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return MOCK_CUSTOMERS;
  try {
    const stored = localStorage.getItem("SSLM_CUSTOMERS");
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem("SSLM_CUSTOMERS", JSON.stringify(MOCK_CUSTOMERS));
      return MOCK_CUSTOMERS;
    }
  } catch (e) {
    console.error("Failed to load customers from storage", e);
    return MOCK_CUSTOMERS;
  }
}

export function getCustomerById(id: string): Customer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.id === id);
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CUSTOMERS", JSON.stringify(customers));
  } catch (e) {
    console.error("Failed to save customers to storage", e);
  }
}

export function createOrUpdateCustomer(customer: Customer): void {
  const list = getCustomers();
  const idx = list.findIndex((c) => c.id === customer.id);
  if (idx !== -1) {
    list[idx] = customer;
  } else {
    list.push(customer);
  }
  saveCustomers(list);
}

export function updateCustomerStatus(id: string, status: "Active" | "Inactive"): void {
  const list = getCustomers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    saveCustomers(list);
  }
}

export function generateCustomerId(): string {
  const list = getCustomers();
  const numericIds = list
    .map((c) => parseInt(c.id.replace("c-", "")))
    .filter((num) => !isNaN(num));
  const max = numericIds.length > 0 ? Math.max(...numericIds) : 100;
  return `c-${max + 1}`;
}
