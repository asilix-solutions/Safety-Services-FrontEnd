export type LicenseStatus =
  | "Applied"
  | "In Review"
  | "Approved"
  | "Active"
  | "Expired"
  | "Revoked"
  | "Action Required";

export type LicenseType =
  | "Occupancy Permit"
  | "Fire Safety License"
  | "Hazardous Materials Permit"
  | "Elevator Certification"
  | "Environmental Clearance";

export interface License {
  id: string;
  licenseNumber?: string;
  title: string;
  type: LicenseType;
  issuer: string;
  clientName: string;
  clientId: string;
  projectId: string;
  status: LicenseStatus;
  issuedDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}
