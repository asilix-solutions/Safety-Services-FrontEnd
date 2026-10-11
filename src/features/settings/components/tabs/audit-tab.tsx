"use client";

import React, { useState, useEffect } from "react";
import {
  auditApi,
  AuditLogDto,
  AuditLogDetailDto,
  AuditActionType,
} from "@/domains/audit/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  ShieldAlert,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  UserCheck,
  Database,
  ArrowRightLeft,
} from "lucide-react";
import { alertService } from "@/services/alert-notification";

export function AuditTab() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogDetailDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // CSV Exporting
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async (page = pageNumber, search = searchTerm, actionFilter = selectedAction) => {
    try {
      setLoading(true);
      const actionNum = actionFilter !== "all" ? Number(actionFilter) : undefined;
      const res = await auditApi.getAuditLogs({
        pageNumber: page,
        pageSize: 15,
        searchTerm: search.trim() || undefined,
        action: actionNum as AuditActionType,
      });

      if (res.isSuccess && res.data) {
        setLogs(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
        setPages(res.data.totalPages || 1);
        setPageNumber(res.data.pageNumber || 1);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch live audit logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, searchTerm, selectedAction);
  }, [selectedAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, searchTerm, selectedAction);
  };

  const handleViewDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);
      const res = await auditApi.getAuditLogById(id);
      if (res.isSuccess && res.data) {
        setSelectedLog(res.data);
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في استرجاع تفاصيل سجل الرقابة", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const actionNum = selectedAction !== "all" ? Number(selectedAction) : undefined;
      const res = await auditApi.exportAuditLogs({
        searchTerm: searchTerm.trim() || undefined,
        action: actionNum as AuditActionType,
      });

      // Handle Blob
      const blob = res as unknown as Blob;
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alertService.showSuccess("تم تصدير سجل الرقابة بنجاح", "تم تحميل ملف CSV على جهازك.");
    } catch (err: any) {
      alertService.showError("فشل في تصدير سجل الرقابة", err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatActionBadge = (action: AuditActionType) => {
    switch (action) {
      case AuditActionType.Create:
        return <Badge variant="success" className="text-[10px]">إنشاء (Create)</Badge>;
      case AuditActionType.Update:
        return <Badge variant="default" className="text-[10px]">تعديل (Update)</Badge>;
      case AuditActionType.Delete:
        return <Badge variant="destructive" className="text-[10px]">حذف (Delete)</Badge>;
      case AuditActionType.Login:
        return <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">تسجيل دخول (Login)</Badge>;
      case AuditActionType.Logout:
        return <Badge variant="outline" className="text-[10px]">تسجيل خروج (Logout)</Badge>;
      case AuditActionType.StateTransition:
        return <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600 bg-amber-500/10">انتقال حالة (State Transition)</Badge>;
      case AuditActionType.Authorize:
        return <Badge variant="outline" className="text-[10px] border-cyan-500 text-cyan-600 bg-cyan-500/10">تفويض (Authorize)</Badge>;
      case AuditActionType.Export:
        return <Badge variant="outline" className="text-[10px]">تصدير (Export)</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">عملية ({action})</Badge>;
    }
  };

  const renderJsonPretty = (rawJson?: string | null) => {
    if (!rawJson) return <span className="text-muted-foreground italic text-xs">لا توجد بيانات</span>;
    try {
      const parsed = JSON.parse(rawJson);
      return (
        <pre className="text-[11px] font-mono bg-secondary/15 p-3 rounded-lg overflow-x-auto text-foreground dir-ltr text-left">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return (
        <pre className="text-[11px] font-mono bg-secondary/15 p-3 rounded-lg overflow-x-auto text-foreground dir-ltr text-left">
          {rawJson}
        </pre>
      );
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base font-bold">
                سجل الرقابة وتتبع العمليات الإدارية (Audit Trail)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                {totalCount} سجل موثق
              </Badge>
            </div>
            <CardDescription className="text-xs">
              سجل تدقيق غير قابل للتلاعب يرصد كافة التعديلات، تسجيل الدخول، وانتقالات الحالات مع عنوان IP وهوية المستخدم.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pageNumber, searchTerm, selectedAction)}
              disabled={loading}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={exporting || logs.length === 0}
              isLoading={exporting}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              تصدير CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالكيان، المعرف، أو عنوان IP..."
              className="ps-9 text-xs h-9"
            />
          </form>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
          >
            <option value="all">كافة العمليات (All Actions)</option>
            <option value="1">إنشاء (Create)</option>
            <option value="2">تعديل (Update)</option>
            <option value="3">حذف (Delete)</option>
            <option value="4">تسجيل دخول (Login)</option>
            <option value="5">تسجيل خروج (Logout)</option>
            <option value="6">انتقال حالة (State Transition)</option>
            <option value="7">تفويض (Authorize)</option>
            <option value="8">تصدير (Export)</option>
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs text-start">
            <thead className="bg-secondary/15 text-muted-foreground text-[11px] border-b border-border">
              <tr>
                <th className="p-2.5 font-semibold text-start">التاريخ والوقت</th>
                <th className="p-2.5 font-semibold text-start">نوع العملية</th>
                <th className="p-2.5 font-semibold text-start">الكيان (Entity)</th>
                <th className="p-2.5 font-semibold text-start">الحقول المعدلة</th>
                <th className="p-2.5 font-semibold text-start">عنوان IP</th>
                <th className="p-2.5 font-semibold text-end">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {loading ? "جاري تحميل سجلات الرقابة..." : "لا توجد سجلات تطابق شروط البحث"}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">{formatActionBadge(log.action)}</td>
                    <td className="p-2.5 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{log.entityName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-muted-foreground">
                      {log.changedColumns || "—"}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="p-2.5 text-end whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(log.id)}
                        className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        عرض الفروقات
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div>
            صفحة <span className="font-bold text-foreground">{pageNumber}</span> من{" "}
            <span className="font-bold text-foreground">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1 || loading}
              onClick={() => fetchLogs(pageNumber - 1, searchTerm, selectedAction)}
              className="h-8 text-xs gap-1"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= totalPages || loading}
              onClick={() => fetchLogs(pageNumber + 1, searchTerm, selectedAction)}
              className="h-8 text-xs gap-1"
            >
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Audit Record Details & JSON Diff Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              تفاصيل عملية التدقيق وتتبع الحالة
            </DialogTitle>
            <DialogDescription className="text-xs">
              معاينة الحالة السابقة واللاحقة (State Mutation Diff)
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs">جاري تحميل الحالة التفصيلية...</p>
            </div>
          ) : selectedLog ? (
            <div className="space-y-4 py-2 text-xs">
              {/* Metadata card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-secondary/10">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    المنفذ
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedLog.performedByName || selectedLog.performedByEmail || "النظام (System)"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    نوع العملية
                  </span>
                  <div>{formatActionBadge(selectedLog.action)}</div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    عنوان IP
                  </span>
                  <span className="font-mono text-foreground">{selectedLog.ipAddress || "—"}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    الكيان / المعرف
                  </span>
                  <span className="font-mono text-foreground">
                    {selectedLog.entityName} • {selectedLog.entityId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    التاريخ والوقت
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString("ar-SA")}
                  </span>
                </div>
              </div>

              {/* Old vs New State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-amber-500" />
                    الحالة السابقة (Old State)
                  </span>
                  {renderJsonPretty(selectedLog.oldValues)}
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-500" />
                    الحالة الجديدة (New State)
                  </span>
                  {renderJsonPretty(selectedLog.newValues)}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default AuditTab;
