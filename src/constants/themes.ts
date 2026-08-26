import themesData from "./themes.json";

export type PresetThemeId =
  | "royal-indigo"
  | "safety-amber"
  | "corporate-navy"
  | "emerald-compliance"
  | "slate-steel";

export interface ThemePreset {
  id: PresetThemeId;
  name: string;
  description: string;
  industry: string;
  colors: {
    primary: string;
    primaryForeground?: string;
    secondary: string;
    accent: string;
  };
  darkModeOverrides: {
    primary: string;
    primaryForeground?: string;
    secondary: string;
    accent: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = themesData as ThemePreset[];

export const DEFAULT_THEME_PRESET_ID: PresetThemeId = "royal-indigo";

/**
 * Mapping of tenant IDs to their initial default branding presets.
 */
export const TENANT_DEFAULT_PRESETS: Record<string, PresetThemeId> = {
  "COMP-001": "royal-indigo",     // Apex Safety
  "COMP-002": "safety-amber",      // Safety Shield Co.
  "COMP-003": "emerald-compliance", // Gulf Fire Engineering
  "COMP-004": "corporate-navy",    // Red Sea Compliance
};

export function getThemePresetById(id?: string): ThemePreset {
  const found = THEME_PRESETS.find((p) => p.id === id);
  return found || THEME_PRESETS[0];
}

export function getDefaultPresetForTenant(tenantId?: string): ThemePreset {
  if (!tenantId) return getThemePresetById(DEFAULT_THEME_PRESET_ID);
  const presetId = TENANT_DEFAULT_PRESETS[tenantId] || DEFAULT_THEME_PRESET_ID;
  return getThemePresetById(presetId);
}
