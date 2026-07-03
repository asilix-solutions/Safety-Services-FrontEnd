import { useState, useEffect, useMemo } from "react";
import { getMergedRequests } from "@/domains/requests/storage";
import { getEngineeringReviews } from "@/domains/engineering/storage";
import { buildBlueprintReviewViewModel, BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

export type QueueFilter = "all" | "engineering" | "high_hazard" | "returned" | "approved";

export function useBlueprintReviewQueue() {
  const [requests, setRequests] = useState<BlueprintReviewViewModel[]>([]);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("all");

  useEffect(() => {
    const mergedRequests = getMergedRequests();
    const reviews = getEngineeringReviews();
    const reviewMap = new Map(reviews.map((r) => [r.jobNumber, r]));

    // Filter to requests belonging to Engineering Review Queue
    const filtered = mergedRequests
      .filter((r) => {
        const queue = r.assignedQueue;
        const classification = r.classification;
        return (
          queue === "ENGINEERING" ||
          queue === "HIGH_HAZARD" ||
          classification === "engineering_project" ||
          classification === "high_hazard_review" ||
          r.engineeringReviewRequired
        );
      })
      .map((r) => buildBlueprintReviewViewModel(r, reviewMap.get(r.jobNumber)));

    setRequests(filtered);
  }, []);

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
