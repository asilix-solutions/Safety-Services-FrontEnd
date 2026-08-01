"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getScopedClosureByProject, createClosureRecord } from "@/domains/closure";
import { ClosureDraft } from "@/domains/closure/types";
import { toTenantContext } from "@/domains/tenancy";
import { getScopedPhotoSummary } from "@/domains/photos";
import { canEditProjectWorkspace } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ClosureFormValues } from "@/schemas/closure.schema";
import { buildClosureViewModel } from "../view-models/closure.viewmodel";

/**
 * @param onClosed Reloads the workspace after a close. Closing advances the project's
 * execution phase, and the surrounding tabs hold that project in their own state — without
 * this the record would show as closed while the rest of the page still showed the old phase.
 */
export function useClosure(projectId: string, onClosed?: () => void) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["closure", "validation", "common"]);
  const queryClient = useQueryClient();

  const canEdit = canEditProjectWorkspace(user?.role);
  const tenantCtx = useMemo(() => toTenantContext(user), [user]);

  const { data: record = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CLOSURE.DETAIL(projectId, user?.tenantId),
    queryFn: () => getScopedClosureByProject(projectId, tenantCtx),
    enabled: !!projectId,
  });

  // Scoped, unlike the domain gate: the button must reflect the photos this user
  // can see. Scoped ⊆ unscoped, so this only ever disables close, never enables it.
  const { data: photoSummary } = useQuery({
    queryKey: QUERY_KEYS.PHOTOS.LIST(projectId, user?.tenantId),
    queryFn: () => getScopedPhotoSummary(projectId, tenantCtx),
    enabled: !!projectId,
  });
  const hasPhotos = (photoSummary?.total ?? 0) > 0;

  const closeMutation = useMutation({
    mutationFn: async (values: ClosureFormValues) => {
      if (!user) throw new Error("A signed-in user is required to close the project.");
      const draft: ClosureDraft = {
        projectId,
        tenantId: user.tenantId,
        signatureImage: values.signatureImage,
        method: values.method,
        signedBy: values.signedBy || undefined,
      };
      return createClosureRecord(draft, { id: user.id, name: user.name || user.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLOSURE.DETAIL(projectId, user?.tenantId) });
      toast.success(t("closure:toast.closed"));
      onClosed?.();
    },
    onError: () => {
      // The domain validates every precondition before the WORM write, so a failure
      // here means nothing was recorded and the officer can safely retry.
      toast.error(t("closure:toast.closeFailed"));
    },
  });

  const viewModel = useMemo(
    () => buildClosureViewModel(record, projectId, locale, tenantCtx),
    [record, projectId, locale, tenantCtx]
  );

  return {
    canEdit,
    isLoading,
    viewModel,
    hasPhotos,
    closeProject: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    closeError: closeMutation.error as Error | null,
    t,
  };
}
