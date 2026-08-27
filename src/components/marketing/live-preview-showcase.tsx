"use client";

import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  FileCheck2,
  MapPin,
  BarChart3,
  Layers,
  Stamp,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export function LivePreviewShowcase() {
  const { t } = useTranslation();

  return (
    <section id="showcase" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("marketing:showcase_badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            {t("marketing:showcase_title")}
          </h2>
        </div>

        {/* Interactive Tabs Showcase */}
        <Tabs defaultValue="engineer" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 h-auto p-1.5 bg-secondary/50 border border-border/60 rounded-xl mb-8">
            <TabsTrigger
              value="engineer"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>{t("marketing:showcase_tab_engineer")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="operations"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              <span>{t("marketing:showcase_tab_operations")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{t("marketing:showcase_tab_analytics")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Engineering Blueprint Review Canvas */}
          <TabsContent value="engineer" className="focus-visible:outline-none">
            <div className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    مراجعة وتدقيق المخطط الهندسي رقم: DWG-SAF-2026-081
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    مشروع: برج الأفق التجاري • المسار: شبكة الرش الآلي ومضخات الحريق
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                    <CheckCircle className="h-3.5 w-3.5" />
                    مكتمل التدقيق
                  </Badge>
                  <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-primary/20">
                    <Stamp className="h-4 w-4" />
                    الختم الرقمي المعتمد
                  </Button>
                </div>
              </div>

              {/* Blueprint Mock Canvas Canvas Grid */}
              <div className="relative rounded-xl border border-border bg-secondary/40 h-72 sm:h-80 flex items-center justify-center overflow-hidden">
                {/* Blueprint grid pattern */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Annotation Badges on Mock Canvas */}
                <div className="absolute top-8 start-12 p-3 rounded-lg bg-card/90 border border-primary/40 shadow-lg text-xs space-y-1">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> صمام التحكم الرئيسي (OS&Y)
                  </span>
                  <p className="text-[11px] text-muted-foreground">مطابق لكود NFPA 13 البند 8.2</p>
                </div>

                <div className="absolute bottom-10 end-12 p-3 rounded-lg bg-card/90 border border-emerald-500/40 shadow-lg text-xs space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> ختم الاعتماد الهندسي CD-STAMP
                  </span>
                  <p className="text-[11px] text-muted-foreground">تم التوقيع بواسطة د. ماركوس فانس</p>
                </div>

                <p className="text-sm font-semibold text-muted-foreground/60 select-none">
                  [ محاكي عارض المخططات الهندسية التفاعلي CAD/BIM Canvas ]
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Operations Field Team & GPS Check-in */}
          <TabsContent value="operations" className="focus-visible:outline-none">
            <div className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    سجل الحوكمة الميدانية والتحقق الجغرافي (GPS Field Log)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    الزيارة الميدانية: VST-2026-440 • موقع: مستودعات السلي اللوجستية
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/30 gap-1 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  داخل النطاق الجغرافي (Geofenced: 12m)
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                  <span className="text-xs text-muted-foreground font-semibold">حالة التحقق الجغرافي:</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    24.7136° N, 46.6753° E
                  </p>
                  <p className="text-[11px] text-muted-foreground">تم التحقق آلياً عبر خادم SSLM</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                  <span className="text-xs text-muted-foreground font-semibold">الصور التوثيقية المرفقة:</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-primary" />
                    6 صور مع علامة مائية رقمية
                  </p>
                  <p className="text-[11px] text-muted-foreground">مختومة بالتاريخ والوقت والطقس</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                  <span className="text-xs text-muted-foreground font-semibold">تقرير الملاحظات والعيوب:</span>
                  <p className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    ملاحظة واحدة تم إغلاقها
                  </p>
                  <p className="text-[11px] text-muted-foreground">جاهز لإصدار محضر المعاينة</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Executive KPIs & Analytics */}
          <TabsContent value="analytics" className="focus-visible:outline-none">
            <div className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    المؤشرات التنفيذية ونسب الامتثال لكود الدفاع المدني
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    لوحة الإدارة العامة • ملخص الربع الأول 2026
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +28.4% نمو إنجاز التراخيص
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/30 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold">إجمالي الطلبات النشطة</span>
                  <p className="text-2xl font-black text-foreground">148</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold">شهادات سلامة صادرة</span>
                  <p className="text-2xl font-black text-primary">892</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold">الإيراد الضريبي 15%</span>
                  <p className="text-2xl font-black text-emerald-500">412,850 ر.س</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold">متوسط زمن المعاملة</span>
                  <p className="text-2xl font-black text-foreground">1.8 يوم</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
