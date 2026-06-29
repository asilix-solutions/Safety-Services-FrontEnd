import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TimelineItem } from "../helpers/timeline";

interface ProjectTimelineCardProps {
  timeline: TimelineItem[];
  t: any;
}

export function ProjectTimelineCard({ timeline, t }: ProjectTimelineCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("projects:timeline.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs pt-0">
        {timeline.length > 0 ? (
          <div className="relative border-s border-border pl-4 ml-2 space-y-4 pt-1">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-background" />
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-foreground capitalize">{item.status.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                {item.comment && <p className="text-[10px] text-muted-foreground mt-0.5">{item.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground text-xs">
            No workflow history items recorded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
