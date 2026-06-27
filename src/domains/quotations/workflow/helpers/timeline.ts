import { LicensingRequest } from "@/domains/requests/types";
import { RequestStatus } from "@/types/request-status";

export function appendTimelineEvent(
  request: LicensingRequest,
  status: RequestStatus,
  comment: string
): LicensingRequest {
  const lastEvent = request.timeline[request.timeline.length - 1];
  if (lastEvent && lastEvent.status === status && lastEvent.comment === comment) {
    return request;
  }

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

