import { LaborRecord } from "./types";

const STORAGE_KEY = "SSLM_LABOR_V2";

/** ONLY function in the domain allowed to read localStorage for labor (ADR-002). */
export function listLabor(): LaborRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: LaborRecord[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_LABOR from localStorage", err);
    return [];
  }
}

function saveLabor(records: LaborRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to write SSLM_LABOR to localStorage", err);
  }
}

/** ONLY write path for labor records (ADR-002) — called exclusively from workflow.ts. */
export function upsertLabor(record: LaborRecord): LaborRecord {
  const records = listLabor();
  const index = records.findIndex((r) => r.id === record.id);
  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }
  saveLabor(records);
  return record;
}

export function getLaborByProject(projectId: string): LaborRecord[] {
  return listLabor().filter((r) => r.projectId === projectId);
}

export function getLaborRecordById(id: string): LaborRecord | undefined {
  return listLabor().find((r) => r.id === id);
}
