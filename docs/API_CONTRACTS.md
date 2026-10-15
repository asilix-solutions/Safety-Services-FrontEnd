# Amanix API Contracts & Architecture Specification

**Base URL (Staging):** `https://amanixapi-001-site1.ktempurl.com/api/v1`  
**OpenAPI Specification:** `https://amanixapi-001-site1.ktempurl.com/openapi/v1.json`  
**Interactive Reference:** `https://amanixapi-001-site1.ktempurl.com/scalar/v1`  
**Generated TypeScript Types:** `src/types/api.generated.ts`  

---

## 1. Response Envelope Protocol

Every HTTP response returned by the Amanix backend conforms to the following standardized envelope structure:

```typescript
export interface ApiEnvelope<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: string[] | null;
}
```

### Critical Rules
1. **Always branch on `isSuccess`:** Never infer success or failure from `data !== null` or `data !== undefined`. Empty datasets or zero counts (`data: 0`, `data: false`) are legitimate payload values.
2. **Localized Human Sentences:** The `message` field and `errors` array contain localized strings matching the `Accept-Language` header (`ar` by default).
3. **ProblemDetails (RFC 7807):** For validation errors, the backend returns status `400 Bad Request` with an array of specific field failure messages.

### Standardized TypeScript Unwrapper

```typescript
export class ApiError extends Error {
  constructor(
    public readonly errors: string[],
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function unwrapResponse<T>(res: ApiResponse<T> | ApiEnvelope<T>): Promise<T> {
  if (!res.isSuccess) {
    throw new ApiError(
      res.errors || [],
      res.message || "Operation failed",
      400
    );
  }
  return res.data as T;
}
```

---

## 2. Request Protocol & Header Conventions

| Header | Value | Behavior / Scope |
|---|---|---|
| `Authorization` | `Bearer <accessToken>` | Mandatory for all 137 authenticated endpoints. Carries cryptographically signed `tenant_id` and role claims. |
| `Accept-Language` | `ar` (default) or `en` | Sent with **every** request. Controls server-side localization of messages and validation errors. |
| `X-Tenant-Domain` | `<subdomain-slug>` | Used **only** on pre-auth / anonymous calls (e.g. `GET /tenants/settings/public-branding`, `POST /auth/login`, `POST /auth/register-client`). Ignored on authenticated calls where tenant identity is established by the JWT. |
| `Content-Type` | `application/json` or `multipart/form-data` | Standard JSON for payloads; multipart for file and photo uploads. Do not set manual boundary on FormData. |

---

## 3. Wire Enums (Integer Value Reference)

All enums travel across the wire as numeric integers. Never send string enum values.

### `UserRole`
* `100` = `SystemSuperAdmin` (Platform owner, global visibility)
* `101` = `PlatformSupport` (Support staff, no default permissions)
* `102` = `PlatformFinance` (Platform billing & financial auditor)
* `200` = `CompanyAdmin` (Tenant owner, sovereign controls)
* `201` = `DeputyAdmin` (Operations equal, read-only on branding/financial policy)
* `202` = `ConsultingEngineer` (SBC 801 technical review & quotation cost preparation)
* `203` = `OperationsOfficer` (Field supervision, resource assignment, WBS)
* `204` = `FieldWorker` (Field execution, geotagged photo capture)
* `205` = `MaintenanceManager` (Maintenance agreements & periodic visit scheduling)
* `206` = `SalesRepresentative` (Client relations & quotation intake)
* `207` = `Client` (Intake submissions, quotation approvals, invoice payments)
* `208` = `MaintenanceWorker` (Periodic visit field execution)

### `WorkflowInstanceStatus`
* `1` = `Draft`
* `2` = `Submitted`
* `3` = `UnderReview`
* `4` = `IntakeRevision`
* `5` = `QuotePending`
* `6` = `QuoteApproved`
* `7` = `QuoteRejected`
* `8` = `InExecution`
* `9` = `PreClosure`
* `10` = `Completed`
* `11` = `SlaBreached`
* `12` = `Cancelled`
* `13` = `AwaitingPayment`

### `EngineeringComplianceStatus`
* `1` = `Compliant`
* `2` = `RequiresModifications`
* `3` = `Rejected`

### `QuotationStatus`
* `1` = `Draft`
* `2` = `Issued`
* `3` = `ClientAccepted`
* `4` = `ClientRejected`
* `5` = `Cancelled`

### `FieldTaskStatus`
* `1` = `Draft`
* `2` = `Assigned`
* `3` = `InProgress`
* `4` = `Blocked`
* `5` = `PendingSupervisorApproval`
* `6` = `Completed`

### `PhotoVerificationOutcome`
* `1` = `Verified` (EXIF timestamp and GPS coordinate match job site within geofence)
* `2` = `Flagged` (GPS mismatch or suspicious timestamp)
* `3` = `MetadataStripped` (Missing EXIF metadata, requires admin justification)

### `ProjectPaymentMethod`
* `1` = `ElectronicCard` (Mada / Visa / Mastercard)
* `2` = `BankTransferReceipt` (Wire transfer with uploaded receipt)
* `3` = `CashOnSite` (Cash collected on-site by field supervisor)

### `ServiceCategory`
* `1` = `Licensing` (Civil Defense licenses, safety compliance certificates)
* `2` = `Maintenance` (Periodic fire alarm and sprinkler maintenance contracts)
* `3` = `Contracting` (Turnkey fire protection installation projects)

---

## 4. HTTP Status Handling Matrix

| HTTP Status | Interpretation | Required Frontend Client Behavior |
|---|---|---|
| `200 OK` / `201 Created` | Successful operation | Parse payload with `unwrapResponse<T>()`, persist state, trigger optimistic UI updates or toasts. |
| `400 Bad Request` | Validation failure or business rule violation | Preserve all form inputs; display localized field-level errors or top-level notification banner. |
| `401 Unauthorized` | Expired or invalid JWT token | Trigger single-flight silent token refresh (`/auth/refresh-token`). If refresh fails, clear session and redirect to `/login?session_expired=true`. |
| `402 Payment Required` | Subscription limit exceeded or quota exhausted | Display non-blocking upgrade banner or usage quota modal; allow read-only operations to continue smoothly. |
| `403 Forbidden` | Insufficient role or permission claims | Treated as a UI defect (control should have been gated with `can(permission)`). Show friendly permission notice; log to diagnostic telemetry. |
| `404 Not Found` | Entity missing or belonging to another tenant | Show contextual "Record Not Found" state. Never leak cross-tenant existence. |
| `409 Conflict` | Concurrency conflict or illegal state transition | Refetch the latest entity state from the server and notify the user with an actionable refresh message. |
| `429 Too Many Requests`| Rate limit reached | Implement exponential backoff retry; inform the user to pause for a brief period. |
| `500 Server Error` | Unhandled backend exception | Show non-destructive error boundary with retry trigger; preserve all draft inputs. |

---

## 5. Summary of Endpoint Groups (157 Total)

| Domain Tag | Endpoints | Public / Protected | Primary Operations |
|---|---|---|---|
| `auth` | 10 | 8 Public / 2 Protected | Login, Refresh Token, Logout, Permissions, Invitations, Client Registration, Password Reset |
| `tenants` | 8 | 4 Public / 4 Protected | Public Branding, Subdomain Availability, Tenant Registration, Settings, Financial Policy |
| `tenant-users` | 6 | 6 Protected | Staff Directory, User Invite, Role Modification, Status Toggle, Permission Overrides |
| `workflow-templates`| 7 | 7 Protected | Template Listing, JSON Form Schema Extraction, Custom Section Configuration |
| `intake` | 8 | 8 Protected | Draft Initialization, Draft Auto-Save, Document Upload, Submission, Triage Accept/Reject |
| `workflow-instances`| 9 | 9 Protected | Enterprise Workflow Table, State Transition, SLA Monitoring, Cancellation |
| `my-requests` | 5 | 5 Protected | Client Portal Projections, Request Status, Quotation View & Response, Statements |
| `engineering` | 6 | 6 Protected | SBC 801 Blueprint Reviews, Compliance Verdicts, Technical Reports |
| `quotations` | 8 | 8 Protected | Line-item Costing, Preparation, Administrative Issuance, Client Revision History |
| `field-workers` | 7 | 7 Protected | Roster, Cost Rates Calculation, Account Linking, Onboarding |
| `equipment` | 7 | 7 Protected | Heavy Equipment Pool, Cost Allocation, Ownership Transition |
| `field-tasks` | 9 | 9 Protected | WBS Sprints, Task Lifecycle (Start/Submit/Review), Obstacle Logging |
| `field-photos` | 1 | 1 Protected | Photo Metadata Justification |
| `payments` | 8 | 8 Protected | Project Cost Ledger, Expense Clearance, Card Payment, Bank Wire Review |
| `closure` | 7 | 7 Protected | Readiness Check, SBC 801 Punch List, Dual Signatures, Vault Sealing |
| `invoices` | 6 | 6 Protected | ZATCA Phase 2 Tax Invoices, QR Code Generation, Voiding |
| `maintenance` | 8 | 8 Protected | Periodic Agreements, Automated Visit Scheduler, Calendar Planning Board |
| `audit-logs` | 3 | 3 Protected | Security Audit Trail, CSV Export, Entity History |
| `notifications` | 5 | 5 Protected | In-App Inbox, Mark as Read, Event Subscriptions |
| `diagnostics` | 4 | 4 Public | Server Health, Liveness, Readiness, Ping |
