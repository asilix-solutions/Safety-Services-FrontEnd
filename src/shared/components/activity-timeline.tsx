import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: "success" | "warning" | "error" | "info";
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {items.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== items.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card",
                      item.status === "success"
                        ? "bg-success/20 text-success"
                        : item.status === "warning"
                        ? "bg-warning/20 text-warning"
                        : item.status === "error"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-secondary text-primary"
                    )}
                  >
                    {item.icon || <span className="h-2 w-2 rounded-full bg-current" />}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <div className="text-right text-[10px] whitespace-nowrap text-muted-foreground">
                    <time dateTime={item.timestamp}>{item.timestamp}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ActivityTimeline;
