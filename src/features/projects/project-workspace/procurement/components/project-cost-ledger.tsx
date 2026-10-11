"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  paymentsApi,
  ProjectLedgerDto,
  ProjectExpenseDto,
  ProjectExpenseStatus,
  RecordExpensePayload,
} from "@/domains/payments/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Receipt,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { alertService } from "@/services/alert-notification";

interface ProjectCostLedgerProps {
  projectId: string;
}

export function ProjectCostLedger({ projectId }: ProjectCostLedgerProps) {
  const { user } = useAuth();
  const [ledger, setLedger] = useState<ProjectLedgerDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Expense Dialog
  const [recordExpenseOpen, setRecordExpenseOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorTaxNumber, setVendorTaxNumber] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [subtotal, setSubtotal] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [isVatDeductible, setIsVatDeductible] = useState(true);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Clearance Dialog
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ProjectExpenseDto | null>(null);
  const [clearanceNotes, setClearanceNotes] = useState("");
  const [submittingClearance, setSubmittingClearance] = useState(false);

  const isManagerOrAdmin =
    user?.role === "Super Admin" ||
    user?.role === "Company Admin" ||
    user?.role === "Operations Officer";

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentsApi.getProjectLedger(projectId);
      if (res.isSuccess && res.data) {
        setLedger(res.data);
      } else {
        // May not be created yet on backend
        setLedger(null);
      }
    } catch (err: any) {
      // If endpoint returns 404 or fails, we silently keep local mock
      console.warn("Project ledger not found on live backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLedger();
    }
  }, [projectId]);

  const handleSubtotalChange = (val: number) => {
    setSubtotal(val);
    // Standard KSA VAT 15% calculation
    const vat = Math.round(val * 0.15 * 100) / 100;
    setVatAmount(vat);
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !invoiceRef.trim() || subtotal <= 0) {
      alertService.showWarning("يرجى ملء جميع الحقول الإلزامية وقيمة الفاتورة.");
      return;
    }

    try {
      setSubmittingExpense(true);
      const payload: RecordExpensePayload = {
        vendorName: vendorName.trim(),
        vendorTaxNumber: vendorTaxNumber.trim() || undefined,
        invoiceReferenceNumber: invoiceRef.trim(),
        description: expenseDesc.trim(),
        subtotalAmount: Number(subtotal),
        vatAmount: Number(vatAmount),
        isVatDeductible,
      };

      const res = await paymentsApi.recordExpense(projectId, payload);
      if (res.isSuccess) {
        alertService.showSuccess(
          "تم تسجيل فاتورة المورد بنجاح",
          `المورد: ${payload.vendorName} • القيمة: ${(payload.subtotalAmount + payload.vatAmount).toLocaleString()} ر.س`
        );
        setRecordExpenseOpen(false);
        setVendorName("");
        setVendorTaxNumber("");
        setInvoiceRef("");
        setExpenseDesc("");
        setSubtotal(0);
        setVatAmount(0);
        fetchLedger();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في تسجيل فاتورة المورد", err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleClearExpense = async (approve: boolean) => {
    if (!selectedExpense) return;
    try {
      setSubmittingClearance(true);
      const res = await paymentsApi.clearExpense(
        selectedExpense.id,
        approve,
        clearanceNotes.trim() || undefined
      );

      if (res.isSuccess) {
        alertService.showSuccess(
          approve ? "تمت الموافقة على تخطي سقف المصروفات" : "تم رفض المصروف",
          `الفاتورة: ${selectedExpense.invoiceReferenceNumber}`
        );
        setClearanceModalOpen(false);
        setSelectedExpense(null);
        setClearanceNotes("");
        fetchLedger();
      } else {
        alertService.showApiError(res);
      }
    } catch (err: any) {
      alertService.showError("فشل في اعتماد المصروف", err.message);
    } finally {
      setSubmittingClearance(false);
    }
  };

  if (!ledger) {
    return null;
  }

  const isExceedingCeiling = ledger.cumulativeSpend > ledger.spendingCeiling && ledger.spendingCeiling > 0;

  return (
    <div className="space-y-4 pt-2">
      {/* Live Financial Cost Ledger Summary */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base font-bold">
                  سجل التكاليف المباشرة وهوامش الربحية (Cost Ledger)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  LIVE STAGING SYNC
                </Badge>
              </div>
              <CardDescription className="text-xs">
                حساب الأرباح اللحظي، سقف الإنفاق المعتمد، ومطابقة ضريبة القيمة المضافة.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLedger}
                disabled={loading}
                className="h-8 text-xs gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                تحديث
              </Button>

              {isManagerOrAdmin && (
                <Button
                  size="sm"
                  onClick={() => setRecordExpenseOpen(true)}
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  تسجيل فاتورة مورد
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                قيمة العقد الصافية
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {ledger.contractNet.toLocaleString()} ر.س
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border bg-secondary/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                إجمالي التكلفة المباشرة
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {ledger.totalCost.toLocaleString()} ر.س
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                ledger.isLossMaking
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span className="text-[10px] opacity-75 uppercase font-semibold block">
                هامش الربح الصافي
              </span>
              <span className="text-base font-bold tabular-nums">
                {ledger.netMarginAmount.toLocaleString()} ر.س ({ledger.netMarginPercent}%)
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isExceedingCeiling
                  ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                  : "border-border bg-secondary/10 text-foreground"
              }`}
            >
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                سقف الإنفاق المعتمد
              </span>
              <span className="text-base font-bold tabular-nums">
                {ledger.cumulativeSpend.toLocaleString()} / {ledger.spendingCeiling.toLocaleString()} ر.س
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-4 text-xs p-3 rounded-lg bg-secondary/5 border border-border text-muted-foreground">
            <span>
              توريد المواد:{" "}
              <strong className="text-foreground">{ledger.materialCost.toLocaleString()} ر.س</strong>
            </span>
            <span>•</span>
            <span>
              العمالة الميدانية:{" "}
              <strong className="text-foreground">
                {ledger.outsourcedLaborCost.toLocaleString()} ر.س
              </strong>
            </span>
            <span>•</span>
            <span>
              المعدات والأدوات:{" "}
              <strong className="text-foreground">
                {ledger.equipmentCost.toLocaleString()} ر.س
              </strong>
            </span>
            {ledger.expensesAwaitingClearance > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {ledger.expensesAwaitingClearance} فواتير بانتظار اعتماد التخطي
                </span>
              </>
            )}
          </div>

          {/* Expenses Table */}
          {ledger.expenses && ledger.expenses.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                فواتير ومصروفات الموردين المعتمدة ({ledger.expenses.length})
              </h4>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-secondary/15 text-muted-foreground text-[11px] border-b border-border">
                    <tr>
                      <th className="p-2.5 font-semibold text-start">المورد</th>
                      <th className="p-2.5 font-semibold text-start">رقم الفاتورة</th>
                      <th className="p-2.5 font-semibold text-start">البيان</th>
                      <th className="p-2.5 font-semibold text-start">المبلغ (بدون ضريبة)</th>
                      <th className="p-2.5 font-semibold text-start">الضريبة 15%</th>
                      <th className="p-2.5 font-semibold text-start">الإجمالي</th>
                      <th className="p-2.5 font-semibold text-start">الحالة</th>
                      {isManagerOrAdmin && <th className="p-2.5 font-semibold text-end">الإجراءات</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledger.expenses.map((exp) => {
                      const isPending =
                        exp.status === ProjectExpenseStatus.PendingCeilingClearance;
                      const isApproved = exp.status === ProjectExpenseStatus.Approved;
                      const isRejected = exp.status === ProjectExpenseStatus.Rejected;

                      return (
                        <tr key={exp.id} className="hover:bg-secondary/5">
                          <td className="p-2.5 font-medium text-foreground">{exp.vendorName}</td>
                          <td className="p-2.5 font-mono text-muted-foreground">
                            {exp.invoiceReferenceNumber}
                          </td>
                          <td className="p-2.5 text-muted-foreground">{exp.description}</td>
                          <td className="p-2.5 tabular-nums">
                            {exp.subtotalAmount.toLocaleString()} ر.س
                          </td>
                          <td className="p-2.5 tabular-nums text-muted-foreground">
                            {exp.vatAmount.toLocaleString()} ر.س
                          </td>
                          <td className="p-2.5 tabular-nums font-bold text-foreground">
                            {exp.totalAmount.toLocaleString()} ر.س
                          </td>
                          <td className="p-2.5">
                            <Badge
                              variant={
                                isApproved
                                  ? "success"
                                  : isPending
                                  ? "outline"
                                  : "destructive"
                              }
                              className={`text-[10px] ${
                                isPending ? "border-amber-500 text-amber-600 bg-amber-500/10" : ""
                              }`}
                            >
                              {isApproved
                                ? "معتمد"
                                : isPending
                                ? "تجاوز السقف"
                                : "مرفوض"}
                            </Badge>
                          </td>
                          {isManagerOrAdmin && (
                            <td className="p-2.5 text-end">
                              {isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedExpense(exp);
                                    setClearanceModalOpen(true);
                                  }}
                                  className="h-7 text-[11px] gap-1 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                                >
                                  اعتماد التخطي
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Expense Dialog */}
      <Dialog open={recordExpenseOpen} onOpenChange={setRecordExpenseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              تسجيل فاتورة مورد أو تكلفة مباشرة
            </DialogTitle>
            <DialogDescription className="text-xs">
              يتم قيد الفاتورة في سجل المشروع وخصمها من سقف الإنفاق المعتمد.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordExpense} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">اسم المورد أو الجهة *</Label>
              <Input
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="مثال: شركة التوريدات السعودية لمكافحة الحرائق"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">الرقم الضريبي للمورد</Label>
                <Input
                  value={vendorTaxNumber}
                  onChange={(e) => setVendorTaxNumber(e.target.value)}
                  placeholder="300XXXXXXXXXXXX"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">رقم الفاتورة المرجعي *</Label>
                <Input
                  required
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder="INV-2026-XXXX"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">بيان المشتريات أو الخدمات *</Label>
              <Input
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="مثال: توريد صمامات إنذار ولوحات تحكم حريق"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">المبلغ الخاضع للضريبة (ر.س) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={subtotal || ""}
                  onChange={(e) => handleSubtotalChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">ضريبة القيمة المضافة 15% (ر.س)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={vatAmount || ""}
                  onChange={(e) => setVatAmount(parseFloat(e.target.value) || 0)}
                  className="text-xs text-muted-foreground"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-secondary/10 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">الإجمالي شاملاً الضريبة:</span>
              <span className="font-bold text-sm text-foreground tabular-nums">
                {(subtotal + vatAmount).toLocaleString()} ر.س
              </span>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRecordExpenseOpen(false)}
                disabled={submittingExpense}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingExpense}
                isLoading={submittingExpense}
              >
                قيد المصروف
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expense Clearance Dialog */}
      <Dialog open={clearanceModalOpen} onOpenChange={setClearanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
              اعتماد تجاوز سقف الإنفاق للمشروع
            </DialogTitle>
            <DialogDescription className="text-xs">
              تجاوزت هذه الفاتورة سقف الإنفاق المعتمد وتتطلب تفويضاً إدارياً للمرور.
            </DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-secondary/10 space-y-1">
                <p>
                  المورد: <strong>{selectedExpense.vendorName}</strong>
                </p>
                <p>
                  رقم الفاتورة: <strong>{selectedExpense.invoiceReferenceNumber}</strong>
                </p>
                <p>
                  إجمالي المبلغ:{" "}
                  <strong className="text-foreground">
                    {selectedExpense.totalAmount.toLocaleString()} ر.س
                  </strong>
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">ملاحظات الاعتماد والتبرير الإداري</Label>
                <Input
                  value={clearanceNotes}
                  onChange={(e) => setClearanceNotes(e.target.value)}
                  placeholder="ملاحظات الموافقة..."
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearExpense(false)}
              disabled={submittingClearance}
              className="text-destructive hover:bg-destructive/10"
            >
              رفض الفاتورة
            </Button>
            <Button
              size="sm"
              onClick={() => handleClearExpense(true)}
              disabled={submittingClearance}
              isLoading={submittingClearance}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              اعتماد وتمرير المصروف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectCostLedger;
