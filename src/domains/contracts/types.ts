export interface ClientContract {
  id: string;
  tenantId: string;
  clientId: string;
  title: string;
  value: number;
  status: "draft" | "sent" | "signed" | "terminated";
  createdAt: string;
}
