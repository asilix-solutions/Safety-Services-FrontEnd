"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/components/empty-state";
import { useNotificationBell } from "./hooks/use-notification-bell";
import { NotificationItem } from "./components/notification-item";

export function NotificationBell() {
  const { t, notifications, unreadCount, formatRelativeTime, markOneAsRead, markAllAsRead } =
    useNotificationBell();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-border/20 bg-secondary/15 relative cursor-pointer"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">{t("notifications:open_label")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 border-border/80 bg-popover">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{t("notifications:title")}</p>
            {unreadCount > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {t("notifications:unread_count", { count: String(unreadCount) })}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] font-semibold cursor-pointer shrink-0"
              onClick={markAllAsRead}
            >
              {t("notifications:mark_all_read")}
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {notifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={t("notifications:empty_title")}
              description={t("notifications:empty_description")}
              compact
            />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                relativeTime={formatRelativeTime(notification.createdAt)}
                onSelect={markOneAsRead}
              />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
