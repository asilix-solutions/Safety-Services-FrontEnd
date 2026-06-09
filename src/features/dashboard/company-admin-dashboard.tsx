"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { ClipboardCopy, FolderKanban, FileSignature, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function CompanyAdminDashboard() {
  const mockRequests = [
    { id: "REQ-0932", name: "Al Hamra Warehouse Fire Review", client: "Al Hamra Retail", status: "awaiting_approval", date: "2026-06-08" },
    { id: "REQ-0891", name: "Modern Offices Safety Certificate", client: "Tamkeen Co.", status: "under_review", date: "2026-06-07" },
    { id: "REQ-0854", name: "Plaza Hotel Ventilation Audit", client: "Plaza Group", status: "quotation_created", date: "2026-06-05" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Administration"
        description="Oversee safety compliance projects, requests, client contracts, and billings."
        actions={
          <Button size="sm" className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <RefreshCw className="h-4 w-4" /> Sync Data
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value="42"
          description="licensing/review requests"
          icon={<ClipboardCopy className="h-4 w-4 text-indigo-500" />}
        />
        <StatsCard
          title="Active Projects"
          value="15"
          description="ongoing safety operations"
          icon={<FolderKanban className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Pending Reviews"
          value="7"
          description="blueprint reviews assigned"
          icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Contracts Awaiting Signature"
          value="4"
          description="pending client execution"
          icon={<FileSignature className="h-4 w-4 text-rose-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Requests Queue</CardTitle>
            <CardDescription className="text-slate-400">Review requests waiting for engineering pipeline processing</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Request Name</th>
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {mockRequests.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-indigo-400 font-semibold">{r.id}</td>
                    <td className="py-3 font-medium text-slate-200">{r.name}</td>
                    <td className="py-3">{r.client}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === "awaiting_approval"
                          ? "bg-amber-500/10 text-amber-400"
                          : r.status === "under_review"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title="Company SLA Performance"
          score={97.1}
          description="Average response turnaround time on client blueprints."
        />
      </div>
    </div>
  );
}
export default CompanyAdminDashboard;
