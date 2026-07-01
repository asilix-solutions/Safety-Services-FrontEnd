import React from "react";
import { SiteVisit } from "@/domains/site-visits/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SiteVisitsCalendarProps {
  visits: SiteVisit[];
  inspectionCalendarLabel: string;
  juneScheduleDescLabel: string;
}

export function SiteVisitsCalendar({
  visits,
  inspectionCalendarLabel,
  juneScheduleDescLabel,
}: SiteVisitsCalendarProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">{inspectionCalendarLabel}</CardTitle>
          <CardDescription className="text-muted-foreground">{juneScheduleDescLabel}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" className="text-xs">June 2026</Button>
          <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs border-b border-border pb-2 mb-2 text-muted-foreground">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2 h-96">
          {Array.from({ length: 30 }).map((_, i) => {
            const day = i + 1;
            const dateStr = `2026-06-${day < 10 ? "0" + day : day}`;
            const dayVisits = visits.filter((v) => v.scheduledDate.startsWith(dateStr));

            return (
              <div key={i} className="border border-border/40 rounded-lg p-1.5 flex flex-col justify-between bg-secondary/10 hover:bg-secondary/25 transition-all">
                <span className="text-xs font-bold text-muted-foreground self-start">{day}</span>
                <div className="space-y-1">
                  {dayVisits.map((v) => (
                    <div
                      key={v.id}
                      className={`text-[9px] p-1 rounded font-medium truncate ${
                        v.status === "upcoming"
                          ? "bg-warning/20 text-warning border border-warning/30"
                          : "bg-success/20 text-success border border-success/30"
                      }`}
                      title={`${v.projectName} (${v.id})`}
                    >
                      {v.id}: {v.projectName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export default SiteVisitsCalendar;
