import { ClosureRecord } from "./types";

const STORAGE_KEY = "SSLM_CLOSURE";

/** ONLY function in the domain allowed to read localStorage for closure (ADR-002). */
export function listClosure(): ClosureRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse SSLM_CLOSURE from localStorage", err);
    return [];
  }
}

function saveClosure(records: ClosureRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to write SSLM_CLOSURE to localStorage", err);
  }
}

/** ONLY write path for closure records (ADR-002) — called exclusively from workflow.ts. */
export function upsertClosure(record: ClosureRecord): ClosureRecord {
  const records = listClosure();
  const index = records.findIndex((r) => r.id === record.id);
  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }
  saveClosure(records);
  return record;
}

/** One closure record per project — a project either has none or exactly one. */
export function getClosureByProject(projectId: string): ClosureRecord | null {
  return listClosure().find((r) => r.projectId === projectId) ?? null;
}
