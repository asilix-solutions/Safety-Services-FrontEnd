"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations, useTranslation } from "@/providers/i18n-provider";
import { getPhotosByProject, createPhotoRecord } from "@/domains/photos";
import { PhotoDraft } from "@/domains/photos/types";
import { canEditProjectWorkspace } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { PhotoFormValues } from "@/schemas/photo.schema";
import { buildPhotosViewModel } from "../view-models/photos.viewmodel";

export function usePhotos(projectId: string) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  useNamespaceTranslations(["photos", "validation", "common"]);
  const queryClient = useQueryClient();

  const canEdit = canEditProjectWorkspace(user?.role);

  const { data: records = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PHOTOS.LIST(projectId),
    queryFn: () => getPhotosByProject(projectId),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: async (values: PhotoFormValues) => {
      if (!user) throw new Error("A signed-in user is required to record an installation photo.");
      const draft: PhotoDraft = {
        projectId,
        siloTag: values.siloTag,
        caption: values.caption || undefined,
        image: values.image,
      };
      return createPhotoRecord(draft, { id: user.id, name: user.name || user.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PHOTOS.LIST(projectId) });
      toast.success(t("photos:form.saveSuccess"));
    },
  });

  const viewModel = useMemo(() => buildPhotosViewModel(records, projectId, locale), [records, projectId, locale]);

  return {
    canEdit,
    isLoading,
    viewModel,
    savePhoto: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error as Error | null,
    t,
  };
}
