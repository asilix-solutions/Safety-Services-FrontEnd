"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { ClipboardList, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { useSiteVisitsList } from "./hooks/use-site-visits-list";
import { SiteVisitCard } from "./components/site-visit-card";
import { SiteVisitsCalendar } from "./components/site-visits-calendar";

export function SiteVisitsList() {
  const {
    user,
    activeTab,
    setActiveTab,
    allVisits,
    filteredVisits,
    t,
  } = useSiteVisitsList();

  if (!user) return null;

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
          className="gap-2 cursor-pointer"
        >
          <ClipboardList className="h-4 w-4" />
          {t("dashboard:list_view")}
        </Button>
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          onClick={() => setActiveTab("calendar")}
          className="gap-2 cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4" />
          {t("dashboard:calendar_view")}
        </Button>
        <Button
          variant={activeTab === "upcoming" ? "default" : "ghost"}
          onClick={() => setActiveTab("upcoming")}
          className="gap-2 cursor-pointer"
        >
          <Clock className="h-4 w-4" />
          {t("dashboard:upcoming_visits")}
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "ghost"}
          onClick={() => setActiveTab("completed")}
          className="gap-2 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("dashboard:completed_visits")}
        </Button>
      </div>

      {activeTab === "calendar" ? (
        <SiteVisitsCalendar
          visits={allVisits}
          inspectionCalendarLabel={t("dashboard:inspection_calendar")}
          juneScheduleDescLabel={t("dashboard:june_schedule_desc")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVisits.map((visit) => (
            <SiteVisitCard
              key={visit.id}
              visit={visit}
              assignedInspectorLabel={t("dashboard:assigned_inspector")}
              notesLabel={t("dashboard:notes_label")}
            />
          ))}
          {filteredVisits.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground font-semibold">
              No site visits found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default SiteVisitsList;
