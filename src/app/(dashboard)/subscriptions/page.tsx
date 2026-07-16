"use client";

import { useAuth } from "@/providers/AuthProvider";
import { SubscriptionMatrix } from "@/features/subscriptions/subscription-matrix";

export default function SubscriptionsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return <SubscriptionMatrix />;
}
