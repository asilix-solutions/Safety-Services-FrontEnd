import React from "react";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { ClipboardList, ShieldAlert, RotateCcw, CheckSquare } from "lucide-react";
import { useBlueprintReviewQueue, QueueFilter } from "../hooks/use-blueprint-review-queue";
import { BlueprintReviewTable } from "./blueprint-review-table";

export function BlueprintReviewQueue() {
  const { t } = useTranslation();
  useNamespaceTranslations(["requests", "common", "dashboard"]);

  const {
    requests,
    activeFilter,
    setActiveFilter,
    stats,
  } = useBlueprintReviewQueue();

  const filters: { key: QueueFilter; labelKey: string }[] = [
    { key: "all", labelKey: "blueprintReview.queue.all" },
    { key: "engineering", labelKey: "blueprintReview.queue.engineering" },
    { key: "high_hazard", labelKey: "blueprintReview.queue.highHazard" },
    { key: "returned", labelKey: "blueprintReview.queue.returned" },
    { key: "approved", labelKey: "blueprintReview.queue.approved" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("requests:blueprintReview.title")}
        description={t("requests:blueprintReview.description")}
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                {t("requests:blueprintReview.queue.pendingReviews")}
              </span>
              <span className="text-xl font-bold text-foreground font-sans">
                {stats.pendingReviews}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                {t("requests:blueprintReview.queue.highHazardCount")}
              </span>
              <span className="text-xl font-bold text-foreground font-sans">
                {stats.highHazard}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                {t("requests:blueprintReview.queue.returnedCount")}
              </span>
              <span className="text-xl font-bold text-foreground font-sans">
                {stats.returnedCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                {t("requests:blueprintReview.queue.approvedToday")}
              </span>
              <span className="text-xl font-bold text-foreground font-sans">
                {stats.approvedToday}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Filters */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeFilter === f.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`requests:${f.labelKey}`)}
          </button>
        ))}
      </div>

      {/* Data Table / Empty State */}
      {requests.length > 0 ? (
        <BlueprintReviewTable requests={requests} />
      ) : (
        <EmptyState
          title={t("requests:blueprintReview.empty.title")}
          description={t("requests:blueprintReview.empty.description")}
        />
      )}
    </div>
  );
}
