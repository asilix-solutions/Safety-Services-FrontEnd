export type EmployeeDepartment = "Engineering" | "Operations" | "Sales" | "Administration";
export type EmployeeStatus = "Active" | "Inactive";
export type EmployeeAvailability = "Available" | "Busy" | "Unavailable";

export interface Employee {
  id: string;
  tenantId: string;
  userId?: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Company Admin" | "Consulting Engineer" | "Operations Officer" | "Sales Agent";
  department: EmployeeDepartment;
  status: EmployeeStatus;
  availabilityStatus: EmployeeAvailability;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
