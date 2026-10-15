# Amanix Product Context and Operating Model

> Working brief for AI-assisted frontend integration. Verify this against the latest backend branch, `Docs/frontend/`, the live OpenAPI document and the implementation before coding.

## 1. Product vision

Amanix is a multi-tenant SaaS platform for Saudi fire-safety, safety-services and engineering-contracting companies. Each subscribed/activated company has a private operational workspace and branded portal. Its end-to-end service lifecycle moves from a client request, through triage and engineering review, to a quotation, acceptance/payment, field execution, costs, formal closure, and tax documentation. The platform must protect legal, financial and operational records between companies.

The frontend is not a generic CRUD admin template. It is the working interface for three populations:

1. **Amanix platform staff** operate the SaaS itself: company registration and activation, subscription/tenant standing, support and platform-level oversight.
2. **Company staff** operate one safety-services business: staff, branding/settings, client requests, engineering, quotes, field projects, workers/equipment, costs, closure, invoicing, maintenance and subscriptions.
3. **Clients** use a company-branded portal to register, submit information and documents, follow their own requests, review/accept quotes, pay when the applicable job-payment flow supports it, and participate in project closure.

The root/platform console and a company portal on a tenant host are separate application contexts sharing one API. They may share design primitives, but they must not accidentally share role assumptions, tenant sessions, navigation or screens.

## 2. Business failure → product behavior

| Business problem | Required UI/product behavior |
|---|---|
| Decisions and work vanish into chats, spreadsheets and paper | Use numbered jobs, explicit workflow states, audit trails, attached evidence and clear responsibility at each stage. |
| Site photos may be unrelated to the work | Capture/submit original image bytes with their EXIF metadata intact; explain server verification outcomes in the UI. |
| Project margin is discovered too late | Show server-calculated quote/cost/financial information only to authorized roles, expose spending/approval status, and never calculate authoritative totals in the browser. |
| Closure paperwork is assembled by hand and later altered | Drive users through the required inspection, punch-list, signature, countersignature and sealed-state workflow; sealed records must not show edit affordances. |
| Different companies need their own identity | Resolve the tenant from its verified host/anonymous pre-auth context; load the company’s real branding and SEO before first paint. |
| Users have different responsibilities and delegated rights | Navigation follows the user’s role; every actionable control is gated by the effective permission list returned by the API. |

## 3. Roles and actors

Current backend frontend guidance documents the following twelve role values; verify the generated OpenAPI types and backend enum on the current branch before using the list in code.

### Platform roles (platform staff, no tenant)

| Value | Role | Frontend treatment |
|---:|---|---|
| 100 | `SystemSuperAdmin` | Platform-wide administration and approved cross-company capabilities. |
| 101 | `PlatformSupport` | Known to have an undecided/empty permission set in the project guide. Do not invent capabilities or show unbacked screens. |
| 102 | `PlatformFinance` | Platform/company activation finance workflows actually exposed by the API. |

### Company roles

| Value | Role | Intended experience |
|---:|---|---|
| 200 | `CompanyAdmin` | Company owner/admin; manages staff and sovereign company settings subject to permissions. |
| 201 | `DeputyAdmin` | Broad operational authority, but branding and financial-policy settings are read-only by design. |
| 202 | `ConsultingEngineer` | Engineering review, compliance decisions and quote preparation when permissioned. |
| 203 | `OperationsOfficer` | Plans and supervises field execution and operational stages. |
| 204 | `FieldWorker` | Assigned tasks and field evidence/photo submissions. |
| 205 | `MaintenanceManager` | Maintenance contracts, scheduled visits and related jobs. |
| 206 | `SalesRepresentative` | Client relationship and quotation preparation when permissioned. |
| 207 | `Client` | Own requests, related documents, quotes/payments and permitted closure steps only. |
| 208 | `MaintenanceWorker` | Assigned maintenance work and visit completion. |

Do not duplicate all authorization logic in a hard-coded frontend role table. This list is useful for layout, role labels and role-specific home screens; **effective permissions from `GET /api/v1/auth/permissions/me` control actions**. The caller-specific `assignableRoles` field from the permissions catalogue must populate role selectors when present.

## 4. End-to-end business lifecycle

Follow real endpoint/enum semantics rather than inventing UI states from whichever fields happen to be populated.

1. **Tenant onboarding and activation:** company registration, subdomain-availability check, OTP verification and one of the supported activation paths (manual approval, card or bank-transfer receipt) where these are present in the current API. Display a human explanation of pending approval; never show a numeric enum value to end users.
2. **Dynamic intake:** client enters company/facility and service information, legal identifiers such as Saudi CR/Unified 700 number when required, ISIC activity, facility size/location, and uploads relevant plans/permits. The form schema is server-driven and tenant/configuration-aware. Do not hard-code forms or the old area-based auto-routing rule.
3. **Submission and tracking:** submission generates a stable job number in the documented format `AMX-{YYYY}-{00000}` (confirm exact contract in OpenAPI), which is the anchor for customer-facing tracking and staff work.
4. **Manager triage:** where the current backend implements the triage gate, only the authorized management roles may accept/reject; rejection must include the required reason.
5. **Engineering review:** an authorized consulting engineer assesses regulatory/technical compliance (including the project’s SBC 801 scope) and may request revisions through the actual state machine.
6. **Quotation:** authorized roles prepare an itemized quote. The server owns arithmetic, rounding, VAT segregation, margin-floor enforcement and approval decisions. Client accepts/rejects through supported transitions.
7. **Payment and execution:** support the real job-payment states and methods exposed by the API. Acceptance must not add invented extra buttons or duplicate transitions. The project turns into a Work Breakdown Structure (sections/sprints/tasks) as specified by the API.
8. **Field operations and evidence:** authorized workers execute assigned tasks, attach obstacles/evidence, and submit site photos. The backend validates image metadata and proximity to the facility. The documented baseline is a 300 m geofence and a 6 h EXIF time guard; verify current backend behavior before surfacing exact messages. Image compression or canvas processing must not silently strip EXIF.
9. **Ledger and spending control:** show expenses, approved labor/materials, ceilings and escalation states from backend responses. Internal labor and contractor cost behavior comes from domain rules; the UI must not recalculate authoritative profitability.
10. **Closure and immutability:** reflect the real punch list, inspection, client signature then company countersignature, sealed status and archive workflow. A sealed project is immutable at the backend boundary; suppress edit actions rather than inviting guaranteed failures.
11. **Tax invoices:** display server-generated invoice data, segregated VAT, QR/hash-chain information when available. Do not claim ZATCA filing/submission if only invoice generation is implemented.
12. **Maintenance, subscriptions and notifications:** integrate only the current real endpoints and status fields. The repository describes recurring quarterly maintenance visits and subscription/quotas/expiry, but the AI must confirm the deployed implementation. In-app notifications are distinct from external email/SMS/WhatsApp delivery.

## 5. White-label experience

Every company portal should feel like a coherent product belonging to that company, not a logo pasted onto the Amanix default UI. Subject to the real branding contract, apply company logo, favicon, palette, public contact information, welcome/about content, social links, SEO title/description/keywords, canonical URL and Open Graph metadata. The branding schema’s maps may be open-ended; use known keys and tolerate unknown keys without crashing.

Load public branding before the first tenant-branded render where the framework supports server rendering. Use CSS variables/design tokens rather than spreading tenant colors through component styles. Revalidate branding after a successful save. An unresolved or inactive tenant must not receive fabricated identity or the default tenant’s private data; show a deliberate not-found/suspended state based on what the API actually reveals.

Custom domains and DNS/SSL binding must be treated as a capability to verify in current backend code and docs—not something the UI may simulate if the API does not support it yet.

## 6. Localisation, geography and currency

- Arabic is the primary/default language in the project requirements; English must also be complete.
- Set correct `lang` and `dir` values and test genuine RTL layouts, mixed Arabic/Latin identifiers, numbers, dates, tables, navigation and dialogs. A mirrored CSS screenshot alone is not enough.
- Send `Accept-Language: ar|en` on every API request, including public/anonymous calls, so server messages and validation errors match the selected language.
- Store and transmit dates as the API specifies (typically ISO-8601); render them in the user’s configured/local zone without silently changing the instant.
- Use tenant financial policy and server-returned currency/amount values. Never hard-code a universal 15% VAT, margin, commission, or currency assumption into calculations.

## 7. Product limitations to disclose honestly

The backend’s frontend guide last verified on 2026-10-13 states that Dev/Staging expose test OTP/invitation values in responses, payments for subscriptions are not built, and external email/SMS transport is not genuinely configured/sent. Its system overview also notes that generated invoices are not the same as ZATCA submission. Reconfirm all these limitations on the current branch and staging environment. The UI must not promise an unbuilt integration or expose development conveniences in production.
