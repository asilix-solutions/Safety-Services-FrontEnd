import { SiloTag } from "@/domains/procurement/types";

export type { SiloTag };

export interface InstallationPhoto {
  id: string;
  /**
   * Owning safety company. Stamped from the capturing user, or the photo would be
   * invisible to its own tenant. Optional only so pre-tenancy rows still parse —
   * those fail closed under `scopeToTenant` rather than leaking.
   */
  tenantId?: string;
  projectId: string;
  siloTag: SiloTag;
  /** Optional short field note captured alongside the photo. */
  caption?: string;
  /** Base64 data URI of the live-captured (or uploaded) installation photo, compressed client-side. */
  image: string;
  createdAt: string;
  createdBy: string;
}

/** Input shape submitted by the Photos form before the domain stamps audit fields. */
export interface PhotoDraft {
  projectId: string;
  /** Caller's tenant. The domain refuses to write a photo record without it (fails closed). */
  tenantId?: string;
  siloTag: SiloTag;
  caption?: string;
  image: string;
}

/** Centralized KPI shape for the Photos tab (ADR-005) — never recomputed inline in the UI. */
export interface PhotoSummary {
  total: number;
  bySilo: Record<SiloTag, number>;
}
