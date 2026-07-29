/**
 * Single source of truth for the FR-RU area/hazard classification rule engine
 * (SRS §4.3 FR-RUL-01..06 / UC-01; Arabic SRS §3.2.1, §3.3.2).
 *
 * These values are data only. The one function allowed to interpret them is
 * `domains/requests/workflow.ts#classifyRequest` (ADR-003 — all workflow
 * decisions live in the domain layer). No page, feature, hook, or component
 * may re-derive an area band or a hazard match from these constants directly.
 */

/**
 * FR-RUL-01/02/03 area bands, in m². Boundary inclusivity is verbatim from the
 * SRS (§4.3 lines: "area < 150", "area is >=150 and <=1000", "area > 1000"):
 * 150 itself is MAINTENANCE (not fast-track), and 1000 itself is MAINTENANCE
 * (not engineering).
 */
export const AREA_THRESHOLDS = {
  /** FR-RUL-01: area strictly below this is Fast-Track. */
  FAST_TRACK_BELOW: 150,
  /** FR-RUL-02: area up to and including this is mandatory-maintenance. */
  MAINTENANCE_MAX_INCLUSIVE: 1000,
} as const;

/** The area-driven band, before the FR-RUL-05 high-hazard override is applied. */
export type AreaBand = "FAST_TRACK" | "MAINTENANCE" | "ENGINEERING";

/** The four hazard categories seeded by FR-RUL-04. */
export type HighHazardCategoryId =
  | "commercial_kitchen"
  | "chemical_storage"
  | "compressed_gas"
  | "heavy_workshop";

export interface HighHazardCategory {
  readonly id: HighHazardCategoryId;
  /** ISIC activity codes, matched exactly against the request's `isicCode`. */
  readonly isicCodes: readonly string[];
  /**
   * Activity-name fragments, matched as case-insensitive substrings. Arabic
   * entries are listed alongside the English ones because Arabic is the
   * product's default language and `toLowerCase()` is a no-op for it, so an
   * English-only list silently mis-routes Arabic input to Fast-Track.
   */
  readonly keywords: readonly string[];
}

/**
 * FR-RUL-04 hazard matrix. Grouped into the SRS's four named categories
 * (commercial kitchens/buffet, chemical warehousing, compressed gas outlets/gas
 * extensions, heavy workshops with flammable oils/materials).
 *
 * Every English keyword and ISIC code that the pre-consolidation engine matched
 * is preserved here verbatim, so matching is a strict superset of the previous
 * behaviour: identical for English input, newly correct for Arabic input.
 *
 * Known limitation, deliberately left as-is (backlog): substring matching is
 * broad — English "gas" also matches "gasket", and Arabic alef/ya spelling
 * variants (أ/ا، ي/ى) are not normalised before comparison.
 */
export const HIGH_HAZARD_CATEGORIES: readonly HighHazardCategory[] = [
  {
    id: "commercial_kitchen",
    isicCodes: ["5610"],
    keywords: [
      "kitchen",
      "buffet",
      "مطبخ",
      "مطابخ",
      "بوفيه",
      // "مطعم"/"مطاعم" have no English counterpart in the pre-consolidation list,
      // but restaurants are already inside this seeded FR-RUL-04 category via ISIC
      // 5610 above. They are kept so a restaurant is still caught when the client
      // omits or mistypes the ISIC code.
      "مطعم",
      "مطاعم",
    ],
  },
  {
    id: "chemical_storage",
    isicCodes: ["2011"],
    keywords: [
      "chemical",
      "storage",
      "كيميائ",
      "كيماوي",
      "مستودع",
      "مخزن",
      "مخازن",
    ],
  },
  {
    id: "compressed_gas",
    isicCodes: ["4730"],
    keywords: [
      "gas",
      "compressed",
      "غاز",
      "مضغوط",
      // FR-RUL-04 names compressed-gas outlets / gas extensions explicitly, and
      // "أسطوانات الغاز" is the ordinary Arabic term for them. Both hamza
      // spellings are listed because the matcher does no alef normalisation.
      "اسطوانة",
      "أسطوانة",
    ],
  },
  {
    id: "heavy_workshop",
    isicCodes: ["4520"],
    keywords: [
      "workshop",
      "oil",
      "heavy",
      "welding",
      "factory",
      "manufacturing",
      "ورش",
      "لحام",
      "زيت",
      "زيوت",
      "مصنع",
      "مصانع",
      "تصنيع",
      "ثقيل",
    ],
  },
] as const;
