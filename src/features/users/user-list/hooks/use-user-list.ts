"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations } from "@/providers/i18n-provider";
import {
  getUsersWithCompany,
  getUsersSummary,
  getCompanyPersonnelUsage,
  activateUser,
  deactivateUser,
} from "@/domains/users";
import { canViewUsers, canManageUsers } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toUserRows } from "../view-models/user-list.viewmodel";
import { usersApi } from "@/domains/users/api";
import { UserRole } from "@/types/role";

export function useUserList() {
  const { user } = useAuth();
  useNamespaceTranslations(["users"]);
  const queryClient = useQueryClient();

  const permissions = useMemo(
    () => ({
      canView: canViewUsers(user?.role),
      canManage: canManageUsers(user?.role),
    }),
    [user]
  );

  const { data: usersWithCompany = [] } = useQuery({
    queryKey: QUERY_KEYS.USERS.LIST,
    queryFn: async () => {
      try {
        const res = await usersApi.getUsers();
        if (res.isSuccess && res.data?.items) {
          const liveUsers = res.data.items.map((u) => {
            const roleStr = String(u.role);
            let mappedRole: UserRole = "Company Admin";
            if (roleStr === "CompanyAdmin" || roleStr === "200") mappedRole = "Company Admin";
            else if (roleStr === "ConsultingEngineer" || roleStr === "202") mappedRole = "Consulting Engineer";
            else if (roleStr === "OperationsOfficer" || roleStr === "203") mappedRole = "Operations Officer";
            else if (roleStr === "SalesRepresentative" || roleStr === "206") mappedRole = "Sales Agent";
            else if (roleStr === "Client" || roleStr === "207") mappedRole = "Client";
            else if (roleStr === "DeputyAdmin" || roleStr === "201") mappedRole = "Company Admin";

            return {
              user: {
                id: u.id,
                name: u.fullName,
                role: mappedRole,
                status: (u.isActive ? "active" : "inactive") as "active" | "inactive",
                companyId: user?.tenantId || "COMP-001",
                createdAt: u.createdAt,
              },
              company: {
                id: user?.tenantId || "COMP-001",
                name: user?.tenantName || "شركة السلامة لحماية الحرائق",
                owner: user?.name || "مدير الشركة",
                plan: "Professional",
                tier: "Professional" as const,
                status: "active" as const,
                projectCount: 1,
                personnelCount: 1,
                expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
                registeredAt: new Date().toISOString(),
              },
            };
          });
          return liveUsers;
        }
      } catch (err) {
        console.warn("Live users fetch failed, falling back to local:", err);
      }
      return getUsersWithCompany();
    },
    enabled: permissions.canView,
  });

  const { data: summary } = useQuery({
    queryKey: QUERY_KEYS.USERS.SUMMARY,
    queryFn: () => getUsersSummary(),
    enabled: permissions.canView,
  });

  const { data: personnelUsage = [] } = useQuery({
    queryKey: QUERY_KEYS.USERS.PERSONNEL_USAGE,
    queryFn: () => getCompanyPersonnelUsage(),
    enabled: permissions.canView,
  });

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.LIST });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.SUMMARY });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.PERSONNEL_USAGE });
  };

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await usersApi.toggleUserStatus(id, true);
      } catch {
        // Fallback
      }
      return activateUser(id);
    },
    onSuccess: invalidateUsers,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await usersApi.toggleUserStatus(id, false);
      } catch {
        // Fallback
      }
      return deactivateUser(id);
    },
    onSuccess: invalidateUsers,
  });

  const rows = useMemo(() => toUserRows(usersWithCompany), [usersWithCompany]);

  return {
    permissions,
    rows,
    summary,
    personnelUsage,
    activate: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    deactivate: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
  };
}
