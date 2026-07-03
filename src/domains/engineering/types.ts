export interface BlueprintEvaluation {
  id: string;
  tenantId: string;
  projectId: string;
  engineerId: string;
  comments: string;
  approved: boolean;
  reviewedAt: string;
}

export type EngineeringReviewStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "MODIFICATION_REQUIRED"
  | "MISSING_DOCUMENTS";

export type EngineeringReviewDecision =
  | "APPROVE"
  | "RETURN_FOR_MODIFICATION"
  | "REQUEST_MISSING_DOCUMENTS";

export interface EngineeringReviewRecord {
  jobNumber: string;
  status: EngineeringReviewStatus;
  notes: string;
  correctionReason?: string;
  missingDocumentsNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  updatedAt?: string;
}

