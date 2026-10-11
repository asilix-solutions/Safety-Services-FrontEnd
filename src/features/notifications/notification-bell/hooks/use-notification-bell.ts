"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getNotifications, markAsRead, markAllAsRead, notificationsApi } from "@/domains/notifications";
import { QUERY_KEYS } from "@/constants/query-keys";

export function useNotificationBell() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["notifications", "common"]);
  const queryClient = useQueryClient();

  // Clients see their own company's notifications plus system-wide ones.
  // Internal roles see everything.
  const companyId = user?.role === "Client" ? user.companyId : undefined;

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS.LIST, companyId ?? "all"],
    queryFn: async () => {
      try {
        const res = await notificationsApi.getMyNotifications(false, 50);
        if (res.isSuccess && res.data?.items) {
          return res.data.items.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.body,
            type: "info" as const,
            read: n.isRead,
            actionUrl: n.jobNumber ? `/requests/${n.jobNumber}` : undefined,
            createdAt: n.createdAt,
            clientId: companyId,
          }));
        }
      } catch (err) {
        console.warn("Live notifications fetch failed, falling back to local:", err);
      }
      return getNotifications(companyId);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.LIST });
  };

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await notificationsApi.markRead([id]);
      } catch {
        // Fallback
      }
      return markAsRead(id);
    },
    onSuccess: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      try {
        await notificationsApi.markRead([]);
      } catch {
        // Fallback
      }
      return markAllAsRead(companyId);
    },
    onSuccess: invalidate,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatRelativeTime = (iso: string): string => {
    const diffMs = new Date(iso).getTime() - Date.now();
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 31536000000],
      ["month", 2592000000],
      ["day", 86400000],
      ["hour", 3600000],
      ["minute", 60000],
    ];
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    for (const [unit, ms] of units) {
      if (Math.abs(diffMs) >= ms) {
        return formatter.format(Math.round(diffMs / ms), unit);
      }
    }
    return t("notifications:just_now");
  };

  return {
    t,
    notifications,
    unreadCount,
    isLoading,
    formatRelativeTime,
    markOneAsRead: (id: string) => readMutation.mutate(id),
    markAllAsRead: () => readAllMutation.mutate(),
  };
}
