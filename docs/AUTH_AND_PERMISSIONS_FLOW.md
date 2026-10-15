# Amanix Authentication, Tenant Context & Permissions Flow

---

## 1. Authentication & Session Lifecycle

Amanix uses a hardened JWT authentication model with rolling refresh tokens and tenant-isolated context.

### Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Operator
    participant Client as Frontend Browser
    participant API as Amanix Backend API (/api/v1)
    participant DB as Isolated Tenant DB

    User->>Client: Enters Email & Password on login screen
    Client->>API: POST /auth/login { email, password } [X-Tenant-Domain: subdomain]
    API->>DB: Validate credentials & retrieve tenant record
    DB-->>API: User profile, role, tenantId
    API-->>Client: 200 OK { isSuccess: true, data: { accessToken, refreshToken, userName, email } }
    
    Note over Client: Store tokens in sync (localStorage + httpOnly/Lax cookie)
    
    par Concurrent Profile & Permissions Hydration
        Client->>API: GET /me [Authorization: Bearer <accessToken>]
        Client->>API: GET /auth/permissions/me [Authorization: Bearer <accessToken>]
    end
    API-->>Client: Profile DTO (role: 200, tenantId, subdomain, preferredLanguage)
    API-->>Client: Effective Permissions Array (["Intake.Triage", "Quotations.Authorize", ...])
    
    Note over Client: Hydrate AuthContext / AuthProvider state
    Client-->>User: Navigate to Role Landing Screen (e.g. /dashboard or /requests)
```

---

## 2. Single-Flight Token Refresh Rotation (Mutex Queue)

When the short-lived access token (120 minutes) expires, any subsequent request returns `401 Unauthorized`. The frontend coordinates a single-flight mutex refresh:

```mermaid
sequenceDiagram
    autonumber
    participant UI as Active UI Components
    participant Interceptor as Axios Response Interceptor
    participant Queue as Mutex Retry Queue
    participant API as Backend (/api/v1/auth/refresh-token)

    UI->>Interceptor: Request A triggers 401 Unauthorized
    UI->>Interceptor: Request B triggers 401 Unauthorized (concurrent)
    
    Note over Interceptor: First 401 acquires lock (isRefreshing = true)
    Interceptor->>Queue: Push Request A resolver
    Interceptor->>Queue: Push Request B resolver
    
    Interceptor->>API: POST /auth/refresh-token { accessToken, refreshToken }
    
    alt Refresh Succeeded (200 OK)
        API-->>Interceptor: { isSuccess: true, data: { accessToken: "new...", refreshToken: "newRotated..." } }
        Note over Interceptor: Store new token pair atomically
        Interceptor->>Queue: Drain & replay queued requests with new token
        Queue-->>UI: Request A succeeds
        Queue-->>UI: Request B succeeds
    else Refresh Failed (401 / Invalid Refresh Token)
        API-->>Interceptor: 400/401 Failure
        Interceptor->>UI: Clear tokens & redirect to /login?session_expired=true
    end
```

---

## 3. Hybrid Access Governance (RBAC vs PBAC)

In Amanix:
- **Role (RBAC):** Dictates high-level persona layout, navigation bar items, and default landing destination.
- **Permission (PBAC):** Dictates capability to view, enable, or trigger specific operations and action buttons.

### Effective Permissions (`GET /api/v1/auth/permissions/me`)
Returns a flat string array containing combined permissions granted through the role plus any individual per-user overrides:

```json
[
  "Intake.View",
  "Intake.Triage",
  "Engineering.Review",
  "Quotations.Prepare",
  "Quotations.Authorize",
  "FieldTasks.Assign",
  "FieldTasks.Execute",
  "Closure.Seal",
  "Invoices.Issue"
]
```

### Reactive Gate Helper: `can(permissionKey)`

```typescript
export function usePermissions() {
  const { permissions, role } = useAuth();

  const can = (permission: string): boolean => {
    if (role === UserRole.SystemSuperAdmin) return true; // Super admin bypass
    return permissions.includes(permission);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    return role ? allowedRoles.includes(role) : false;
  };

  return { can, hasRole };
}
```

### Component-Level Gating Example

```tsx
export function QuotationActions({ instanceId }: { instanceId: string }) {
  const { can } = usePermissions();

  return (
    <div className="flex items-center gap-2">
      {can("Quotations.Prepare") && (
        <Button variant="outline" onClick={handleEditCosting}>
          تعديل التكلفة والبنود
        </Button>
      )}

      {can("Quotations.Authorize") && (
        <Button variant="default" onClick={handleIssueQuotation}>
          إصدار عرض السعر للعميل
        </Button>
      )}
    </div>
  );
}
```

---

## 4. Route Protection Middleware

`src/middleware.ts` guards all protected routes on both server and client:

1. **Unauthenticated Access:** Any attempt to access `/dashboard/*` or protected routes without a valid session cookie redirects to `/login`.
2. **Platform vs Tenant Separation:** Platform staff (`SystemSuperAdmin`, `PlatformFinance`) accessing a tenant subdomain, or tenant staff accessing the platform console root, are routed to their designated workspaces.
3. **Segregation of Duties Enforcement:** Routes requiring specific permissions are checked before page rendering to prevent content flashing.
