"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Calendar, ShieldCheck, Loader2 } from "lucide-react";

interface OpenContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    instanceId: string;
    startsOnUtc: string;
    termMonths: number;
    visitsPerYear: number;
    leadTimeDays: number;
  }) => Promise<boolean>;
}

export function OpenContractDialog({
  isOpen,
  onClose,
  onSubmit,
}: OpenContractDialogProps) {
  const [instanceId, setInstanceId] = useState("");
  const [startsOn, setStartsOn] = useState(new Date().toISOString().slice(0, 10));
  const [termMonths, setTermMonths] = useState(12);
  const [visitsPerYear, setVisitsPerYear] = useState(4);
  const [leadTimeDays, setLeadTimeDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instanceId.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit({
      instanceId: instanceId.trim(),
      startsOnUtc: new Date(startsOn).toISOString(),
      termMonths: Number(termMonths),
      visitsPerYear: Number(visitsPerYear),
      leadTimeDays: Number(leadTimeDays),
    });
    setIsSubmitting(false);

    if (success) {
      setInstanceId("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-right" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              فتح عقد صيانة دورية معتمد
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            تأسيس عقد صيانة دورية لمشروع سلامة معتمد، وتوزيع مواعيد الزيارات الميدانية تلقائياً وفق كود البناء السعودي.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">معرف المعاملة المعتمدة (Job Instance GUID)</Label>
            <Input
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="مثال: 3bad56b9-acc3-43a0-a501-56560bb25fd4"
              required
              className="text-xs font-mono text-left"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">تاريخ بدء سريان العقد</Label>
              <Input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">مدة العقد (بالأشهر)</Label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
              >
                <option value={12}>12 شهراً (سنة كاملة)</option>
                <option value={24}>24 شهراً (سنتان)</option>
                <option value={36}>36 شهراً (3 سنوات)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">دورية الزيارات الميدانية</Label>
              <select
                value={visitsPerYear}
                onChange={(e) => setVisitsPerYear(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
              >
                <option value={1}>زيارة واحدة سنوياً</option>
                <option value={2}>زيارتان (نصف سنوي)</option>
                <option value={4}>4 زيارات (ربع سنوي - معتمد)</option>
                <option value={6}>6 زيارات (كل شهرين)</option>
                <option value={12}>12 زيارة (شهرياً)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">مهلة إشعار الزيارة (أيام)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
            <strong>ملاحظة فنية:</strong> يقوم محرك أمانكس بجدولة كافة الزيارات في نفس لحظة فتح العقد، وسيتم إنشاء معاملة صيانة ميدانية مستقلة لكل زيارة قبل موعدها بـ {leadTimeDays} يوماً تلقائياً.
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin ml-1.5" />
                  جاري فتح العقد...
                </>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5 ml-1.5" />
                  اعتماد العقد والزيارات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
