"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Customer, CustomerStatus } from "@/domains/customers/types";
import { createCustomerSchema, CreateCustomerFormValues } from "@/schemas/customer.schema";
import { SAUDI_CITIES, SAUDI_SECTORS } from "@/domains/customers/helpers";
import {
  Building2,
  FileSpreadsheet,
  User,
  Mail,
  Phone,
  MapPin,
  Layers,
  Plus,
  ArrowRight,
} from "lucide-react";

interface CreateCustomerModalProps {
  onAdd: (
    data: Omit<Customer, "id" | "tenantId" | "createdAt" | "updatedAt" | "representatives">
  ) => { success: boolean; errors?: any };
  trigger?: React.ReactNode;
}

export function CreateCustomerModal({ onAdd, trigger }: CreateCustomerModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      companyName: "",
      commercialRegistration: "",
      industry: "التطوير العقاري",
      city: "الرياض",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      address: "",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setServerError(null);
    }
  };

  const onSubmit = async (values: CreateCustomerFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      // Format phone to standard format if starts with 05
      let formattedPhone = values.primaryContactPhone.trim();
      if (formattedPhone.startsWith("05")) {
        formattedPhone = "+966 " + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith("5")) {
        formattedPhone = "+966 " + formattedPhone;
      }

      const res = onAdd({
        companyName: values.companyName.trim(),
        commercialRegistration: values.commercialRegistration.trim(),
        industry: values.industry.trim(),
        status: "Active" as CustomerStatus,
        primaryContactName: values.primaryContactName.trim(),
        primaryContactEmail: values.primaryContactEmail.trim(),
        primaryContactPhone: formattedPhone,
        city: values.city.trim(),
        address: values.address?.trim() || values.city.trim(),
      });

      if (res.success) {
        handleOpenChange(false);
      } else if (res.errors) {
        const errorKey = Object.values(res.errors)[0] as string;
        setServerError(errorKey ? t(`common:${errorKey}`) : "فشل في حفظ بيانات العميل");
      }
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
            <span>{t("common:customers.add_btn")}</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b border-border bg-muted/20 pe-12">
          <DialogTitle className="text-base font-bold flex items-center gap-2.5 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-5 w-5 shrink-0" />
            </div>
            <span>{t("common:customers.modal.title")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {t("common:customers.modal.desc")}
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Section 1: Enterprise Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">بيانات المنشأة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Enterprise Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.enterprise_name")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="مثال: شركة التطوير المتكامل للمقاولات"
                      {...register("companyName")}
                      className="ps-9 h-10 text-xs bg-background/50 border-border"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[11px] text-destructive mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Commercial Registration (10 digits) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.cr_digits")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <FileSpreadsheet className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="1010XXXXXX"
                      maxLength={10}
                      dir="ltr"
                      {...register("commercialRegistration")}
                      className="ps-9 h-10 text-xs font-mono text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.commercialRegistration && (
                    <p className="text-[11px] text-destructive mt-1">
                      {errors.commercialRegistration.message}
                    </p>
                  )}
                </div>

                {/* Sector / Industry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.sector")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      {...register("industry")}
                      className="w-full bg-background/50 border border-border rounded-md ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                    >
                      {SAUDI_SECTORS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.industry && (
                    <p className="text-[11px] text-destructive mt-1">{errors.industry.message}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.city")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      {...register("city")}
                      className="w-full bg-background/50 border border-border rounded-md ps-9 pe-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                    >
                      {SAUDI_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && (
                    <p className="text-[11px] text-destructive mt-1">{errors.city.message}</p>
                  )}
                </div>

                {/* National Address / HQ Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.address")}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">اختياري</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="مثال: طريق الملك فهد، حي العليا"
                      {...register("address")}
                      className="ps-9 h-10 text-xs bg-background/50 border-border"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-[11px] text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Primary Contact Information */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <span className="text-xs font-bold text-foreground">بيانات المسؤول الرئيسي</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.primary_contact_name")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="مثال: م. فهد بن سلطان العتيبي"
                      {...register("primaryContactName")}
                      className="ps-9 h-10 text-xs bg-background/50 border-border"
                    />
                  </div>
                  {errors.primaryContactName && (
                    <p className="text-[11px] text-destructive mt-1">
                      {errors.primaryContactName.message}
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.email")}</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="contact@company.sa"
                      dir="ltr"
                      {...register("primaryContactEmail")}
                      className="ps-9 h-10 text-xs text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.primaryContactEmail && (
                    <p className="text-[11px] text-destructive mt-1">
                      {errors.primaryContactEmail.message}
                    </p>
                  )}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{t("common:customers.fields.phone")} (+966 5X)</span>
                    <span className="text-[10px] text-destructive font-mono">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="+966 5X XXX XXXX"
                      dir="ltr"
                      {...register("primaryContactPhone")}
                      className="ps-9 h-10 text-xs font-mono text-start bg-background/50 border-border"
                    />
                  </div>
                  {errors.primaryContactPhone && (
                    <p className="text-[11px] text-destructive mt-1">
                      {errors.primaryContactPhone.message}
                    </p>
                  )}
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
              {t("common:customers.modal.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="font-bold gap-2 cursor-pointer shadow-md shadow-primary/20 px-5"
            >
              <span>{t("common:customers.modal.submit")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default CreateCustomerModal;
