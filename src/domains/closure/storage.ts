import { scopeToTenant } from "@/domains/tenancy";
import { TenantContext } from "@/domains/tenancy/types";
import { ClosureRecord } from "./types";

const STORAGE_KEY = "SSLM_CLOSURE_V2";

/**
 * Every closure record, unscoped. ONLY function in the domain allowed to read
 * localStorage for closure (ADR-002).
 *
 * Internal: write paths and the WORM guard need the full set — a scoped read
 * would let one tenant re-close a project it cannot see. UI must never call
 * this; use `getScopedClosureByProject`.
 */
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
  // Unscoped on purpose: saving a scoped list would drop other tenants' rows.
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

/**
 * One closure record per project — a project either has none or exactly one.
 *
 * Unscoped: for the WORM guard and write paths that already hold a specific
 * projectId. Not for display.
 */
export function getClosureByProject(projectId: string): ClosureRecord | null {
  return listClosure().find((r) => r.projectId === projectId) ?? null;
}

/**
 * The closure record visible to the caller's tenant. The getter the UI must use.
 *
 * Fails closed via `scopeToTenant`: a caller from another tenant sees `null`,
 * which reads as "not closed" rather than exposing another company's signed
 * report image and closer identity.
 */
export function getScopedClosureByProject(
  projectId: string,
  ctx: TenantContext
): ClosureRecord | null {
  const record = getClosureByProject(projectId);
  if (!record) return null;
  return scopeToTenant([record], ctx)[0] ?? null;
}
