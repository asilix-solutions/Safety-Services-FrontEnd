"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";

// Recharts data
const REVENUE_DATA = [
  { month: "يناير", revenue: 142000, vat: 21300, target: 120000 },
  { month: "فبراير", revenue: 185000, vat: 27750, target: 140000 },
  { month: "مارس", revenue: 210000, vat: 31500, target: 160000 },
  { month: "أبريل", revenue: 195000, vat: 29250, target: 170000 },
  { month: "مايو", revenue: 260000, vat: 39000, target: 200000 },
  { month: "يونيو", revenue: 320000, vat: 48000, target: 250000 },
  { month: "يوليو", revenue: 345000, vat: 51750, target: 270000 },
  { month: "أغسطس", revenue: 390000, vat: 58500, target: 300000 },
  { month: "سبتمبر", revenue: 410000, vat: 61500, target: 320000 },
  { month: "أكتوبر", revenue: 465000, vat: 69750, target: 350000 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "أنظمة الرشاشات الآلية (NFPA 13)", value: 42, color: "#DC2626" },
  { name: "أنظمة الإنذار والكشف المبكر (NFPA 72)", value: 28, color: "#EA580C" },
  { name: "مخارج الطوارئ ومسالك الهروب (SBC 801)", value: 18, color: "#4F46E5" },
  { name: "شبكات الإطفاء ومضخات الحريق", value: 12, color: "#059669" },
];

const TURNAROUND_DATA = [
  { category: "مستودعات صناعية", days: 1.4, target: 3.0 },
  { category: "أبراج مكتبية", days: 2.1, target: 4.0 },
  { category: "مراكز تسوق", days: 2.8, target: 5.0 },
  { category: "مستشفيات ومراكز صحية", days: 3.4, target: 5.0 },
  { category: "مجمعات سكنية", days: 1.1, target: 2.5 },
];

export function AnalyticsView() {
  const [period, setPeriod] = useState<"MONTH" | "QUARTER" | "YEAR">("MONTH");

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "جاري استخراج التحليلات ومصفوفة الامتثال لكود البناء السعودي...",
        success: "تم تصدير تقرير التحليلات الشامل بنجاح",
        error: "فشل التصدير",
      }
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">تحليلات العمليات والسلامة الهندسية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            مؤشرات الأداء اللحظية، معدلات الامتثال لكود البناء السعودي (SBC 801)، وتدفقات الفوترة الضريبية.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
            <button
              onClick={() => setPeriod("MONTH")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                period === "MONTH" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setPeriod("QUARTER")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                period === "QUARTER" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ربع سنوي
            </button>
            <button
              onClick={() => setPeriod("YEAR")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                period === "YEAR" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              سنوي
            </button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">إجمالي الإيرادات المفوترة</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">465,000 ر.س</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+18.4% مقارنة بالشهر السابق</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">نسبة الامتثال لكود SBC 801</span>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">96.8%</h3>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>اعتماد من الجولة الأولى</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">متوسط زمن المراجعة الهندسية</span>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">1.8 يوم</h3>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>أسرع بـ 42% من المستهدف (3 أيام)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">الزيارات الميدانية الموثقة GPS</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">184 زيارة</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% نسبة توثيق EXIF للموقع</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend */}
        <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>نمو الإيرادات وضريبة القيمة المضافة ZATCA (ر.س)</span>
              <Badge variant="outline" className="font-normal text-xs">
                محدث لحظياً
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              مقارنة بين الإيراد الفعلي والضريبة المحصلة والمستهدف التشغيلي الشهري.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                  <XAxis dataKey="month" stroke="#88888880" fontSize={12} tickLine={false} />
                  <YAxis stroke="#88888880" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="revenue" name="إجمالي الإيرادات" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="vat" name="ضريبة القيمة المضافة (15%)" stroke="#10B981" fillOpacity={1} fill="url(#colorVat)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Safety Category Breakdown */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>توزيع المعاملات حسب تصنيف السلامة</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardTitle>
            <CardDescription className="text-xs">
              النسبة المئوية لطلبات الأنظمة والاشتراطات الهندسية.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(val: any) => [`${val}%`, "النسبة"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {CATEGORY_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turnaround Time Analysis */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            متوسط زمن إنجاز التراخيص الهندسية حسب طبيعة المنشأة (أيام)
          </CardTitle>
          <CardDescription className="text-xs">
            مقارنة بين زمن الإنجاز الفعلي والمستهدف التشغيلي المتفق عليه في اتفاقية مستوى الخدمة (SLA).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TURNAROUND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="category" stroke="#88888880" fontSize={12} tickLine={false} />
                <YAxis stroke="#88888880" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  formatter={(val: any) => [`${val} يوم`]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="days" name="الإنجاز الفعلي (أيام)" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="المستهدف المسموح به (SLA)" fill="#94A3B840" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
