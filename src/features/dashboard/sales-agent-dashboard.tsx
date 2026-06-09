"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Contact, FileQuestion, Star, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function SalesAgentDashboard() {
  const mockFollowUps = [
    { name: "Emaar Properties", request: "Burj Phase 2 Fire Audit", status: "Awaiting Quote", days: 2 },
    { name: "Marina Mall LLC", request: "Escalator Certification Plan", status: "Proposal Under Review", days: 4 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Workspace"
        description="Track customer portfolios, monitor new licensing requests progress, and manage relationships."
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-slate-800 text-slate-300 hover:bg-slate-850">
            <RefreshCw className="h-4 w-4" /> Sync Portfolio
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Assigned Customers"
          value="28"
          description="managed customer accounts"
          icon={<Contact className="h-4 w-4 text-indigo-500" />}
        />
        <StatsCard
          title="New Requests"
          value="9"
          description="registered in last 7 days"
          icon={<FileQuestion className="h-4 w-4 text-emerald-500" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Awaiting Follow-Up"
          value="5"
          description="pending client calls/responses"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Client Requests Under Follow-Up</CardTitle>
            <CardDescription className="text-slate-400">Read-only tracking of client safety request cycles</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Customer Name</th>
                  <th className="py-2.5">Associated Request</th>
                  <th className="py-2.5">Workflow Status</th>
                  <th className="py-2.5">In Phase (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {mockFollowUps.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-200">{f.name}</td>
                    <td className="py-3 text-slate-400">{f.request}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono">{f.days} days ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title="Customer Retention Rating"
          score={98.2}
          description="Client renewal and customer relationship satisfaction SLA metric."
        />
      </div>
    </div>
  );
}
export default SalesAgentDashboard;
