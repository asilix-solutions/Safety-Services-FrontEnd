import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface ExecutionSummaryCardProps {
  totals: {
    totalLabor: number;
    totalMaterialsCost: number;
    totalMaterialsCount: number;
  };
  projectStatus: string;
  kickoffNotes?: string;
  t: any;
}

export function ExecutionSummaryCard({ totals, projectStatus, kickoffNotes, t }: ExecutionSummaryCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Procurement Summary Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("projects:procurement.title") || "Procurement & Materials"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">{t("projects:procurement.totalCost") || "Est. Materials Cost"}</span>
            <span className="font-bold text-foreground">{totals.totalMaterialsCost.toLocaleString()} SAR</span>
          </div>
          {totals.totalMaterialsCount > 0 ? (
            <>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">{t("projects:procurement.invoices") || "Procurement Invoices"}</span>
                <span className="font-semibold text-foreground">{t("requests:details.invoicesCount")?.replace("{{count}}", "1") || "1 Invoice"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t("projects:procurement.pending") || "Pending Items"}</span>
                <span className="font-semibold text-foreground">{t("requests:details.itemsCount")?.replace("{{count}}", String(totals.totalMaterialsCount)) || `${totals.totalMaterialsCount} items`}</span>
              </div>
            </>
          ) : (
            <div className="pt-2 text-muted-foreground text-[10px] italic">
              <p>{t("projects:procurement.noInvoices") || "No procurement invoices logged yet."}</p>
              <p className="mt-1">{t("projects:procurement.noMaterials") || "No materials logged yet."}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labor Snapshot Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("projects:labor.title") || "Field Workforce"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {totals.totalLabor > 0 ? (
            <>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">{t("projects:labor.crewSize") || "On-Site Technicians"}</span>
                <span className="font-bold text-foreground">{t("requests:details.techsCount")?.replace("{{count}}", String(totals.totalLabor)) || `${totals.totalLabor} Techs`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">{t("projects:labor.fieldStatus") || "Execution Status"}</span>
                <span className="font-semibold text-foreground capitalize">{t(`projects:status.${projectStatus}`) || projectStatus}</span>
              </div>
            </>
          ) : (
            <div className="pt-1 text-muted-foreground text-[10px] italic pb-2">
              {t("projects:labor.noStaff") || "No field technician staff allocated to this site yet."}
            </div>
          )}
          <div className="flex flex-col py-1">
            <span className="text-muted-foreground block mb-1">{t("projects:labor.fieldNotes") || "Daily Operations Log"}</span>
            <p className="p-2 bg-secondary/25 border border-border rounded text-[10px] text-muted-foreground italic">
              {kickoffNotes || t("requests:details.noNotes") || "No kickoff notes logged."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
