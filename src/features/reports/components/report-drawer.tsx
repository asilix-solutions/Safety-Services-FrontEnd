import React, { useState } from "react";
import { Report } from "@/domains/reports/types";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Award, Printer, History, FileText, Link, Check, AlertTriangle, Archive, Send } from "lucide-react";
import { getReportStatusBadgeVariant, getReportStatusDisplayName, getReportTypeDisplayName } from "@/domains/reports/helpers";
import { BrandingSettings, CompanyProfileSettings } from "@/domains/settings/types";
import { useTranslation } from "@/providers/i18n-provider";
import { ReportDocument } from "../report-document";

interface ReportDrawerProps {
  report: Report | null;
  branding: BrandingSettings;
  company: CompanyProfileSettings;
  onClose: () => void;
  onApprove: (report: Report) => void;
  onReject: (report: Report, reason: string) => void;
  onArchive: (report: Report) => void;
  onDownload: (report: Report) => void;
  onSubmit: (report: Report) => void;
  userRole: string;
  t: (key: string) => string;
}

export function ReportDrawer({
  report,
  branding,
  company,
  onClose,
  onApprove,
  onReject,
  onArchive,
  onDownload,
  onSubmit,
  userRole,
  t,
}: ReportDrawerProps) {
  const { dir } = useTranslation();
  const side = dir === "rtl" ? "right" : "left";
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(report);

  React.useEffect(() => {
    if (report) {
      setActiveReport(report);
      setShowRejectForm(false);
      setRejectReason("");
    }
  }, [report]);

  const currentReport = report || activeReport;
  if (!currentReport) return null;

  // Permissions helpers
  const isAdmin = ["Super Admin", "Company Admin"].includes(userRole);
  const isAuthor = userRole === "Consulting Engineer" || isAdmin;

  // Parse snapshot content safely
  let contentData: any = null;
  try {
    if (currentReport.contentSnapshot) {
      contentData = JSON.parse(currentReport.contentSnapshot);
    }
  } catch (e) {
    console.error("Failed to parse report snapshot content", e);
  }

  const formatDateTime = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    onReject(currentReport, rejectReason);
    setShowRejectForm(false);
    setRejectReason("");
  };

  return (
    <>
      <Sheet open={!!report} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side={side} className="w-full sm:max-w-md h-full p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6 flex-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <SheetTitle className="text-lg font-bold text-foreground">
                  {t("reports:drawerTitle")}
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-muted-foreground font-mono mt-1">{currentReport.reportNumber}</SheetDescription>
              <h4 className="text-sm font-bold text-foreground mt-2">{t(currentReport.title) || currentReport.title}</h4>
              <div className="flex gap-2 mt-2">
                <Badge variant={getReportStatusBadgeVariant(currentReport.status)} className="uppercase text-[10px]">
                  {getReportStatusDisplayName(currentReport.status, t)}
                </Badge>
                <Badge variant="outline" className="uppercase text-[10px]">
                  {getReportTypeDisplayName(currentReport.reportType, t)}
                </Badge>
              </div>
            </div>

          {/* Section 1: Relationship Tracing */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <Link className="h-4 w-4 text-muted-foreground" />
              {t("reports:relationshipTitle")}
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-border/40 pb-1">
                <span className="text-muted-foreground">{t("reports:fieldClient")}:</span>
                <span className="text-foreground text-end">{currentReport.clientId}</span>
              </div>
              {currentReport.jobNumber && (
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">{t("reports:fieldRequest")}:</span>
                  <span className="text-foreground text-end">{currentReport.jobNumber}</span>
                </div>
              )}
              {currentReport.projectId && (
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">{t("reports:fieldProject")}:</span>
                  <span className="text-foreground text-end">{currentReport.projectId}</span>
                </div>
              )}
              {currentReport.siteVisitId && (
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">{t("reports:fieldSiteVisit")}:</span>
                  <span className="text-foreground text-end">{currentReport.siteVisitId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Snapshot Content */}
          {contentData && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t("reports:snapshotsTitle")}
              </h4>
              <div className="space-y-3 text-xs">
                {contentData.generalInfo && (
                  <div className="border-b border-border/45 pb-2">
                    <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                      {t("reports:fieldSummary")}
                    </span>
                    <p className="mt-1 text-foreground leading-relaxed">
                      {t(currentReport.summary) || currentReport.summary}
                    </p>
                  </div>
                )}

                {contentData.observations && contentData.observations.length > 0 && (
                  <div className="border-b border-border/45 pb-2">
                    <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                      {t("reports:fieldObservations")}
                    </span>
                    <ul className="list-disc ps-4 mt-1 text-foreground space-y-1">
                      {contentData.observations.map((obs: string, idx: number) => (
                        <li key={idx}>{t(obs) || obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {contentData.findings && contentData.findings.length > 0 && (
                  <div className="border-b border-border/45 pb-2">
                    <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                      {t("reports:fieldFindings")}
                    </span>
                    <ul className="list-disc ps-4 mt-1 text-foreground space-y-1">
                      {contentData.findings.map((finding: string, idx: number) => (
                        <li key={idx} className="text-warning-foreground">{t(finding) || finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {contentData.recommendations && contentData.recommendations.length > 0 && (
                  <div>
                    <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                      {t("reports:fieldRecommendations")}
                    </span>
                    <ul className="list-disc ps-4 mt-1 text-foreground space-y-1">
                      {contentData.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{t(rec) || rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Timeline & Audit */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/15">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <History className="h-4 w-4 text-muted-foreground" />
              {t("reports:timelineTitle")}
            </h4>
            <div className="space-y-3 text-xs ps-2 border-s-2 border-primary/20 ms-2">
              {currentReport.timeline.map((event) => (
                <div className="relative ps-3" key={event.id}>
                  <span className="absolute -start-[18px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="font-semibold block capitalize">{t(`reports:action_${event.action}`) || event.action}</span>
                  <span className="text-[10px] text-muted-foreground block">{formatDateTime(event.performedAt)} - {event.performedBy}</span>
                  {event.notes && <span className="text-[10px] text-muted-foreground block mt-0.5">{t(event.notes) || event.notes}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Form overlay inline */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
              <span className="text-xs font-semibold text-destructive uppercase block">{t("reports:rejectReasonTitle") || "Provide Rejection Reason"}</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("reports:rejectReasonPlaceholder") || "Reason for report rejection..."}
                className="w-full text-xs bg-background border border-border rounded p-2 h-20 text-foreground resize-none"
                required
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)} className="cursor-pointer text-xs h-8 px-2">
                  {t("common:cancel") || "Cancel"}
                </Button>
                <Button type="submit" size="sm" className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/95 text-xs h-8 px-2 border-none">
                  {t("reports:btnConfirmReject") || "Confirm Reject"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-border flex flex-wrap justify-end gap-2">
          {/* Submit action for Consulting Engineer / Author */}
          {currentReport.status === "DRAFT" && isAuthor && !showRejectForm && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSubmit(currentReport)}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {t("reports:btnSubmit")}
            </Button>
          )}

          {/* Approve/Reject actions for Admins */}
          {currentReport.status === "SUBMITTED" && isAdmin && !showRejectForm && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(currentReport)}
                className="gap-1.5 text-xs cursor-pointer bg-success hover:bg-success/90 text-success-foreground border-none"
              >
                <Check className="h-4 w-4" />
                {t("reports:btnApprove")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowRejectForm(true)}
                className="gap-1.5 text-xs cursor-pointer border-none"
              >
                <AlertTriangle className="h-4 w-4" />
                {t("reports:btnReject")}
              </Button>
            </>
          )}

          {/* Archive action */}
          {currentReport.status === "APPROVED" && isAdmin && !showRejectForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(currentReport)}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Archive className="h-4 w-4" />
              {t("reports:btnArchive")}
            </Button>
          )}

          {/* Print / save as PDF — always available */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(currentReport)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            {t("reports:btnPrint")}
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose} className="cursor-pointer">
            {t("common:close")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    {/*
      The printable artifact for the report currently open.

      A sibling of the overlay, not a child: the overlay is `fixed inset-0`, which
      would become the containing block for the sheet's absolute print lift and
      clip it to one viewport height — a report longer than a page would simply
      lose its later pages.
    */}
    {currentReport && <ReportDocument report={currentReport} branding={branding} company={company} t={t} />}
    </>
  );
}
export default ReportDrawer;
