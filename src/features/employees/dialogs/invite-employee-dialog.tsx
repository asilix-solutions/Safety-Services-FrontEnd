import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/providers/i18n-provider";
import { Employee, EmployeeDepartment, EmployeeAvailability } from "@/domains/employees/types";
import { EmployeeValidationError } from "@/domains/employees/validation";
import { X, Plus } from "lucide-react";

interface InviteEmployeeDialogProps {
  onInvite: (data: Omit<Employee, "id" | "tenantId" | "employeeNumber" | "createdAt" | "updatedAt">) => { success: boolean; errors?: EmployeeValidationError };
  trigger?: React.ReactNode;
}

export function InviteEmployeeDialog({ onInvite, trigger }: InviteEmployeeDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Consulting Engineer" as any,
    department: "Engineering" as EmployeeDepartment,
    status: "Active" as any,
    availabilityStatus: "Available" as EmployeeAvailability,
  });

  const [errors, setErrors] = useState<EmployeeValidationError>({});

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "Consulting Engineer",
        department: "Engineering",
        status: "Active",
        availabilityStatus: "Available",
      });
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onInvite(formData);
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
          {t("common:employees.add_btn")}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="sm:max-w-[425px] w-full border-border bg-card shadow-2xl relative">
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-sm font-bold">{t("common:employees.invite")}</CardTitle>
                <CardDescription className="text-xs">{t("common:employees.invite_desc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 py-2 text-xs">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:employees.fields.name")}</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Abdullah Ahmed"
                    className="h-9 text-xs"
                  />
                  {errors.fullName && <p className="text-destructive text-[10px]">{t(`common:${errors.fullName}`)}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:employees.fields.email")}</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="h-9 text-xs"
                  />
                  {errors.email && <p className="text-destructive text-[10px]">{t(`common:${errors.email}`)}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:employees.fields.phone")}</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +966501234567"
                    className="h-9 text-xs"
                  />
                  {errors.phone && <p className="text-destructive text-[10px]">{t(`common:${errors.phone}`)}</p>}
                </div>

                {/* Role & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:employees.fields.role")}</label>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="h-9 text-xs"
                    >
                      <option value="Company Admin">{t("common:roles.company_admin")}</option>
                      <option value="Consulting Engineer">{t("common:roles.consulting_engineer")}</option>
                      <option value="Operations Officer">{t("common:roles.operations_officer")}</option>
                      <option value="Sales Agent">{t("common:roles.sales_agent")}</option>
                    </Select>
                    {errors.role && <p className="text-destructive text-[10px]">{t(`common:${errors.role}`)}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:employees.fields.department")}</label>
                    <Select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                      className="h-9 text-xs"
                    >
                      <option value="Engineering">{t("common:employees.departments.Engineering")}</option>
                      <option value="Operations">{t("common:employees.departments.Operations")}</option>
                      <option value="Sales">{t("common:employees.departments.Sales")}</option>
                      <option value="Administration">{t("common:employees.departments.Administration")}</option>
                    </Select>
                    {errors.department && <p className="text-destructive text-[10px]">{t(`common:${errors.department}`)}</p>}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:employees.fields.availability")}</label>
                  <Select
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as any })}
                    className="h-9 text-xs"
                  >
                    <option value="Available">{t("common:employees.availability.Available")}</option>
                    <option value="Busy">{t("common:employees.availability.Busy")}</option>
                    <option value="Unavailable">{t("common:employees.availability.Unavailable")}</option>
                  </Select>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} size="sm">
                  {t("common:cancel")}
                </Button>
                <Button type="submit" size="sm">
                  {t("common:employees.invite")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
