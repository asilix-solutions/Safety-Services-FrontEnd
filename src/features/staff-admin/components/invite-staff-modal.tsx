"use client";

import React, { useState } from "react";
import { UserPlus, Mail, User, Phone, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteStaffSchema, InviteStaffFormValues } from "@/schemas/staff.schema";
import { SAUDI_ROLES, SAUDI_DEPARTMENTS } from "@/domains/employees/helpers";

interface InviteStaffModalProps {
  onInvite: (data: InviteStaffFormValues) => Promise<void>;
  trigger?: React.ReactNode;
}

export function InviteStaffModal({ onInvite, trigger }: InviteStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteStaffFormValues>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "Engineering",
      role: "Consulting Engineer",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setServerError(null);
    }
  };

  const onSubmit = async (data: InviteStaffFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await onInvite(data);
      reset();
      setOpen(false);
    } catch (err: any) {
      setServerError(err?.message || "حدث خطأ غير متوقع أثناء معالجة الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2 font-bold shadow-md shadow-primary/20 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            <span>دعوة موظف جديد</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b border-border bg-muted/20 pe-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                دعوة موظف جديد
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                تسجيل ملف تعريف جديد لفريق العمل الداخلي وتحديد تفاصيلهم التشغيلية.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">بيانات الموظف والاتصال</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>الاسم الكامل</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="مثال: م. عبدالله المنصور"
                      {...register("name")}
                      className="ps-9 h-10 text-xs bg-background/50 border-border"
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-destructive mt-1 font-medium">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>البريد الإلكتروني للعمل</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      dir="ltr"
                      placeholder="name@company.sa"
                      {...register("email")}
                      className="ps-9 h-10 text-xs font-mono text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-destructive mt-1 font-medium">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>رقم الهاتف (+966 5X)</span>
                    <span className="text-[10px] text-muted-foreground font-mono">اختياري</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      {...register("phone")}
                      className="ps-9 h-10 text-xs font-mono text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-destructive mt-1 font-medium">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Operational Assignment */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">التكليف والصلاحيات التشغيلية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>القسم</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      {...register("department")}
                      className="w-full bg-background/50 border border-border rounded-md ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                    >
                      {SAUDI_DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>صلاحية الوصول (الدور)</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      {...register("role")}
                      className="w-full bg-background/50 border border-border rounded-md ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                    >
                      {SAUDI_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer px-4"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="font-bold gap-2 cursor-pointer shadow-md shadow-primary/20 px-5"
            >
              <span>إرسال الدعوة</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteStaffModal;
