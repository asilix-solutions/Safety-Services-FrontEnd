import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import { SiteVisit, getSiteVisits } from "@/domains/site-visits/storage";
import { maintenanceApi, MaintenanceVisitStatus } from "@/domains/maintenance/api";
import { filterSiteVisits } from "../helpers/helpers";

export function useSiteVisitsList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "upcoming" | "completed">("list");
  const [allVisits, setAllVisits] = useState<SiteVisit[]>([]);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    let isCancelled = false;
    const localVisits = getSiteVisits();
    setAllVisits(localVisits);

    async function syncLiveVisits() {
      try {
        const res = await maintenanceApi.getCalendar();
        if (!isCancelled && res.isSuccess && res.data) {
          const liveMapped: SiteVisit[] = res.data.map((e) => ({
            id: e.visitId,
            projectId: e.contractId,
            projectName: `عقد صيانة رقم ${e.contractNumber} (${e.clientName || "عميل معتمد"})`,
            location: "مقر المنشأة المعتمد",
            inspectorId: "ins-sa",
            inspectorName: "مهندس السلامة الميداني",
            scheduledDate: e.dueOnUtc.slice(0, 10),
            type: "routine" as const,
            status:
              e.status === MaintenanceVisitStatus.Completed
                ? ("completed" as const)
                : e.status === MaintenanceVisitStatus.Cancelled || e.status === MaintenanceVisitStatus.Missed
                ? ("cancelled" as const)
                : ("scheduled" as const),
            notes: e.raisedJobNumber
              ? `المعاملة الميدانية: ${e.raisedJobNumber}`
              : `زيارة رقم #${e.visitNumber}`,
            approved: e.status === MaintenanceVisitStatus.Completed,
          }));

          const visitMap = new Map<string, SiteVisit>();
          liveMapped.forEach((v) => visitMap.set(v.id, v));
          localVisits.forEach((v) => {
            if (!visitMap.has(v.id)) {
              visitMap.set(v.id, v);
            }
          });

          setAllVisits(Array.from(visitMap.values()));
          setIsLiveSynced(true);
        }
      } catch (err) {
        console.warn("Live site visits sync failed:", err);
      }
    }

    syncLiveVisits();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const filteredVisits = filterSiteVisits(allVisits, activeTab);

  return {
    user,
    activeTab,
    setActiveTab,
    allVisits,
    filteredVisits,
    isLiveSynced,
    t,
  };
}
export default useSiteVisitsList;
