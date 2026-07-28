import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { Company, SubscriptionTier } from "@/domains/organization/types";
import { getCompanies } from "@/domains/organization/storage";
import {
  suspendCompany,
  activateCompany,
  changeTier,
  checkTierLimit,
  getCompaniesSummary,
} from "@/domains/organization/workflow";
import { canViewCompanies, canManageCompanies } from "@/constants/permissions";

export function useCompanyList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = () => {
    setCompanies(getCompanies());
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const permissions = useMemo(
    () => ({
      canView: canViewCompanies(user?.role),
      canManage: canManageCompanies(user?.role),
    }),
    [user]
  );

  const summary = useMemo(() => getCompaniesSummary(), [companies]);

  const tierLimits = useMemo(() => {
    const map: Record<string, ReturnType<typeof checkTierLimit>> = {};
    companies.forEach((c) => {
      map[c.id] = checkTierLimit(c);
    });
    return map;
  }, [companies]);

  const handleSuspend = (id: string) => {
    if (!permissions.canManage) return;
    setError(null);
    try {
      suspendCompany(id);
      loadCompanies();
    } catch (e) {
      console.error("suspendCompany failed:", e);
      setError(t("common:error_generic_action_failed"));
    }
  };

  const handleActivate = (id: string) => {
    if (!permissions.canManage) return;
    setError(null);
    try {
      activateCompany(id);
      loadCompanies();
    } catch (e) {
      console.error("activateCompany failed:", e);
      setError(t("common:error_generic_action_failed"));
    }
  };

  const handleChangeTier = (id: string, tier: SubscriptionTier): { success: boolean; error?: string } => {
    if (!permissions.canManage) return { success: false, error: "unauthorized" };
    try {
      changeTier(id, tier);
      loadCompanies();
      return { success: true };
    } catch (e) {
      console.error("changeTier failed:", e);
      return { success: false };
    }
  };

  return {
    companies,
    summary,
    tierLimits,
    permissions,
    error,
    handleSuspend,
    handleActivate,
    handleChangeTier,
  };
}
