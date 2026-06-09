import { Locale } from "@/types/i18n";

/**
 * Formats a date string, number, or object according to the active locale.
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  
  // Use 'ar-SA' for Arabic and 'en-US' for English
  const bcp47 = locale === "ar" ? "ar-SA" : "en-US";
  return new Intl.DateTimeFormat(bcp47, options).format(d);
}

/**
 * Formats a number as a currency value.
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currencyCode?: string
): string {
  const bcp47 = locale === "ar" ? "ar-SA" : "en-US";
  const defaultCurrency = locale === "ar" ? "SAR" : "USD";
  
  return new Intl.NumberFormat(bcp47, {
    style: "currency",
    currency: currencyCode || defaultCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a decimal number as a percentage (e.g. 0.85 -> 85%).
 */
export function formatPercent(value: number, locale: Locale): string {
  const bcp47 = locale === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(bcp47, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a regular number with thousands separators and decimals.
 */
export function formatNumber(value: number, locale: Locale, decimals = 0): string {
  const bcp47 = locale === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(bcp47, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
