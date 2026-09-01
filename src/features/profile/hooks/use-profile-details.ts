import { useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { UserProfileResponseDTO } from "@/domains/users/types";
import { ROLE_PERMISSIONS } from "@/constants/permissions";

export function useProfileDetails() {
  const { user } = useAuth();

  const profileData: UserProfileResponseDTO | null = useMemo(() => {
    if (!user) return null;

    const rolePermissions = (ROLE_PERMISSIONS[user.role] || []) as string[];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: "+966 50 123 4567",
      jobTitle: user.role === "Consulting Engineer" ? "Senior Safety Consultant" : user.role,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenantId === "COMP-001" ? "Vertex Industrial Safety" : "شركة السلامة الهندسية",
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
      active: user.active,
      permissions: rolePermissions,
      supervisor:
        user.role !== "Super Admin" && user.role !== "Company Admin"
          ? {
              id: "sup-01",
              name: "سارة جينكينز (Sarah Jenkins)",
              email: "sarah.j@vertexindustrial.com",
              role: "Company Admin",
              avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
            }
          : null,
      auditTrail: {
        createdAt: "2025-01-15T08:30:00Z",
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: "192.168.1.105 (Riyadh, SA)",
        passwordChangedAt: "2025-06-10T14:20:00Z",
        currentSessionId: "sess-998822-sec",
      },
    };
  }, [user]);

  return {
    profile: profileData,
    isLoading: false,
  };
}
