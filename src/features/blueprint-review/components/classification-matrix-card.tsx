import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";
import { getQueueDisplayName, getClassificationReason, classifyRequest } from "@/domains/requests/workflow";

interface ClassificationMatrixCardProps {
  request: BlueprintReviewViewModel;
}

export function ClassificationMatrixCard({ request }: ClassificationMatrixCardProps) {
  const { t } = useTranslation();

  // Area band and hazard evaluation both come from the canonical FR-RU engine.
  // The stored queue/classification still win when present — they are what the
  // request was actually routed as at submission time.
  const rules = classifyRequest(request);

  const isHighHazard =
    request.assignedQueue === "HIGH_HAZARD" ||
    request.classification === "high_hazard_review" ||
    rules.classification === "high_hazard_review";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-foreground">
          {t("requests:blueprintReview.workspace.classificationMatrix")}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t("requests:blueprintReview.workspace.classificationMatrixDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 text-xs">
        {/* Decision Matrix Table */}
        <div className="border border-border rounded-xl overflow-hidden font-sans">
          <table className="w-full text-start border-collapse text-[11px]">
            <thead>
              <tr className="bg-secondary/20 border-b border-border">
                <th className="p-2.5 text-start font-semibold text-muted-foreground w-1/3">Rule / Metric</th>
                <th className="p-2.5 text-start font-semibold text-muted-foreground w-2/3">Evaluation Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-secondary/5">
                <td className="p-2.5 font-medium text-foreground">Area Constraint</td>
                <td className="p-2.5 text-foreground font-semibold">
                  {request.area} m² ({t(`requests:classification.areaBand.${rules.areaBand}`)})
                </td>
              </tr>
              <tr className="hover:bg-secondary/5">
                <td className="p-2.5 font-medium text-foreground">Activity Type</td>
                <td className="p-2.5">
                  <span className="font-semibold text-foreground">{request.activityName}</span>{" "}
                  {isHighHazard && (
                    <Badge variant="destructive" className="ms-2 py-0 px-1.5 text-[8px] font-bold">
                      High Hazard Override
                    </Badge>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-secondary/5">
                <td className="p-2.5 font-medium text-foreground">Final Target Queue</td>
                <td className="p-2.5">
                  <Badge variant={request.assignedQueue === "HIGH_HAZARD" ? "destructive" : "default"} className="py-0 px-1.5 text-[8px] font-bold">
                    {getQueueDisplayName(request.assignedQueue, t)}
                  </Badge>
                </td>
              </tr>
              <tr className="hover:bg-secondary/5">
                <td className="p-2.5 font-medium text-foreground">Routing Reason</td>
                <td className="p-2.5 text-muted-foreground leading-relaxed">
                  {getClassificationReason(request, t)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
