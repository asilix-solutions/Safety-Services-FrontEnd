export interface ClientContract {
  id: string;
  tenantId: string;
  clientId: string;
  projectId: string;          // Link to completed project
  jobNumber: string;          // Link to originating request
  title: string;              // Auto-populated from project name/request details
  value: number;              // Auto-populated from project or request details
  status: "draft" | "generated" | "signed" | "archived" | "terminated";
  createdAt: string;
  signedAt?: string;          // Populated when the client signs the contract
  signedBy?: string;          // Username of client who signed
  documentUrl?: string;       // Simulated file download link
  archivedAt?: string;        // Populated when archived
  archivedBy?: string;        // User who archived the contract
}
