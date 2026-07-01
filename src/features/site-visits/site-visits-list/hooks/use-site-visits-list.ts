import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { SiteVisit, getSiteVisits } from "@/domains/site-visits/storage";
import { filterSiteVisits } from "../helpers/helpers";

export function useSiteVisitsList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "upcoming" | "completed">("list");
  const [allVisits, setAllVisits] = useState<SiteVisit[]>([]);

  useEffect(() => {
    if (user) {
      setAllVisits(getSiteVisits());
    }
  }, [user]);

  const filteredVisits = filterSiteVisits(allVisits, activeTab);

  return {
    user,
    activeTab,
    setActiveTab,
    allVisits,
    filteredVisits,
    t,
  };
}
export default useSiteVisitsList;
