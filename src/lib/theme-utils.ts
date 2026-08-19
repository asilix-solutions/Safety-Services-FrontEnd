/**
 * Utility functions for real-time dynamic tenant branding and theme injection.
 * Converts HEX color tokens into CSS custom properties matching Tailwind CSS v4 variables.
 */

export interface HslColor {
  h: number;
  s: number;
  l: number;
  hslString: string;
}

/**
 * Parses a 3 or 6 digit hex string to HSL color object.
 */
export function hexToHsl(hex: string): HslColor | null {
  if (!hex || typeof hex !== "string") return null;

  let cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (cleaned.length !== 6) return null;

  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

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
 * Calculates relative luminance to return an accessible foreground color (white or dark slate).
 */
export function getContrastForeground(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return "hsl(0 0% 100%)";

  // Perceived lightness check
  if (hsl.l > 60) {
    return "hsl(222.2 84% 4.9%)";
  }
  return "hsl(0 0% 100%)";
}

/**
 * Injects dynamic tenant branding colors into document.documentElement.style.
 * Updates Tailwind CSS v4 variables: --primary, --primary-foreground, --ring, --chart-1.
 */
export function applyTenantTheme(
  primaryHex: string,
  secondaryHex?: string,
  accentHex?: string
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (primaryHex) {
    const primaryHsl = hexToHsl(primaryHex);
    if (primaryHsl) {
      root.style.setProperty("--primary", primaryHsl.hslString);
      root.style.setProperty("--primary-foreground", getContrastForeground(primaryHex));
      root.style.setProperty("--ring", primaryHsl.hslString);
      root.style.setProperty("--chart-1", primaryHsl.hslString);
    }
  }

  if (secondaryHex) {
    const secondaryHsl = hexToHsl(secondaryHex);
    if (secondaryHsl) {
      root.style.setProperty("--tenant-secondary", secondaryHsl.hslString);
    }
  }

  if (accentHex) {
    const accentHsl = hexToHsl(accentHex);
    if (accentHsl) {
      root.style.setProperty("--tenant-accent", accentHsl.hslString);
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
  root.style.removeProperty("--ring");
  root.style.removeProperty("--chart-1");
  root.style.removeProperty("--tenant-secondary");
  root.style.removeProperty("--tenant-accent");
}
