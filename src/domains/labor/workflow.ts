import { GeoTag, LaborDraft, LaborRecord, LaborSummary, LegalCategory } from "./types";
import { getLaborByProject, getLaborRecordById, upsertLabor } from "./storage";

/** SRS UC step 5: the ONLY place the internal/outsource cost rule is applied. */
export function computeLaborCost(category: LegalCategory, wage: number): number {
  if (category === "internal") return 0;
  const safeWage = Number.isFinite(wage) && wage > 0 ? wage : 0;
  return safeWage;
}

/** WORM guard (MVP): once settled, a labor record is immutable — any further mutation throws. */
function assertNotSettled(record: LaborRecord): void {
  if (record.settled) {
    throw new Error("This labor record has already been settled and can no longer be modified.");
  }
}

/** ONLY write path for a new labor record — validates, computes cost, stamps audit fields. */
export function createLaborRecord(
  draft: LaborDraft,
  createdBy: { id: string; name: string }
): LaborRecord {
  if (!draft.projectId) {
    throw new Error("Labor record requires a projectId.");
  }
  if (!draft.workerName || draft.workerName.trim().length < 2) {
    throw new Error("Labor record requires a valid worker name.");
  }
  if (!draft.fieldRole || draft.fieldRole.trim().length < 2) {
    throw new Error("Labor record requires a valid field role.");
  }
  if (draft.legalCategory === "outsource" && (!Number.isFinite(draft.agreedWage) || draft.agreedWage <= 0)) {
    throw new Error("Outsource labor requires a positive agreed wage.");
  }

  const agreedWage = computeLaborCost(draft.legalCategory, draft.agreedWage);

  const record: LaborRecord = {
    id: `LABOR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    projectId: draft.projectId,
    workerName: draft.workerName.trim(),
    fieldRole: draft.fieldRole.trim(),
    legalCategory: draft.legalCategory,
    agreedWage,
    settled: false,
    settledAt: null,
    settledBy: null,
    geoTag: null,
    ipAddress: null,
    createdAt: new Date().toISOString(),
    createdBy: createdBy.name || createdBy.id,
  };

  return upsertLabor(record);
}

/**
 * SRS UC step 6 / FR-OPS-07: one-way settlement confirmation for outsource labor.
 * Stamps settledAt/settledBy/geoTag into a WORM-locked record. Throws for internal labor,
 * missing records, or records already settled.
 */
export function confirmOutsourceSettlement(
  id: string,
  user: { id: string; name: string },
  geoTag: GeoTag | null
): LaborRecord {
  const record = getLaborRecordById(id);
  if (!record) {
    throw new Error("Labor record not found.");
  }
  if (record.legalCategory === "internal") {
    throw new Error("Internal labor has no cost and cannot be settled.");
  }
  assertNotSettled(record);

  const settledRecord: LaborRecord = {
    ...record,
    settled: true,
    settledAt: new Date().toISOString(),
    settledBy: user.name || user.id,
    geoTag,
    ipAddress: null,
  };

  return upsertLabor(settledRecord);
}

/** ADR-005 — centralized KPI selector; view-models must call this, never sum records inline. */
export function getLaborSummary(projectId: string): LaborSummary {
  const records = getLaborByProject(projectId);

  return records.reduce<LaborSummary>(
    (acc, record) => {
      const isOutsource = record.legalCategory === "outsource";
      return {
        headcount: acc.headcount + 1,
        internalCount: acc.internalCount + (isOutsource ? 0 : 1),
        outsourceCount: acc.outsourceCount + (isOutsource ? 1 : 0),
        totalOutsourceCost: acc.totalOutsourceCost + (isOutsource ? record.agreedWage : 0),
        unsettledOutsourceCount: acc.unsettledOutsourceCount + (isOutsource && !record.settled ? 1 : 0),
      };
    },
    { headcount: 0, internalCount: 0, outsourceCount: 0, totalOutsourceCost: 0, unsettledOutsourceCount: 0 }
  );
}
