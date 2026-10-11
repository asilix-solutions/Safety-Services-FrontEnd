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
import { CalendarClock, Loader2 } from "lucide-react";

interface RescheduleVisitDialogProps {
  visitId: string | null;
  currentDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitId: string, dueOnUtc: string) => Promise<boolean>;
}

export function RescheduleVisitDialog({
  visitId,
  currentDate,
  isOpen,
  onClose,
  onSubmit,
}: RescheduleVisitDialogProps) {
  const [newDate, setNewDate] = useState(
    currentDate ? currentDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitId) return;

    setIsSubmitting(true);
    const success = await onSubmit(visitId, new Date(newDate).toISOString());
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm text-right" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">
              إعادة جدولة موعد الزيارة الميدانية
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            تعديل تاريخ استحقاق الزيارة الميدانية قبل فتح معاملتها التنفيذية على الخادم.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">التاريخ الجديد المعتمد للزيارة</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="text-xs"
            />
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
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التاريخ الجديد"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
