import { CustomerStatus } from "./types";

/**
 * Format status for presentation or styles
 */
export function getStatusBadgeVariant(status: CustomerStatus): "default" | "secondary" {
  return status === "Active" ? "default" : "secondary";
}
