"use client";

import React from "react";
import { StatsCard } from "./components/stats-card";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { FileQuestion, FolderOpen, FileText, Receipt, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ClientDashboard() {
  const mockTimeline = [
    { title: "Fire Safety Audit Commenced", desc: "Inspection engineer has arrived on Skyline Tower premises.", date: "Today, 10:15 AM" },
    { title: "Quotation Generated", desc: "Quotation for Marina Mall Unit B22 issued and awaiting signature.", date: "Yesterday, 2:30 PM" },
    { title: "Blueprint Review Approved", desc: "Structural load calculations for Vertex HQ site approved by reviewer.", date: "June 05, 2026" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome to your Safety Portal"
        description="Monitor inspection requests, sign engineering contracts, review invoices, and track live project milestones."
        actions={
          <Button className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10">
            <RefreshCw className="h-4 w-4" /> Refresh Portal
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Requests"
          value="3"
          description="safety evaluation requests"
          icon={<FileQuestion className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="My Active Projects"
          value="2"
          description="ongoing safety audits"
          icon={<FolderOpen className="h-4 w-4 text-sky-500" />}
        />
        <StatsCard
          title="My Contracts"
          value="1"
          description="signed service agreement"
          icon={<FileText className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="My Invoices"
          value="2"
          description="outstanding invoices"
          icon={<Receipt className="h-4 w-4 text-indigo-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Latest Project Updates</CardTitle>
            <CardDescription className="text-slate-400">Chronological history of safety licensing events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
              {mockTimeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{item.title}</span>
                      <span className="text-slate-400 font-medium">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Need Engineering Support?</CardTitle>
            <CardDescription className="text-slate-400">Get in touch directly with our assigned safety team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Assigned Safety Engineer</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">Eng. Tariq Al-Mansoor</p>
              <p className="text-[10px] text-slate-400 mt-1">Lead Safety & Licensing Auditor</p>
            </div>
            <Button className="w-full text-xs gap-1.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700">
              Submit Safety Inquiry <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default ClientDashboard;
