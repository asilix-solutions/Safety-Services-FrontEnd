"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getNotifications, markAsRead, markAllAsRead } from "@/domains/notifications";
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
    queryFn: () => getNotifications(companyId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.LIST });
  };

  const readMutation = useMutation({
    mutationFn: async (id: string) => markAsRead(id),
    onSuccess: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: async () => markAllAsRead(companyId),
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
