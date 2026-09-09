import { Customer } from "./types";
import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c-101",
    tenantId: "COMP-001",
    companyName: "شركة تطوير فيرتكس المحدودة",
    commercialRegistration: "1010908122",
    industry: "التطوير العقاري",
    status: "Active",
    primaryContactName: "سارة العامري",
    primaryContactEmail: "sarah.a@vertex.sa",
    primaryContactPhone: "+966 50 123 4567",
    city: "الرياض",
    address: "الرياض - طريق الملك فهد، حي العليا",
    representatives: [
      { id: "rep-1", name: "سارة العامري", email: "sarah.a@vertex.sa", phone: "+966 50 123 4567", role: "مدير المرافق" },
      { id: "rep-2", name: "م. أحمد المنصوري", email: "a.mansoori@vertex.sa", phone: "+966 50 765 4321", role: "مفتش السلامة" }
    ],
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "c-102",
    tenantId: "COMP-001",
    companyName: "شركة إعمار العقارية",
    commercialRegistration: "1010334412",
    industry: "التطوير العقاري والبنية التحتية",
    status: "Active",
    primaryContactName: "داوود الصالح",
    primaryContactEmail: "d.saleh@emaar.sa",
    primaryContactPhone: "+966 54 367 3333",
    city: "جدة",
    address: "جدة - طريق الكورنيش، مجمع إعمار",
    representatives: [
      { id: "rep-4", name: "داوود الصالح", email: "d.saleh@emaar.sa", phone: "+966 54 367 3333", role: "مدير المشروع" }
    ],
    createdAt: "2023-09-01T08:00:00Z",
    updatedAt: "2026-06-01T14:30:00Z",
  },
  {
    id: "c-103",
    tenantId: "COMP-001",
    companyName: "شركة بترول الخليج للطاقة",
    commercialRegistration: "2050774431",
    industry: "النفط والغاز",
    status: "Active",
    primaryContactName: "ريان المنصور",
    primaryContactEmail: "rayyan@gulfpetroleum.sa",
    primaryContactPhone: "+966 55 765 4321",
    city: "الدمام",
    address: "الدمام - طريق الأمير محمد بن فهد",
    representatives: [
      { id: "rep-3", name: "ريان المنصور", email: "rayyan@gulfpetroleum.sa", phone: "+966 55 765 4321", role: "مدير العمليات" }
    ],
    createdAt: "2024-06-10T11:00:00Z",
    updatedAt: "2026-06-03T11:20:00Z",
  },
  {
    id: "c-104",
    tenantId: "COMP-002",
    companyName: "شركة مارينا سنتر التجارية",
    commercialRegistration: "1010882290",
    industry: "التجزئة والترفيه",
    status: "Active",
    primaryContactName: "فاطمة الهاشمي",
    primaryContactEmail: "f.alhashimi@marina.sa",
    primaryContactPhone: "+966 50 681 2310",
    city: "الرياض",
    address: "الرياض - الطريق الدائري الشمالي",
    representatives: [
      { id: "rep-5", name: "فاطمة الهاشمي", email: "f.alhashimi@marina.sa", phone: "+966 50 681 2310", role: "مدير التأجير" }
    ],
    createdAt: "2026-04-01T14:00:00Z",
    updatedAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "c-105",
    tenantId: "COMP-002",
    companyName: "هيئة النقل العام",
    commercialRegistration: "7001100223",
    industry: "النقل العام",
    status: "Inactive",
    primaryContactName: "عبدالله المطيري",
    primaryContactEmail: "a.mutairi@transit.gov.sa",
    primaryContactPhone: "+966 56 284 4444",
    city: "الرياض",
    address: "الرياض - تقاطع العليا مع طريق خريص",
    representatives: [
      { id: "rep-6", name: "عبدالله المطيري", email: "a.mutairi@transit.gov.sa", phone: "+966 56 284 4444", role: "منسق السلامة" }
    ],
    createdAt: "2026-05-10T10:00:00Z",
    updatedAt: "2026-05-15T10:45:00Z",
  }
];

const STORAGE_KEY = "SSLM_CUSTOMERS_V3";

/**
 * Every customer on record, unscoped. Internal: writes must read the whole
 * collection or a save would drop the other tenants' rows.
 */
function readAllCustomers(): Customer[] {
  if (typeof window === "undefined") return MOCK_CUSTOMERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS));
      return MOCK_CUSTOMERS;
    }
  } catch (e) {
    console.error("Failed to load customers from storage", e);
    return MOCK_CUSTOMERS;
  }
}

export function getCustomers(ctx: TenantContext): Customer[] {
  if (typeof window === "undefined") return [];
  return scopeToTenant(readAllCustomers(), ctx);
}

export function getCustomerById(id: string): Customer | undefined {
  return readAllCustomers().find((c) => c.id === id);
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error("Failed to save customers to storage", e);
  }
}

export function createOrUpdateCustomer(customer: Customer): void {
  const list = readAllCustomers();
  const idx = list.findIndex((c) => c.id === customer.id);
  if (idx !== -1) {
    list[idx] = customer;
  } else {
    list.push(customer);
  }
  saveCustomers(list);
}

export function updateCustomerStatus(id: string, status: "Active" | "Inactive"): void {
  const list = readAllCustomers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    saveCustomers(list);
  }
}

export function generateCustomerId(): string {
  const list = readAllCustomers();
  const numericIds = list
    .map((c) => parseInt(c.id.replace("c-", "")))
    .filter((num) => !isNaN(num));
  const max = numericIds.length > 0 ? Math.max(...numericIds) : 100;
  return `c-${max + 1}`;
}
