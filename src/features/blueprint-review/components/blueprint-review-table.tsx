import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";
import { getQueueDisplayName, getClassificationDisplayName } from "@/domains/requests/workflow";

interface BlueprintReviewTableProps {
  requests: BlueprintReviewViewModel[];
}

export function BlueprintReviewTable({ requests }: BlueprintReviewTableProps) {
  const { t } = useTranslation();

  const getStatusBadge = (status: BlueprintReviewViewModel["reviewStatus"]) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-none">{t(`requests:blueprintReview.status.${status}`)}</Badge>;
      case "MODIFICATION_REQUIRED":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">{t(`requests:blueprintReview.status.${status}`)}</Badge>;
      case "MISSING_DOCUMENTS":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-none">{t(`requests:blueprintReview.status.${status}`)}</Badge>;
      case "IN_REVIEW":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">{t(`requests:blueprintReview.status.${status}`)}</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-secondary text-muted-foreground border-none">{t(`requests:blueprintReview.status.PENDING`)}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm text-start border-collapse">
        <thead>
          <tr className="border-b border-border bg-secondary/20">
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.jobNumber")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.client")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.area")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.activity")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.classification")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.queue")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.status")}</th>
            <th className="p-4 text-start font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.date")}</th>
            <th className="p-4 text-center font-semibold text-muted-foreground">{t("requests:blueprintReview.queue.cols.action")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-secondary/15 transition-colors">
              <td className="p-4 font-mono font-bold text-foreground">{req.jobNumber}</td>
              <td className="p-4">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground block">{req.facilityName}</span>
                  <span className="text-xs text-muted-foreground block">{req.clientName}</span>
                </div>
              </td>
              <td className="p-4 text-foreground font-medium">{req.area} m²</td>
              <td className="p-4 text-foreground">{req.activityName}</td>
              <td className="p-4">
                <span className="text-xs text-foreground font-semibold">
                  {getClassificationDisplayName(req.classification, t)}
                </span>
              </td>
              <td className="p-4">
                <Badge variant={req.assignedQueue === "HIGH_HAZARD" ? "destructive" : "secondary"}>
                  {getQueueDisplayName(req.assignedQueue, t)}
                </Badge>
              </td>
              <td className="p-4">{getStatusBadge(req.reviewStatus)}</td>
              <td className="p-4 text-muted-foreground text-xs">
                {new Date(req.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-center">
                <Link href={`/blueprint-review/${req.jobNumber}`}>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary-active">
                    <Eye className="h-4 w-4" />
                    <span>{t("requests:blueprintReview.queue.openWorkspace")}</span>
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
