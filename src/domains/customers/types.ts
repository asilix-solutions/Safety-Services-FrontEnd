export type CustomerStatus = "Active" | "Inactive";

export interface CustomerRepresentative {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Customer {
  id: string;                    // c-XXX format
  tenantId: string;
  companyName: string;
  commercialRegistration: string;
  industry: string;
  status: CustomerStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  city: string;
  address: string;
  representatives: CustomerRepresentative[];
  createdAt: string;
  updatedAt: string;
}
