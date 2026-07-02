import { EmployeeDepartment, EmployeeStatus, EmployeeAvailability } from "@/domains/employees/types";

export interface EmployeeFilters {
  search: string;
  department: EmployeeDepartment | "All";
  role: string | "All";
  status: EmployeeStatus | "All";
  availabilityStatus: EmployeeAvailability | "All";
}
