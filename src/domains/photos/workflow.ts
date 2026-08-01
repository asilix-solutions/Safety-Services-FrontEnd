import { SiloTag } from "@/domains/procurement/types";
import { TenantContext } from "@/domains/tenancy/types";
import { PhotoDraft, InstallationPhoto, PhotoSummary } from "./types";
import { getPhotosByProject, getScopedPhotosByProject, upsertPhoto } from "./storage";

const SILO_TAGS: SiloTag[] = ["alarm", "suppression", "ventilation"];

/** SRS UC step 7 / FR-OPS-05: blocks saving an installation photo record without a captured image. */
export function assertImagePresent(draft: Pick<PhotoDraft, "image">): void {
  if (!draft.image || draft.image.trim().length === 0) {
    throw new Error("An installation photo is required before saving.");
  }
}

/** ONLY write path for a new installation photo record — validates, stamps audit fields. */
export function createPhotoRecord(
  draft: PhotoDraft,
  createdBy: { id: string; name: string }
): InstallationPhoto {
  assertImagePresent(draft);

  if (!draft.projectId) {
    throw new Error("Installation photo record requires a projectId.");
  }
  // Fails closed: an untenanted photo is invisible to scoped reads for everyone
  // except a Super Admin, so refuse to create one rather than write an orphan.
  if (!draft.tenantId) {
    throw new Error("Installation photo record requires the capturing user's tenantId.");
  }

  const record: InstallationPhoto = {
    id: `PHOTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tenantId: draft.tenantId,
    projectId: draft.projectId,
    siloTag: draft.siloTag,
    caption: draft.caption?.trim() || undefined,
    image: draft.image,
    createdAt: new Date().toISOString(),
    createdBy: createdBy.name || createdBy.id,
  };

  return upsertPhoto(record);
}

function summarize(records: InstallationPhoto[]): PhotoSummary {
  const bySilo = SILO_TAGS.reduce((acc, silo) => {
    acc[silo] = 0;
    return acc;
  }, {} as Record<SiloTag, number>);

  records.forEach((record) => {
    bySilo[record.siloTag] += 1;
  });

  return { total: records.length, bySilo };
}

/**
 * Unscoped KPI selector — for the closure gate only.
 *
 * The gate asks whether the project has field evidence at all, so it must count
 * every row. Scoping it would let a caller who cannot see the photos conclude
 * none exist and weaken the gate.
 */
export function getPhotoSummary(projectId: string): PhotoSummary {
  return summarize(getPhotosByProject(projectId));
}

/** ADR-005 — centralized KPI selector for display; view-models must call this, never sum records inline. */
export function getScopedPhotoSummary(projectId: string, ctx: TenantContext): PhotoSummary {
  return summarize(getScopedPhotosByProject(projectId, ctx));
}
