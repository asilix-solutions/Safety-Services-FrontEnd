"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { KpiCard } from "./components/kpi-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Building2, CreditCard, Users2, ShieldCheck, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function SuperAdminDashboard() {
  const mockCompanies = [
    { name: "Apex Safety Ltd", owner: "Fahad Qasim", plan: "Enterprise Premium", status: "Active", date: "2026-05-10" },
    { name: "Safety Shield Co.", owner: "Salim Obaid", plan: "Basic Business", status: "Active", date: "2026-05-28" },
    { name: "Gulf Fire Engineering", owner: "Khalid Issa", plan: "Standard Growth", status: "Trial Expired", date: "2026-06-01" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Global SaaS metrics, subscription monitoring, and tenant control console."
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <RefreshCw className="h-4 w-4" /> Sync Metrics
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Companies"
          value="18"
          description="registered tenants"
          icon={<Building2 className="h-4 w-4 text-indigo-500" />}
        />
        <StatsCard
          title="Active Subscriptions"
          value="14"
          description="recurring monthly accounts"
          icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Expiring Subscriptions"
          value="3"
          description="renewals due in 30 days"
          icon={<Layers className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Total Users"
          value="142"
          description="platform accounts registered"
          icon={<Users2 className="h-4 w-4 text-sky-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Company Registrations</CardTitle>
            <CardDescription className="text-slate-400">Newly provisioned SaaS tenants</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Company</th>
                  <th className="py-2.5">Owner</th>
                  <th className="py-2.5">Plan</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {mockCompanies.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3">{c.owner}</td>
                    <td className="py-3">{c.plan}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <KpiCard
          title="Global SLA Compliance"
          score={99.4}
          description="Platform uptime and system performance index across all tenants."
        />
      </div>
    </div>
  );
}
export default SuperAdminDashboard;
