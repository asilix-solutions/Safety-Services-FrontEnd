import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Employee, EmployeeDepartment, EmployeeStatus, EmployeeAvailability } from "@/domains/employees/types";
import { getEmployees, createOrUpdateEmployee } from "@/domains/employees/storage";
import { validateEmployee } from "@/domains/employees/validation";
import { canViewEmployees, canManageEmployees, isRole } from "@/constants/permissions";
import { USER_ROLES } from "@/constants/roles";
import { EmployeeFilters } from "../types";

export function useEmployeeList() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Active state filters
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    department: "All",
    role: "All",
    status: "All",
    availabilityStatus: "All",
  });

  // Load employees under current user tenant
  const loadEmployees = () => {
    if (!user) return;
    // Super Admin sees everything; Company Admin and others see only their company's employees
    const tenantId = isRole(user.role, [USER_ROLES.SUPER_ADMIN]) ? undefined : user.companyId;
    const list = getEmployees(tenantId);
    setEmployees(list);
  };

  useEffect(() => {
    loadEmployees();
  }, [user]);

  // Permission Checks (Centralized)
  const permissions = useMemo(() => {
    if (!user) return { canManage: false, canView: false };

    return {
      canManage: canManageEmployees(user.role),
      canView: canViewEmployees(user.role),
    };
  }, [user]);

  // Compute KPI cards
  const kpis = useMemo(() => {
    const activeList = employees.filter((e) => e.status === "Active");
    return {
      total: employees.length,
      engineers: employees.filter((e) => e.department === "Engineering").length,
      operations: employees.filter((e) => e.department === "Operations").length,
      available: employees.filter((e) => e.availabilityStatus === "Available" && e.status === "Active").length,
    };
  }, [employees]);

  // Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          emp.fullName.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.phone.toLowerCase().includes(query) ||
          emp.employeeNumber.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Department filter
      if (filters.department !== "All" && emp.department !== filters.department) {
        return false;
      }

      // Role filter — filters the employee roster by the employee's own job role field
      // (a UI list filter), not a permission check on the acting user.
      if (filters.role !== "All" && emp.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status !== "All" && emp.status !== filters.status) {
        return false;
      }

      // Availability filter
      if (filters.availabilityStatus !== "All" && emp.availabilityStatus !== filters.availabilityStatus) {
        return false;
      }

      return true;
    });
  }, [employees, filters]);

  // Actions
  const handleInviteEmployee = (data: Omit<Employee, "id" | "tenantId" | "employeeNumber" | "createdAt" | "updatedAt">): { success: boolean; errors?: any } => {
    if (!permissions.canManage || !user) {
      return { success: false, errors: { global: "unauthorized" } };
    }

    const { valid, errors } = validateEmployee(data);
    if (!valid) {
      return { success: false, errors };
    }

    const newId = `EMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const employeeNumber = `EMP-${String(employees.length + 1).padStart(4, "0")}`;
    const tenantId = user.companyId || "c-default";
    const nowStr = new Date().toISOString();

    const newEmp: Employee = {
      ...data,
      id: newId,
      tenantId,
      employeeNumber,
      createdAt: nowStr,
      updatedAt: nowStr,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.fullName)}`,
    };

    createOrUpdateEmployee(newEmp);
    loadEmployees();
    return { success: true };
  };

  const handleUpdateEmployee = (employee: Employee): { success: boolean; errors?: any } => {
    if (!permissions.canManage) {
      return { success: false, errors: { global: "unauthorized" } };
    }

    const { valid, errors } = validateEmployee(employee);
    if (!valid) {
      return { success: false, errors };
    }

    const updated: Employee = {
      ...employee,
      updatedAt: new Date().toISOString(),
    };

    createOrUpdateEmployee(updated);
    loadEmployees();
    return { success: true };
  };

  const handleToggleStatus = (employeeId: string) => {
    if (!permissions.canManage) return;
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const updated: Employee = {
      ...emp,
      status: emp.status === "Active" ? "Inactive" : "Active",
      updatedAt: new Date().toISOString(),
    };

    createOrUpdateEmployee(updated);
    loadEmployees();
  };

  return {
    employees: filteredEmployees,
    filters,
    setFilters,
    kpis,
    permissions,
    handleInviteEmployee,
    handleUpdateEmployee,
    handleToggleStatus,
  };
}
