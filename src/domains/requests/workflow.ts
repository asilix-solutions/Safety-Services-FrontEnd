import { WorkflowStage, RequestQueue, RequestClassification, LicensingRequest } from "./types";
import { RequestStatus } from "@/types/request-status";
import {
  AREA_THRESHOLDS,
  HIGH_HAZARD_CATEGORIES,
  AreaBand,
  HighHazardCategoryId,
} from "@/constants/classification";

export const WORKFLOW_STAGES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTATION",
  "QUOTATION_APPROVAL",
  "READY_FOR_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PROJECT_CREATED",
  "FIELD_EXECUTION",
  "FINAL_INSPECTION",
  "COMPLETED",
] as const;

export function getNextStage(stage: WorkflowStage): WorkflowStage | null {
  const index = WORKFLOW_STAGES.indexOf(stage);
  if (index === -1 || index === WORKFLOW_STAGES.length - 1) return null;
  return WORKFLOW_STAGES[index + 1];
}

/**
 * How far along the linear milestone track a request is, as a whole percentage
 * (FR-COM-02 / Arabic SRS §3.5 "نسبة الإنجاز").
 *
 * Derived from the position in `WORKFLOW_STAGES` so the percentage and the stage
 * list can never drift apart — the first stage is 0% and the last is 100%.
 * Pure: the UI decides how to present it.
 */
export function getStageProgressPercent(stage: WorkflowStage): number {
  const index = WORKFLOW_STAGES.indexOf(stage);
  if (index === -1) return 0;
  return Math.round((index / (WORKFLOW_STAGES.length - 1)) * 100);
}

export function canTransition(from: WorkflowStage, to: WorkflowStage): boolean {
  // Linear progression
  const fromIndex = WORKFLOW_STAGES.indexOf(from);
  const toIndex = WORKFLOW_STAGES.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return false;
  
  // Can only transition to the immediate next stage
  return toIndex === fromIndex + 1;
}

export function mapStatusToStage(status: RequestStatus): WorkflowStage {
  const map: Record<RequestStatus, WorkflowStage> = {
    draft: "DRAFT",
    submitted: "SUBMITTED",
    assigned: "UNDER_REVIEW",
    under_review: "UNDER_REVIEW",
    quotation_created: "QUOTATION",
    awaiting_approval: "QUOTATION_APPROVAL",
    awaiting_payment: "READY_FOR_PAYMENT",
    approved: "PROJECT_CREATED",
    in_execution: "FIELD_EXECUTION",
    completed: "COMPLETED",
    closed: "COMPLETED",
  };
  return map[status] || "SUBMITTED";
}

export function getCanonicalRequestTypeDisplayName(
  request: LicensingRequest | Partial<LicensingRequest>,
  t: (key: string) => string
): string {
  const type = request.requestType || "";
  const map: Record<string, string> = {
    new_license: t("requests:new_license") || "New Safety License",
    maintenance_contract: t("requests:maintenance_contract") || "Maintenance Contract",
    engineering_blueprint: t("requests:engineering_blueprint") || "Blueprint Review",
    technical_report: t("requests:technical_report") || "Technical Safety Report",
  };
  return map[type] || type;
}

export function getReviewPathDisplayName(
  request: LicensingRequest | Partial<LicensingRequest>,
  t: (key: string) => string
): string {
  const classification = request.classification || "";
  const queue = request.assignedQueue || "";
  const normClass = (classification || "").toLowerCase();
  const normQueue = (queue || "").toLowerCase();

  if (normClass.includes("maintenance") || normQueue.includes("maintenance")) {
    return t("requests:classification.client.maintenance") || "Maintenance Review";
  }
  if (normClass.includes("engineering") || normQueue.includes("engineering")) {
    return t("requests:classification.client.engineering") || "Engineering Review";
  }
  if (normClass.includes("high_hazard") || normClass.includes("hazard") || normQueue.includes("high_hazard")) {
    return t("requests:classification.client.highHazard") || "Enhanced Safety Review";
  }
  return t("requests:classification.client.fastTrack") || "Fast Review";
}

export function getCommercialServiceLabel(
  request: LicensingRequest | Partial<LicensingRequest>,
  t: (key: string) => string
): string {
  const rType = (request.requestType || "").toLowerCase();
  const classif = (request.classification || "").toLowerCase();
  const queue = (request.assignedQueue || "").toLowerCase();

  if (classif.includes("maintenance") || queue.includes("maintenance") || rType.includes("maintenance")) {
    return t("requests:commercialServiceLabel.maintenance") || "Maintenance Contract";
  }
  if (classif.includes("engineering") || queue.includes("engineering") || rType.includes("engineering_blueprint")) {
    return t("requests:commercialServiceLabel.installation") || "Installation Compliance";
  }
  return t("requests:commercialServiceLabel.compliance") || "Compliance Follow-up";
}

export function getQueueDisplayName(queue: RequestQueue | null, t: (key: string) => string): string {
  if (!queue) return t("requests:queue.none");
  const map: Record<RequestQueue, string> = {
    FAST_TRACK: t("requests:queue.fast_track"),
    MAINTENANCE: t("requests:queue.maintenance"),
    ENGINEERING: t("requests:queue.engineering"),
    HIGH_HAZARD: t("requests:queue.high_hazard"),
  };
  return map[queue] || queue;
}

export function getClassificationDisplayName(classification: string, t: (key: string) => string): string {
  const norm = (classification || "").toUpperCase().replace(/_/g, "");
  
  if (norm.includes("FASTTRACK") || norm === "FAST_TRACK") {
    return t("requests:classification.client.fastTrack");
  }
  if (norm.includes("MAINTENANCE")) {
    return t("requests:classification.client.maintenance");
  }
  if (norm.includes("ENGINEERING")) {
    return t("requests:classification.client.engineering");
  }
  if (norm.includes("HIGHHAZARD") || norm.includes("HAZARD")) {
    return t("requests:classification.client.highHazard");
  }

  // Fallback to original wizard classification display keys
  const map: Record<string, string> = {
    fast_track: t("requests:wizard.classification.fastTrack"),
    maintenance_strategy: t("requests:wizard.classification.maintenanceStrategy"),
    engineering_project: t("requests:wizard.classification.engineeringProject"),
    high_hazard_review: t("requests:wizard.classification.highHazardReview"),
  };
  return map[classification] || classification.replace("_", " ");
}

/** Everything the FR-RU rule engine needs. Satisfied by both a wizard form value object and a stored `LicensingRequest`. */
export interface ClassificationInput {
  area?: number | null;
  activityName?: string | null;
  isicCode?: string | null;
  gasExtensions?: boolean;
  hazardousMaterials?: boolean;
  riskCategory?: "low" | "medium" | "high";
}

export interface ClassificationResult {
  classification: RequestClassification;
  assignedQueue: RequestQueue;
  /** The area-driven band on its own, before the FR-RUL-05 hazard override. */
  areaBand: AreaBand;
  /** Which FR-RUL-04 category matched, or null when the hazard came from a risk flag or nothing matched. */
  hazardCategoryId: HighHazardCategoryId | null;
  siteVisitRequired: boolean;
  engineeringReviewRequired: boolean;
  /**
   * FR-RUL-01/05. Kept as its own explicit field: callers must read it directly
   * and never re-derive it from `classification`, because the downstream FR-C
   * gate (client-chosen `reportType` vs. what the rules permit) depends on it.
   */
  instantReportAllowed: boolean;
  /** i18n key. This module stays pure — the UI does the translating. */
  reasonKey: string;
}

const QUEUE_BY_CLASSIFICATION: Record<RequestClassification, RequestQueue> = {
  fast_track: "FAST_TRACK",
  maintenance_strategy: "MAINTENANCE",
  engineering_project: "ENGINEERING",
  high_hazard_review: "HIGH_HAZARD",
};

const REASON_KEY_BY_QUEUE: Record<RequestQueue, string> = {
  FAST_TRACK: "requests:classificationReason.FAST_TRACK",
  MAINTENANCE: "requests:classificationReason.MAINTENANCE",
  ENGINEERING: "requests:classificationReason.ENGINEERING",
  HIGH_HAZARD: "requests:classificationReason.HIGH_HAZARD",
};

/** FR-RUL-04: the hazard category this activity falls into, by ISIC code or activity-name keyword. */
function matchHighHazardCategory(input: ClassificationInput): HighHazardCategoryId | null {
  const activityName = (input.activityName || "").toLowerCase();
  const isicCode = input.isicCode || "";

  for (const category of HIGH_HAZARD_CATEGORIES) {
    if (isicCode && category.isicCodes.includes(isicCode)) return category.id;
    if (activityName && category.keywords.some((keyword) => activityName.includes(keyword))) {
      return category.id;
    }
  }
  return null;
}

/**
 * The single source of truth for the FR-RU area/hazard rule engine
 * (SRS FR-RUL-01..06 / UC-01). Pure: no React, no storage, no `t()` — it
 * returns enums and i18n keys and lets the UI translate them (ADR-003).
 *
 * No page, feature, hook, or component may re-derive any part of this decision.
 */
export function classifyRequest(input: ClassificationInput): ClassificationResult {
  const hazardCategoryId = matchHighHazardCategory(input);
  const hasHazardFlag =
    input.gasExtensions === true ||
    input.hazardousMaterials === true ||
    input.riskCategory === "high";
  const isHighHazard = hasHazardFlag || hazardCategoryId !== null;

  const area = Number(input.area) || 0;
  const areaIsUsable = Number.isFinite(area) && area > 0;

  const areaBand: AreaBand =
    area < AREA_THRESHOLDS.FAST_TRACK_BELOW
      ? "FAST_TRACK"
      : area <= AREA_THRESHOLDS.MAINTENANCE_MAX_INCLUSIVE
        ? "MAINTENANCE"
        : "ENGINEERING";

  let classification: RequestClassification;
  let siteVisitRequired: boolean;
  let engineeringReviewRequired: boolean;
  let instantReportAllowed: boolean;

  // FR-RUL-05: a high-hazard activity severs fast-track regardless of area.
  if (isHighHazard) {
    classification = "high_hazard_review";
    siteVisitRequired = true;
    engineeringReviewRequired = true;
    instantReportAllowed = false;
  } else if (areaBand === "FAST_TRACK") {
    classification = "fast_track";
    siteVisitRequired = false;
    engineeringReviewRequired = false;
    instantReportAllowed = true;
  } else if (areaBand === "MAINTENANCE") {
    classification = "maintenance_strategy";
    siteVisitRequired = true;
    engineeringReviewRequired = false;
    instantReportAllowed = false;
  } else {
    classification = "engineering_project";
    siteVisitRequired = true;
    engineeringReviewRequired = true;
    instantReportAllowed = false;
  }

  // An unusable area (zero, negative, or non-numeric) must never grant an
  // instant report. The form layer rejects it first (client-request.schema.ts);
  // this is the rule engine's own guard so the permissive default can't leak.
  if (!areaIsUsable) {
    instantReportAllowed = false;
  }

  const assignedQueue = QUEUE_BY_CLASSIFICATION[classification];

  return {
    classification,
    assignedQueue,
    areaBand,
    hazardCategoryId,
    siteVisitRequired,
    engineeringReviewRequired,
    instantReportAllowed,
    reasonKey: REASON_KEY_BY_QUEUE[assignedQueue],
  };
}

export function getClassificationReason(request: Partial<LicensingRequest>, t: (key: string) => string): string {
  // Normalize based on existing queue or classification path
  const queueNorm = (request.assignedQueue || "").toUpperCase();
  const classNorm = (request.classification || "").toUpperCase().replace(/_/g, "");
  
  if (queueNorm === "HIGH_HAZARD" || classNorm.includes("HIGHHAZARD") || classNorm.includes("HAZARD")) {
    return t("requests:classificationReason.HIGH_HAZARD");
  }
  if (queueNorm === "FAST_TRACK" || classNorm.includes("FASTTRACK") || classNorm.includes("FAST")) {
    return t("requests:classificationReason.FAST_TRACK");
  }
  if (queueNorm === "MAINTENANCE" || classNorm.includes("MAINTENANCE")) {
    return t("requests:classificationReason.MAINTENANCE");
  }
  if (queueNorm === "ENGINEERING" || classNorm.includes("ENGINEERING")) {
    return t("requests:classificationReason.ENGINEERING");
  }

  // Rules-based calculation for new requests (fallback). Delegates to the
  // canonical engine so thresholds and the hazard matrix exist in one place only.
  return t(classifyRequest(request).reasonKey);
}

export function getRequestStatusDisplayName(
  status: string,
  t: (key: string) => string
): string {
  const keyMap: Record<string, string> = {
    draft: "common:status_Draft",
    submitted: "common:status_Pending_Review",
    assigned: "common:status_In_Review",
    under_review: "common:status_In_Review",
    quotation_created: "requests:status_quotation_created",
    awaiting_approval: "common:status_Action_Required",
    awaiting_payment: "common:status_Awaiting_Payment",
    approved: "common:status_Approved",
    in_execution: "common:status_In_Progress",
    completed: "common:status_Completed",
    closed: "common:status_Inactive",
  };
  const key = keyMap[status];
  return key ? t(key) : status.replace(/_/g, " ");
}

export function getWorkflowStageDisplayName(
  stage: string,
  t: (key: string) => string
): string {
  return t(`requests:stages.${stage}`) || stage.replace(/_/g, " ");
}

export function approveRequestForQuotation(
  request: LicensingRequest,
  actorName?: string
): LicensingRequest {
  const actor = actorName || "Consulting Engineer";
  const now = new Date().toISOString();
  
  const newTimelineEvent = {
    status: "quotation_created" as RequestStatus,
    comment: "Approved for Quotation.",
    date: now,
  };

  return {
    ...request,
    currentStage: "QUOTATION",
    status: "quotation_created",
    updatedAt: now,
    timeline: [...(request.timeline || []), newTimelineEvent],
  };
}

