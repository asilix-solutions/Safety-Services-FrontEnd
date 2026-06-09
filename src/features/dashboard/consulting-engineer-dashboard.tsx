"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { FileCheck, BookOpen, DollarSign, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ConsultingEngineerDashboard() {
  const mockQueue = [
    { id: "REV-202", title: "Skyline Tower Electrical Schematic", type: "Blueprint Review", priority: "High", due: "2026-06-12" },
    { id: "REV-205", title: "Marina Mall Smoke Vent Plan", type: "Technical Evaluation", priority: "Critical", due: "2026-06-10" },
    { id: "REV-209", title: "Gulf Gas hydro-pressure calculations", type: "Quotation Drafting", priority: "Medium", due: "2026-06-18" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineer Workspace"
        description="Review assigned blueprints, draft safety compliance reports, and schedule inspection visits."
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-zinc-800 text-zinc-300 hover:bg-zinc-850">
            <RefreshCw className="h-4 w-4" /> Reload Tasks
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Reviews"
          value="5"
          description="blueprints under evaluation"
          icon={<BookOpen className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Pending Reports"
          value="3"
          description="draft inspections"
          icon={<FileCheck className="h-4 w-4 text-sky-500" />}
        />
        <StatsCard
          title="Pending Quotations"
          value="2"
          description="quotation cost sheets"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Upcoming Site Visits"
          value="4"
          description="on-site audits scheduled"
          icon={<MapPin className="h-4 w-4 text-rose-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-zinc-800 bg-zinc-900/60 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">My Review Queue</CardTitle>
            <CardDescription className="text-zinc-400">Assigned engineering review work orders</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="py-2.5">Code</th>
                  <th className="py-2.5">Task Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Priority</th>
                  <th className="py-2.5">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {mockQueue.map((q, i) => (
                  <tr key={i} className="hover:bg-zinc-850/30">
                    <td className="py-3 font-mono text-amber-500 font-semibold">{q.id}</td>
                    <td className="py-3 font-medium text-zinc-200">{q.title}</td>
                    <td className="py-3">{q.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        q.priority === "Critical"
                          ? "bg-rose-500/15 text-rose-400"
                          : q.priority === "High"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-zinc-500/15 text-zinc-400"
                      }`}>
                        {q.priority}
                      </span>
                    </td>
                    <td className="py-3">{q.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title="Review Accuracy Rate"
          score={99.8}
          description="Inspection review acceptance accuracy and safety standard calibration index."
        />
      </div>
    </div>
  );
}
export default ConsultingEngineerDashboard;
