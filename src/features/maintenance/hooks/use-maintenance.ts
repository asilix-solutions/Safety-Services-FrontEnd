"use client";

import { useState, useEffect, useCallback } from "react";
import {
  maintenanceApi,
  MaintenanceContractDto,
  MaintenanceCalendarEntryDto,
  MaintenanceContractStatus,
  MaintenanceVisitStatus,
  OpenMaintenanceContractPayload,
} from "@/domains/maintenance/api";
import { alertService } from "@/services/alert-service";
import { useAuth } from "@/providers/AuthProvider";

export function useMaintenance() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<MaintenanceContractDto[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<MaintenanceCalendarEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await maintenanceApi.getContracts({ pageNumber: 1, pageSize: 50 });
      if (res.isSuccess && res.data?.items) {
        setContracts(res.data.items);
        setIsLiveSynced(true);
      }
    } catch (err) {
      console.warn("Failed to fetch maintenance contracts:", err);
    }
  }, []);

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await maintenanceApi.getCalendar();
      if (res.isSuccess && res.data) {
        setCalendarEntries(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch maintenance calendar:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchContracts(), fetchCalendar()]);
    setIsLoading(false);
  }, [fetchContracts, fetchCalendar]);

  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  const handleOpenContract = async (payload: OpenMaintenanceContractPayload) => {
    try {
      const res = await maintenanceApi.openContract(payload);
      if (res.isSuccess) {
        alertService.success("تم فتح عقد الصيانة الدورية وتوزيع الزيارات بنجاح");
        await refreshAll();
        return true;
      } else {
        alertService.showApiResponse(res);
        return false;
      }
    } catch (err) {
      alertService.showApiError(err);
      return false;
    }
  };

  const handleRescheduleVisit = async (visitId: string, dueOnUtc: string) => {
    try {
      const res = await maintenanceApi.rescheduleVisit(visitId, dueOnUtc);
      if (res.isSuccess) {
        alertService.success("تمت إعادة جدولة موعد الزيارة الميدانية بنجاح");
        await refreshAll();
        return true;
      } else {
        alertService.showApiResponse(res);
        return false;
      }
    } catch (err) {
      alertService.showApiError(err);
      return false;
    }
  };

  const handleCancelContract = async (contractId: string, reason: string) => {
    try {
      const res = await maintenanceApi.cancelContract(contractId, reason);
      if (res.isSuccess) {
        alertService.success("تم إلغاء عقد الصيانة وإنهاء الزيارات غير المرفوعة");
        await refreshAll();
        return true;
      } else {
        alertService.showApiResponse(res);
        return false;
      }
    } catch (err) {
      alertService.showApiError(err);
      return false;
    }
  };

  // Compute KPI metrics
  const kpis = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c) => c.status === MaintenanceContractStatus.Active).length,
    scheduledVisits: calendarEntries.filter((v) => v.status === MaintenanceVisitStatus.Scheduled).length,
    completedVisits: contracts.reduce((acc, c) => acc + (c.visitsCompleted || 0), 0),
  };

  return {
    contracts,
    calendarEntries,
    isLoading,
    isLiveSynced,
    kpis,
    refreshAll,
    handleOpenContract,
    handleRescheduleVisit,
    handleCancelContract,
  };
}
