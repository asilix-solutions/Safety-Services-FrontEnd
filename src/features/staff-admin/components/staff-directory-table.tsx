"use client";

import React from "react";
import { TenantUserDTO } from "@/domains/users/types";
import { UserRole } from "@/types/role";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Mail, Phone, MoreVertical, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/ui/dropdown-menu";

interface StaffDirectoryTableProps {
  staff: TenantUserDTO[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: string) => void;
  onUpdateRole: (id: string, role: UserRole) => void;
  canManage: boolean;
}

export function StaffDirectoryTable({
  staff,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onToggleStatus,
  onUpdateRole,
  canManage,
}: StaffDirectoryTableProps) {
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Company Admin":
        return "default";
      case "Consulting Engineer":
        return "secondary";
      case "Operations Officer":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-card/85 backdrop-blur-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-secondary/40 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 text-start">عضو الفريق</th>
                <th className="py-3 px-4 text-start">القسم والمسمى</th>
                <th className="py-3 px-4 text-start">الدور والصلاحيات</th>
                <th className="py-3 px-4 text-start">المسؤول المباشر</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-end">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    لا يوجد أعضاء مطابقين لشروط البحث والفلترة.
                  </td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{user.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1 font-mono" dir="ltr">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Job Title */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{user.jobTitle || user.role}</p>
                        <p className="text-[11px] text-muted-foreground">{user.department}</p>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium text-[10px]">
                        {user.role}
                      </Badge>
                    </td>

                    {/* Supervisor */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {user.supervisorName || "—"}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : user.status === "Inactive"
                            ? "bg-muted text-muted-foreground border border-border"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}
                      >
                        {user.status === "Active" ? "نشط" : user.status === "Inactive" ? "معطل" : "موقوف"}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-end">
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                              إدارة حساب الموظف
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() => onToggleStatus(user.id)}
                              className="cursor-pointer gap-2"
                            >
                              {user.status === "Active" ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 text-destructive" />
                                  <span>تعطيل الحساب</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 text-emerald-500" />
                                  <span>تفعيل الحساب</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                              تغيير الدور والصلاحيات
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() => onUpdateRole(user.id, "Consulting Engineer")}
                              className="cursor-pointer"
                            >
                              مهندس استشاري
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(user.id, "Operations Officer")}
                              className="cursor-pointer"
                            >
                              مسؤول عمليات
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(user.id, "Sales Agent")}
                              className="cursor-pointer"
                            >
                              مسؤول مبيعات
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(user.id, "Company Admin")}
                              className="cursor-pointer font-bold text-primary"
                            >
                              مدير منشأة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>
          عرض {staff.length} من أصل {totalCount} عضو
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="px-2 font-semibold text-foreground">
            صفحة {currentPage} من {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
