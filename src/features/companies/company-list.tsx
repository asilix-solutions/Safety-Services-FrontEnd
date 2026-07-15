import React, { useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { useTranslation } from "@/providers/i18n-provider";
import { CompanySummary } from "./components/company-summary";
import { CompanyTable } from "./components/company-table";
import { ChangeTierDialog } from "./components/change-tier-dialog";
import { useCompanyList } from "./hooks/use-company-list";
import { Company } from "@/domains/organization/types";
import { ShieldAlert } from "lucide-react";

export function CompanyList() {
  const { t } = useTranslation();
  const {
    companies,
    summary,
    tierLimits,
    permissions,
    handleSuspend,
    handleActivate,
    handleChangeTier,
  } = useCompanyList();

  const [tierDialogCompany, setTierDialogCompany] = useState<Company | null>(null);

  if (!permissions.canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{t("common:unauthorized")}</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            {t("common:companies.unauthorized_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("common:companies.title")} description={t("common:companies.desc")} />

      <CompanySummary summary={summary} />

      <CompanyTable
        companies={companies}
        tierLimits={tierLimits}
        permissions={permissions}
        onSuspend={handleSuspend}
        onActivate={handleActivate}
        onOpenChangeTier={setTierDialogCompany}
      />

      <ChangeTierDialog
        company={tierDialogCompany}
        onConfirm={handleChangeTier}
        onClose={() => setTierDialogCompany(null)}
      />
    </div>
  );
}
