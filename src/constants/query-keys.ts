export const QUERY_KEYS = {
  AUTH: {
    SESSION: ["auth", "session"] as const,
    PROFILE: ["auth", "profile"] as const,
    ME: ["auth", "me"] as const,
    PERMISSIONS: ["auth", "permissions"] as const,
  },
  TENANTS: {
    CURRENT: (tenantId?: string) => ["tenants", "current", tenantId] as const,
    AVAILABILITY: (subdomain: string) => ["tenants", "availability", subdomain] as const,
  },
  STAFF: {
    LIST: (tenantId?: string, params?: Record<string, unknown>) =>
      ["staff", tenantId, params] as const,
    DETAIL: (id: string) => ["staff", "detail", id] as const,
    SUPERVISORS: (tenantId?: string) => ["staff", "supervisors", tenantId] as const,
  },
  COMPANY_ADMIN: {
    ANALYTICS: (tenantId?: string) => ["company-admin", "analytics", tenantId] as const,
    OVERVIEW: (tenantId?: string) => ["company-admin", "overview", tenantId] as const,
  },
  SETTINGS: {
    GENERAL: (tenantId?: string) => ["settings", "general", tenantId] as const,
    SEO: (tenantId?: string) => ["settings", "seo", tenantId] as const,
    COMMUNICATION: (tenantId?: string) => ["settings", "communication", tenantId] as const,
    POLICIES: (tenantId?: string) => ["settings", "policies", tenantId] as const,
    SYSTEM: (tenantId?: string) => ["settings", "system", tenantId] as const,
  },
  USERS: {
    LIST: ["users"] as const,
    DETAIL: (id: string) => ["users", id] as const,
    SUMMARY: ["users", "summary"] as const,
    PERSONNEL_USAGE: ["users", "personnel-usage"] as const,
  },
  PROJECTS: {
    LIST: ["projects"] as const,
    DETAIL: (id: string) => ["projects", id] as const,
    TASKS: (id: string) => ["projects", id, "tasks"] as const,
  },
  PROCUREMENT: {
    LIST: (projectId: string) => ["procurement", projectId] as const,
  },
  PHOTOS: {
    /** Tenant-keyed for the same reason as CLOSURE.DETAIL below. */
    LIST: (projectId: string, tenantId?: string) => ["photos", tenantId, projectId] as const,
  },
  LABOR: {
    LIST: (projectId: string) => ["labor", projectId] as const,
  },
  CLOSURE: {
    /**
     * Tenant-keyed: the cache is not cleared on sign-out, so without the tenant in
     * the key a re-login in the same tab would serve the previous tenant's closure.
     */
    DETAIL: (projectId: string, tenantId?: string) => ["closure", tenantId, projectId] as const,
  },
  CUSTOMERS: {
    LIST: ["customers"] as const,
    DETAIL: (id: string) => ["customers", id] as const,
    ACTIVITIES: (id: string) => ["customers", id, "activities"] as const,
  },
  LICENSES: {
    LIST: ["licenses"] as const,
    DETAIL: (id: string) => ["licenses", id] as const,
  },
  REPORTS: {
    LIST: ["reports"] as const,
    DETAIL: (id: string) => ["reports", id] as const,
  },
  MAINTENANCE: {
    LIST: ["maintenance"] as const,
    DETAIL: (id: string) => ["maintenance", id] as const,
  },
  ANALYTICS: {
    KPI: ["analytics", "kpi"] as const,
    REVENUE: ["analytics", "revenue"] as const,
    COMPLIANCE: ["analytics", "compliance"] as const,
  },
  NOTIFICATIONS: {
    LIST: ["notifications"] as const,
  },
  SUBSCRIPTIONS: {
    DISTRIBUTION: ["subscriptions", "distribution"] as const,
    MATRIX: ["subscriptions", "matrix"] as const,
  },
} as const;
export type QueryKeysType = typeof QUERY_KEYS;

