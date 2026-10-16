"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  DollarSign,
  User,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { toast } from "sonner";

export interface Deal {
  id: string;
  facilityName: string;
  clientName: string;
  value: number;
  stage: "NEW" | "SURVEY" | "QUOTING" | "SENT" | "WON";
  category: "شبكات إطفاء" | "إنذار مبكر" | "مخارج طوارئ" | "صيانة سنوية";
  salesRep: string;
  date: string;
}

const STAGES = [
  { id: "NEW", title: "فرصة جديدة", color: "border-t-blue-500", count: 3 },
  { id: "SURVEY", title: "معاينة مجدولة", color: "border-t-purple-500", count: 2 },
  { id: "QUOTING", title: "دراسة وتسعير هندسي", color: "border-t-amber-500", count: 4 },
  { id: "SENT", title: "عرض سعر مرسل للعميل", color: "border-t-indigo-500", count: 3 },
  { id: "WON", title: "معتمد وتم التعميد", color: "border-t-emerald-500", count: 5 },
] as const;

const INITIAL_DEALS: Deal[] = [
  {
    id: "deal-01",
    facilityName: "مجمع النور التجاري (Mall)",
    clientName: "شركة إعمار الأفق",
    value: 185000,
    stage: "NEW",
    category: "شبكات إطفاء",
    salesRep: "عبدالله الراجحي",
    date: "2026-10-14",
  },
  {
    id: "deal-02",
    facilityName: "مصنع البلاستيك الوطني",
    clientName: "مجموعة الصناعات المتقدمة",
    value: 320000,
    stage: "SURVEY",
    category: "إنذار مبكر",
    salesRep: "سارة المنصور",
    date: "2026-10-15",
  },
  {
    id: "deal-03",
    facilityName: "برج الفهد السكني",
    clientName: "مؤسسة الفهد العقارية",
    value: 95000,
    stage: "QUOTING",
    category: "مخارج طوارئ",
    salesRep: "عبدالله الراجحي",
    date: "2026-10-12",
  },
  {
    id: "deal-04",
    facilityName: "مستشفى الأمل التخصصي",
    clientName: "شركة الرعاية الطبية الأولى",
    value: 480000,
    stage: "SENT",
    category: "شبكات إطفاء",
    salesRep: "سارة المنصور",
    date: "2026-10-10",
  },
  {
    id: "deal-05",
    facilityName: "مستودعات سحاب للوجستيات",
    clientName: "شركة سحاب اللوجستية",
    value: 240000,
    stage: "WON",
    category: "صيانة سنوية",
    salesRep: "عبدالله الراجحي",
    date: "2026-10-08",
  },
];

export function PipelineView() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [viewMode, setViewMode] = useState<"KANBAN" | "LIST">("KANBAN");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Deal State
  const [facility, setFacility] = useState("");
  const [client, setClient] = useState("");
  const [value, setValue] = useState("120000");
  const [category, setCategory] = useState<Deal["category"]>("شبكات إطفاء");
  const [salesRep, setSalesRep] = useState("عبدالله الراجحي");

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === "WON").reduce((acc, d) => acc + d.value, 0);

  const handleAdvance = (dealId: string) => {
    const stageOrder: Deal["stage"][] = ["NEW", "SURVEY", "QUOTING", "SENT", "WON"];
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const currentIndex = stageOrder.indexOf(d.stage);
          if (currentIndex < stageOrder.length - 1) {
            const nextStage = stageOrder[currentIndex + 1];
            toast.success(`تم ترقية الفرصة إلى مرحلة: ${STAGES.find((s) => s.id === nextStage)?.title}`);
            return { ...d, stage: nextStage };
          }
        }
        return d;
      })
    );
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility || !client) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      facilityName: facility,
      clientName: client,
      value: Number(value) || 0,
      stage: "NEW",
      category,
      salesRep,
      date: new Date().toISOString().split("T")[0],
    };

    setDeals((prev) => [newDeal, ...prev]);
    setIsAddModalOpen(false);
    toast.success("تم إدراج فرصة المبيعات الجديدة في مسار الصفقات");

    setFacility("");
    setClient("");
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">مسار المبيعات وعروض الأسعار (Pipeline)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            إدارة دورة حياة الفرص التجارية من الاستفسار الأولي حتى المعاينة الهندسية واعتماد عرض السعر.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === "KANBAN" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              لوحة كانبان
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === "LIST" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              عرض الجدول
            </button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            إضافة فرصة جديدة
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">إجمالي قيمة مسار المبيعات</p>
              <h3 className="text-2xl font-bold tracking-tight">{totalPipelineValue.toLocaleString()} ر.س</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">عروض أسعار معتمدة ومقفلة</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {wonValue.toLocaleString()} ر.س
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">الفرص النشطة الجارية</p>
              <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {deals.filter((d) => d.stage !== "WON").length} صفقات
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">نسبة التحويل (Win Rate)</p>
              <h3 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">68%</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board View */}
      {viewMode === "KANBAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const colDeals = deals.filter((d) => d.stage === col.id);
            const colTotal = colDeals.reduce((a, b) => a + b.value, 0);

            return (
              <div
                key={col.id}
                className={`bg-muted/40 rounded-2xl p-3 border border-border border-t-4 ${col.color} flex flex-col min-w-[240px]`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{col.title}</h3>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {colTotal.toLocaleString()} ر.س
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-background text-xs font-bold flex items-center justify-center border border-border">
                    {colDeals.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <AnimatePresence mode="popLayout">
                    {colDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <Card className="rounded-xl border-border/80 shadow-xs hover:shadow-sm transition-all bg-card">
                          <CardContent className="p-3.5 space-y-2.5">
                            <div>
                              <Badge variant="outline" className="text-[10px] mb-1 font-normal">
                                {deal.category}
                              </Badge>
                              <h4 className="text-xs font-bold text-foreground leading-snug">
                                {deal.facilityName}
                              </h4>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building className="h-3 w-3 shrink-0" />
                                {deal.clientName}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/60">
                              <span className="font-bold text-xs text-primary font-mono">
                                {deal.value.toLocaleString()} ر.س
                              </span>
                              <span className="text-[10px] text-muted-foreground">{deal.salesRep}</span>
                            </div>

                            {deal.stage !== "WON" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAdvance(deal.id)}
                                className="w-full h-7 text-[11px] rounded-lg gap-1 hover:bg-primary/10 hover:text-primary transition-colors mt-1"
                              >
                                <span>ترقية للمرحلة التالية</span>
                                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 text-start">المنشأة والعميل</th>
                  <th className="px-6 py-4 text-start">تصنيف الخدمة</th>
                  <th className="px-6 py-4 text-start">القيمة المقدرة</th>
                  <th className="px-6 py-4 text-start">مرحلة العرض</th>
                  <th className="px-6 py-4 text-start">مسؤول المبيعات</th>
                  <th className="px-6 py-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map((deal) => {
                  const stage = STAGES.find((s) => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold block text-foreground">{deal.facilityName}</span>
                        <span className="text-xs text-muted-foreground">{deal.clientName}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {deal.category}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary">
                        {deal.value.toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-muted border border-border">
                          {stage?.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {deal.salesRep}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {deal.stage !== "WON" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdvance(deal.id)}
                            className="h-7 text-xs rounded-lg"
                          >
                            ترقية
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Deal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              إضافة صفقة / فرصة مبيعات جديدة
            </DialogTitle>
            <DialogDescription>
              تسجيل بيانات المنشأة المستهدفة والقيمة المالية المقدرة لعرض السعر.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDeal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">اسم المنشأة أو المشروع</Label>
              <Input
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="مثال: مجمع السلام التجاري"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">اسم العميل أو الشركة المالكة</Label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="مثال: شركة التطوير العقاري المتقدمة"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">القيمة التقديرية (ر.س)</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="150000"
                  required
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">تصنيف الخدمة</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="شبكات إطفاء">شبكات إطفاء ورشاشات</option>
                  <option value="إنذار مبكر">إنذار وكشف مبكر</option>
                  <option value="مخارج طوارئ">مخارج ومسالك هروب</option>
                  <option value="صيانة سنوية">عقد صيانة سنوي</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">مسؤول المبيعات</Label>
              <Input
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                placeholder="اسم ممثل المبيعات"
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" variant="default" className="rounded-xl">
                إضافة الفرصة
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
