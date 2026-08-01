import { scopeToTenant, scopeToClient } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { Report } from "./types";
import { MOCK_REPORTS } from "@/mock/reports";

export { MOCK_REPORTS };

const STORAGE_KEY = "SSLM_REPORTS_V2";

/**
 * Every report, unscoped. ONLY function in the domain allowed to read
 * localStorage for reports (ADR-002).
 *
 * Internal: the write path and the report-number sequence need the full set —
 * a scoped read would let one tenant reuse another tenant's sequence number, and
 * would make `createOrUpdateReport` persist a list with every other tenant's row
 * dropped. UI must never call this; use `getScopedReports`.
 */
export function listReports(): Report[] {
  if (typeof window === "undefined") return MOCK_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_REPORTS));
  } catch (err) {
    console.error("Failed to load reports from storage", err);
  }
  return MOCK_REPORTS;
}

function saveReports(reports: Report[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Failed to save reports to storage", err);
  }
}

/** ONLY write path for reports (ADR-002) — called exclusively from workflow.ts. */
export function createOrUpdateReport(report: Report): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const reports = listReports();
  const index = reports.findIndex((r) => r.id === report.id);
  if (index !== -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  saveReports(reports);
}

/**
 * Unscoped single read, for write paths that already hold a specific report id.
 * Not for display — use `getScopedReportById`.
 */
export function getReportById(id: string): Report | null {
  return listReports().find((r) => r.id === id) || null;
}

/**
 * The reports visible to the caller. The getter the UI must use.
 *
 * Fails closed via `scopeToTenant`: without a tenantId the result is empty, so a
 * half-initialised context can never be mistaken for a cross-tenant reader. The
 * client boundary is applied after the tenant boundary, never instead of it.
 */
export function getScopedReports(ctx: TenantContext): Report[] {
  return scopeToClient(scopeToTenant(listReports(), ctx), ctx);
}

/**
 * A single report, or null when it belongs to another tenant.
 *
 * Returning null rather than the record keeps a foreign id indistinguishable
 * from a missing one, so an id guessed from a report number leaks nothing.
 */
export function getScopedReportById(id: string, ctx: TenantContext): Report | null {
  const report = getReportById(id);
  if (!report) return null;
  return scopeToTenant([report], ctx)[0] ?? null;
}
