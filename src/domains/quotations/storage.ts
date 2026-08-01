import { Quotation } from "./types";
import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

/**
 * Every quotation, unscoped. Internal: writes must read the whole collection
 * or a save would drop the other tenants' rows.
 */
export function getQuotations(): Quotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_QUOTATIONS_V2");
    const list: Quotation[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_QUOTATIONS", err);
    return [];
  }
}

export function saveQuotations(quotations: Quotation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_QUOTATIONS_V2", JSON.stringify(quotations));
  } catch (err) {
    console.error("Failed to save SSLM_QUOTATIONS", err);
  }
}

/** Quotations visible to the caller's tenant. The getter UI lists must use. */
export function getScopedQuotations(ctx: TenantContext): Quotation[] {
  return scopeToTenant(getQuotations(), ctx);
}

export function createOrUpdateQuotation(quotation: Quotation): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const quotations = getQuotations();
  const index = quotations.findIndex((q) => q.jobNumber === quotation.jobNumber);
  if (index !== -1) {
    quotations[index] = quotation;
  } else {
    quotations.push(quotation);
  }
  saveQuotations(quotations);
}

export function getPendingQuotationApprovals(ctx: TenantContext): Quotation[] {
  return getScopedQuotations(ctx).filter((q) => q.quotationStatus === "SUBMITTED_FOR_APPROVAL");
}

export function getPendingQuotations(ctx: TenantContext): Quotation[] {
  return getScopedQuotations(ctx).filter(
    (q) => q.quotationStatus === "DRAFT" || q.quotationStatus === "CHANGES_REQUESTED"
  );
}

/**
 * A single quotation by job number, unscoped.
 *
 * Internal: for write paths and duplicate guards that already hold a specific
 * job number and must see the row whoever owns it. UI must never call this —
 * use `getScopedQuotationByJobNumber`.
 */
export function getQuotationByJobNumber(jobNumber: string): Quotation | null {
  const list = getQuotations();
  return list.find((q) => q.jobNumber === jobNumber) || null;
}

/**
 * The single-record reader every UI surface must use.
 *
 * Resolves the record, then applies the same tenant rule as the list readers,
 * so a quotation outside the caller's tenant comes back as null rather than as
 * a viewable page. Returning null rather than the record keeps a foreign job
 * number indistinguishable from a missing one, so an id guessed from the
 * `SSLM-YYYY-NNNNNN` sequence leaks nothing.
 *
 * Super Admin still reads across tenants — `scopeToTenant` short-circuits on
 * `isCrossTenant` before any filtering.
 */
export function getScopedQuotationByJobNumber(
  jobNumber: string,
  ctx: TenantContext
): Quotation | null {
  const found = getQuotationByJobNumber(jobNumber);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] ?? null;
}

