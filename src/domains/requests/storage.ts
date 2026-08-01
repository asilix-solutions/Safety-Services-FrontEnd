import { LicensingRequest } from "./types";
import { MOCK_REQUESTS } from "@/mock/requests";
import { mapStatusToStage } from "./workflow";
import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";

export function getRequests(): LicensingRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CLIENT_REQUESTS_V2");
    const list: LicensingRequest[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_CLIENT_REQUESTS", err);
    return [];
  }
}

export function saveRequests(requests: LicensingRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CLIENT_REQUESTS_V2", JSON.stringify(requests));
  } catch (err) {
    console.error("Failed to save SSLM_CLIENT_REQUESTS", err);
  }
}

/**
 * Every request, unscoped. Used by workflows that already hold a specific
 * record, and as the source for the scoped reader below. Not for UI lists —
 * use `getScopedRequests`.
 */
export function getMergedRequests(): LicensingRequest[] {
  const localList = getRequests();
  
  const mergedMap = new Map<string, LicensingRequest>();
  // 1. Load mock data first
  MOCK_REQUESTS.forEach((r) => {
    mergedMap.set(r.jobNumber, r);
  });
  // 2. Overwrite with local modifications
  localList.forEach((r) => {
    mergedMap.set(r.jobNumber, r);
  });

  const mergedList = Array.from(mergedMap.values()).map((r) => {
    const currentStage = r.currentStage || mapStatusToStage(r.status);
    let status = r.status;
    if ((currentStage === "QUOTATION" || currentStage === "QUOTATION_APPROVAL") && status === "submitted") {
      status = "quotation_created";
    }
    return {
      ...r,
      status,
      currentStage,
      assignedQueue: r.assignedQueue || (r.classification === "high_hazard_review" ? "HIGH_HAZARD" : r.classification === "engineering_project" ? "ENGINEERING" : r.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK")
    };
  });

  return mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Requests visible to the caller's tenant. The getter UI lists must use. */
export function getScopedRequests(ctx: TenantContext): LicensingRequest[] {
  return scopeToTenant(getMergedRequests(), ctx);
}

export function upsertRequest(request: LicensingRequest): void {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const localList = getRequests();
  const index = localList.findIndex((r) => r.jobNumber === request.jobNumber);
  if (index !== -1) {
    localList[index] = request;
  } else {
    localList.push(request);
  }
  saveRequests(localList);
}

export function getRequestDraft(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const draft = localStorage.getItem("SSLM_CLIENT_REQUEST_DRAFT_V2");
    return draft ? JSON.parse(draft) : null;
  } catch (err) {
    console.error("Failed to parse SSLM_CLIENT_REQUEST_DRAFT", err);
    return null;
  }
}

export function saveRequestDraft(draft: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CLIENT_REQUEST_DRAFT_V2", JSON.stringify(draft));
  } catch (err) {
    console.error("Failed to save SSLM_CLIENT_REQUEST_DRAFT", err);
  }
}

export function deleteRequestDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("SSLM_CLIENT_REQUEST_DRAFT_V2");
  } catch (err) {
    console.error("Failed to remove SSLM_CLIENT_REQUEST_DRAFT", err);
  }
}

/**
 * Active requests for one client, within the caller's tenant. The two layers
 * are applied as separate conditions: tenant first, then the client narrowing.
 */
export function getActiveRequests(
  ctx: TenantContext,
  userId?: string,
  companyId?: string
): LicensingRequest[] {
  const requests = getScopedRequests(ctx);
  const active = requests.filter((r) => r.status !== "completed" && r.status !== "closed");
  if (companyId) {
    return active.filter((r) => r.clientId === companyId);
  }
  if (userId) {
    return active.filter((r) => r.clientId === userId);
  }
  return active;
}

export function getEngineeringRequests(ctx: TenantContext): LicensingRequest[] {
  const requests = getScopedRequests(ctx);
  return requests.filter(
    (r) =>
      r.currentStage === "UNDER_REVIEW" &&
      (r.classification === "engineering_project" ||
        r.classification === "high_hazard_review" ||
        r.engineeringReviewRequired)
  );
}

/**
 * Unscoped single-record lookup. For workflows and write paths that already
 * hold, or are about to rewrite, a specific record. Never call this from a
 * page or feature to decide what a user may see — use the scoped reader below,
 * otherwise a job number from another tenant resolves and becomes actionable.
 */
export function getRequestByJobNumber(jobNumber: string): LicensingRequest | null {
  const list = getMergedRequests();
  return list.find((r) => r.jobNumber === jobNumber) || null;
}

/**
 * The reader every UI surface must use. Resolves the record, then applies the
 * same tenant rule as the list readers, so a request outside the caller's
 * tenant comes back as null rather than as a viewable — and decidable — page.
 */
export function getScopedRequestByJobNumber(
  jobNumber: string,
  ctx: TenantContext
): LicensingRequest | null {
  const found = getRequestByJobNumber(jobNumber);
  if (!found) return null;
  return scopeToTenant([found], ctx)[0] || null;
}

