"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/role";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/constants/roles";
import { useTranslation } from "@/providers/i18n-provider";

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  if (!user) return null;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith("Client:")) {
      const companyId = val.split(":")[1];
      switchRole(USER_ROLES.CLIENT, companyId);
    } else {
      switchRole(val as UserRole);
    }
    router.push("/");
  };

  const getSelectValue = () => {
    if (user.role === USER_ROLES.CLIENT) {
      return `Client:${user.companyId || "c-102"}`;
    }
    return user.role;
  };

  return (
    <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-lg px-2.5 py-1">
      <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider hidden sm:inline-block">
        {t("common:switch_workspace")}
      </span>
      <select
        value={getSelectValue()}
        onChange={handleRoleChange}
        className="bg-transparent text-xs font-semibold text-primary outline-none cursor-pointer focus:ring-0 border-0 p-0 pr-6"
      >
        <option value="Super Admin">{t("common:roles.super_admin")}</option>
        <option value="Company Admin">{t("common:roles.company_admin")}</option>
        <option value="Consulting Engineer">{t("common:roles.consulting_engineer")}</option>
        <option value="Operations Officer">{t("common:roles.operations_officer")}</option>
        <option value="Sales Agent">{t("common:roles.sales_agent")}</option>
        <option value="Client:c-102">{t("common:roles.client_emaar")}</option>
        <option value="Client:c-103">{t("common:roles.client_gulf")}</option>
      </select>
    </div>
  );
}
export default RoleSwitcher;
