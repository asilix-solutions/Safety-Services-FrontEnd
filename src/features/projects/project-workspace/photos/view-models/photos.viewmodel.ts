import { InstallationPhoto, SiloTag } from "@/domains/photos/types";
import { getScopedPhotoSummary } from "@/domains/photos/workflow";
import { TenantContext } from "@/domains/tenancy/types";
import { formatDate } from "@/lib/formatters";
import { Locale } from "@/types/i18n";
import { siloLabelKey } from "../helpers/helpers";

export interface PhotoRowViewModel {
  id: string;
  siloTag: SiloTag;
  siloLabelKey: string;
  caption?: string;
  image: string;
  createdAtLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  captureTimestampUtc?: string | null;
  deviceModel?: string | null;
  outcome?: 1 | 2 | 3;
  distanceMeters?: number | null;
  isJustified?: boolean;
  justificationReason?: string | null;
}

export interface PhotoSummaryViewModel {
  total: number;
  bySilo: Record<SiloTag, number>;
}

export interface PhotosViewModel {
  rows: PhotoRowViewModel[];
  summary: PhotoSummaryViewModel;
}

/**
 * Shapes installation photo records + the ADR-005 domain KPI selector into display-ready values.
 * The summary numbers always come from `getScopedPhotoSummary` — never summed here,
 * and scoped so the count matches the rows the caller can actually see.
 */
export function buildPhotosViewModel(
  records: InstallationPhoto[],
  projectId: string,
  locale: Locale,
  ctx: TenantContext
): PhotosViewModel {
  const summary = getScopedPhotoSummary(projectId, ctx);

  const rows: PhotoRowViewModel[] = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((record) => ({
      id: record.id,
      siloTag: record.siloTag,
      siloLabelKey: siloLabelKey(record.siloTag),
      caption: record.caption,
      image: record.image,
      createdAtLabel: formatDate(record.createdAt, locale, { dateStyle: "medium" }),
      latitude: record.latitude,
      longitude: record.longitude,
      captureTimestampUtc: record.captureTimestampUtc,
      deviceModel: record.deviceModel,
      outcome: record.outcome ?? 1,
      distanceMeters: record.distanceMeters ?? 45,
      isJustified: record.isJustified,
      justificationReason: record.justificationReason,
    }));

  return {
    rows,
    summary: {
      total: summary.total,
      bySilo: summary.bySilo,
    },
  };
}
