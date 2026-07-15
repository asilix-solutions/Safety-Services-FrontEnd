import { ClosureDraft, ClosureRecord, ClosureStatus } from "./types";
import { getClosureByProject, upsertClosure } from "./storage";
import { getPhotoSummary } from "@/domains/photos";

/** AF-3: blocks creating a closure record without a bound signature/upload artifact. */
export function assertSignaturePresent(draft: Pick<ClosureDraft, "signatureImage">): void {
  if (!draft.signatureImage || draft.signatureImage.trim().length === 0) {
    throw new Error("A signature or a photo of the signed report is required to close the project.");
  }
}

/** SRS step 9 / AF-3: blocks closure until field readiness is documented with at least one installation photo. */
export function assertHasInstallationPhoto(projectId: string): void {
  if (getPhotoSummary(projectId).total === 0) {
    throw new Error("At least one installation photo is required to close the project.");
  }
}

/** WORM guard: a project can be closed only once — no re-close, no edit, no delete. */
export function assertNotClosed(projectId: string): void {
  if (getClosureByProject(projectId)) {
    throw new Error("This project has already been closed and the closure record is immutable.");
  }
}

/** ONLY write path for a closure record — validates, stamps audit fields, persists. */
export function createClosureRecord(
  draft: ClosureDraft,
  createdBy: { id: string; name: string }
): ClosureRecord {
  assertSignaturePresent(draft);
  assertHasInstallationPhoto(draft.projectId);
  assertNotClosed(draft.projectId);

  if (!draft.projectId) {
    throw new Error("Closure record requires a projectId.");
  }
  if (draft.method !== "canvas" && draft.method !== "upload") {
    throw new Error("Closure record requires a valid capture method.");
  }

  const record: ClosureRecord = {
    id: `CLOSURE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    projectId: draft.projectId,
    signatureImage: draft.signatureImage,
    method: draft.method,
    signedBy: draft.signedBy?.trim() || null,
    closedAt: new Date().toISOString(),
    closedBy: createdBy.name || createdBy.id,
    ipAddress: null,
  };

  return upsertClosure(record);
}

/** ADR-005 — centralized status selector; view-models must call this, never inspect storage directly. */
export function getClosureStatus(projectId: string): ClosureStatus {
  const record = getClosureByProject(projectId);
  if (!record) {
    return { isClosed: false, closedAt: null, closedBy: null, method: null };
  }
  return {
    isClosed: true,
    closedAt: record.closedAt,
    closedBy: record.closedBy,
    method: record.method,
  };
}
