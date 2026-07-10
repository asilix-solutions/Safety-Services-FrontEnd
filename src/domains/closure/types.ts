export type ClosureMethod = "canvas" | "upload";

export interface ClosureRecord {
  id: string;
  projectId: string;
  /** Base64 data URI of the drawn signature or the uploaded photo of the signed report. */
  signatureImage: string;
  method: ClosureMethod;
  signedBy: string | null;
  closedAt: string;
  closedBy: string;
  /** Real client IP is not obtainable in the browser; the backend fills this post-MVP. */
  ipAddress: null;
}

/** Input shape submitted by the Closure form before the domain stamps audit fields. */
export interface ClosureDraft {
  projectId: string;
  signatureImage: string;
  method: ClosureMethod;
  signedBy?: string;
}

/** Centralized status shape for the Completion tab (ADR-005) — never derived inline in the UI. */
export interface ClosureStatus {
  isClosed: boolean;
  closedAt: string | null;
  closedBy: string | null;
  method: ClosureMethod | null;
}
