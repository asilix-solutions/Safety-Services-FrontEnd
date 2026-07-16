"use client";

import { useAuth } from "@/providers/AuthProvider";
import { UserList } from "@/features/users/user-list";

export default function UsersPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <UserList />;
}
