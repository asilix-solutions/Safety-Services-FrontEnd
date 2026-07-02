import { Employee } from "./types";

export interface EmployeeValidationError {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
}

export function validateEmployee(employee: Partial<Employee>): {
  valid: boolean;
  errors: EmployeeValidationError;
} {
  const errors: EmployeeValidationError = {};

  if (!employee.fullName || employee.fullName.trim().length === 0) {
    errors.fullName = "employees.validation.name_required";
  }

  if (!employee.email || employee.email.trim().length === 0) {
    errors.email = "employees.validation.email_required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.email = "employees.validation.email_invalid";
  }

  if (!employee.phone || employee.phone.trim().length === 0) {
    errors.phone = "employees.validation.phone_required";
  } else if (!/^\+?[0-9]{7,15}$/.test(employee.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "employees.validation.phone_invalid";
  }

  if (!employee.role) {
    errors.role = "employees.validation.role_required";
  }

  if (!employee.department) {
    errors.department = "employees.validation.department_required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
