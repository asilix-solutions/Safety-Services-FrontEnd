import { hexToHsl, getContrastForeground } from "@/lib/theme-utils";
import { TenantBrandingDTO } from "@/types/tenant";
import { getServerTenantBranding } from "@/lib/server-tenant";

interface TenantThemeInjectorProps {
  branding?: TenantBrandingDTO | null;
}

export async function TenantThemeInjector({ branding: explicitBranding }: TenantThemeInjectorProps) {
  const branding = explicitBranding || (await getServerTenantBranding());

  if (!branding?.primaryColor) {
    return null;
  }

  const primaryHsl = hexToHsl(branding.primaryColor);
  if (!primaryHsl) {
    return null;
  }

  const primaryFg = branding.primaryForeground
    ? hexToHsl(branding.primaryForeground)?.hslString || getContrastForeground(branding.primaryColor)
    : getContrastForeground(branding.primaryColor);

  const darkPrimaryHex = branding.darkModeOverrides?.primary || branding.primaryColor;
  const darkPrimaryHsl = hexToHsl(darkPrimaryHex)?.hslString || primaryHsl.hslString;
  const darkPrimaryFg = branding.darkModeOverrides?.primaryForeground
    ? hexToHsl(branding.darkModeOverrides.primaryForeground)?.hslString || getContrastForeground(darkPrimaryHex)
    : getContrastForeground(darkPrimaryHex);

  const secondaryHsl = branding.secondaryColor ? hexToHsl(branding.secondaryColor) : null;
  const accentHsl = branding.accentColor ? hexToHsl(branding.accentColor) : null;

  const cssString = `
    :root {
      --primary: ${primaryHsl.hslString};
      --primary-foreground: ${primaryFg};
      --ring: ${primaryHsl.hslString};
      --chart-1: ${primaryHsl.hslString};
      ${secondaryHsl ? `--secondary: ${secondaryHsl.hslString};` : ""}
      ${accentHsl ? `--accent: ${accentHsl.hslString};` : ""}
    }
    .dark {
      --primary: ${darkPrimaryHsl};
      --primary-foreground: ${darkPrimaryFg};
      --ring: ${darkPrimaryHsl};
      --chart-1: ${darkPrimaryHsl};
      ${secondaryHsl ? `--secondary: ${secondaryHsl.hslString};` : ""}
      ${accentHsl ? `--accent: ${accentHsl.hslString};` : ""}
    }
  `;

  return (
    <style
      id="tenant-theme-prehydrate"
      dangerouslySetInnerHTML={{ __html: cssString }}
    />
  );
}
