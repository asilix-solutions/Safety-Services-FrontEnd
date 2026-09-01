"use client";

import React from "react";
import { Search } from "lucide-react";

interface StaffFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  departmentFilter: string;
  onDepartmentChange: (val: string) => void;
  roleFilter: string;
  onRoleChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

export function StaffFilterBar({
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: StaffFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="البحث بالاسم، البريد، الجوال، أو المسمى..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background/60 border border-border rounded-lg ps-9 pe-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="bg-background/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">جميع الأقسام</option>
          <option value="Engineering">الهندسة والاستشارات</option>
          <option value="Operations">العمليات والمعاينة</option>
          <option value="Sales">المبيعات والعقود</option>
          <option value="Management">الإدارة العليا</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-background/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">جميع الأدوار</option>
          <option value="Company Admin">مدير المنشأة</option>
          <option value="Consulting Engineer">مهندس استشاري</option>
          <option value="Operations Officer">مسؤول عمليات</option>
          <option value="Sales Agent">مسؤول مبيعات</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-background/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">جميع الحالات</option>
          <option value="Active">نشط</option>
          <option value="Inactive">غير نشط</option>
          <option value="Suspended">موقوف</option>
        </select>
      </div>
    </div>
  );
}
