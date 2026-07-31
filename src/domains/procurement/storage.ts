import { ProcurementRecord } from "./types";

const STORAGE_KEY = "SSLM_PROCUREMENT_V2";

/** ONLY function in the domain allowed to read localStorage for procurement (ADR-002). */
export function listProcurement(): ProcurementRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: ProcurementRecord[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to parse SSLM_PROCUREMENT from localStorage", err);
    return [];
  }
}

function saveProcurement(records: ProcurementRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to write SSLM_PROCUREMENT to localStorage", err);
  }
}

/** ONLY write path for procurement records (ADR-002) — called exclusively from workflow.ts. */
export function upsertProcurement(record: ProcurementRecord): ProcurementRecord {
  const records = listProcurement();
  const index = records.findIndex((r) => r.id === record.id);
  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }
  saveProcurement(records);
  return record;
}

export function getProcurementByProject(projectId: string): ProcurementRecord[] {
  return listProcurement().filter((r) => r.projectId === projectId);
}
