import { LicensingRequest } from "./types";
import { MOCK_REQUESTS } from "@/mock/requests";
import { mapStatusToStage } from "./workflow";

export function getRequests(): LicensingRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("SSLM_CLIENT_REQUESTS");
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

  const mergedList = Array.from(mergedMap.values()).map((r) => ({
    ...r,
    currentStage: r.currentStage || mapStatusToStage(r.status),
    assignedQueue: r.assignedQueue || (r.classification === "high_hazard_review" ? "HIGH_HAZARD" : r.classification === "engineering_project" ? "ENGINEERING" : r.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK")
  }));

  return mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

export function getActiveRequests(userId?: string, companyId?: string): LicensingRequest[] {
  const requests = getMergedRequests();
  const active = requests.filter((r) => r.status !== "completed" && r.status !== "closed");
  if (companyId) {
    return active.filter((r) => r.clientId === companyId);
  }
  if (userId) {
    return active.filter((r) => r.clientId === userId);
  }
  return active;
}

export function getEngineeringRequests(): LicensingRequest[] {
  const requests = getMergedRequests();
  return requests.filter(
    (r) =>
      r.currentStage === "UNDER_REVIEW" &&
      (r.classification === "engineering_project" ||
        r.classification === "high_hazard_review" ||
        r.engineeringReviewRequired)
  );
}

