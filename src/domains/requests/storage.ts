import { LicensingRequest } from "./types";
import { MOCK_REQUESTS } from "@/mock/requests";
import { mapStatusToStage } from "./workflow";

export function getRequests(): LicensingRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CLIENT_REQUESTS");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CLIENT_REQUESTS", err);
    return [];
  }
}

export function saveRequests(requests: LicensingRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(requests));
  } catch (err) {
    console.error("Failed to save SSLM_CLIENT_REQUESTS", err);
  }
}

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

  return Array.from(mergedMap.values()).map((r) => ({
    ...r,
    currentStage: r.currentStage || mapStatusToStage(r.status),
    assignedQueue: r.assignedQueue || (r.classification === "high_hazard_review" ? "HIGH_HAZARD" : r.classification === "engineering_project" ? "ENGINEERING" : r.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK")
  }));
}

export function upsertRequest(request: LicensingRequest): void {
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
    const draft = localStorage.getItem("SSLM_CLIENT_REQUEST_DRAFT");
    return draft ? JSON.parse(draft) : null;
  } catch (err) {
    console.error("Failed to parse SSLM_CLIENT_REQUEST_DRAFT", err);
    return null;
  }
}

export function saveRequestDraft(draft: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_CLIENT_REQUEST_DRAFT", JSON.stringify(draft));
  } catch (err) {
    console.error("Failed to save SSLM_CLIENT_REQUEST_DRAFT", err);
  }
}

export function deleteRequestDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("SSLM_CLIENT_REQUEST_DRAFT");
  } catch (err) {
    console.error("Failed to remove SSLM_CLIENT_REQUEST_DRAFT", err);
  }
}
