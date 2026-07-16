import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation } from "@/providers/i18n-provider";
import { UsersSummaryCards } from "./components/users-summary";
import { PersonnelUsageSummary } from "./components/personnel-usage-summary";
import { UsersTable } from "./components/users-table";
import { useUserList } from "./hooks/use-user-list";
import { ShieldAlert } from "lucide-react";

export function UserList() {
  const { t } = useTranslation();
  const { permissions, rows, summary, personnelUsage, activate, deactivate, isActivating, isDeactivating } =
    useUserList();

  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{t("common:unauthorized")}</h3>
          <p className="text-xs text-muted-foreground max-w-xs">{t("users:unauthorized_desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("users:title")} description={t("users:desc")} />

      <UsersSummaryCards summary={summary} />

      <PersonnelUsageSummary usage={personnelUsage} />

      <UsersTable
        rows={rows}
        canManage={permissions.canManage}
        onActivate={activate}
        onDeactivate={deactivate}
        isBusy={isActivating || isDeactivating}
      />
    </div>
  );
}
