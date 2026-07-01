import { ClientContract } from "@/domains/contracts/types";

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

export function getContractStatusBadgeVariant(status: string): "success" | "secondary" | "warning" | "default" | "destructive" | "outline" {
  switch (status) {
    case "signed":
      return "success";
    case "archived":
      return "secondary";
    case "generated":
      return "warning";
    default:
      return "default";
  }
}

export function canSignContract(contract: ClientContract, userRole: string): boolean {
  return contract.status === "generated" && userRole === "Client";
}

export function canArchiveContract(contract: ClientContract, userRole: string): boolean {
  return contract.status === "signed" && ["Company Admin", "Super Admin"].includes(userRole);
}
