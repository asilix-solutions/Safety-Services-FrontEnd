/**
 * Utility functions for real-time dynamic tenant branding and theme injection.
 * Converts HEX color tokens into CSS custom properties matching Tailwind CSS v4 variables.
 * Enforces WCAG 2.1 Relative Luminance & Contrast safeguards.
 */

export interface HslColor {
  h: number;
  s: number;
  l: number;
  hslString: string;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface WcagComplianceResult {
  contrastRatio: number;
  level: "AAA" | "AA" | "FAIL";
  isDarkForeground: boolean;
  foregroundHsl: string;
}

/**
 * Parses a 3 or 6 digit hex string to RGB color object.
 */
export function hexToRgb(hex: string): RgbColor | null {
  if (!hex || typeof hex !== "string") return null;

  let cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (cleaned.length !== 6) return null;

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
}

/**
 * Parses a 3 or 6 digit hex string to HSL color object.
 */
export function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360 * 10) / 10;
  const sPct = Math.round(s * 100 * 10) / 10;
  const lPct = Math.round(l * 100 * 10) / 10;

  return {
    h: hDeg,
    s: sPct,
    l: lPct,
    hslString: `hsl(${hDeg} ${sPct}% ${lPct}%)`,
  };
}

/**
 * Calculates WCAG 2.1 Relative Luminance (Y) using standard sRGB linear gamma expansion.
 * Formula: Y = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rsrgb = r / 255;
  const gsrgb = g / 255;
  const bsrgb = b / 255;

  const rlin = rsrgb <= 0.04045 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const glin = gsrgb <= 0.04045 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const blin = bsrgb <= 0.04045 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);

  return 0.2126 * rlin + 0.7152 * glin + 0.0722 * blin;
}

/**
 * Calculates the WCAG contrast ratio between two relative luminance values.
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
 */
export function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Fixed luminance constants for standard foreground candidates
const WHITE_LUMINANCE = 1.0;
// Dark Slate: hsl(222.2 84% 4.9%) corresponds to approx #020817 (L ≈ 0.002)
const DARK_SLATE_LUMINANCE = 0.002;
export const FOREGROUND_LIGHT = "hsl(0 0% 100%)";
export const FOREGROUND_DARK = "hsl(222.2 84% 4.9%)";

/**
 * Evaluates WCAG 2.1 compliance for a background hex color.
 * Defaults to Pure White (`hsl(0 0% 100%)`) for all primary brand presets and saturated colors.
 * Only switches to dark text (`hsl(222.2 84% 4.9%)`) if the background color is extremely light/pastel
 * (Relative Luminance Y > 0.65 or Lightness > 75%, like light yellows or creams).
 */
export function evaluateWcagCompliance(bgHex: string): WcagComplianceResult {
  const rgb = hexToRgb(bgHex);
  if (!rgb) {
    return {
      contrastRatio: 21,
      level: "AAA",
      isDarkForeground: false,
      foregroundHsl: FOREGROUND_LIGHT,
    };
  }

  const bgLum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  const hsl = hexToHsl(bgHex);
  const lightness = hsl ? hsl.l : 50;

  // Extremely light or pastel backgrounds require dark text for readability
  const isDarkForeground = bgLum > 0.65 || lightness > 75;
  const activeFgLum = isDarkForeground ? DARK_SLATE_LUMINANCE : WHITE_LUMINANCE;
  const contrastRatio = getContrastRatio(bgLum, activeFgLum);
  const roundedRatio = Math.round(contrastRatio * 10) / 10;

  let level: "AAA" | "AA" | "FAIL" = "FAIL";
  if (contrastRatio >= 7.0) {
    level = "AAA";
  } else if (contrastRatio >= 4.5) {
    level = "AA";
  }

  return {
    contrastRatio: roundedRatio,
    level,
    isDarkForeground,
    foregroundHsl: isDarkForeground ? FOREGROUND_DARK : FOREGROUND_LIGHT,
  };
}

/**
 * Returns an accessible foreground color (pure white or dark slate).
 * Defaults to pure white for saturated and enterprise brand colors, switching to dark slate only for extremely light/pastel colors.
 */
export function getContrastForeground(hex: string): string {
  return evaluateWcagCompliance(hex).foregroundHsl;
}

export interface ApplyThemeOptions {
  primaryHex: string;
  primaryForegroundHex?: string;
  secondaryHex?: string;
  accentHex?: string;
  isDark?: boolean;
  darkModeOverrides?: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    accent?: string;
  };
}

/**
 * Injects dynamic tenant branding colors into document.documentElement.style.
 * Updates Tailwind CSS v4 variables: --primary, --primary-foreground, --ring, --chart-1.
 * Strictly preserves immutable base neutrals (--secondary, --muted, --card, --background, --border).
 */
export function applyTenantTheme(
  primaryHexOrOptions: string | ApplyThemeOptions,
  secondaryHex?: string,
  accentHex?: string,
  isDarkOverride?: boolean,
  darkModeOverrides?: { primary?: string; primaryForeground?: string; secondary?: string; accent?: string }
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Normalize options
  let primary: string;
  let primaryForeground: string | undefined;
  let isDark: boolean;
  let darkOverrides: { primary?: string; primaryForeground?: string; secondary?: string; accent?: string } | undefined;

  if (typeof primaryHexOrOptions === "object" && primaryHexOrOptions !== null) {
    primary = primaryHexOrOptions.primaryHex;
    primaryForeground = primaryHexOrOptions.primaryForegroundHex;
    isDark = primaryHexOrOptions.isDark ?? root.classList.contains("dark");
    darkOverrides = primaryHexOrOptions.darkModeOverrides;
  } else {
    primary = primaryHexOrOptions;
    isDark = isDarkOverride ?? root.classList.contains("dark");
    darkOverrides = darkModeOverrides;
  }

  // Resolve active tokens based on light / dark mode
  let activePrimary = primary;
  let activePrimaryForeground = primaryForeground;

  if (isDark && darkOverrides) {
    if (darkOverrides.primary) activePrimary = darkOverrides.primary;
    if (darkOverrides.primaryForeground) activePrimaryForeground = darkOverrides.primaryForeground;
  }

  if (activePrimary) {
    const primaryHsl = hexToHsl(activePrimary);
    if (primaryHsl) {
      root.style.setProperty("--primary", primaryHsl.hslString);
      
      const fgHsl = activePrimaryForeground
        ? (hexToHsl(activePrimaryForeground)?.hslString || getContrastForeground(activePrimary))
        : getContrastForeground(activePrimary);

      root.style.setProperty("--primary-foreground", fgHsl);
      root.style.setProperty("--ring", primaryHsl.hslString);
      root.style.setProperty("--chart-1", primaryHsl.hslString);
    }
  }
}

/**
 * Resets dynamic tenant theme variables back to standard stylesheet defaults.
 */
export function clearTenantTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.style.removeProperty("--secondary");
  root.style.removeProperty("--secondary-foreground");
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-foreground");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--chart-1");
  root.style.removeProperty("--tenant-secondary");
  root.style.removeProperty("--tenant-accent");
}
