import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useTranslation } from "@/providers/i18n-provider";
import { Customer, CustomerStatus } from "@/domains/customers/types";
import { CustomerValidationError } from "@/domains/customers/validation";
import { Plus } from "lucide-react";

interface AddCustomerDialogProps {
  onAdd: (data: Omit<Customer, "id" | "tenantId" | "createdAt" | "updatedAt" | "representatives">) => { success: boolean; errors?: CustomerValidationError };
  trigger?: React.ReactNode;
}

export function AddCustomerDialog({ onAdd, trigger }: AddCustomerDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<{
    companyName: string;
    commercialRegistration: string;
    industry: string;
    status: CustomerStatus;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    city: string;
    address: string;
  }>({
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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t("common:customers.add_btn")}</DialogTitle>
              <DialogDescription>
                Create a new client customer profile to associate safety projects and compliance records.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
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
                  placeholder="e.g. Construction / Contracting"
                  className="h-9 text-xs"
                />
                {errors.industry && <p className="text-destructive text-[10px]">{t(`common:${errors.industry}`)}</p>}
              </div>

              <div className="pt-2 border-t border-border">
                <h4 className="font-bold text-foreground text-xs mb-2">{t("common:customers.fields.contact_person")}</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.contact_name")}</label>
                    <Input
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                      placeholder="e.g. Ahmed Ali"
                      className="h-9 text-xs"
                    />
                    {errors.primaryContactName && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactName}`)}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">{t("common:customers.fields.email")}</label>
                      <Input
                        type="email"
                        value={formData.primaryContactEmail}
                        onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                        placeholder="e.g. ahmed@acme.com"
                        className="h-9 text-xs"
                      />
                      {errors.primaryContactEmail && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactEmail}`)}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">{t("common:customers.fields.phone")}</label>
                      <Input
                        value={formData.primaryContactPhone}
                        onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                        placeholder="e.g. +966 50 000 0000"
                        className="h-9 text-xs"
                      />
                      {errors.primaryContactPhone && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactPhone}`)}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <h4 className="font-bold text-foreground text-xs mb-2">{t("common:customers.fields.location")}</h4>
                <div className="grid grid-cols-2 gap-2">
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

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.status")}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Active">{t("common:customers.status.Active")}</option>
                      <option value="Inactive">{t("common:customers.status.Inactive")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.address")}</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. King Fahd Road, Olaya"
                    className="h-9 text-xs"
                  />
                  {errors.address && <p className="text-destructive text-[10px]">{t(`common:${errors.address}`)}</p>}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                {t("common:cancel")}
              </Button>
              <Button type="submit" size="sm">
                {t("common:save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
