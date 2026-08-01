import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { InstallationPhoto } from "./types";

const STORAGE_KEY = "SSLM_PHOTOS_V2";

/**
 * Every installation photo, unscoped. ONLY function in the domain allowed to read
 * localStorage for photos (ADR-002).
 *
 * Internal: write paths and the closure gate need the full set. UI must never
 * call this; use `getScopedPhotosByProject`.
 */
export function listPhotos(): InstallationPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: InstallationPhoto[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_PHOTOS from localStorage", err);
    return [];
  }
}

function savePhotos(records: InstallationPhoto[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to write SSLM_PHOTOS to localStorage", err);
  }
}

/** ONLY write path for installation photo records (ADR-002) — called exclusively from workflow.ts. */
export function upsertPhoto(record: InstallationPhoto): InstallationPhoto {
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
  const records = listPhotos();
  const index = records.findIndex((r) => r.id === record.id);
  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }
  savePhotos(records);
  return record;
}

/**
 * Unscoped: for the closure gate and write paths that already hold a specific
 * projectId. Not for display.
 */
export function getPhotosByProject(projectId: string): InstallationPhoto[] {
  return listPhotos().filter((r) => r.projectId === projectId);
}

/**
 * The project's photos visible to the caller's tenant. The getter the UI must use.
 * Fails closed via `scopeToTenant` — another tenant sees an empty gallery.
 */
export function getScopedPhotosByProject(
  projectId: string,
  ctx: TenantContext
): InstallationPhoto[] {
  return scopeToTenant(getPhotosByProject(projectId), ctx);
}
