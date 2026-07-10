export type LegalCategory = "internal" | "outsource";

export interface GeoTag {
  lat: number;
  lng: number;
}

export interface LaborRecord {
  id: string;
  projectId: string;
  workerName: string;
  fieldRole: string;
  legalCategory: LegalCategory;
  agreedWage: number;
  settled: boolean;
  settledAt: string | null;
  settledBy: string | null;
  geoTag: GeoTag | null;
  /** Real client IP is not obtainable in the browser; the backend fills this post-MVP. */
  ipAddress: null;
  createdAt: string;
  createdBy: string;
}

/** Input shape submitted by the Labor form before the domain computes cost and stamps audit fields. */
export interface LaborDraft {
  projectId: string;
  workerName: string;
  fieldRole: string;
  legalCategory: LegalCategory;
  agreedWage: number;
}

/** Centralized KPI shape for the Labor tab (ADR-005) — never recomputed inline in the UI. */
export interface LaborSummary {
  headcount: number;
  internalCount: number;
  outsourceCount: number;
  totalOutsourceCost: number;
  unsettledOutsourceCount: number;
}
