import React from "react";
import { TimelineItem } from "../helpers/timeline";
import { ProjectTimelineCard } from "../components/project-timeline-card";

interface TimelineTabProps {
  timeline: TimelineItem[];
  t: (key: string) => string;
}

export function TimelineTab({ timeline, t }: TimelineTabProps) {
  return <ProjectTimelineCard timeline={timeline} t={t} />;
}
