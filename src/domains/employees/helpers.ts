import { EmployeeRole, EmployeeDepartment } from "./types";

/**
 * Format a Saudi mobile/phone number to clean international display format:
 * e.g. +966 50 123 4561
 */
export function formatSaudiPhone(phone: string | undefined | null): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  
  // Extract all digits and optional leading plus
  const digitsOnly = cleaned.replace(/[^\d]/g, "");
  
  let coreDigits = digitsOnly;
  if (coreDigits.startsWith("00966")) {
    coreDigits = coreDigits.slice(5);
  } else if (coreDigits.startsWith("966")) {
    coreDigits = coreDigits.slice(3);
  } else if (coreDigits.startsWith("0")) {
    coreDigits = coreDigits.slice(1);
  }

  // Expect 9 digits for Saudi mobiles (e.g. 5XXXXXXXX)
  if (coreDigits.length === 9) {
    const p1 = coreDigits.slice(0, 2); // 50
    const p2 = coreDigits.slice(2, 5); // 123
    const p3 = coreDigits.slice(5);    // 4561
    return `+966 ${p1} ${p2} ${p3}`;
  }

  // If already formatted with spaces or dashes, return normalized
  if (cleaned.startsWith("+966")) {
    return cleaned;
  }

  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export const SAUDI_ROLES: { value: string; labelAr: string; labelEn: string }[] = [
  { value: "Company Admin", labelAr: "مدير الشركة", labelEn: "Company Admin" },
  { value: "Consulting Engineer", labelAr: "مهندس فاحص / استشاري", labelEn: "Consulting Engineer" },
  { value: "Operations Officer", labelAr: "مسؤول العمليات", labelEn: "Operations Officer" },
  { value: "Sales Agent", labelAr: "مسؤول مبيعات", labelEn: "Sales Agent" },
];

export const SAUDI_DEPARTMENTS: { value: EmployeeDepartment; labelAr: string; labelEn: string }[] = [
  { value: "Engineering", labelAr: "الهندسة", labelEn: "Engineering" },
  { value: "Operations", labelAr: "العمليات", labelEn: "Operations" },
  { value: "Sales", labelAr: "المبيعات", labelEn: "Sales" },
  { value: "Administration", labelAr: "الإدارة", labelEn: "Administration" },
];

export function formatEmployeeRole(role: string): string {
  const match = SAUDI_ROLES.find((r) => r.value === role);
  return match ? match.labelAr : role;
}

export function formatEmployeeDepartment(dept: string): string {
  const match = SAUDI_DEPARTMENTS.find((d) => d.value === dept);
  return match ? match.labelAr : dept;
}
