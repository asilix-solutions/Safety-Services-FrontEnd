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
  const norm = (classification || "").toUpperCase().replace(/_/, "");
  
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

export function getClassificationReason(request: Partial<LicensingRequest>, t: (key: string) => string): string {
  // Normalize based on existing queue or classification path
  const queueNorm = (request.assignedQueue || "").toUpperCase();
  const classNorm = (request.classification || "").toUpperCase().replace(/_/, "");
  
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

  // Rules-based calculation for new requests (fallback)
  if (request.gasExtensions || request.hazardousMaterials || request.riskCategory === "high") {
    return t("requests:classificationReason.HIGH_HAZARD");
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
    return t("requests:classificationReason.HIGH_HAZARD");
  }

  const area = request.area || 0;
  if (area < 150) {
    return t("requests:classificationReason.FAST_TRACK");
  } else if (area >= 150 && area <= 1000) {
    return t("requests:classificationReason.MAINTENANCE");
  } else {
    return t("requests:classificationReason.ENGINEERING");
  }
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
    quotation_created: "common:status_In_Review",
    awaiting_approval: "common:status_Action_Required",
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

