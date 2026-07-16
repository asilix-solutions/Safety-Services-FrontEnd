"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations } from "@/providers/i18n-provider";
import { getTierDistribution, getSubscriptionMatrix } from "@/domains/organization/workflow";
import { canViewSubscriptions } from "@/constants/permissions";
import { QUERY_KEYS } from "@/constants/query-keys";

export function useSubscriptionMatrix() {
  const { user } = useAuth();
  useNamespaceTranslations(["subscriptions"]);

  const permissions = useMemo(
    () => ({ canView: canViewSubscriptions(user?.role) }),
    [user]
  );

  const { data: distribution = [] } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS.DISTRIBUTION,
    queryFn: () => getTierDistribution(),
    enabled: permissions.canView,
  });

  const { data: matrix = [] } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS.MATRIX,
    queryFn: () => getSubscriptionMatrix(),
    enabled: permissions.canView,
  });

  return { permissions, distribution, matrix };
}
