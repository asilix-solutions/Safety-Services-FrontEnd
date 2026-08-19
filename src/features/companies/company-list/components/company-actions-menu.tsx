import React from "react";
import { Company } from "@/domains/organization/types";
import { ActionMenu, ActionMenuItem } from "@/shared/components/action-menu/action-menu";
import { useTranslation } from "@/providers/i18n-provider";
import { Ban, CheckCircle2, Layers } from "lucide-react";

interface CompanyActionsMenuProps {
  company: Company;
  canManage: boolean;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onOpenChangeTier: (company: Company) => void;
}

export function CompanyActionsMenu({
  company,
  canManage,
  onSuspend,
  onActivate,
  onOpenChangeTier,
}: CompanyActionsMenuProps) {
  const { t } = useTranslation();

  if (!canManage) {
    return null;
  }

  const actions: ActionMenuItem[] = [
    {
      id: `${company.id}-change-tier`,
      label: t("companies:table.change_tier"),
      onClick: () => onOpenChangeTier(company),
      icon: Layers,
    },
    {
      id: `${company.id}-status`,
      label: company.status === "active" ? t("companies:table.suspend") : t("companies:table.activate"),
      onClick: () => (company.status === "active" ? onSuspend(company.id) : onActivate(company.id)),
      icon: company.status === "active" ? Ban : CheckCircle2,
    },
  ];

  return <ActionMenu items={actions} />;
}
