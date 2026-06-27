export function formatSARCurrency(value: number): string {
  return `${value.toLocaleString()} SAR`;
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch (e) {
    return dateStr;
  }
}

export function getContractStatusBadgeClass(status: string): string {
  switch (status) {
    case "signed":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "archived":
      return "bg-muted text-muted-foreground";
    case "generated":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}
