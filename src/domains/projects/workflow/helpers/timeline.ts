import { LicensingRequest } from "@/domains/requests/types";
import { RequestStatus } from "@/types/request-status";

export function appendTimelineEvent(
  request: LicensingRequest,
  status: RequestStatus,
  comment: string
): LicensingRequest {
  const nowStr = new Date().toISOString();
  const updatedTimeline = [...request.timeline];
  updatedTimeline.push({
    status,
    comment,
    date: nowStr,
  });

  return {
    ...request,
    timeline: updatedTimeline,
    updatedAt: nowStr,
  };
}
