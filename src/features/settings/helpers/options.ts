export interface SelectOption {
  value: string;
  label: string;
}

export function getLanguageOptions(t: (key: string) => string): SelectOption[] {
  return [
    { value: "ar", label: t("settings:lang_ar") || "العربية (Default)" },
    { value: "en", label: t("settings:lang_en") || "English" }
  ];
}

export function getThemeOptions(t: (key: string) => string): SelectOption[] {
  return [
    { value: "light", label: t("settings:theme_light") || "Light" },
    { value: "dark", label: t("settings:theme_dark") || "Dark" },
    { value: "system", label: t("settings:theme_system") || "System" }
  ];
}

export function getTimezoneOptions(): SelectOption[] {
  return [
    { value: "Asia/Riyadh", label: "GMT+3 (Asia/Riyadh)" },
    { value: "Asia/Dubai", label: "GMT+4 (Asia/Dubai)" },
    { value: "Europe/London", label: "GMT+0 (Europe/London)" },
    { value: "UTC", label: "UTC" }
  ];
}

export function getDateFormats(): SelectOption[] {
  return [
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" }
  ];
}

export function getTimeFormats(t: (key: string) => string): SelectOption[] {
  return [
    { value: "12h", label: t("settings:timeFormat_12h") || "12 Hour (AM/PM)" },
    { value: "24h", label: t("settings:timeFormat_24h") || "24 Hour" }
  ];
}

export function getPageSizeOptions(): SelectOption[] {
  return [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" }
  ];
}

export function getSessionTimeoutOptions(t: (key: string) => string): SelectOption[] {
  return [
    { value: "15", label: `15 ${t("settings:minutes") || "Minutes"}` },
    { value: "30", label: `30 ${t("settings:minutes") || "Minutes"}` },
    { value: "60", label: `60 ${t("settings:minutes") || "Minutes"}` },
    { value: "120", label: `120 ${t("settings:minutes") || "Minutes"}` }
  ];
}

export function getCountryOptions(t: (key: string) => string): SelectOption[] {
  return [
    { value: "SA", label: t("settings:country_sa") || "Saudi Arabia" },
    { value: "AE", label: t("settings:country_ae") || "United Arab Emirates" },
    { value: "BH", label: t("settings:country_bh") || "Bahrain" },
    { value: "KW", label: t("settings:country_kw") || "Kuwait" },
    { value: "OM", label: t("settings:country_om") || "Oman" }
  ];
}
