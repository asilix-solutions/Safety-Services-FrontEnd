"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getClosureByProject, createClosureRecord } from "@/domains/closure";
import { ClosureDraft } from "@/domains/closure/types";
import { canEditProjectWorkspace } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ClosureFormValues } from "@/schemas/closure.schema";
import { buildClosureViewModel } from "../view-models/closure.viewmodel";

export function useClosure(projectId: string) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["closure", "validation", "common"]);
  const queryClient = useQueryClient();

  const canEdit = canEditProjectWorkspace(user?.role);

  const { data: record = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CLOSURE.DETAIL(projectId),
    queryFn: () => getClosureByProject(projectId),
    enabled: !!projectId,
  });

  const closeMutation = useMutation({
    mutationFn: async (values: ClosureFormValues) => {
      if (!user) throw new Error("A signed-in user is required to close the project.");
      const draft: ClosureDraft = {
        projectId,
        signatureImage: values.signatureImage,
        method: values.method,
        signedBy: values.signedBy || undefined,
      };
      return createClosureRecord(draft, { id: user.id, name: user.name || user.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLOSURE.DETAIL(projectId) });
    },
  });

  const viewModel = useMemo(() => buildClosureViewModel(record, projectId, locale), [record, projectId, locale]);

  return {
    canEdit,
    isLoading,
    viewModel,
    closeProject: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    closeError: closeMutation.error as Error | null,
    t,
  };
}
