import { LicensingRequest } from "@/domains/requests/types";
import { EngineeringReviewRecord } from "@/domains/engineering/types";
import { getEngineeringReviewByJobNumber } from "@/domains/engineering/storage";

export type BlueprintReviewViewModel = LicensingRequest & {
  reviewRecord: EngineeringReviewRecord;
  reviewStatus: EngineeringReviewRecord["status"];
};

/**
 * Strips the view-model-only extensions back off, so a decision handler can
 * hand a clean LicensingRequest to the workflow domain. Without this the
 * reviewRecord/reviewStatus fields leak into request storage.
 */
export function toLicensingRequest(viewModel: BlueprintReviewViewModel): LicensingRequest {
  const { reviewRecord, reviewStatus, ...request } = viewModel;
  void reviewRecord;
  void reviewStatus;
  return request;
}

export function buildBlueprintReviewViewModel(
  request: LicensingRequest,
  reviewRecordInput?: EngineeringReviewRecord
): BlueprintReviewViewModel {
  const reviewRecord = reviewRecordInput || getEngineeringReviewByJobNumber(request.jobNumber);
  return {
    ...request,
    reviewRecord,
    reviewStatus: reviewRecord.status,
  };
}
