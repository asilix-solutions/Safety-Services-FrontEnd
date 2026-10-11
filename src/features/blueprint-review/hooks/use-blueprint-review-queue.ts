import { useState, useEffect, useMemo } from "react";
import { getScopedRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getEngineeringReviews } from "@/domains/engineering/storage";
import { buildBlueprintReviewViewModel, BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";
import { requestsApi } from "@/domains/requests/api";
import { mapWorkflowSummaryToLicensingRequest } from "@/domains/requests/mappers";

export type QueueFilter = "all" | "engineering" | "high_hazard" | "returned" | "approved";

export function useBlueprintReviewQueue() {
  const tenantContext = useTenantContext();
  const [requests, setRequests] = useState<BlueprintReviewViewModel[]>([]);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("all");

  useEffect(() => {
    let isMounted = true;

    async function loadQueueData() {
      const localRequests = getScopedRequests(tenantContext);
      let combined = [...localRequests];

      try {
        const res = await requestsApi.getWorkflowInstances();
        if (res.isSuccess && res.data?.items) {
          const tenantId = tenantContext.tenantId || "al-salamah";
          const liveList = res.data.items.map((i) =>
            mapWorkflowSummaryToLicensingRequest(i, tenantId)
          );
          const existingJobNumbers = new Set(localRequests.map((r) => r.jobNumber));
          const newLive = liveList.filter((r) => !existingJobNumbers.has(r.jobNumber));
          combined = [...newLive, ...localRequests];
        }
      } catch {
        // Fallback to local items
      }

      if (!isMounted) return;

      const reviews = getEngineeringReviews();
      const reviewMap = new Map(reviews.map((r) => [r.jobNumber, r]));

      // Filter to requests belonging to Engineering Review Queue
      const filtered = combined
        .filter((r) => {
          const queue = r.assignedQueue;
          const classification = r.classification;
          return (
            queue === "ENGINEERING" ||
            queue === "HIGH_HAZARD" ||
            classification === "engineering_project" ||
            classification === "high_hazard_review" ||
            r.engineeringReviewRequired ||
            r.currentStage === "UNDER_REVIEW" ||
            r.requestType === "engineering_blueprint"
          );
        })
        .map((r) => buildBlueprintReviewViewModel(r, reviewMap.get(r.jobNumber)));

      setRequests(filtered);
    }

    loadQueueData();

    return () => {
      isMounted = false;
    };
  }, [tenantContext]);

  // Compute Statistics
  const stats = useMemo(() => {
    let pendingReviews = 0;
    let highHazard = 0;
    let returnedCount = 0;
    let approvedToday = 0;

    requests.forEach((r) => {
      const status = r.reviewStatus;
      if (status === "PENDING" || status === "IN_REVIEW") {
        pendingReviews++;
      } else if (status === "MODIFICATION_REQUIRED" || status === "MISSING_DOCUMENTS") {
        returnedCount++;
      } else if (status === "APPROVED") {
        approvedToday++;
      }

      if (r.assignedQueue === "HIGH_HAZARD" || r.classification === "high_hazard_review") {
        highHazard++;
      }
    });

    return {
      pendingReviews,
      highHazard,
      returnedCount,
      approvedToday,
    };
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "engineering") {
        return r.assignedQueue === "ENGINEERING" || r.classification === "engineering_project";
      }
      if (activeFilter === "high_hazard") {
        return r.assignedQueue === "HIGH_HAZARD" || r.classification === "high_hazard_review";
      }
      if (activeFilter === "returned") {
        return r.reviewStatus === "MODIFICATION_REQUIRED" || r.reviewStatus === "MISSING_DOCUMENTS";
      }
      if (activeFilter === "approved") {
        return r.reviewStatus === "APPROVED";
      }
      return true;
    });
  }, [requests, activeFilter]);

  return {
    requests: filteredRequests,
    activeFilter,
    setActiveFilter,
    stats,
  };
}
