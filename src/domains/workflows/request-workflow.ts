import { RequestStatus } from "@/types/request-status";

export const ALLOWED_REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  draft: ["submitted"],
  submitted: ["assigned", "closed"],
  assigned: ["under_review", "closed"],
  under_review: ["quotation_created", "closed"],
  quotation_created: ["awaiting_approval", "closed"],
  awaiting_approval: ["approved", "closed"],
  approved: ["in_execution", "closed"],
  in_execution: ["completed", "closed"],
  completed: ["closed"],
  closed: [],
};

export function isValidRequestTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_REQUEST_TRANSITIONS[from].includes(to);
}
