export type CertificateStatus = "active" | "revoked";
export type CertificateType = "safety" | "installation" | "maintenance";

export interface ClientCertificate {
  id: string;              // CERT-XXXX format
  tenantId: string;        // Relates to company tenant
  clientId: string;        // Relates to client company ID
  projectId: string;       // Link to the completed project
  contractId: string;      // Link to the archived contract
  jobNumber: string;       // Link to the originating request
  title: string;           // E.g., "Safety Compliance Certificate"
  status: CertificateStatus;
  type: CertificateType;
  facilityName: string;
  issuedAt: string;        // ISO timestamp
  issuedBy: string;        // Username/Name of the admin who issued it
  expiresAt: string;       // ISO timestamp
  documentUrl: string;     // Simulated download URL (#)
  revokedAt?: string;      // ISO timestamp if revoked
  revokedBy?: string;      // User who revoked it
  revokedReason?: string;  // Reason for revocation
  contractSnapshot?: {
    status: "archived";
    archivedAt: string;
  };
}
