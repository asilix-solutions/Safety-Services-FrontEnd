import { InstallationPhoto } from "./types";

const STORAGE_KEY = "SSLM_PHOTOS";

/** ONLY function in the domain allowed to read localStorage for photos (ADR-002). */
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

export function getPhotosByProject(projectId: string): InstallationPhoto[] {
  return listPhotos().filter((r) => r.projectId === projectId);
}
