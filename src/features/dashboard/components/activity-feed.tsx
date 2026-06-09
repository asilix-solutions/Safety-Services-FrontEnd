"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { MOCK_NOTIFICATIONS } from "@/mock/notifications";
import { Bell, AlertCircle, CheckCircle, Info, Flame } from "lucide-react";

export function ActivityFeed() {
  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <Flame className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Active Compliance Alerts</CardTitle>
          <CardDescription>Live notifications regarding critical safety audits</CardDescription>
        </div>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-all border border-border/20 bg-secondary/5"
          >
            <div className="mt-0.5">{getIcon(notif.type)}</div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                <Badge variant={getBadgeVariant(notif.type)} className="text-[9px] px-1.5 py-0">
                  {notif.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
              <p className="text-[9px] text-muted-foreground/75">
                {new Date(notif.createdAt).toLocaleDateString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
export default ActivityFeed;
