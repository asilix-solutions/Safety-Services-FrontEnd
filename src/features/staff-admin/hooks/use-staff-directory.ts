import { useState, useMemo } from "react";
import { TenantUserDTO, StaffDepartment, StaffStatus } from "@/domains/users/types";
import { UserRole } from "@/types/role";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { InviteStaffFormValues } from "@/schemas/staff.schema";

const INITIAL_STAFF: TenantUserDTO[] = [
  {
    id: "usr-01",
    name: "م. خالد الأحمد",
    email: "khaled@vertexindustrial.com",
    phone: "0501234567",
    jobTitle: "المدير العام والمسؤول المعتمد",
    department: "Management",
    role: "Company Admin",
    status: "Active",
    createdAt: "2025-01-10T00:00:00Z",
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "usr-02",
    name: "د. ماركوس فانس (Dr. Marcus Vance)",
    email: "marcus.v@safetysystem.com",
    phone: "0559876543",
    jobTitle: "استشاري أول هندسة إطفاء وسلامة",
    department: "Engineering",
    role: "Consulting Engineer",
    status: "Active",
    supervisorName: "م. خالد الأحمد",
    createdAt: "2025-01-15T00:00:00Z",
    lastActiveAt: "2025-08-28T11:00:00Z",
  },
  {
    id: "usr-03",
    name: "إيلينا روستوفا (Elena Rostova)",
    email: "elena.r@vertexindustrial.com",
    phone: "0543322114",
    jobTitle: "مسؤول عمليات ومعاينة ميدانية",
    department: "Operations",
    role: "Operations Officer",
    status: "Active",
    supervisorName: "م. خالد الأحمد",
    createdAt: "2025-02-01T00:00:00Z",
    lastActiveAt: "2025-08-30T09:30:00Z",
  },
  {
    id: "usr-04",
    name: "جيمس ستيرلينغ (James Sterling)",
    email: "james.s@safetysystem.com",
    phone: "0567788990",
    jobTitle: "مسؤول تطوير أعمال ومبيعات",
    department: "Sales",
    role: "Sales Agent",
    status: "Active",
    supervisorName: "م. خالد الأحمد",
    createdAt: "2025-02-10T00:00:00Z",
    lastActiveAt: "2025-08-25T14:15:00Z",
  },
  {
    id: "usr-05",
    name: "م. طارق المنصور",
    email: "tariq.m@vertexindustrial.com",
    phone: "0504455667",
    jobTitle: "مهندس سلامة معتمد - شبكات إنذار",
    department: "Engineering",
    role: "Consulting Engineer",
    status: "Active",
    supervisorName: "د. ماركوس فانس",
    createdAt: "2025-03-01T00:00:00Z",
    lastActiveAt: "2025-08-29T16:45:00Z",
  },
  {
    id: "usr-06",
    name: "أحمد الجابري",
    email: "ahmed.j@vertexindustrial.com",
    phone: "0551122334",
    jobTitle: "فني فحص ومعاينة موقعية",
    department: "Operations",
    role: "Operations Officer",
    status: "Inactive",
    supervisorName: "إيلينا روستوفا",
    createdAt: "2025-03-15T00:00:00Z",
    lastActiveAt: "2025-07-20T10:00:00Z",
  },
];

export function useStaffDirectory() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<TenantUserDTO[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // KPI summaries
  const kpis = useMemo(() => {
    const active = staffList.filter((s) => s.status === "Active");
    return {
      total: staffList.length,
      activeEngineers: active.filter((s) => s.role === "Consulting Engineer").length,
      activeOperations: active.filter((s) => s.role === "Operations Officer").length,
      activeSales: active.filter((s) => s.role === "Sales Agent").length,
    };
  }, [staffList]);

  // Filtered List
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          (item.phone && item.phone.includes(query)) ||
          (item.jobTitle && item.jobTitle.toLowerCase().includes(query));
        if (!matches) return false;
      }

      if (departmentFilter !== "All" && item.department !== departmentFilter) {
        return false;
      }

      if (roleFilter !== "All" && item.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [staffList, search, departmentFilter, roleFilter, statusFilter]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  // Actions
  const handleToggleStatus = (userId: string) => {
    setStaffList((prev) =>
      prev.map((item) => {
        if (item.id === userId) {
          const nextStatus: StaffStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(
            `تم ${nextStatus === "Active" ? "تفعيل" : "تعطيل"} حساب: ${item.name}`
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setStaffList((prev) =>
      prev.map((item) => {
        if (item.id === userId) {
          toast.success(`تم تحديث دور ${item.name} إلى ${newRole}`);
          return { ...item, role: newRole };
        }
        return item;
      })
    );
  };

  const handleInviteStaff = async (data: InviteStaffFormValues) => {
    await new Promise((res) => setTimeout(res, 600));

    const newId = `usr-${Date.now().toString().slice(-4)}`;
    const newStaffMember: TenantUserDTO = {
      id: newId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department as StaffDepartment,
      role: data.role as UserRole,
      status: "Active",
      jobTitle: data.role,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    setStaffList((prev) => [newStaffMember, ...prev]);
    toast.success(`تم إرسال دعوة الانضمام إلى: ${data.email}`, {
      description: `تم إضافة ${data.name} كـ ${data.role} في قسم ${data.department}.`,
    });
  };

  return {
    staff: paginatedStaff,
    totalCount: filteredStaff.length,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    kpis,
    handleToggleStatus,
    handleUpdateRole,
    handleInviteStaff,
    canManage: user?.role === "Super Admin" || user?.role === "Company Admin",
  };
}
