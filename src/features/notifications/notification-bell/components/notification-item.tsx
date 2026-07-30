"use client";

import React from "react";
import Link from "next/link";
import { Notification } from "@/types/notification";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { AlertCircle, CheckCircle, Flame, Info } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  relativeTime: string;
  onSelect: (id: string) => void;
}

function getIcon(type: Notification["type"]) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "error":
      return <Flame className={`${cls} text-destructive`} />;
    case "warning":
      return <AlertCircle className={`${cls} text-warning`} />;
    case "success":
      return <CheckCircle className={`${cls} text-success`} />;
    default:
      return <Info className={`${cls} text-primary`} />;
  }
}

export function NotificationItem({ notification, relativeTime, onSelect }: NotificationItemProps) {
  const content = (
    <>
      <div className="mt-0.5">{getIcon(notification.type)}</div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          {!notification.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
          )}
          <p
            className={`text-xs truncate ${
              notification.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"
            }`}
          >
            {notification.title}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-2 whitespace-normal">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/75">{relativeTime}</p>
      </div>
    </>
  );

  return (
    <DropdownMenuItem
      onSelect={() => onSelect(notification.id)}
      className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary/20"
    >
      {notification.actionUrl ? (
        <Link href={notification.actionUrl} className="flex items-start gap-3 w-full min-w-0">
          {content}
        </Link>
      ) : (
        content
      )}
    </DropdownMenuItem>
  );
}

export default NotificationItem;
