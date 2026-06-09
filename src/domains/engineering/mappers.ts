import { BlueprintEvaluation } from "./types";

export function mapEvaluationToReport(evalItem: BlueprintEvaluation) {
  return {
    evalId: evalItem.id,
    projectRef: evalItem.projectId,
    statusText: evalItem.approved ? "APPROVED" : "REJECTED",
    date: evalItem.reviewedAt,
  };
}
