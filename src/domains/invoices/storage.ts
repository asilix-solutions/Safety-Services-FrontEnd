import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { ClientInvoice } from "./types";

export function getInvoices(): ClientInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_INVOICES_V2");
    const list: ClientInvoice[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_INVOICES from localStorage", err);
    return [];
  }
}

export function saveInvoices(invoices: ClientInvoice[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_INVOICES_V2", JSON.stringify(invoices));
  } catch (err) {
    console.error("Failed to write SSLM_INVOICES to localStorage", err);
  }
}

export function createOrUpdateInvoice(invoice: ClientInvoice): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === invoice.id || i.jobNumber === invoice.jobNumber);
  if (index !== -1) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  saveInvoices(invoices);
}

const MOCK_INVOICES: ClientInvoice[] = [
  {
    id: "INV-2026-001",
    tenantId: "COMP-001",
    clientId: "c-102", // client companyId
    jobNumber: "SSLM-2026-000001",
    quotationJobNumber: "SSLM-2026-000001",
    subtotal: 5000,
    vatAmount: 750,
    grandTotal: 5750,
    currency: "SAR",
    status: "unpaid",
    dueDate: "2026-07-28T00:00:00Z",
    issuedAt: "2026-06-25T08:00:00Z",
  },
  {
    id: "INV-2026-002",
    tenantId: "COMP-001",
    clientId: "c-103", // client companyId
    jobNumber: "SSLM-2026-000002",
    quotationJobNumber: "SSLM-2026-000002",
    subtotal: 12000,
    vatAmount: 1800,
    grandTotal: 13800,
    currency: "SAR",
    // Unpaid on purpose: SSLM-2026-000002 is seeded at UNDER_REVIEW, so a paid
    // invoice here would be an orphan — no payment record, no quotation behind
    // it — and would deadlock the request. See the commit message.
    status: "unpaid",
    dueDate: "2026-06-30T00:00:00Z",
    issuedAt: "2026-05-31T09:00:00Z",
  }
];

export function getMergedInvoices(): ClientInvoice[] {
  const localList = getInvoices();
  const hasOldSchema = localList.length > 0 && localList.some(inv => !inv.clientId);
  
  if (localList.length === 0 || hasOldSchema) {
    // Seed initial mock invoices if local storage is clean or outdated
    saveInvoices(MOCK_INVOICES);
    return [...MOCK_INVOICES].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  // Merge mock invoices and local modifications safely
  const mergedMap = new Map<string, ClientInvoice>();
  MOCK_INVOICES.forEach((inv) => {
    mergedMap.set(inv.id, inv);
  });
  localList.forEach((inv) => {
    mergedMap.set(inv.id, inv);
  });

  return Array.from(mergedMap.values()).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
}

/** Invoices visible to the caller's tenant. The getter UI lists must use. */
export function getScopedInvoices(ctx: TenantContext): ClientInvoice[] {
  return scopeToTenant(getMergedInvoices(), ctx);
}

/**
 * Unpaid invoices for one client, within the caller's tenant. Tenant boundary
 * first, then the client narrowing — kept as separate conditions.
 */
export function getUnpaidInvoices(
  ctx: TenantContext,
  userId?: string,
  companyId?: string
): ClientInvoice[] {
  const invoices = getScopedInvoices(ctx);
  const unpaid = invoices.filter((i) => i.status === "unpaid");
  if (companyId) {
    return unpaid.filter((i) => i.clientId === companyId);
  }
  if (userId) {
    return unpaid.filter((i) => i.clientId === userId);
  }
  return unpaid;
}

export function getInvoiceByJobNumber(jobNumber: string): ClientInvoice | null {
  const list = getMergedInvoices();
  return list.find((i) => i.jobNumber === jobNumber) || null;
}

