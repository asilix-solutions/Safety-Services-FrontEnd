"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import {
  Employee,
  EmployeeDepartment,
  EmployeeAvailability,
  EmployeeRole,
} from "@/domains/employees/types";
import { EmployeeValidationError } from "@/domains/employees/validation";
import {
  formatSaudiPhone,
  formatEmployeeRole,
  formatEmployeeDepartment,
  SAUDI_ROLES,
  SAUDI_DEPARTMENTS,
} from "@/domains/employees/helpers";
import { cn } from "@/lib/utils";

interface EmployeeDetailsDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => { success: boolean; errors?: EmployeeValidationError };
  canManage: boolean;
}

export function EmployeeDetailsDrawer({
  employee,
  isOpen,
  onClose,
  onSave,
  canManage,
}: EmployeeDetailsDrawerProps) {
  const { t, dir } = useTranslation();
  const side = dir === "rtl" ? "right" : "left";
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(employee);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<EmployeeValidationError>({});

  useEffect(() => {
    if (employee) {
      setActiveEmployee(employee);
      setFormData({ ...employee });
      setIsEditing(false);
      setErrors({});
    }
  }, [employee]);

  const currentEmployee = employee || activeEmployee;
  if (!currentEmployee || !formData) return null;

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
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      case "Busy":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      case "Unavailable":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        className="w-full sm:max-w-md h-full p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg font-bold text-foreground">
                {t("common:employees.details")}
              </SheetTitle>
              {!canManage && (
                <Badge
                  variant="secondary"
                  className="text-[10px] py-0.5 px-2 bg-muted text-muted-foreground border-border"
                >
                  {t("common:read_only")}
                </Badge>
              )}
            </div>
            <SheetDescription className="text-xs text-muted-foreground font-mono mt-1">
              {currentEmployee.employeeNumber}
            </SheetDescription>
          </div>

          {/* Profile Card Header */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/15">
            <Avatar className="h-14 w-14 border-2 border-primary/10">
              <AvatarImage src={currentEmployee.avatarUrl} alt={currentEmployee.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                {currentEmployee.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">{currentEmployee.fullName}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                {formatEmployeeRole(currentEmployee.role)}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", getAvailabilityBadgeClass(currentEmployee.availabilityStatus))}
                >
                  {t(`common:employees.availability.${currentEmployee.availabilityStatus}`)}
                </Badge>
                <Badge
                  variant={currentEmployee.status === "Active" ? "success" : "secondary"}
                  className={cn(
                    "text-[10px] font-semibold",
                    currentEmployee.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-muted text-muted-foreground border-transparent"
                  )}
                >
                  {currentEmployee.status === "Active"
                    ? t("common:employees.status.Active")
                    : t("common:employees.status.Inactive")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Fields Info */}
          <div className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                {t("common:employees.fields.name")}
              </label>
              {isEditing ? (
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">
                  {currentEmployee.fullName}
                </p>
              )}
              {errors.fullName && (
                <p className="text-destructive text-[10px]">
                  {t(`common:${errors.fullName}`)}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                {t("common:employees.fields.email")}
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 text-xs font-mono text-left"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5 font-mono" dir="ltr">
                  {currentEmployee.email}
                </p>
              )}
              {errors.email && (
                <p className="text-destructive text-[10px]">
                  {t(`common:${errors.email}`)}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                {t("common:employees.fields.phone")}
              </label>
              {isEditing ? (
                <Input
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-9 text-xs font-mono text-left"
                  placeholder="05XXXXXXXX"
                />
              ) : (
                <p className="py-1.5">
                  <span
                    dir="ltr"
                    className="inline-block font-mono text-sm tabular-nums text-foreground"
                  >
                    {formatSaudiPhone(currentEmployee.phone)}
                  </span>
                </p>
              )}
              {errors.phone && (
                <p className="text-destructive text-[10px]">
                  {t(`common:${errors.phone}`)}
                </p>
              )}
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-4">
              {/* Access Role */}
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  {t("common:employees.fields.role")}
                </label>
                {isEditing ? (
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as EmployeeRole })
                    }
                    className="h-9 text-xs cursor-pointer"
                  >
                    {SAUDI_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.labelAr}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className="text-sm font-medium text-foreground py-1.5">
                    {formatEmployeeRole(currentEmployee.role)}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  {t("common:employees.fields.department")}
                </label>
                {isEditing ? (
                  <Select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value as EmployeeDepartment,
                      })
                    }
                    className="h-9 text-xs cursor-pointer"
                  >
                    {SAUDI_DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.labelAr}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className="text-sm font-medium text-foreground py-1.5">
                    {formatEmployeeDepartment(currentEmployee.department)}
                  </p>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                {t("common:employees.fields.availability")}
              </label>
              {isEditing ? (
                <Select
                  value={formData.availabilityStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availabilityStatus: e.target.value as EmployeeAvailability,
                    })
                  }
                  className="h-9 text-xs cursor-pointer"
                >
                  <option value="Available">{t("common:employees.availability.Available")}</option>
                  <option value="Busy">{t("common:employees.availability.Busy")}</option>
                  <option value="Unavailable">{t("common:employees.availability.Unavailable")}</option>
                </Select>
              ) : (
                <p className="text-sm font-medium text-foreground py-1.5">
                  {t(`common:employees.availability.${currentEmployee.availabilityStatus}`)}
                </p>
              )}
            </div>

            {/* Audit Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-[10px] text-muted-foreground">
              <div>
                <span>{t("common:employees.fields.created")}</span>
                <span className="block font-medium mt-0.5">
                  {new Date(currentEmployee.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>{t("common:employees.fields.updated")}</span>
                <span className="block font-medium mt-0.5">
                  {new Date(currentEmployee.updatedAt).toLocaleDateString()}
                </span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ ...currentEmployee });
                      setErrors({});
                    }}
                  >
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
      </SheetContent>
    </Sheet>
  );
}

export default EmployeeDetailsDrawer;
