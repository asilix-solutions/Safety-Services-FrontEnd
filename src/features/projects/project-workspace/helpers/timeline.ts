import { LicensingRequest } from "@/domains/requests/types";

export interface TimelineItem {
  status: string;
  comment?: string;
  date: string;
}

export function buildProjectTimeline(request: LicensingRequest | null): TimelineItem[] {
  if (!request || !request.timeline) {
    return [];
  }
  return request.timeline.map((item) => ({
    status: item.status,
    comment: item.comment,
    date: item.date
  }));
}
