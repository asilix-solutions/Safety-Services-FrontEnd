import {
  OverviewStatCard,
  OverviewActionItem,
  OverviewEntityItem,
  OverviewActivityItem,
  OverviewQuickAccessItem,
} from "@/features/dashboard-overview";

export interface SuperAdminOverviewViewModel {
  welcomeCardProps: {
    name: string;
    roleLabel: string;
    subtitle: string;
  };
  summaryCards: OverviewStatCard[];
  actionItems: OverviewActionItem[];
  recentCompanies: OverviewEntityItem[];
  companiesRequiringAttention: OverviewEntityItem[];
  expiringSubscriptionsQueue: OverviewEntityItem[];
  recentActivity: OverviewActivityItem[];
  quickAccessLinks: OverviewQuickAccessItem[];
}

// Mock company domain definitions ready to move to future domain files
export interface MockCompany {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: "active" | "suspended" | "pending_verification";
  expiresAt: string;
  userCount: number;
  registeredAt: string;
}

export const MOCK_COMPANIES: MockCompany[] = [
  {
    id: "COMP-001",
    name: "Apex Safety Ltd",
    owner: "Fahad Qasim",
    plan: "Enterprise Premium",
    status: "active",
    expiresAt: "2026-12-31T00:00:00Z",
    userCount: 45,
    registeredAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "COMP-002",
    name: "Safety Shield Co.",
    owner: "Salim Obaid",
    plan: "Basic Business",
    status: "active",
    expiresAt: "2026-07-15T00:00:00Z", // Expiring soon (within 30 days of June 28)
    userCount: 12,
    registeredAt: "2026-05-28T14:30:00Z",
  },
  {
    id: "COMP-003",
    name: "Gulf Fire Engineering",
    owner: "Khalid Issa",
    plan: "Standard Growth",
    status: "suspended",
    expiresAt: "2026-06-01T00:00:00Z", // Expired/Suspended
    userCount: 22,
    registeredAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "COMP-004",
    name: "Red Sea Compliance",
    owner: "Ahmed Jamil",
    plan: "Standard Growth",
    status: "pending_verification",
    expiresAt: "2026-08-20T00:00:00Z",
    userCount: 5,
    registeredAt: "2026-06-25T11:00:00Z",
  },
];

export function prepareSuperAdminOverviewViewModel(
  user: { name: string; role: string },
  data: {
    companies?: MockCompany[];
  }
): SuperAdminOverviewViewModel {
  const todayStr = "2026-06-28";
  const todayMs = new Date(todayStr).getTime();

  const companiesList = data.companies || MOCK_COMPANIES;

  // 1. KPI Calculations
  const totalCompanies = companiesList.length;
  const activeSubscriptions = companiesList.filter((c) => c.status === "active").length;
  
  // Expiring in 30 days (between June 28 and July 28)
  const expiringSubscriptionsCount = companiesList.filter((c) => {
    const expiresMs = new Date(c.expiresAt).getTime();
    const diffDays = (expiresMs - todayMs) / (1000 * 60 * 60 * 24);
    return c.status === "active" && diffDays >= 0 && diffDays <= 30;
  }).length;

  const totalUsers = companiesList.reduce((sum, c) => sum + c.userCount, 0);

  // Reordered by natural SaaS hierarchy: Total Companies -> Active Subscriptions -> Expiring Subscriptions -> Total Users
  const summaryCards: OverviewStatCard[] = [
    {
      id: "sa-total-companies",
      labelKey: "superAdmin.overview.totalCompanies",
      labelFallback: "Total Companies",
      value: totalCompanies,
      iconName: "project",
      href: "/companies",
      variant: "info",
    },
    {
      id: "sa-active-subs",
      labelKey: "superAdmin.overview.activeSubscriptions",
      labelFallback: "Active Subscriptions",
      value: activeSubscriptions,
      iconName: "contract",
      href: "/subscriptions",
      variant: "success",
    },
    {
      id: "sa-expiring-subs",
      labelKey: "superAdmin.overview.expiringSubscriptions",
      labelFallback: "Expiring Subscriptions",
      value: expiringSubscriptionsCount,
      iconName: "invoice",
      href: "/subscriptions",
      variant: "warning",
    },
    {
      id: "sa-total-users",
      labelKey: "superAdmin.overview.totalUsers",
      labelFallback: "Total Users",
      value: totalUsers,
      iconName: "request",
      href: "/users",
      variant: "default",
    },
  ];

  // 2. Action Items (Generated and sorted by Business Priority: 1. Verification, 2. Expiring Sub, 3. Suspensions)
  const actionItems: OverviewActionItem[] = [];

  companiesList.forEach((c) => {
    // 1. Pending Verification (High)
    if (c.status === "pending_verification") {
      actionItems.push({
        id: `action-sa-verify-${c.id}`,
        titleKey: "superAdmin.overview.verifyCompany",
        titleFallback: "Verify Company",
        descriptionFallback: `Verify registered tenant details for ${c.name} (Owner: ${c.owner})`,
        href: "/companies",
        actionLabelKey: "open",
        actionLabelFallback: "Open",
        referenceId: c.id,
        priority: "high",
      });
    }

    // 2. Expiring Subscription Review (Medium)
    const expiresMs = new Date(c.expiresAt).getTime();
    const diffDays = (expiresMs - todayMs) / (1000 * 60 * 60 * 24);
    if (c.status === "active" && diffDays >= 0 && diffDays <= 30) {
      actionItems.push({
        id: `action-sa-expire-${c.id}`,
        titleKey: "superAdmin.overview.reviewSubscription",
        titleFallback: "Review Expiring Subscription",
        descriptionFallback: `Subscription for ${c.name} expires in ${Math.round(diffDays)} days.`,
        href: "/subscriptions",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: c.id,
        priority: "medium",
      });
    }

    // 3. Suspended Company Review (Low)
    if (c.status === "suspended") {
      actionItems.push({
        id: `action-sa-suspended-${c.id}`,
        titleKey: "superAdmin.overview.suspendCompany",
        titleFallback: "Review Suspended Company",
        descriptionFallback: `Suspended account review for ${c.name} (Owner: ${c.owner})`,
        href: "/companies",
        actionLabelKey: "view",
        actionLabelFallback: "View",
        referenceId: c.id,
        priority: "low",
      });
    }
  });

  // Sort by priority mapping: high -> 1, medium -> 2, low -> 3
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  actionItems.sort((a, b) => {
    const pA = priorityOrder[a.priority || "low"] || 3;
    const pB = priorityOrder[b.priority || "low"] || 3;
    return pA - pB;
  });

  // 3. Recent Companies Queue (Subtitle displays Subscription Plan instead of owner)
  const recentCompanies = [...companiesList]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5)
    .map((c): OverviewEntityItem => {
      let regDate = "";
      try {
        regDate = new Date(c.registeredAt).toLocaleDateString([], { month: "short", day: "numeric" });
      } catch {
        regDate = c.registeredAt;
      }
      return {
        id: c.id,
        title: c.name,
        subtitle: c.plan,
        statusKey: `company_status_${c.status}`,
        statusFallback: c.status,
        metaText: regDate,
        href: "/companies",
      };
    });

  // 4. Companies Requiring Attention Queue (Sorted by operational urgency: Verification -> Suspended)
  const urgencyPriority: Record<string, number> = { pending_verification: 1, suspended: 2 };
  const companiesRequiringAttention = companiesList
    .filter((c) => c.status === "suspended" || c.status === "pending_verification")
    .sort((a, b) => {
      const uA = urgencyPriority[a.status] || 3;
      const uB = urgencyPriority[b.status] || 3;
      return uA - uB;
    })
    .slice(0, 5)
    .map((c): OverviewEntityItem => {
      return {
        id: c.id,
        title: c.name,
        subtitle: c.owner,
        statusKey: `company_status_${c.status}`,
        statusFallback: c.status,
        metaText: c.plan,
        href: "/companies",
      };
    });

  // 5. Expiring Subscriptions Queue (Up to 5 expiring items, sorted by proximity to expiration date)
  const expiringSubscriptionsQueue = companiesList
    .filter((c) => {
      const expiresMs = new Date(c.expiresAt).getTime();
      const diffDays = (expiresMs - todayMs) / (1000 * 60 * 60 * 24);
      return c.status === "active" && diffDays >= 0 && diffDays <= 30;
    })
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
    .slice(0, 5)
    .map((c): OverviewEntityItem => {
      let expDate = "";
      try {
        expDate = new Date(c.expiresAt).toLocaleDateString([], { month: "short", day: "numeric" });
      } catch {
        expDate = c.expiresAt;
      }
      return {
        id: c.id,
        title: c.name,
        subtitle: c.plan,
        statusKey: `company_status_${c.status}`,
        statusFallback: c.status,
        metaText: expDate,
        href: "/subscriptions",
      };
    });

  // 6. Recent Platform Activity (Represents the complete SaaS lifecycle events)
  const activities: OverviewActivityItem[] = [];

  companiesList.forEach((c) => {
    // New Company Registered Event
    activities.push({
      id: `act-sa-reg-${c.id}`,
      type: "project",
      titleKey: "superAdmin.overview.activity.companyRegistered",
      titleFallback: "New Company Registered",
      timestamp: c.registeredAt,
      referenceId: c.id,
      descriptionFallback: `${c.name} - Plan: ${c.plan}`,
      href: "/companies",
    });

    // Company Verified / Activated Event
    if (c.status === "active") {
      activities.push({
        id: `act-sa-verify-${c.id}`,
        type: "certificate",
        titleKey: "superAdmin.overview.activity.companyVerified",
        titleFallback: "Company Verified",
        timestamp: c.registeredAt, // Verified close to registration in mock
        referenceId: c.id,
        descriptionFallback: `${c.name} validated and activated.`,
        href: "/companies",
      });
    }

    // Company Suspended / Expired / Expiring soon Events
    const expiresMs = new Date(c.expiresAt).getTime();
    const diffDays = (expiresMs - todayMs) / (1000 * 60 * 60 * 24);

    if (c.status === "suspended") {
      activities.push({
        id: `act-sa-suspend-${c.id}`,
        type: "invoice",
        titleKey: "superAdmin.overview.activity.companySuspended",
        titleFallback: "Company Suspended",
        timestamp: c.expiresAt,
        referenceId: c.id,
        descriptionFallback: `${c.name} accounts disabled.`,
        href: "/companies",
      });

      activities.push({
        id: `act-sa-expired-${c.id}`,
        type: "contract",
        titleKey: "superAdmin.overview.activity.subscriptionExpired",
        titleFallback: "Subscription Expired",
        timestamp: c.expiresAt,
        referenceId: c.id,
        descriptionFallback: `Billing period ended for ${c.name}`,
        href: "/subscriptions",
      });
    } else if (c.status === "active" && diffDays >= 0 && diffDays <= 30) {
      activities.push({
        id: `act-sa-expiring-${c.id}`,
        type: "invoice",
        titleKey: "superAdmin.overview.activity.subscriptionExpiring",
        titleFallback: "Subscription Expiring Soon",
        timestamp: todayStr, // Occurs close to evaluation time
        referenceId: c.id,
        descriptionFallback: `Renewal pending for ${c.name}`,
        href: "/subscriptions",
      });
    }
  });

  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // 7. Quick Access (Companies -> /companies, Subscriptions -> /subscriptions, Users -> /users, Settings -> /settings)
  const quickAccessLinks: OverviewQuickAccessItem[] = [
    {
      id: "qa-sa-companies",
      labelKey: "superAdmin.overview.companies",
      labelFallback: "Companies",
      count: totalCompanies,
      href: "/companies",
      iconName: "project",
    },
    {
      id: "qa-sa-subscriptions",
      labelKey: "superAdmin.overview.subscriptions",
      labelFallback: "Subscriptions",
      count: activeSubscriptions,
      href: "/subscriptions",
      iconName: "contract",
    },
    {
      id: "qa-sa-users",
      labelKey: "superAdmin.overview.users",
      labelFallback: "Users",
      count: totalUsers,
      href: "/users",
      iconName: "request",
    },
    {
      id: "qa-sa-settings",
      labelKey: "superAdmin.overview.settings",
      labelFallback: "Settings",
      href: "/settings",
      iconName: "certificate",
    },
  ];

  return {
    welcomeCardProps: {
      name: user.name,
      roleLabel: user.role,
      subtitle: todayStr,
    },
    summaryCards,
    actionItems,
    recentCompanies,
    companiesRequiringAttention,
    expiringSubscriptionsQueue,
    recentActivity,
    quickAccessLinks,
  };
}
