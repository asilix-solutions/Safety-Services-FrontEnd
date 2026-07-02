import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { DerivedOrganizationInfo } from "@/domains/settings/types";

interface OrganizationTabProps {
  info: DerivedOrganizationInfo;
  t: (key: string) => string;
}

export function OrganizationTab({ info, t }: OrganizationTabProps) {
  const formatDateTime = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_orgInfo")}</CardTitle>
        <CardDescription>{t("settings:orgInfo_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_workspaceId") || "Workspace ID"}
            </span>
            <span className="font-mono text-sm font-semibold text-foreground block mt-1">
              {info.workspaceId}
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_tenantId") || "Tenant ID"}
            </span>
            <span className="font-mono text-sm font-semibold text-foreground block mt-1">
              {info.tenantId}
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_subscriptionPlan") || "Active Plan"}
            </span>
            <span className="text-sm font-semibold text-foreground block mt-1">
              {info.subscriptionPlan}
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_workspaceCreatedAt") || "Workspace Created"}
            </span>
            <span className="text-sm font-semibold text-foreground block mt-1">
              {formatDateTime(info.workspaceCreatedAt)}
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4 md:col-span-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_activeCompanyAdmin") || "Primary Workspace Admin"}
            </span>
            <span className="text-sm font-semibold text-foreground block mt-1">
              {info.activeCompanyAdmin}
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_mvpVersion") || "MVP Version"}
            </span>
            <span className="text-sm font-semibold text-foreground block mt-1">
              v1.0.0-MVP
            </span>
          </Card>

          <Card className="border-border bg-secondary/10 shadow-none p-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              {t("settings:lbl_storageMode") || "Storage Mode"}
            </span>
            <span className="text-sm font-semibold text-foreground block mt-1">
              {t("settings:storage_mode_local") || "Browser Local Storage"}
            </span>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
export default OrganizationTab;
