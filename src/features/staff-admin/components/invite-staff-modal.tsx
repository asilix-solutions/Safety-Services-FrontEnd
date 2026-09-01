"use client";

import React, { useState } from "react";
import { UserPlus, Mail, User, Phone, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteStaffSchema, InviteStaffFormValues } from "@/schemas/staff.schema";

interface InviteStaffModalProps {
  onInvite: (data: InviteStaffFormValues) => Promise<void>;
}

export function InviteStaffModal({ onInvite }: InviteStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: InviteStaffFormValues) => {
    setIsSubmitting(true);
    try {
      await onInvite(data);
      reset();
      setOpen(false);
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 font-bold shadow-md shadow-primary/20">
          <UserPlus className="h-4 w-4" />
          <span>دعوة موظف / مهندس</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>دعوة عضو جديد لفريق العمل</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            سيتم إرسال بريد إلكتروني يحتوي على رابط التفعيل وتعيين كلمة المرور.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="م. أحمد السالم"
                {...register("name")}
                className="w-full bg-background/50 border border-border rounded-lg ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">البريد الإلكتروني للعمل</label>
            <div className="relative">
              <Mail className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="engineer@company.com"
                {...register("email")}
                className="w-full bg-background/50 border border-border rounded-lg ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">رقم الجوال (اختياري)</label>
            <div className="relative">
              <Phone className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="05XXXXXXXX"
                dir="ltr"
                {...register("phone")}
                className="w-full bg-background/50 border border-border rounded-lg ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-start"
              />
            </div>
            {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">القسم</label>
              <select
                {...register("department")}
                className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Engineering">الهندسة والاستشارات</option>
                <option value="Operations">العمليات والمعاينة</option>
                <option value="Sales">المبيعات والعقود</option>
                <option value="Management">الإدارة</option>
                <option value="Administration">الشؤون الإدارية</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">الدور والصلاحيات</label>
              <select
                {...register("role")}
                className="w-full bg-background/50 border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Consulting Engineer">مهندس استشاري</option>
                <option value="Operations Officer">مسؤول عمليات</option>
                <option value="Sales Agent">مسؤول مبيعات</option>
                <option value="Company Admin">مدير منشأة</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 font-bold" isLoading={isSubmitting}>
              <span>إرسال الدعوة</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
