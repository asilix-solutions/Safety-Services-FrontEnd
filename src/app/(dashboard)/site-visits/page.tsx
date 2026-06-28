"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MapPin, Calendar as CalendarIcon, ClipboardList, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface SiteVisit {
  id: string;
  projectName: string;
  location: string;
  inspectorName: string;
  scheduledDate: string;
  status: "upcoming" | "completed" | "cancelled";
  notes: string;
}

const MOCK_VISITS: SiteVisit[] = [
  {
    id: "SV-101",
    projectName: "Skyline Tower Fire Certification",
    location: "Skyline Tower, Floor 14-20",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-12T10:00:00Z",
    status: "upcoming",
    notes: "Conduct final water pressure test on the primary wet riser system.",
  },
  {
    id: "SV-102",
    projectName: "Marina Retail Electrical Inspection",
    location: "Marina Mall, Unit B22",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-15T09:00:00Z",
    status: "upcoming",
    notes: "Review automatic transfer switch calibration log.",
  },
  {
    id: "SV-103",
    projectName: "Gulf Industrial Gas Pipe Audit",
    location: "Industrial Sector 4, Depot C",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-06-08T11:00:00Z",
    status: "completed",
    notes: "Hydrostatic pipe tests verified. Safety certification document signed.",
  },
  {
    id: "SV-104",
    projectName: "Vertex Structural Blueprint Review",
    location: "Vertex HQ site, Zone A",
    inspectorName: "Eng. Tariq Al-Mansoor",
    scheduledDate: "2026-05-24T14:30:00Z",
    status: "completed",
    notes: "Core load-bearing columns inspected. Rebar reinforcement approved.",
  },
];

export default function SiteVisitsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "upcoming" | "completed">("list");
  
  if (!user) return null;

  const filteredVisits = MOCK_VISITS.filter((visit) => {
    if (activeTab === "upcoming") return visit.status === "upcoming";
    if (activeTab === "completed") return visit.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:site_visits_title")}
        description={t("dashboard:site_visits_desc")}
      />

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "list" ? "default" : "ghost"}
          onClick={() => setActiveTab("list")}
          className="gap-2"
        >
          <ClipboardList className="h-4 w-4" />
          {t("dashboard:list_view")}
        </Button>
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          onClick={() => setActiveTab("calendar")}
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {t("dashboard:calendar_view")}
        </Button>
        <Button
          variant={activeTab === "upcoming" ? "default" : "ghost"}
          onClick={() => setActiveTab("upcoming")}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          {t("dashboard:upcoming_visits")}
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "ghost"}
          onClick={() => setActiveTab("completed")}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("dashboard:completed_visits")}
        </Button>
      </div>

      {activeTab === "calendar" ? (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">{t("dashboard:inspection_calendar")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:june_schedule_desc")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" className="text-xs">June 2026</Button>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple Grid Calendar Mockup */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs border-b border-border pb-2 mb-2 text-muted-foreground">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2 h-96">
              {/* Render 31 days with simple site visits indicators */}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const dateStr = `2026-06-${day < 10 ? "0" + day : day}`;
                const dayVisits = MOCK_VISITS.filter((v) => v.scheduledDate.startsWith(dateStr));

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
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="border-border bg-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                  <Badge variant={visit.status === "upcoming" ? "warning" : "success"}>
                    {visit.status.toUpperCase()}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">{visit.projectName}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {visit.location}
                  </CardDescription>
                </div>
                <span className="text-xs font-mono font-semibold text-primary">{visit.id}</span>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{new Date(visit.scheduledDate).toLocaleDateString()} at {new Date(visit.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground">{t("dashboard:assigned_inspector")}:</p>
                  <p className="text-foreground">{visit.inspectorName}</p>
                </div>
                {visit.notes && (
                  <div className="p-2.5 rounded-lg border border-border bg-secondary/10">
                    <p className="font-semibold text-muted-foreground mb-1">{t("dashboard:notes_label")}:</p>
                    <p className="text-muted-foreground">{visit.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredVisits.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No site visits found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
