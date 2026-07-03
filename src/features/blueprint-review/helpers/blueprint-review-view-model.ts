import { LicensingRequest } from "@/domains/requests/types";
import { EngineeringReviewRecord } from "@/domains/engineering/types";
import { getEngineeringReviewByJobNumber } from "@/domains/engineering/storage";

export type BlueprintReviewViewModel = LicensingRequest & {
  reviewRecord: EngineeringReviewRecord;
  reviewStatus: EngineeringReviewRecord["status"];
};

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
