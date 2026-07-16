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
    queryFn: () => getUsersWithCompany(),
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
    mutationFn: async (id: string) => activateUser(id),
    onSuccess: invalidateUsers,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => deactivateUser(id),
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
