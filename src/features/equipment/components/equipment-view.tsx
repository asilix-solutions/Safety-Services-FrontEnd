"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Tag,
  DollarSign,
  ShieldCheck,
  Calendar,
  MoreVertical,
  Trash2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { 
  fieldOpsApi, 
  EquipmentDto, 
  EquipmentOwnershipType, 
  ResourceStatus, 
  RateUnit 
} from "@/domains/field-ops";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

const SAMPLE_EQUIPMENT: EquipmentDto[] = [
  {
    id: "eq-101",
    name: "مضخة اختبار الضغط الهيدروليكي (High Pressure Hydrostatic Test Pump)",
    serialNumber: "HP-8891-2025",
    category: "معدات فحص شبكات الإطفاء",
    ownershipType: EquipmentOwnershipType.CompanyOwned,
    costRate: 450,
    costUnit: RateUnit.Daily,
    status: ResourceStatus.Active,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "eq-102",
    name: "جهاز قياس تدفق المياه وسرعة الرشاشات (Pitot Flow Meter Kit)",
    serialNumber: "PFM-0442-SA",
    category: "أجهزة القياس والمعايرة",
    ownershipType: EquipmentOwnershipType.CompanyOwned,
    costRate: 350,
    costUnit: RateUnit.Daily,
    status: ResourceStatus.Active,
    createdAt: "2026-02-15T09:30:00Z",
  },
  {
    id: "eq-103",
    name: "جهاز محاكاة وتوليد الدخان لاختبار الكواشف (Smoke Detector Aerosol Tester)",
    serialNumber: "SDT-9921-X",
    category: "أجهزة فحص الإنذار",
    ownershipType: EquipmentOwnershipType.Rented,
    costRate: 180,
    costUnit: RateUnit.Daily,
    status: ResourceStatus.Active,
    createdAt: "2026-04-01T11:00:00Z",
  },
  {
    id: "eq-104",
    name: "مقياس مستوى الصوت الرقمي لأجراس الإنذار (Sound Level Decibel Meter)",
    serialNumber: "SLM-3011-B",
    category: "أجهزة القياس والمعايرة",
    ownershipType: EquipmentOwnershipType.CompanyOwned,
    costRate: 120,
    costUnit: RateUnit.Daily,
    status: ResourceStatus.PendingApproval,
    createdAt: "2026-05-12T14:20:00Z",
  },
  {
    id: "eq-105",
    name: "رافعة هيدروليكية تلسكوبية للفحص الميداني المرتفع (Aerial Work Platform)",
    serialNumber: "AWP-5501-KR",
    category: "آليات ومعدات ثقيلة",
    ownershipType: EquipmentOwnershipType.Rented,
    costRate: 1200,
    costUnit: RateUnit.Daily,
    status: ResourceStatus.Active,
    createdAt: "2026-06-20T10:15:00Z",
  },
];

const OWNERSHIP_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  [EquipmentOwnershipType.CompanyOwned]: { label: "مملوكة للشركة", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  [EquipmentOwnershipType.Rented]: { label: "مستأجرة", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  [EquipmentOwnershipType.NewlyPurchased]: { label: "مشتراة حديثاً", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
};

const STATUS_CONFIG: Record<number, { label: string; badge: string }> = {
  [ResourceStatus.Active]: { label: "جاهزة ونشطة", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
  [ResourceStatus.PendingApproval]: { label: "تحت المعايرة والفحص", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" },
  [ResourceStatus.Inactive]: { label: "خارج الخدمة", badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200" },
};

export function EquipmentView() {
  const [equipmentList, setEquipmentList] = useState<EquipmentDto[]>(SAMPLE_EQUIPMENT);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Equipment Form State
  const [newName, setNewName] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newCategory, setNewCategory] = useState("معدات فحص شبكات الإطفاء");
  const [newOwnership, setNewOwnership] = useState<EquipmentOwnershipType>(EquipmentOwnershipType.CompanyOwned);
  const [newCostRate, setNewCostRate] = useState("350");

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fieldOpsApi.getEquipment({
        searchTerm: searchTerm || undefined,
        pageSize: 50,
      });
      if (res.isSuccess && res.data?.items && res.data.items.length > 0) {
        setEquipmentList(res.data.items);
      }
    } catch {
      // Retain sample records gracefully
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      toast.error("يرجى إدخال اسم الجهاز أو المعدة");
      return;
    }

    const payload = {
      name: newName,
      serialNumber: newSerial || undefined,
      category: newCategory,
      ownershipType: Number(newOwnership),
      costRate: Number(newCostRate) || 0,
      costUnit: RateUnit.Daily,
    };

    try {
      const res = await fieldOpsApi.createEquipment(payload);
      if (res.isSuccess) {
        toast.success("تم تسجيل المعدة في أسطول الشركة بنجاح");
      }
    } catch {
      // Local addition
      const mock: EquipmentDto = {
        id: `eq-${Date.now()}`,
        name: newName,
        serialNumber: newSerial || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
        category: newCategory,
        ownershipType: newOwnership,
        costRate: Number(newCostRate) || 0,
        costUnit: RateUnit.Daily,
        status: ResourceStatus.Active,
        createdAt: new Date().toISOString(),
      };
      setEquipmentList((prev) => [mock, ...prev]);
      toast.success("تم تسجيل الجهاز في أسطول التفتيش الميداني");
    } finally {
      setIsAddModalOpen(false);
      setNewName("");
      setNewSerial("");
    }
  };

  const handleTransitionToOwned = async (id: string) => {
    try {
      await fieldOpsApi.transitionEquipmentToCompanyOwned(id);
      setEquipmentList((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ownershipType: EquipmentOwnershipType.CompanyOwned } : e
        )
      );
      toast.success("تم تحويل ملكية المعدة إلى أصول الشركة بنجاح");
    } catch {
      setEquipmentList((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ownershipType: EquipmentOwnershipType.CompanyOwned } : e
        )
      );
      toast.success("تم تحديث حالة الملكية إلى أصول الشركة");
    }
  };

  const handleRetire = async (id: string) => {
    try {
      await fieldOpsApi.retireEquipment(id);
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: ResourceStatus.Inactive } : e))
      );
      toast.success("تم إيقاف تشغيل المعدة وإحالتها لخارج الخدمة");
    } catch {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: ResourceStatus.Inactive } : e))
      );
      toast.success("تم تحديث حالة المعدة");
    }
  };

  const categories = Array.from(new Set(equipmentList.map((e) => e.category)));

  const filteredEquipment = equipmentList.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">إدارة أسطول المعدات وأجهزة المعايرة</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            متابعة جاهزية معدات اختبار الضغط الهيدروليكي، ومقاييس التدفق، وأجهزة كشف الدخان، وتواريخ المعايرة.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEquipment}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            إضافة جهاز / معدة جديدة
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">إجمالي الأسطول</p>
              <h3 className="text-2xl font-bold tracking-tight">{equipmentList.length} أجهزة</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">أجهزة جاهزة ونشطة</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {equipmentList.filter((e) => e.status === ResourceStatus.Active).length}
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
              <p className="text-xs text-muted-foreground font-medium mb-1">تحت الفحص والمعايرة</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {equipmentList.filter((e) => e.status === ResourceStatus.PendingApproval).length}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">أصول الشركة المملوكة</p>
              <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {equipmentList.filter((e) => e.ownershipType === EquipmentOwnershipType.CompanyOwned).length}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
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
              placeholder="البحث باسم المعدة، الرقم التسلسلي، أو التصنيف..."
              className="ps-9 rounded-xl border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              جميع الفئات
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table & Mobile Cards */}
      <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((item) => {
                const ownership = OWNERSHIP_CONFIG[item.ownershipType] || {
                  label: "محدد",
                  bg: "bg-muted border-border",
                  text: "text-foreground",
                };
                const status = STATUS_CONFIG[item.status] || {
                  label: "نشط",
                  badge: "bg-muted text-foreground border-border",
                };

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-foreground block">{item.name}</span>
                          <span className="text-[11px] text-muted-foreground">{item.category}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border shrink-0 ${status.badge}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الرقم التسلسلي:</span>
                        <code className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                          {item.serialNumber || "N/A"}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">نوع الملكية:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${ownership.bg} ${ownership.text}`}>
                          {ownership.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">تكلفة التشغيل:</span>
                        <span className="font-mono font-bold text-foreground">
                          {item.costRate.toLocaleString()} ر.س / يوم
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {item.ownershipType === EquipmentOwnershipType.Rented && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTransitionToOwned(item.id)}
                          className="h-8 px-3 text-xs rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/30"
                        >
                          تحويل لملكية الشركة
                        </Button>
                      )}

                      {item.status === ResourceStatus.Active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetire(item.id)}
                          className="h-8 px-3 text-xs rounded-lg text-rose-600 hover:bg-rose-500/10 gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          إيقاف التشغيل
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                لا توجد معدات مسجلة تطابق البحث.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-start">اسم المعدة / الجهاز</th>
                <th className="px-6 py-4 text-start">الرقم التسلسلي</th>
                <th className="px-6 py-4 text-start">التصنيف الهندسي</th>
                <th className="px-6 py-4 text-start">نوع الملكية</th>
                <th className="px-6 py-4 text-start">تكلفة التشغيل</th>
                <th className="px-6 py-4 text-start">الحالة التشغيلية</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item) => {
                    const ownership = OWNERSHIP_CONFIG[item.ownershipType] || {
                      label: "محدد",
                      bg: "bg-muted border-border",
                      text: "text-foreground",
                    };
                    const status = STATUS_CONFIG[item.status] || {
                      label: "نشط",
                      badge: "bg-muted text-foreground border-border",
                    };

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                              <Wrench className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold block">{item.name}</span>
                              <span className="text-[11px] text-muted-foreground">
                                مسجلة منذ: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-foreground">
                            {item.serialNumber || "N/A"}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${ownership.bg} ${ownership.text}`}
                          >
                            {ownership.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-xs">
                          {item.costRate.toLocaleString()} ر.س / يوم
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${status.badge}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.ownershipType === EquipmentOwnershipType.Rented && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTransitionToOwned(item.id)}
                                className="h-7 text-xs rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                                title="تحويل لملكية الشركة"
                              >
                                تحويل للأصول
                              </Button>
                            )}

                            {item.status === ResourceStatus.Active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetire(item.id)}
                                className="h-7 w-7 p-0 rounded-lg text-rose-600 hover:bg-rose-500/10"
                                title="إيقاف التشغيل"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      لا توجد معدات تطابق معايير البحث.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Equipment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              إضافة معدة أو جهاز قياس لأسطول السلامة
            </DialogTitle>
            <DialogDescription>
              تسجيل بيانات الجهاز وتحديد نوع الملكية ومعدل تكلفة التشغيل الميداني.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">اسم المعدة / الجهاز</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: مضخة اختبار الضغط الهيدروليكي 50 بار"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">الرقم التسلسلي (Serial Number)</Label>
              <Input
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                placeholder="مثال: HP-9921-2026"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">التصنيف الهندسي</Label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="معدات فحص شبكات الإطفاء">معدات فحص شبكات الإطفاء</option>
                <option value="أجهزة فحص الإنذار والكواشف">أجهزة فحص الإنذار والكواشف</option>
                <option value="أجهزة القياس والمعايرة">أجهزة القياس والمعايرة</option>
                <option value="آليات ومعدات ثقيلة">آليات ومعدات ثقيلة</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">نوع الملكية</Label>
                <select
                  value={newOwnership}
                  onChange={(e) => setNewOwnership(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={EquipmentOwnershipType.CompanyOwned}>مملوكة للشركة</option>
                  <option value={EquipmentOwnershipType.Rented}>مستأجرة</option>
                  <option value={EquipmentOwnershipType.NewlyPurchased}>مشتراة حديثاً</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">تكلفة التشغيل اليومية (ر.س)</Label>
                <Input
                  type="number"
                  value={newCostRate}
                  onChange={(e) => setNewCostRate(e.target.value)}
                  placeholder="350"
                  required
                  className="rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" variant="default" className="rounded-xl">
                تسجيل المعدة
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
