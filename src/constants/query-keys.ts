export const QUERY_KEYS = {
  AUTH: {
    SESSION: ["auth", "session"] as const,
    PROFILE: ["auth", "profile"] as const,
  },
  USERS: {
    LIST: ["users"] as const,
    DETAIL: (id: string) => ["users", id] as const,
  },
  PROJECTS: {
    LIST: ["projects"] as const,
    DETAIL: (id: string) => ["projects", id] as const,
    TASKS: (id: string) => ["projects", id, "tasks"] as const,
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
} as const;
export type QueryKeysType = typeof QUERY_KEYS;
