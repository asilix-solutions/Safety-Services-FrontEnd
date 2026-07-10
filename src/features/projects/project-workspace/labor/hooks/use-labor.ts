"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getLaborByProject, createLaborRecord, confirmOutsourceSettlement } from "@/domains/labor";
import { GeoTag, LaborDraft } from "@/domains/labor/types";
import { canEditProjectWorkspace } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { LaborFormValues } from "@/schemas/labor.schema";
import { buildLaborViewModel } from "../view-models/labor.viewmodel";

const GEOLOCATION_TIMEOUT_MS = 3000;

/** Best-effort geo-tag capture for settlement — resolves null on denial, error, or timeout, never rejects. */
function captureGeoTag(): Promise<GeoTag | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );
  });
}

export function useLabor(projectId: string) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["labor", "validation", "common"]);
  const queryClient = useQueryClient();

  const canEdit = canEditProjectWorkspace(user?.role);

  const { data: records = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.LABOR.LIST(projectId),
    queryFn: () => getLaborByProject(projectId),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (values: LaborFormValues) => {
      if (!user) throw new Error("A signed-in user is required to record labor.");
      const draft: LaborDraft = {
        projectId,
        workerName: values.workerName,
        fieldRole: values.fieldRole,
        legalCategory: values.legalCategory,
        agreedWage: values.agreedWage,
      };
      return createLaborRecord(draft, { id: user.id, name: user.name || user.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LABOR.LIST(projectId) });
    },
  });

  const settleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("A signed-in user is required to confirm settlement.");
      const geoTag = await captureGeoTag();
      return confirmOutsourceSettlement(id, { id: user.id, name: user.name || user.role }, geoTag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LABOR.LIST(projectId) });
    },
  });

  const viewModel = useMemo(() => buildLaborViewModel(records, projectId, locale), [records, projectId, locale]);

  return {
    canEdit,
    isLoading,
    viewModel,
    saveLabor: createMutation.mutateAsync,
    isSaving: createMutation.isPending,
    saveError: createMutation.error as Error | null,
    confirmSettlement: settleMutation.mutateAsync,
    isSettling: settleMutation.isPending,
    settleError: settleMutation.error as Error | null,
    t,
  };
}
