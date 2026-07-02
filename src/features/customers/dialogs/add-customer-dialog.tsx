import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useTranslation } from "@/providers/i18n-provider";
import { Customer } from "@/domains/customers/types";
import { CustomerValidationError } from "@/domains/customers/validation";
import { X, Plus } from "lucide-react";

interface AddCustomerDialogProps {
  onAdd: (data: Omit<Customer, "id" | "tenantId" | "createdAt" | "updatedAt" | "representatives">) => { success: boolean; errors?: CustomerValidationError };
  trigger?: React.ReactNode;
}

export function AddCustomerDialog({ onAdd, trigger }: AddCustomerDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    commercialRegistration: "",
    industry: "",
    status: "Active" as const,
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    city: "",
    address: "",
  });

  const [errors, setErrors] = useState<CustomerValidationError>({});

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData({
        companyName: "",
        commercialRegistration: "",
        industry: "",
        status: "Active",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        city: "",
        address: "",
      });
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onAdd(formData);
    if (res.success) {
      handleOpenChange(false);
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => handleOpenChange(true)}>{trigger}</span>
      ) : (
        <Button size="sm" onClick={() => handleOpenChange(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          {t("common:customers.add_btn")}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="sm:max-w-[450px] w-full border-border bg-card shadow-2xl relative">
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-sm font-bold">{t("common:customers.add_btn")}</CardTitle>
                <CardDescription className="text-xs">
                  Create a new client customer profile to associate safety projects and compliance records.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 py-2 text-xs max-h-[70vh] overflow-y-auto">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.name")}</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className="h-9 text-xs"
                  />
                  {errors.companyName && <p className="text-destructive text-[10px]">{t(`common:${errors.companyName}`)}</p>}
                </div>

                {/* CR Number */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.cr")}</label>
                  <Input
                    value={formData.commercialRegistration}
                    onChange={(e) => setFormData({ ...formData, commercialRegistration: e.target.value })}
                    placeholder="e.g. CR-12345"
                    className="h-9 text-xs"
                  />
                  {errors.commercialRegistration && <p className="text-destructive text-[10px]">{t(`common:${errors.commercialRegistration}`)}</p>}
                </div>

                {/* Industry */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.industry")}</label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Real Estate, Construction"
                    className="h-9 text-xs"
                  />
                </div>

                {/* Primary Contact Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.primary_contact")}</label>
                  <Input
                    value={formData.primaryContactName}
                    onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                    placeholder="e.g. Khalid Al-Amri"
                    className="h-9 text-xs"
                  />
                  {errors.primaryContactName && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactName}`)}</p>}
                </div>

                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.email")}</label>
                  <Input
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                    placeholder="contact@company.com"
                    className="h-9 text-xs"
                  />
                  {errors.primaryContactEmail && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactEmail}`)}</p>}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.phone")}</label>
                  <Input
                    value={formData.primaryContactPhone}
                    onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                    placeholder="e.g. +966500000000"
                    className="h-9 text-xs"
                  />
                  {errors.primaryContactPhone && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactPhone}`)}</p>}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.city")}</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Riyadh"
                    className="h-9 text-xs"
                  />
                  {errors.city && <p className="text-destructive text-[10px]">{t(`common:${errors.city}`)}</p>}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.address")}</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. King Fahd Road, Olaya"
                    className="h-9 text-xs"
                  />
                  {errors.address && <p className="text-destructive text-[10px]">{t(`common:${errors.address}`)}</p>}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                  {t("common:cancel")}
                </Button>
                <Button type="submit" size="sm">
                  {t("common:save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
