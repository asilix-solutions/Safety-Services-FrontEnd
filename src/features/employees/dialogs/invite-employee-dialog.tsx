"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useTranslation } from "@/providers/i18n-provider";
import {
  Employee,
  EmployeeRole,
  EmployeeDepartment,
  EmployeeAvailability,
  EmployeeStatus,
} from "@/domains/employees/types";
import { EmployeeValidationError } from "@/domains/employees/validation";
import { SAUDI_ROLES, SAUDI_DEPARTMENTS, formatSaudiPhone } from "@/domains/employees/helpers";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Activity,
  Plus,
  ArrowRight,
} from "lucide-react";

const saudiMobileRegex = /^(?:\+?966|00966|0)?5\d{8}$/;

const inviteEmployeeSchema = z.object({
  fullName: z
    .string()
    .min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صالحة"),
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .refine((val) => saudiMobileRegex.test(val.replace(/\s+/g, "")), {
      message: "يرجى إدخال رقم هاتف سعودي صحيح (مثال: 05XXXXXXXX أو +966 5X XXX XXXX)",
    }),
  role: z.enum(
    ["Company Admin", "Consulting Engineer", "Operations Officer", "Sales Agent"],
    { message: "صلاحية الوصول مطلوبة" }
  ),
  department: z.enum(
    ["Engineering", "Operations", "Sales", "Administration"],
    { message: "القسم مطلوب" }
  ),
  availabilityStatus: z.enum(["Available", "Busy", "Unavailable"]),
});

export type InviteEmployeeFormValues = z.infer<typeof inviteEmployeeSchema>;

interface InviteEmployeeDialogProps {
  onInvite: (
    data: Omit<Employee, "id" | "tenantId" | "employeeNumber" | "createdAt" | "updatedAt">
  ) => { success: boolean; errors?: EmployeeValidationError } | Promise<any> | any;
  trigger?: React.ReactNode;
}

export function InviteEmployeeDialog({ onInvite, trigger }: InviteEmployeeDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteEmployeeFormValues>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "Consulting Engineer",
      department: "Engineering",
      availabilityStatus: "Available",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setServerError(null);
    }
  };

  const onSubmit = async (values: InviteEmployeeFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const normalizedPhone = formatSaudiPhone(values.phone);

      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: normalizedPhone,
        role: values.role as EmployeeRole,
        department: values.department as EmployeeDepartment,
        status: "Active" as EmployeeStatus,
        availabilityStatus: values.availabilityStatus as EmployeeAvailability,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
          values.fullName.trim()
        )}`,
      };

      const res = await onInvite(payload);

      if (!res || res.success !== false) {
        handleOpenChange(false);
      } else if (res.errors) {
        const firstErrorKey = Object.values(res.errors)[0] as string;
        setServerError(firstErrorKey ? t(`common:${firstErrorKey}`) : "فشل في دعوة الموظف");
      }
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
            <Plus className="h-4 w-4" />
            <span>{t("common:employees.add_btn")}</span>
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
                {t("common:employees.invite")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("common:employees.invite_desc")}
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
            {/* Section 1: Personal & Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">بيانات الموظف والاتصال</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.name")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="مثال: م. عبدالله المنصور"
                      {...register("fullName")}
                      className="ps-9 h-10 text-xs bg-background/50 border-border"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.email")}</span>
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
                  {errors.email && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.phone")} (+966 5X)</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      {...register("phone")}
                      className="ps-9 h-10 text-xs font-mono text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Operational Assignment & Role */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">التكليف والصلاحيات التشغيلية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Access Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.role")}</span>
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
                  {errors.role && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.department")}</span>
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
                  {errors.department && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Availability Status */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:employees.fields.availability")}</span>
                  </label>
                  <div className="relative">
                    <Activity className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      {...register("availabilityStatus")}
                      className="w-full bg-background/50 border border-border rounded-md ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                    >
                      <option value="Available">{t("common:employees.availability.Available")}</option>
                      <option value="Busy">{t("common:employees.availability.Busy")}</option>
                      <option value="Unavailable">{t("common:employees.availability.Unavailable")}</option>
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
              {t("common:cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="font-bold gap-2 cursor-pointer shadow-md shadow-primary/20 px-5"
            >
              <span>{t("common:employees.invite")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const InviteStaffModal = InviteEmployeeDialog;
export default InviteEmployeeDialog;
