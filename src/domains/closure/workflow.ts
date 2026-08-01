import { Project } from "@/types/project";
import { TenantContext } from "@/domains/tenancy/types";
import { ClosureDraft, ClosureRecord, ClosureStatus } from "./types";
import { getClosureByProject, getScopedClosureByProject, upsertClosure } from "./storage";
import { getPhotoSummary } from "@/domains/photos";
import { getProjectById } from "@/domains/projects/storage";
import { getRequestByJobNumber } from "@/domains/requests/storage";
import { completeProjectExecution } from "@/domains/projects/workflow/completion";
import { canCompleteExecution } from "@/domains/workflow-validation";

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

/**
 * Resolves the project being closed and refuses a cross-tenant close.
 *
 * Reads the project unscoped on purpose: a scoped read returns null for a
 * foreign project, which is indistinguishable from "does not exist" and would
 * let the mismatch pass as a plain not-found instead of being rejected.
 */
export function resolveClosableProject(projectId: string, tenantId: string): Project {
  const project = getProjectById(projectId);
  if (!project) {
    throw new Error("Closure requires an existing project.");
  }
  if (project.tenantId !== tenantId) {
    throw new Error("A project may only be closed by its owning tenant.");
  }
  return project;
}

/**
 * ONLY write path for a closure record — validates, stamps audit fields, persists,
 * then advances the project.
 *
 * SRS FR-OPS-10: the signed/stamped report *is* the Complete-Ticket lock, so closing
 * hands off to `completeProjectExecution` rather than writing an execution phase
 * here — the phase transition and its guards have exactly one owner (ADR-003).
 *
 * Every precondition, including the project's own, is checked before the record is
 * written. The closure record is WORM: a failure after the write would leave a
 * project closed on paper but never advanced, and `assertNotClosed` would block the
 * retry that fixes it.
 */
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
  // Fails closed: an untenanted record is invisible to scoped reads for everyone
  // except a Super Admin, so refuse to create one rather than write an orphan.
  if (!draft.tenantId) {
    throw new Error("Closure record requires the closing user's tenantId.");
  }
  if (draft.method !== "canvas" && draft.method !== "upload") {
    throw new Error("Closure record requires a valid capture method.");
  }

  const project = resolveClosableProject(draft.projectId, draft.tenantId);
  const request = project.jobNumber ? getRequestByJobNumber(project.jobNumber) : null;

  // Dry-run the project guard before the irreversible write, so a project that
  // cannot advance is rejected instead of being locked out of ever closing.
  const transitionCheck = canCompleteExecution(project, request);
  if (!transitionCheck.valid) {
    throw new Error(transitionCheck.reason);
  }

  const record: ClosureRecord = {
    id: `CLOSURE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tenantId: draft.tenantId,
    projectId: draft.projectId,
    signatureImage: draft.signatureImage,
    method: draft.method,
    signedBy: draft.signedBy?.trim() || null,
    closedAt: new Date().toISOString(),
    closedBy: createdBy.name || createdBy.id,
    ipAddress: null,
  };

  const saved = upsertClosure(record);

  // Owned by domains/projects: advances the phase, syncs the request stage, appends
  // the timeline event and persists both. Nothing about the project is written here.
  completeProjectExecution({
    project,
    request,
    completionNotes: `Project closed against the signed and stamped inspection report by ${saved.closedBy}.`,
  });

  return saved;
}

/**
 * ADR-005 — centralized status selector; view-models must call this, never inspect
 * storage directly. Tenant-scoped: this feeds the UI, so another tenant's closure
 * must read as "not closed" rather than leaking its closer and timestamp.
 */
export function getClosureStatus(projectId: string, ctx: TenantContext): ClosureStatus {
  const record = getScopedClosureByProject(projectId, ctx);
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
