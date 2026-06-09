"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { ShieldCheck, HardHat, FileSignature, MapPin, BadgeAlert } from "lucide-react";
import { RequestClassification, RequestType } from "@/domains/requests/types";

interface AutoClassificationProps {
  classification: RequestClassification;
  siteVisitRequired: boolean;
  engineeringReviewRequired: boolean;
  instantReportAllowed: boolean;
  area: number;
  requestType: RequestType;
  onNext: () => void;
  onPrev: () => void;
}

export function ClassificationStep({
  classification,
  siteVisitRequired,
  engineeringReviewRequired,
  instantReportAllowed,
  area,
  requestType,
  onNext,
  onPrev,
}: AutoClassificationProps) {
  const getClassificationMeta = () => {
    switch (classification) {
      case "fast_track":
        return {
          title: "Fast-Track basic Safety",
          desc: "Instant digital certification flow allowed under basic municipal safety guidelines.",
          colorClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
          icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
        };
      case "maintenance_strategy":
        return {
          title: "Maintenance Strategy / Mandatory Inspection",
          desc: "Requires scheduling a certified safety technician site visit before compliance verification.",
          colorClass: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
          icon: <HardHat className="h-6 w-6 text-amber-500" />,
        };
      case "engineering_project":
        return {
          title: "Engineering Project / Blueprint Review",
          desc: "Requires deep architectural blueprint audits and formal engineering cost quotes.",
          colorClass: "border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400",
          icon: <FileSignature className="h-6 w-6 text-indigo-500" />,
        };
      case "high_hazard_review":
        return {
          title: "High Hazard Override Review",
          desc: "Overriding Risk Element Triggered: Requires on-site inspector verification and deep blueprint safety engineering review.",
          colorClass: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
          icon: <BadgeAlert className="h-6 w-6 text-rose-500" />,
        };
    }
  };

  const meta = getClassificationMeta();

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Workflow Classification Engine</h2>
        <p className="text-xs text-muted-foreground">
          SSLM has analyzed your facility area and safety equipment checklist to route your request.
        </p>
      </div>

      <div className="space-y-4">
        {/* Classification Summary Card */}
        <div className={`p-5 rounded-xl border flex gap-4 ${meta.colorClass}`}>
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 shrink-0 self-start">
            {meta.icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm">{meta.title}</h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{meta.desc}</p>
          </div>
        </div>

        {/* Detailed Metrics Checklist */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Compliance Routing Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-muted-foreground">Declared Facility Area</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{area} m²</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-muted-foreground">On-Site Inspection Required?</span>
              <span className={`font-semibold ${siteVisitRequired ? "text-amber-500" : "text-emerald-500"}`}>
                {siteVisitRequired ? "Yes (Mandatory)" : "No (Instant Certification)"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-muted-foreground">Engineering Blueprint Audit Required?</span>
              <span className={`font-semibold ${engineeringReviewRequired ? "text-amber-500" : "text-emerald-500"}`}>
                {engineeringReviewRequired ? "Yes (Blueprint Review Required)" : "No"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-muted-foreground">Instant Technical Certificate Pathway?</span>
              <span className={`font-semibold ${instantReportAllowed ? "text-emerald-500" : "text-rose-500"}`}>
                {instantReportAllowed ? "Allowed" : "Bypassed (requires manual verification)"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          Back
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          Continue to Final Review
        </Button>
      </div>
    </div>
  );
}
export default ClassificationStep;
