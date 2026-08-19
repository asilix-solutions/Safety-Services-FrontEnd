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
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/providers/i18n-provider";
import { Employee, EmployeeDepartment, EmployeeAvailability } from "@/domains/employees/types";
import { EmployeeValidationError } from "@/domains/employees/validation";
import { Plus } from "lucide-react";

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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t("common:employees.invite")}</DialogTitle>
              <DialogDescription>{t("common:employees.invite_desc")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t("common:employees.fields.name")}</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Abdullah Al-Mansoor"
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
                  placeholder="e.g. abdullah@company.com"
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
                  placeholder="e.g. +966 50 123 4567"
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
                    <option value="Consulting Engineer">{t("common:employees.roles.Consulting Engineer")}</option>
                    <option value="Inspector">{t("common:employees.roles.Inspector")}</option>
                    <option value="Project Manager">{t("common:employees.roles.Project Manager")}</option>
                    <option value="Finance Officer">{t("common:employees.roles.Finance Officer")}</option>
                    <option value="Operations Manager">{t("common:employees.roles.Operations Manager")}</option>
                  </Select>
                  {errors.role && <p className="text-destructive text-[10px]">{t(`common:${errors.role}`)}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:employees.fields.department")}</label>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as EmployeeDepartment })}
                    className="h-9 text-xs"
                  >
                    <option value="Engineering">{t("common:employees.departments.Engineering")}</option>
                    <option value="Field Operations">{t("common:employees.departments.Field Operations")}</option>
                    <option value="Management">{t("common:employees.departments.Management")}</option>
                    <option value="Finance">{t("common:employees.departments.Finance")}</option>
                    <option value="Support">{t("common:employees.departments.Support")}</option>
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
            </div>

            <DialogFooter className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} size="sm">
                {t("common:cancel")}
              </Button>
              <Button type="submit" size="sm">
                {t("common:employees.invite")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
