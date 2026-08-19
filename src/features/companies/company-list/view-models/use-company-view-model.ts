import { useMemo } from "react";
import { Company, TierLimitCheck, TIER_LIMITS } from "@/domains/organization/types";
import { useTranslation } from "@/providers/i18n-provider";
import { formatLimitLabel, getTierLabelKey } from "../helpers/company-table-helpers";

export interface CompanyRowViewModel {
  company: Company;
  tierLabelKey: string;
  projectLimitLabel: string;
  personnelLimitLabel: string;
  projectsAtLimit: boolean;
  personnelAtLimit: boolean;
}

export function useCompanyViewModel(
  companies: Company[],
  tierLimits: Record<string, TierLimitCheck>
) {
  const { t } = useTranslation();

  const rows: CompanyRowViewModel[] = useMemo(() => {
    const unlimitedText = t("companies:limit_unlimited");

    return companies.map((c) => {
      const limit = tierLimits[c.id];
      const limits = TIER_LIMITS[c.tier];

      return {
        company: c,
        tierLabelKey: getTierLabelKey(c.tier),
        projectLimitLabel: formatLimitLabel(c.projectCount, limits.maxProjects, unlimitedText),
        personnelLimitLabel: formatLimitLabel(c.personnelCount, limits.maxPersonnel, unlimitedText),
        projectsAtLimit: !!limit?.projectsAtLimit,
        personnelAtLimit: !!limit?.personnelAtLimit,
      };
    });
  }, [companies, tierLimits, t]);

  return { rows };
}
