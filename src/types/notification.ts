export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  /**
   * Recipient scope. Matches the client company (`user.companyId`), mirroring the
   * existing filter pattern in the overview view-models. Omitted = system-wide
   * notification, visible to everyone. Role/tenant routing is deliberately out of
   * scope here.
   */
  clientId?: string;
}
