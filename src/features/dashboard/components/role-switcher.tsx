"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/role";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/constants/roles";

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith("Client:")) {
      const companyId = val.split(":")[1];
      switchRole(USER_ROLES.CLIENT, companyId);
    } else {
      switchRole(val as UserRole);
    }
    router.push("/");
  };

  const getSelectValue = () => {
    if (user.role === USER_ROLES.CLIENT) {
      return `Client:${user.companyId || "c-102"}`;
    }
    return user.role;
  };

  return (
    <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 rounded-lg px-2.5 py-1">
      <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider hidden sm:inline-block">
        Switch Workspace:
      </span>
      <select
        value={getSelectValue()}
        onChange={handleRoleChange}
        className="bg-transparent text-xs font-semibold text-primary outline-none cursor-pointer focus:ring-0 border-0 p-0 pr-6"
      >
        <option value="Super Admin">Super Admin</option>
        <option value="Company Admin">Company Admin</option>
        <option value="Consulting Engineer">Consulting Engineer</option>
        <option value="Operations Officer">Operations Officer</option>
        <option value="Sales Agent">Sales Agent</option>
        <option value="Client:c-102">Client - Emaar Properties (c-102)</option>
        <option value="Client:c-103">Client - Gulf Petroleum (c-103)</option>
      </select>
    </div>
  );
}
export default RoleSwitcher;
