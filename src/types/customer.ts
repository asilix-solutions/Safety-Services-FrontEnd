export type CustomerStatus = "Lead" | "Active" | "Inactive" | "Prospect";

export interface CustomerActivity {
  id: string;
  type: "Email" | "Call" | "Meeting" | "Site Visit" | "Document Update";
  description: string;
  agentId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: CustomerStatus;
  licenseCount: number;
  revenue: number;
  activities: CustomerActivity[];
  industry: string;
  createdAt: string;
  updatedAt: string;
}
