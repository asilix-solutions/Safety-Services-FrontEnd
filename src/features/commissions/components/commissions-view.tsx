"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  User,
  Building,
  Award,
  Filter,
  Download,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

interface CommissionRecord {
  id: string;
  agentName: string;
  agentRole: "مندوب مبيعات" | "مهندس استشاري";
  jobNumber: string;
  facilityName: string;
  contractValue: number;
  ratePercent: number;
  commissionAmount: number;
  status: "PENDING" | "APPROVED" | "PAID";
  date: string;
}

const INITIAL_RECORDS: CommissionRecord[] = [
  {
    id: "com-01",
    agentName: "عبدالله الراجحي",
    agentRole: "مندوب مبيعات",
    jobNumber: "AMX-2026-8804",
    facilityName: "مركز بيانات السحابية المتقدمة",
    contractValue: 480000,
    ratePercent: 3.5,
    commissionAmount: 16800,
    status: "APPROVED",
    date: "2026-10-12",
  },
  {
    id: "com-02",
    agentName: "سارة المنصور",
    agentRole: "مندوب مبيعات",
    jobNumber: "AMX-2026-8790",
    facilityName: "فندق البيلسان الدولي",
    contractValue: 320000,
    ratePercent: 3.5,
    commissionAmount: 11200,
    status: "PAID",
    date: "2026-10-05",
  },
  {
    id: "com-03",
    agentName: "م. أحمد الشمري",
    agentRole: "مهندس استشاري",
    jobNumber: "AMX-2026-8812",
    facilityName: "مستودعات الخليج للخدمات اللوجستية",
    contractValue: 260000,
    ratePercent: 5.0,
    commissionAmount: 13000,
    status: "PENDING",
    date: "2026-10-14",
  },
  {
    id: "com-04",
    agentName: "عبدالله الراجحي",
    agentRole: "مندوب مبيعات",
    jobNumber: "AMX-2026-8815",
    facilityName: "برج الأعمال التنفيذي",
    contractValue: 195000,
    ratePercent: 3.5,
    commissionAmount: 6825,
    status: "PENDING",
    date: "2026-10-15",
  },
  {
    id: "com-05",
    agentName: "م. فهد القحطاني",
    agentRole: "مهندس استشاري",
    jobNumber: "AMX-2026-8772",
    facilityName: "مجمع النخيل الطبي",
    contractValue: 140000,
    ratePercent: 5.0,
    commissionAmount: 7000,
    status: "PAID",
    date: "2026-09-28",
  },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "قيد الاعتماد والمراجعة", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" },
  APPROVED: { label: "معتمدة ومستحقة للصرف", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200" },
  PAID: { label: "تم الصرف بنجاح", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
};

export function CommissionsView() {
  const [records, setRecords] = useState<CommissionRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const totalCommissions = records.reduce((acc, r) => acc + r.commissionAmount, 0);
  const paidCommissions = records.filter((r) => r.status === "PAID").reduce((acc, r) => acc + r.commissionAmount, 0);
  const pendingCommissions = records.filter((r) => r.status === "PENDING").reduce((acc, r) => acc + r.commissionAmount, 0);

  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    toast.success("تم اعتماد استحقاق العمولة وإدراجها في قائمة الصرف المالي");
  };

  const handleDisburse = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "PAID" } : r))
    );
    toast.success("تم تأكيد صرف وتحويل العمولة بنجاح");
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "جاري تجهيز مسير العمولات الضريبي...",
        success: "تم تصدير مسير العمولات بنجاح",
        error: "فشل التصدير",
      }
    );
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">حوكمة عمولات المبيعات والشركاء</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            احتساب ومتابعة عمولات العقود الهندسية وتراخيص السلامة بعد اكتمال التحصيل وإصدار فواتير ZATCA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Download className="h-4 w-4" />
            تصدير مسير العمولات
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">إجمالي العمولات المستحقة</p>
              <h3 className="text-2xl font-bold tracking-tight">{totalCommissions.toLocaleString()} ر.س</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">العمولات المصروفة والمحولة</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {paidCommissions.toLocaleString()} ر.س
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
              <p className="text-xs text-muted-foreground font-medium mb-1">عمولات قيد المراجعة والاعتماد</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {pendingCommissions.toLocaleString()} ر.س
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">المستفيدين النشطين</p>
              <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">4 مستفيدين</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم المستفيد، رقم المعاملة، أو المنشأة..."
              className="ps-9 rounded-xl border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              الكل ({records.length})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === "PENDING"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              قيد الاعتماد
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === "APPROVED"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              معتمدة للصرف
            </button>
            <button
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === "PAID"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              تم الصرف
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-start">المستفيد والدور</th>
                <th className="px-6 py-4 text-start">رقم المعاملة والمنشأة</th>
                <th className="px-6 py-4 text-start">قيمة العقد الإجمالية</th>
                <th className="px-6 py-4 text-start">نسبة وقيمة العمولة</th>
                <th className="px-6 py-4 text-start">حالة الاستحقاق</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  filtered.map((r) => {
                    const status = STATUS_CONFIG[r.status];
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold block text-foreground">{r.agentName}</span>
                              <span className="text-[11px] text-muted-foreground">{r.agentRole}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-semibold text-primary block">{r.jobNumber}</span>
                            <span className="text-xs text-muted-foreground">{r.facilityName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-xs">
                          {r.contractValue.toLocaleString()} ر.س
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono block">
                              {r.commissionAmount.toLocaleString()} ر.س
                            </span>
                            <span className="text-[11px] text-muted-foreground">({r.ratePercent}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${status.badge}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {r.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(r.id)}
                                className="h-7 text-xs rounded-lg text-primary hover:bg-primary/10"
                              >
                                اعتماد الاستحقاق
                              </Button>
                            )}
                            {r.status === "APPROVED" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleDisburse(r.id)}
                                className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                تأكيد الصرف
                              </Button>
                            )}
                            {r.status === "PAID" && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                مسدد بالكامل
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      لا توجد سجلات عمولات تطابق معايير البحث.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
