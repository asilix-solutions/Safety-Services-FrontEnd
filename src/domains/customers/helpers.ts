import { CustomerStatus } from "./types";

/**
 * Format status for presentation or styles
 */
export function getStatusBadgeVariant(status: CustomerStatus): "success" | "secondary" {
  return status === "Active" ? "success" : "secondary";
}

export const SAUDI_CITIES = [
  "الرياض",
  "جدة",
  "الدمام",
  "مكة المكرمة",
  "المدينة المنورة",
  "الخبر",
  "الجبيل",
  "القصيم",
  "تبوك",
  "أبها",
] as const;

export const SAUDI_SECTORS = [
  "التطوير العقاري",
  "المقاولات العامة",
  "النفط والغاز",
  "البنية التحتية",
  "التجزئة والترفيه",
  "الصناعة والتعدين",
  "الخدمات اللوجستية والنقل",
  "النقل العام",
  "الرعاية الصحية",
  "تقنية المعلومات والاتصالات",
  "الضيافة والفنادق",
] as const;

const SECTOR_TRANSLATION_MAP: Record<string, string> = {
  "Real Estate Development": "التطوير العقاري",
  "Real Estate & Infrastructure": "التطوير العقاري والبنية التحتية",
  "Oil & Gas": "النفط والغاز",
  "Retail & Leisure": "التجزئة والترفيه",
  "Public Transportation": "النقل العام",
  "Construction": "المقاولات العامة",
  "Infrastructure": "البنية التحتية",
  "Logistics": "الخدمات اللوجستية والنقل",
  "Healthcare": "الرعاية الصحية",
};

const CITY_TRANSLATION_MAP: Record<string, string> = {
  "Riyadh": "الرياض",
  "Jeddah": "جدة",
  "Dammam": "الدمام",
  "Mecca": "مكة المكرمة",
  "Medina": "المدينة المنورة",
  "Khobar": "الخبر",
  "Jubail": "الجبيل",
  "Dubai": "الرياض",
  "Abu Dhabi": "جدة",
};

export function formatSector(sector?: string): string {
  if (!sector) return "—";
  return SECTOR_TRANSLATION_MAP[sector] || sector;
}

export function formatCity(city?: string): string {
  if (!city) return "—";
  return CITY_TRANSLATION_MAP[city] || city;
}

