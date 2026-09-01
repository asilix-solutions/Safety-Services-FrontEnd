"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { SettingsSidebar } from "@/features/settings";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مركز إعدادات المنشأة والنظام (Enterprise Settings Hub)"
        description="إدارة الهوية المؤسسية، محركات البحث، بوابات الإشعار، السياسات المالية، وتهيئة الأمان."
      />

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <SettingsSidebar />
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
