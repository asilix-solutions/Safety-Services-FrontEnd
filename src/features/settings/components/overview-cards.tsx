import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Building, SunMoon, Languages, Hourglass } from "lucide-react";

interface OverviewCardsProps {
  companyName: string;
  theme: string;
  language: string;
  timeout: number;
  t: (key: string) => string;
}

export function OverviewCards({ companyName, theme, language, timeout, t }: OverviewCardsProps) {
  const getThemeLabel = (val: string) => {
    switch (val) {
      case "light":
        return t("settings:theme_light") || "Light";
      case "dark":
        return t("settings:theme_dark") || "Dark";
      default:
        return t("settings:theme_system") || "System";
    }
  };

  const getLangLabel = (val: string) => {
    return val === "ar" ? "العربية" : "English";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Building className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("settings:lbl_companyName")}</span>
            <span className="text-xs font-semibold text-foreground block truncate mt-0.5">{companyName}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center">
            <SunMoon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("settings:lbl_theme")}</span>
            <span className="text-xs font-semibold text-foreground block mt-0.5">{getThemeLabel(theme)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("settings:lbl_language")}</span>
            <span className="text-xs font-semibold text-foreground block mt-0.5">{getLangLabel(language)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Hourglass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("settings:lbl_sessionTimeout")}</span>
            <span className="text-xs font-semibold text-foreground block mt-0.5">
              {timeout} {t("settings:minutes") || "Minutes"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default OverviewCards;
