import React, { useState, useEffect } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { Employee, EmployeeDepartment, EmployeeAvailability } from "@/domains/employees/types";
import { EmployeeValidationError } from "@/domains/employees/validation";
import { X } from "lucide-react";

interface EmployeeDetailsDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => { success: boolean; errors?: EmployeeValidationError };
  canManage: boolean;
}

export function EmployeeDetailsDrawer({ employee, isOpen, onClose, onSave, canManage }: EmployeeDetailsDrawerProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<EmployeeValidationError>({});

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setIsEditing(false);
      setErrors({});
    }
  }, [employee]);

  if (!isOpen || !employee || !formData) return null;

  const handleSave = () => {
    const res = onSave(formData);
    if (res.success) {
      setIsEditing(false);
      setErrors({});
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  const getAvailabilityBadgeClass = (status: EmployeeAvailability) => {
    switch (status) {
      case "Available":
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      case "Busy":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      case "Unavailable":
        return "bg-muted text-muted-foreground border-border hover:bg-secondary";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      {/* Backdrop area click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full sm:max-w-md h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto relative animate-in slide-in-from-right duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{t("common:employees.details")}</h3>
              {!canManage && (
                <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-muted text-muted-foreground border-border">
                  {t("common:read_only")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">{employee.employeeNumber}</p>
          </div>

          {/* Profile Card Header */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/15">
            <Avatar className="h-14 w-14 border-2 border-primary/10">
              <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
              <AvatarFallback>{employee.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">{employee.fullName}</h4>
              <p className="text-xs text-muted-foreground">{t(`common:roles.${employee.role.toLowerCase().replace(" ", "_")}`)}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="outline" className={getAvailabilityBadgeClass(employee.availabilityStatus)}>
                  {t(`common:employees.availability.${employee.availabilityStatus}`)}
                </Badge>
                <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                  {t(`common:status_${employee.status}`)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Fields Info */}
          <div className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">{t("common:employees.fields.name")}</label>
              {isEditing ? (
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">{employee.fullName}</p>
              )}
              {errors.fullName && <p className="text-destructive text-[10px]">{t(`common:${errors.fullName}`)}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">{t("common:employees.fields.email")}</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">{employee.email}</p>
              )}
              {errors.email && <p className="text-destructive text-[10px]">{t(`common:${errors.email}`)}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">{t("common:employees.fields.phone")}</label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">{employee.phone}</p>
              )}
              {errors.phone && <p className="text-destructive text-[10px]">{t(`common:${errors.phone}`)}</p>}
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t("common:employees.fields.role")}</label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm font-medium text-foreground py-1.5">{t(`common:roles.${employee.role.toLowerCase().replace(" ", "_")}`)}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t("common:employees.fields.department")}</label>
                {isEditing ? (
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
                ) : (
                  <p className="text-sm font-medium text-foreground py-1.5">{t(`common:employees.departments.${employee.department}`)}</p>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">{t("common:employees.fields.availability")}</label>
              {isEditing ? (
                <Select
                  value={formData.availabilityStatus}
                  onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as any })}
                  className="h-9 text-xs"
                >
                  <option value="Available">{t("common:employees.availability.Available")}</option>
                  <option value="Busy">{t("common:employees.availability.Busy")}</option>
                  <option value="Unavailable">{t("common:employees.availability.Unavailable")}</option>
                </Select>
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">{t(`common:employees.availability.${employee.availabilityStatus}`)}</p>
              )}
            </div>

            {/* Audit Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-[10px] text-muted-foreground">
              <div>
                <span>{t("common:employees.fields.created")}</span>
                <span className="block font-medium mt-0.5">{new Date(employee.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span>{t("common:employees.fields.updated")}</span>
                <span className="block font-medium mt-0.5">{new Date(employee.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-border flex justify-end gap-2">
          {canManage && (
            <>
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setFormData({ ...employee }); setErrors({}); }}>
                    {t("common:cancel")}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    {t("common:save")}
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  {t("common:edit")}
                </Button>
              )}
            </>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            {isEditing ? t("common:cancel") : t("common:close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
