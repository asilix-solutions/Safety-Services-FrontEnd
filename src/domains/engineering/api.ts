import { http } from "@/services/http";
import { BackendWorkflowStatus } from "@/domains/requests/api";

export enum OccupancyHazardClass {
  LightHazard = 1,
  OrdinaryHazard1 = 2,
  OrdinaryHazard2 = 3,
  ExtraHazard = 4,
}

export enum EngineeringComplianceStatus {
  Compliant = 1,
  RequiresModifications = 2,
  Rejected = 3,
}

export interface RecordEngineeringReviewPayload {
  occupancyHazardClass: OccupancyHazardClass;
  isolatedCompartmentAreaM2: number;
  requiredSprinklerDensity: number;
  pumpHeadRatingMeters?: number;
  smokeVentilationAirChangesPerHour?: number;
  complianceStatus: EngineeringComplianceStatus;
  technicalRemarks?: string;
}

export interface EngineeringReviewResultDto {
  reviewId: string;
  instanceStatus: BackendWorkflowStatus;
  currentStepCode: string;
}

export interface EngineeringReviewTrailItemDto {
  id: string;
  reviewerUserId: string;
  reviewerName: string;
  occupancyHazardClass: OccupancyHazardClass;
  isolatedCompartmentAreaM2: number;
  requiredSprinklerDensity: number;
  pumpHeadRatingMeters?: number;
  smokeVentilationAirChangesPerHour?: number;
  complianceStatus: EngineeringComplianceStatus;
  technicalRemarks?: string;
  createdAt: string;
}

export const engineeringApi = {
  /**
   * Records engineering evaluation of a job according to SBC 801 compliance.
   * POST /api/v1/workflow-instances/{instanceId}/engineering-review
   */
  async recordReview(instanceId: string, payload: RecordEngineeringReviewPayload) {
    return http.post<EngineeringReviewResultDto>(
      `/workflow-instances/${instanceId}/engineering-review`,
      payload
    );
  },

  /**
   * Retrieves engineering review trail and history for a job.
   * GET /api/v1/workflow-instances/{instanceId}/engineering-review
   */
  async getReviews(instanceId: string) {
    return http.get<EngineeringReviewTrailItemDto[]>(
      `/workflow-instances/${instanceId}/engineering-review`
    );
  },
};
