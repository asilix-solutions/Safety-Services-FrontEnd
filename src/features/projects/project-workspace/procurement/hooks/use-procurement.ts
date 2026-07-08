"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getProcurementByProject, createProcurementRecord } from "@/domains/procurement";
import { ProcurementDraft } from "@/domains/procurement/types";
import { canEditProjectWorkspace } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ProcurementFormValues } from "@/schemas/procurement.schema";
import { buildProcurementViewModel } from "../view-models/procurement.viewmodel";

export function useProcurement(projectId: string) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["procurement", "validation", "common"]);
  const queryClient = useQueryClient();

  const canEdit = canEditProjectWorkspace(user?.role);

  const { data: records = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PROCUREMENT.LIST(projectId),
    queryFn: () => getProcurementByProject(projectId),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: async (values: ProcurementFormValues) => {
      if (!user) throw new Error("A signed-in user is required to record procurement.");
      const draft: ProcurementDraft = {
        projectId,
        supplierName: values.supplierName,
        siloTag: values.siloTag,
        invoiceType: values.invoiceType,
        preTaxValue: values.preTaxValue,
        receiptImage: values.receiptImage,
      };
      return createProcurementRecord(draft, { id: user.id, name: user.name || user.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROCUREMENT.LIST(projectId) });
    },
  });

  const viewModel = useMemo(
    () => buildProcurementViewModel(records, projectId, locale),
    [records, projectId, locale]
  );

  return {
    canEdit,
    isLoading,
    viewModel,
    saveProcurement: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error as Error | null,
    t,
  };
}
