import { EngineeringReviewRecord } from "./types";

const STORAGE_KEY = "SSLM_ENGINEERING_REVIEWS";

export function getEngineeringReviews(): EngineeringReviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse engineering reviews", err);
    return [];
  }
}

export function getEngineeringReviewByJobNumber(jobNumber: string): EngineeringReviewRecord {
  const list = getEngineeringReviews();
  const found = list.find((r) => r.jobNumber === jobNumber);
  if (found) {
    return found;
  }
  return {
    jobNumber,
    status: "PENDING",
    notes: "",
  };
}

export function saveEngineeringReview(record: EngineeringReviewRecord): void {
  if (typeof window === "undefined") return;
  try {
    const list = getEngineeringReviews();
    const index = list.findIndex((r) => r.jobNumber === record.jobNumber);
    const updatedRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    if (index !== -1) {
      list[index] = updatedRecord;
    } else {
      list.push(updatedRecord);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save engineering review", err);
  }
}
