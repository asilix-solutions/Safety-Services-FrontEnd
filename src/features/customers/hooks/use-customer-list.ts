import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Customer, CustomerStatus } from "@/domains/customers/types";
import { getCustomers, createOrUpdateCustomer, updateCustomerStatus, generateCustomerId } from "@/domains/customers/storage";
import { validateCustomer } from "@/domains/customers/validation";
import { CustomerFilters } from "../types";
import { getActiveProjects } from "@/domains/projects/storage";
import { getUnpaidInvoices } from "@/domains/invoices/storage";
import { hasPermission } from "@/constants/permissions";

export function useCustomerList() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    status: "All",
    industry: "All",
    city: "All",
  });

  const loadCustomers = () => {
    const list = getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

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
      canToggleCustomerStatus: role === "Company Admin",
      canMutateLinkedRecords: false,
      canView: ["Super Admin", "Company Admin", "Operations Officer", "Consulting Engineer", "Sales Agent"].includes(role),
      role
    };
  }, [user]);

  // KPIs
  const kpis = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.status === "Active");
    
    // Aggregate Active Projects and Unpaid Invoices across all customer profiles
    const totalActiveProjects = activeCustomers.reduce((acc, c) => acc + getActiveProjects(undefined, c.id).length, 0);
    const totalUnpaidInvoices = activeCustomers.reduce((acc, c) => acc + getUnpaidInvoices(undefined, c.id).length, 0);

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
      tenantId: newId,
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
