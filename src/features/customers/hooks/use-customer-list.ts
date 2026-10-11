import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Customer, CustomerStatus } from "@/domains/customers/types";
import { getCustomers, createOrUpdateCustomer, updateCustomerStatus, generateCustomerId } from "@/domains/customers/storage";
import { validateCustomer } from "@/domains/customers/validation";
import { CustomerFilters } from "../types";
import { getActiveProjects } from "@/domains/projects/storage";
import { getUnpaidInvoices } from "@/domains/invoices/storage";
import { hasPermission, isRole } from "@/constants/permissions";
import { USER_ROLES } from "@/constants/roles";
import { usersApi, BackendUserRole } from "@/domains/users/api";

export function useCustomerList() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    status: "All",
    industry: "All",
    city: "All",
  });

  const loadCustomers = () => {
    setCustomers(getCustomers(tenantContext));
  };

  useEffect(() => {
    loadCustomers();

    if (!user || isRole(user.role, [USER_ROLES.CLIENT])) return;

    let isCancelled = false;

    async function syncLiveClients() {
      try {
        const res = await usersApi.getUsers({ role: BackendUserRole.Client, pageSize: 50 });
        if (!isCancelled && res.isSuccess && res.data?.items) {
          const liveClients: Customer[] = res.data.items.map((u) => {
            const numericHash = u.id.replace(/\D/g, "").slice(0, 6).padEnd(6, "0");
            return {
              id: u.id,
              tenantId: tenantContext.tenantId || "COMP-001",
              companyName:
                u.fullName.startsWith("شركة") || u.fullName.startsWith("مؤسسة")
                  ? u.fullName
                  : `مؤسسة ${u.fullName} للخدمات التجارية`,
              commercialRegistration: `1010${numericHash}`,
              industry: "التجارة والخدمات اللوجستية",
              status: u.isActive ? ("Active" as const) : ("Inactive" as const),
              primaryContactName: u.fullName,
              primaryContactEmail: u.email,
              primaryContactPhone: u.phoneNumber || "+966 50 000 0000",
              city: "الرياض",
              address: "طريق الملك فهد، الرياض، المملكة العربية السعودية",
              representatives: [
                {
                  id: `rep-${u.id}`,
                  name: u.fullName,
                  email: u.email,
                  phone: u.phoneNumber || "+966 50 000 0000",
                  role: "الممثل النظامي للمنشأة",
                },
              ],
              createdAt: u.createdAt,
              updatedAt: u.createdAt,
            };
          });

          const localCustomers = getCustomers(tenantContext);
          const map = new Map<string, Customer>();
          liveClients.forEach((c) => map.set(c.id, c));
          localCustomers.forEach((c) => {
            if (!map.has(c.id) && !map.has(c.primaryContactEmail)) {
              map.set(c.id, c);
            }
          });

          setCustomers(Array.from(map.values()));
          setIsLiveSynced(true);
        }
      } catch (err) {
        console.warn("Live customer directory sync failed:", err);
      }
    }

    syncLiveClients();

    return () => {
      isCancelled = true;
    };
  }, [tenantContext, user]);

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canManageCustomerProfile: false,
        canToggleCustomerStatus: false,
        canMutateLinkedRecords: false,
        canView: false,
        role: ""
      };
    }
    const role = user.role;
    return {
      canManageCustomerProfile: hasPermission(role, "customers.manage"),
      canToggleCustomerStatus: isRole(role, [USER_ROLES.COMPANY_ADMIN]),
      canMutateLinkedRecords: false,
      canView: !isRole(role, [USER_ROLES.CLIENT]),
      role
    };
  }, [user]);

  // KPIs
  const kpis = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.status === "Active");
    
    // Aggregate Active Projects and Unpaid Invoices across all customer profiles
    const totalActiveProjects = activeCustomers.reduce((acc, c) => acc + getActiveProjects(tenantContext, undefined, c.id).length, 0);
    const totalUnpaidInvoices = activeCustomers.reduce((acc, c) => acc + getUnpaidInvoices(tenantContext, undefined, c.id).length, 0);

    return {
      total: customers.length,
      active: activeCustomers.length,
      activeProjects: totalActiveProjects,
      unpaidInvoices: totalUnpaidInvoices,
    };
  }, [customers]);

  // Unique filters data helper
  const filterOptions = useMemo(() => {
    const industries = Array.from(new Set(customers.map((c) => c.industry))).filter(Boolean);
    const cities = Array.from(new Set(customers.map((c) => c.city))).filter(Boolean);
    return {
      industries,
      cities,
    };
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filters.status !== "All" && c.status !== filters.status) {
        return false;
      }
      if (filters.industry !== "All" && c.industry !== filters.industry) {
        return false;
      }
      if (filters.city !== "All" && c.city !== filters.city) {
        return false;
      }
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const match =
          c.companyName.toLowerCase().includes(query) ||
          c.commercialRegistration.toLowerCase().includes(query) ||
          c.primaryContactName.toLowerCase().includes(query) ||
          c.primaryContactEmail.toLowerCase().includes(query) ||
          c.primaryContactPhone.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [customers, filters]);

  // Handlers with permission guards
  const handleAddCustomer = (data: Omit<Customer, "id" | "tenantId" | "createdAt" | "updatedAt" | "representatives">): { success: boolean; errors?: any } => {
    if (!permissions.canManageCustomerProfile) {
      return { success: false, errors: { global: "unauthorized" } };
    }

    const { valid, errors } = validateCustomer(data);
    if (!valid) {
      return { success: false, errors };
    }

    const newId = generateCustomerId();
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      ...data,
      id: newId,
      // The creating user's tenant owns the customer — not the customer's own id.
      tenantId: tenantContext.tenantId || "",
      representatives: [
        {
          id: `rep-${Math.random().toString(36).substr(2, 9)}`,
          name: data.primaryContactName,
          email: data.primaryContactEmail,
          phone: data.primaryContactPhone,
          role: "Primary Liaison"
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    createOrUpdateCustomer(newCustomer);
    loadCustomers();
    return { success: true };
  };

  const handleUpdateCustomer = (customer: Customer): { success: boolean; errors?: any } => {
    if (!permissions.canManageCustomerProfile) {
      return { success: false, errors: { global: "unauthorized" } };
    }

    const { valid, errors } = validateCustomer(customer);
    if (!valid) {
      return { success: false, errors };
    }

    const updated: Customer = {
      ...customer,
      updatedAt: new Date().toISOString(),
    };

    createOrUpdateCustomer(updated);
    loadCustomers();
    return { success: true };
  };

  const handleToggleStatus = (id: string) => {
    if (!permissions.canToggleCustomerStatus) return;
    const current = customers.find((c) => c.id === id);
    if (!current) return;
    const newStatus: CustomerStatus = current.status === "Active" ? "Inactive" : "Active";
    updateCustomerStatus(id, newStatus);
    loadCustomers();
  };

  return {
    customers: filteredCustomers,
    isLiveSynced,
    filters,
    setFilters,
    kpis,
    filterOptions,
    permissions,
    handleAddCustomer,
    handleUpdateCustomer,
    handleToggleStatus,
  };
}
