import React from "react";
import { ClientRequest } from "@/domains/requests/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { formatDate } from "../view-model";
import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";

interface RecentRequestsProps {
  requests: ClientRequest[];
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card shadow-sm flex flex-col justify-between h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileQuestion className="h-4.5 w-4.5 text-primary" />
          {t("common:overview_recent_requests")}
        </CardTitle>
        <Link href="/requests" passHref legacyBehavior>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1 text-primary hover:text-primary/95 cursor-pointer">
            {t("common:overview_view_all")}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            {t("common:noRecords")}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between text-xs gap-4 first:pt-0 last:pb-0">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-mono font-bold text-primary truncate">{req.jobNumber}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold truncate">
                    {req.buildingType || req.inspectionType || "—"}
                  </p>
                </div>
                <div className="text-end shrink-0 space-y-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                    {t(`common:status_${req.status}`)}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {formatDate(req.updatedAt || req.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
