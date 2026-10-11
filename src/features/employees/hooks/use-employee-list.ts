import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Employee, EmployeeDepartment, EmployeeStatus, EmployeeAvailability, EmployeeRole } from "@/domains/employees/types";
import { getEmployees, createOrUpdateEmployee } from "@/domains/employees/storage";
import { validateEmployee } from "@/domains/employees/validation";
import { canViewEmployees, canManageEmployees, isRole } from "@/constants/permissions";
import { USER_ROLES } from "@/constants/roles";
import { usersApi, BackendUserRole } from "@/domains/users/api";
import { EmployeeFilters } from "../types";

export function useEmployeeList() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);
  
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
    setEmployees(getEmployees(tenantContext));
  };

  useEffect(() => {
    loadEmployees();

    if (!user || isRole(user.role, [USER_ROLES.CLIENT])) return;

    let isCancelled = false;

    async function syncLiveStaff() {
      try {
        const res = await usersApi.getUsers({ pageSize: 50 });
        if (!isCancelled && res.isSuccess && res.data?.items) {
          const liveEmployees: Employee[] = res.data.items
            .filter((u) => u.role !== BackendUserRole.Client)
            .map((u, idx) => {
              let role: EmployeeRole = "Company Admin";
              let dept: EmployeeDepartment = "Administration";

              if (u.role === BackendUserRole.ConsultingEngineer) {
                role = "Consulting Engineer";
                dept = "Engineering";
              } else if (u.role === BackendUserRole.OperationsOfficer) {
                role = "Operations Officer";
                dept = "Operations";
              } else if (u.role === BackendUserRole.SalesRepresentative) {
                role = "Sales Agent";
                dept = "Sales";
              }

              const numericHash = u.id.replace(/\D/g, "").slice(0, 4).padEnd(4, "0");

              return {
                id: u.id,
                tenantId: tenantContext.tenantId || "COMP-001",
                userId: u.id,
                employeeNumber: `EMP-${numericHash || (idx + 1).toString().padStart(4, "0")}`,
                fullName: u.fullName,
                email: u.email,
                phone: u.phoneNumber || "+966 50 000 0000",
                role,
                department: dept,
                status: u.isActive ? ("Active" as const) : ("Inactive" as const),
                availabilityStatus: "Available" as const,
                createdAt: u.createdAt,
                updatedAt: u.createdAt,
              };
            });

          const localEmployees = getEmployees(tenantContext);
          const map = new Map<string, Employee>();
          liveEmployees.forEach((e) => map.set(e.id, e));
          localEmployees.forEach((e) => {
            if (!map.has(e.id) && !map.has(e.email)) {
              map.set(e.id, e);
            }
          });

          setEmployees(Array.from(map.values()));
          setIsLiveSynced(true);
        }
      } catch (err) {
        console.warn("Live employee directory sync failed:", err);
      }
    }

    syncLiveStaff();

    return () => {
      isCancelled = true;
    };
  }, [user, tenantContext]);

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
    isLiveSynced,
    filters,
    setFilters,
    kpis,
    permissions,
    handleInviteEmployee,
    handleUpdateEmployee,
    handleToggleStatus,
  };
}
