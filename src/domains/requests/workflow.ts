import { WorkflowStage, RequestQueue, LicensingRequest } from "./types";
import { RequestStatus } from "@/types/request-status";

export const WORKFLOW_STAGES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTATION",
  "QUOTATION_APPROVAL",
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
    awaiting_approval: "PAYMENT_CONFIRMED", // awaiting approval maps here in transition logic
    approved: "PROJECT_CREATED",
    in_execution: "FIELD_EXECUTION",
    completed: "COMPLETED",
    closed: "COMPLETED",
  };
  return map[status] || "SUBMITTED";
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
  const map: Record<string, string> = {
    fast_track: t("requests:wizard.classification.fastTrack"),
    maintenance_strategy: t("requests:wizard.classification.maintenanceStrategy"),
    engineering_project: t("requests:wizard.classification.engineeringProject"),
    high_hazard_review: t("requests:wizard.classification.highHazardReview"),
  };
  return map[classification] || classification.replace("_", " ");
}

export function getClassificationReason(request: Partial<LicensingRequest>, t: (key: string) => string): string {
  if (request.gasExtensions || request.hazardousMaterials || request.riskCategory === "high") {
    return t("requests:classificationReason.high_hazard");
  }

  const actName = (request.activityName || "").toLowerCase();
  const isKeywordMatched = [
    "kitchen",
    "buffet",
    "gas",
    "workshop",
    "oil",
    "chemical",
    "compressed",
    "heavy",
    "storage",
    "factory",
    "manufacturing",
    "welding",
  ].some((kw) => actName.includes(kw));

  const code = request.isicCode || "";
  const highHazardIsic = ["5610", "2011", "4520", "4730"];

  if (isKeywordMatched || highHazardIsic.includes(code)) {
    return t("requests:classificationReason.high_hazard");
  }

  const area = request.area || 0;
  if (area < 150) {
    return t("requests:classificationReason.fast_track");
  } else if (area >= 150 && area <= 1000) {
    return t("requests:classificationReason.maintenance");
  } else {
    return t("requests:classificationReason.engineering");
  }
}
