import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { LicensingRequest } from "@/domains/requests/types";
import { getCanonicalRequestTypeDisplayName, getReviewPathDisplayName } from "@/domains/requests/workflow";

interface LinkedRequestCardProps {
  request: LicensingRequest;
  t: any;
}

export function LinkedRequestCard({ request, t }: LinkedRequestCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
          <LinkIcon className="h-4 w-4 text-indigo-500" />
          {t("projects:details.linkedRequest") || "Linked Safety Request"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3 pt-3"> 
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.jobNumber")}</span>
          <span className="font-mono font-bold text-foreground">{request.jobNumber}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.requestType") || "Request Type"}</span>
          <span className="font-semibold text-foreground">{getCanonicalRequestTypeDisplayName(request, t)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("requests:details.reviewPathLabel") || "Review Path"}</span>
          <span className="font-semibold text-foreground">{getReviewPathDisplayName(request, t)}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <Button asChild type="button" variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 font-bold">
            <Link href={`/requests/${request.jobNumber}`}>
              {t("projects:details.viewRequest") || "View Original Request"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
