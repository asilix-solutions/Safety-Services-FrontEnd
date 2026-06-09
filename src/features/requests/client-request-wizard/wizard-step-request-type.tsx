"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileSignature, Wrench, FileCheck, FileText } from "lucide-react";
import { RequestType } from "@/domains/requests/types";

interface RequestTypeStepProps {
  value: RequestType;
  onChange: (value: RequestType) => void;
  onNext: () => void;
}

export function RequestTypeStep({ value, onChange, onNext }: RequestTypeStepProps) {
  const options = [
    {
      id: "new_license" as RequestType,
      title: "New Safety License",
      description: "Obtain an official building occupancy or business safety certification.",
      icon: <FileSignature className="h-6 w-6 text-emerald-500" />,
      docs: ["Commercial Registration (CR)", "Building Permit", "Site Photos"],
    },
    {
      id: "maintenance_contract" as RequestType,
      title: "Maintenance Contract",
      description: "Schedule regular preventative maintenance and safety systems tests.",
      icon: <Wrench className="h-6 w-6 text-amber-500" />,
      docs: ["Existing Agreements", "Photos of Alarm/Extinguisher systems"],
    },
    {
      id: "engineering_blueprint" as RequestType,
      title: "Engineering Drawings / Blueprints Review",
      description: "Submit civil architectural plans for mechanical & fire safety compliance reviews.",
      icon: <FileCheck className="h-6 w-6 text-blue-500" />,
      docs: ["Architectural Blueprint PDF", "Building Permit"],
    },
    {
      id: "technical_report" as RequestType,
      title: "Technical Safety Report",
      description: "Request a detailed engineering safety check and formal technical report.",
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      docs: ["Lease Agreement", "Photos of Facility layout"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select Safety Request Type</h2>
        <p className="text-xs text-muted-foreground">
          Choose the service segment that matches your safety licensing or compliance requirements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <Card
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                onNext();
              }}
              className={`border cursor-pointer transition-all duration-300 hover:shadow-md ${
                isSelected
                  ? "border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-600/30"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700 shrink-0">
                  {opt.icon}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-slate-850 dark:text-slate-100">{opt.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{opt.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-1 text-xs">
                <p className="font-semibold text-[10px] text-muted-foreground tracking-wide uppercase mb-1.5">
                  Required Documents Checklist
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.docs.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground font-medium text-[10px]"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default RequestTypeStep;
