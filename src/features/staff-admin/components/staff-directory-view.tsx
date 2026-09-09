"use client";

import React from "react";
import { Users, UserCheck, Wrench, Activity } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { useStaffDirectory } from "../hooks/use-staff-directory";
import { StaffFilterBar } from "./staff-filter-bar";
import { StaffDirectoryTable } from "./staff-directory-table";
import { InviteStaffModal } from "./invite-staff-modal";

export function StaffDirectoryView() {
  const {
    staff,
    totalCount,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    kpis,
    handleToggleStatus,
    handleUpdateRole,
    handleInviteStaff,
    canManage,
  } = useStaffDirectory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/40 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            دليل الكادر الإداري والهندسي (Staff Administration)
          </h1>
          <p className="text-sm text-muted-foreground">
            إدارة حسابات منسوبي الشركة، تعيين الصلاحيات، وإرسال دعوات الانضمام للمهندسين.
          </p>
        </div>
        <div>
          {canManage && <InviteStaffModal onInvite={handleInviteStaff} />}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/85 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{kpis.total}</p>
              <p className="text-[11px] text-muted-foreground font-medium">إجمالي الكادر</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/85 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{kpis.activeEngineers}</p>
              <p className="text-[11px] text-muted-foreground font-medium">مهندسون استشاريون</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/85 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{kpis.activeOperations}</p>
              <p className="text-[11px] text-muted-foreground font-medium">مسؤولو عمليات</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/85 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{kpis.activeSales}</p>
              <p className="text-[11px] text-muted-foreground font-medium">مسؤولو مبيعات</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <StaffFilterBar
        search={search}
        onSearchChange={setSearch}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Main Staff Table */}
      <StaffDirectoryTable
        staff={staff}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onToggleStatus={handleToggleStatus}
        onUpdateRole={handleUpdateRole}
        canManage={canManage}
      />
    </div>
  );
}
