"use client";

import React, { useState } from "react";
import { useMaintenance } from "../hooks/use-maintenance";
import { OpenContractDialog } from "./open-contract-dialog";
import { RescheduleVisitDialog } from "./reschedule-visit-dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  CalendarClock,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import {
  MaintenanceContractStatus,
  MaintenanceVisitStatus,
} from "@/domains/maintenance/api";

export function MaintenanceDashboard() {
  const {
    contracts,
    calendarEntries,
    isLoading,
    isLiveSynced,
    kpis,
    refreshAll,
    handleOpenContract,
    handleRescheduleVisit,
  } = useMaintenance();

  const [isOpenContractModalOpen, setIsOpenContractModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    visitId: string;
    currentDate?: string;
  } | null>(null);

  const getContractStatusBadge = (status: MaintenanceContractStatus) => {
    switch (status) {
      case MaintenanceContractStatus.Active:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            ساري ونشط
          </Badge>
        );
      case MaintenanceContractStatus.Draft:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            مسودة
          </Badge>
        );
      case MaintenanceContractStatus.Completed:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            مكتمل
          </Badge>
        );
      case MaintenanceContractStatus.Cancelled:
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            ملغى
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getVisitStatusBadge = (status: MaintenanceVisitStatus) => {
    switch (status) {
      case MaintenanceVisitStatus.Scheduled:
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
            مجدولة
          </Badge>
        );
      case MaintenanceVisitStatus.Raised:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            معاملة مفتوحة
          </Badge>
        );
      case MaintenanceVisitStatus.InProgress:
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            قيد التنفيذ
          </Badge>
        );
      case MaintenanceVisitStatus.Completed:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            منفذة
          </Badge>
        );
      case MaintenanceVisitStatus.Missed:
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            فائتة
          </Badge>
        );
      case MaintenanceVisitStatus.Cancelled:
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20">
            ملغاة
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              إدارة عقود الصيانة الدورية والزيارات
            </h1>
            {isLiveSynced && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                مزامنة حية مع أمانكس
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            جدولة الزيارات الوقائية، إدارة عقود الصيانة السنوية، وتتبع الإنجاز وفق متطلبات الدفاع المدني السعودي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ml-1.5 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpenContractModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          >
            <Plus className="h-3.5 w-3.5 ml-1.5" />
            فتح عقد صيانة جديد
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">إجمالي العقود</p>
              <p className="text-2xl font-bold text-foreground">{kpis.totalContracts}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">العقود النشطة السارية</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {kpis.activeContracts}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">الزيارات المجدولة القادمة</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {kpis.scheduledVisits}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CalendarClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">الزيارات المنجزة</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {kpis.completedVisits}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="calendar" className="text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            جدول الزيارات الميدانية ({calendarEntries.length})
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            سجل عقود الصيانة ({contracts.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visits Calendar */}
        <TabsContent value="calendar" className="space-y-4">
          {calendarEntries.length === 0 ? (
            <Card className="border border-dashed p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">لا توجد زيارات ميدانية مجدولة حالياً</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                عند فتح عقد صيانة دورية، سيقوم محرك أمانكس بتوزيع زيارات التفتيش الوقائي تلقائياً وعرضها في هذا الجدول.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpenContractModalOpen(true)}
                className="mt-4 text-xs"
              >
                <Plus className="h-3.5 w-3.5 ml-1.5" />
                فتح عقد صيانة وتوليد الزيارات
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarEntries.map((entry) => (
                <Card key={entry.visitId} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary">
                        زيارة رقم #{entry.visitNumber}
                      </span>
                      {getVisitStatusBadge(entry.status)}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>رقم العقد:</span>
                        <span className="font-mono font-medium text-foreground">{entry.contractNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>العميل:</span>
                        <span className="font-medium text-foreground">{entry.clientName || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>تاريخ الزيارة:</span>
                        <span className="font-medium text-foreground">
                          {new Date(entry.dueOnUtc).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {entry.raisedJobNumber && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>المعاملة الميدانية:</span>
                          <span className="font-mono text-primary font-bold">{entry.raisedJobNumber}</span>
                        </div>
                      )}
                    </div>

                    {entry.status === MaintenanceVisitStatus.Scheduled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRescheduleData({
                            visitId: entry.visitId,
                            currentDate: entry.dueOnUtc,
                          })
                        }
                        className="w-full text-xs mt-2"
                      >
                        <CalendarClock className="h-3.5 w-3.5 ml-1.5" />
                        إعادة جدولة الزيارة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Contracts Roster */}
        <TabsContent value="contracts" className="space-y-4">
          {contracts.length === 0 ? (
            <Card className="border border-dashed p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">سجل عقود الصيانة فارغ</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                لم يتم تسجيل أي عقود صيانة دورية حتى الآن في المنشأة.
              </p>
              <Button
                size="sm"
                onClick={() => setIsOpenContractModalOpen(true)}
                className="mt-4 text-xs"
              >
                <Plus className="h-3.5 w-3.5 ml-1.5" />
                تأسيس أول عقد صيانة
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Mobile Card List View (< 768px) */}
              <div className="md:hidden space-y-3">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="p-4 border-border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {contract.contractNumber}
                      </span>
                      {getContractStatusBadge(contract.status)}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="font-medium text-foreground">{contract.clientName || "—"}</p>
                      </div>
                      {contract.sourceJobNumber && (
                        <p className="text-xs text-muted-foreground font-mono ps-5">
                          المعاملة: {contract.sourceJobNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/40 border border-border/50">
                      <div>
                        <span className="block text-[10px] text-muted-foreground">مدة العقد</span>
                        <span className="font-medium text-foreground">{contract.termMonths} شهر</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">الدورية السنوية</span>
                        <span className="font-medium text-foreground">{contract.visitsPerYear} زيارات / سنة</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">الزيارات المنجزة:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {contract.visitsCompleted} / {contract.visitsScheduled + contract.visitsCompleted}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">رقم العقد</th>
                        <th className="p-3">المعاملة المصدر</th>
                        <th className="p-3">اسم العميل</th>
                        <th className="p-3">مدة العقد</th>
                        <th className="p-3">دورية الزيارات</th>
                        <th className="p-3">الزيارات المنجزة</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {contracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-foreground">
                            {contract.contractNumber}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">
                            {contract.sourceJobNumber || "—"}
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {contract.clientName || "—"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {contract.termMonths} شهر
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {contract.visitsPerYear} زيارات / سنة
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {contract.visitsCompleted}
                            </span>{" "}
                            / {contract.visitsScheduled + contract.visitsCompleted}
                          </td>
                          <td className="p-3">
                            {getContractStatusBadge(contract.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <OpenContractDialog
        isOpen={isOpenContractModalOpen}
        onClose={() => setIsOpenContractModalOpen(false)}
        onSubmit={handleOpenContract}
      />

      {rescheduleData && (
        <RescheduleVisitDialog
          visitId={rescheduleData.visitId}
          currentDate={rescheduleData.currentDate}
          isOpen={!!rescheduleData}
          onClose={() => setRescheduleData(null)}
          onSubmit={handleRescheduleVisit}
        />
      )}
    </div>
  );
}
