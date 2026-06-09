"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Hammer, PlayCircle, AlertTriangle, Wallet, Users, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function OperationsOfficerDashboard() {
  const mockObstacles = [
    { project: "Skyline Tower Fire Certification", obstacle: "Water pressure pump valve malfunction", severity: "High", date: "2026-06-08" },
    { project: "Metro Line 4 Ventilation Plan", obstacle: "Air flow calculation mismatch at Station 3", severity: "Medium", date: "2026-06-06" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Desk"
        description="Monitor active safety projects execution, coordinate labor, track expenses, and resolve site obstacles."
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-zinc-800 text-zinc-300 hover:bg-zinc-850">
            <RefreshCw className="h-4 w-4" /> Sync Operations
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Active Projects"
          value="18"
          description="projects in execution"
          icon={<PlayCircle className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Near Deadline"
          value="3"
          description="due within 7 days"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
        />
        <StatsCard
          title="Open Obstacles"
          value="2"
          description="pending resolution"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Expense Approvals"
          value="6"
          description="awaiting approval"
          icon={<Wallet className="h-4 w-4 text-indigo-500" />}
        />
        <StatsCard
          title="Labor Assignments"
          value="12"
          description="technicians dispatched"
          icon={<Hammer className="h-4 w-4 text-sky-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-zinc-800 bg-zinc-900/60 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Active Obstacles & Site Blockages</CardTitle>
            <CardDescription className="text-zinc-400">Issues delaying safety sign-off</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="py-2.5">Project Name</th>
                  <th className="py-2.5">Obstacle / Log</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {mockObstacles.map((o, i) => (
                  <tr key={i} className="hover:bg-zinc-850/30">
                    <td className="py-3 font-semibold text-zinc-200">{o.project}</td>
                    <td className="py-3 text-zinc-400">{o.obstacle}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        o.severity === "High" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {o.severity}
                      </span>
                    </td>
                    <td className="py-3">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title="Safety Project Velocity"
          score={91.4}
          description="On-time project task completion and schedule compliance metric."
        />
      </div>
    </div>
  );
}
export default OperationsOfficerDashboard;
