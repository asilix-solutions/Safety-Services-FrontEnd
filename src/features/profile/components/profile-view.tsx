"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useProfileDetails } from "../hooks/use-profile-details";
import { ProfileHeaderCard } from "./profile-header-card";
import { PermissionsBadgeGrid } from "./permissions-badge-grid";
import { SupervisorCard } from "./supervisor-card";
import { AuditTrailCard } from "./audit-trail-card";
import { ChangePasswordCard } from "./change-password-card";

export function ProfileView() {
  const { profile, isLoading } = useProfileDetails();

  if (isLoading || !profile) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        جاري تحميل الملف الشخصي...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الملف الشخصي وإدارة الأمان"
        description="عرض تفاصيل الهوية المؤسسية، الصلاحيات المعتمدة، وسجل نشاط الحساب."
      />

      {/* 1. Profile Header Card */}
      <ProfileHeaderCard profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password & Supervisor */}
        <div className="lg:col-span-2 space-y-6">
          <ChangePasswordCard />
          <PermissionsBadgeGrid permissions={profile.permissions} />
        </div>

        {/* Right Column: Supervisor & Audit Trail */}
        <div className="space-y-6">
          <SupervisorCard supervisor={profile.supervisor} />
          <AuditTrailCard audit={profile.auditTrail} />
        </div>
      </div>
    </div>
  );
}
