import { User, UsersSummary, CompanyPersonnelUsage } from "./types";
import { getUsers, saveUsers } from "./storage";
import { UserRole } from "@/types/role";
import { getCompanies, TIER_LIMITS, Company } from "@/domains/organization";

const ALL_ROLES: UserRole[] = [
  "Super Admin",
  "Company Admin",
  "Consulting Engineer",
  "Operations Officer",
  "Sales Agent",
  "Client",
];

function findUserOrThrow(users: User[], id: string): User {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error(`User not found: ${id}`);
  return user;
}

export function activateUser(id: string): User {
  const users = getUsers();
  const user = findUserOrThrow(users, id);
  if (user.status === "active") {
    throw new Error("User is already active");
  }
  user.status = "active";
  saveUsers(users);
  return user;
}

export function deactivateUser(id: string): User {
  const users = getUsers();
  const user = findUserOrThrow(users, id);
  if (user.status === "inactive") {
    throw new Error("User is already inactive");
  }
  user.status = "inactive";
  saveUsers(users);
  return user;
}

export function getUsersSummary(): UsersSummary {
  const users = getUsers();
  // role infrastructure, not a permission check — counting users per role for a summary
  const byRole = ALL_ROLES.reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role).length;
    return acc;
  }, {} as Record<UserRole, number>);

  return {
    total: users.length,
    activeCount: users.filter((u) => u.status === "active").length,
    inactiveCount: users.filter((u) => u.status === "inactive").length,
    byRole,
  };
}

export interface UserWithCompany {
  user: User;
  company: Company | undefined;
}

export function getUsersWithCompany(): UserWithCompany[] {
  const users = getUsers();
  const companies = getCompanies();
  return users.map((user) => ({
    user,
    company: companies.find((c) => c.id === user.companyId),
  }));
}

export function getCompanyPersonnelUsage(): CompanyPersonnelUsage[] {
  const users = getUsers();
  const companies = getCompanies();
  return companies.map((company) => {
    const userCount = users.filter((u) => u.companyId === company.id).length;
    const maxPersonnel = TIER_LIMITS[company.tier].maxPersonnel;
    return {
      companyId: company.id,
      companyName: company.name,
      userCount,
      maxPersonnel,
      atLimit: userCount >= maxPersonnel,
    };
  });
}
