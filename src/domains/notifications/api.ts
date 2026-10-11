import { http } from "@/services/http";

export interface NotificationDto {
  id: string;
  event: number;
  title: string;
  body: string;
  instanceId?: string | null;
  jobNumber?: string | null;
  isRead: boolean;
  readAtUtc?: string | null;
  createdAt: string;
}

export interface NotificationInboxDto {
  unreadCount: number;
  items: NotificationDto[];
}

export const notificationsApi = {
  /**
   * Retrieves the caller's in-app notification inbox.
   * GET /api/v1/notifications
   */
  async getMyNotifications(unreadOnly = false, pageSize = 50) {
    return http.get<NotificationInboxDto>("/notifications", {
      params: { unreadOnly, pageSize },
    });
  },

  /**
   * Marks specific notifications read, or marks all read when notificationIds is empty.
   * POST /api/v1/notifications/mark-read
   */
  async markRead(notificationIds: string[] = []) {
    return http.post<number>("/notifications/mark-read", {
      notificationIds,
    });
  },
};
