# Amanix Full-Stack Integration Roadmap

**Target Staging Base:** `https://amanixapi-001-site1.ktempurl.com/api/v1`  
**Scalar Reference:** `https://amanixapi-001-site1.ktempurl.com/scalar/v1`  
**OpenAPI Schema:** `https://amanixapi-001-site1.ktempurl.com/openapi/v1.json`  
**Integration Branch:** `feature/full-stack-integration`  
**Status:** In Active Execution  

---

## Phase 0: Workspace Sync, Audit & Staging Scalar Ingestion
- [x] Fetch all remote tracking branches (`git fetch --all --prune`) on both backend and frontend repositories.
- [x] Create and checkout dedicated branch `feature/full-stack-integration` across both repositories.
- [x] Pull latest commits (`origin/main` for backend, `origin/integrations` for frontend).
- [x] Deep Backend Audit: Inspect 21 `.http` files, C# domain models, enums, controllers, and `Docs/frontend/` guides.
- [x] Staging API verification: Verify live staging health (`/api/v1/diagnostics/ping`), download OpenAPI schema.
- [x] Type generation: Generate strict TypeScript definitions into `src/types/api.generated.ts` using `openapi-typescript`.
- [x] Add `"gen:api"` command into `package.json`.
- [x] Reconcile discrepancies and establish documentation artifacts.

---

## Phase 1: Core Client Infrastructure, i18n & Theming Engine
- [x] **Enterprise HTTP Client (`src/services/api-client.ts`, `src/services/http.ts`)**:
  - [x] Unified Axios client with global request/response interceptors.
  - [x] Automatic injection of `Authorization: Bearer <accessToken>` and `Accept-Language: ar|en`.
  - [x] `X-Tenant-Domain` injection for pre-auth tenant scoping.
  - [x] Single-flight mutex token refresh queue on `401 Unauthorized` with request replay.
  - [x] Standardized `ApiEnvelope<T>` unwrapper and typed RFC 7807 `ApiError` normalization.
- [x] **Dynamic White-Label Theme Provider (`src/lib/server-tenant.ts`, `src/lib/theme-utils.ts`, `src/components/theme/`)**:
  - [x] Tenant host resolution (`subdomain.amanix.com`, `subdomain.localhost:3000`).
  - [x] Server-side retrieval of `GET /api/v1/tenants/settings/public-branding` with fallback and cache revalidation.
  - [x] Dynamic injection of CSS variables (`--color-primary`, `--color-secondary`, `--color-accent`) into `:root`.
  - [x] Custom font loading and favicon injection without Cumulative Layout Shift (CLS).
- [x] **Internationalization (i18n) Engine**:
  - [x] Arabic (RTL) as primary default; English (LTR) as secondary.
  - [x] Dynamic switching of `dir="rtl"` / `dir="ltr"` and `lang` on `<html>`.
  - [x] Locale-aware currency (SAR), Hijri/Gregorian date, and number formatters.

---

## Phase 2: Authentication, Tenant Context & Session Management
- [x] **Low-Level Identity Endpoints (`src/domains/auth/api.ts`)**:
  - [x] Tenant login `POST /api/v1/auth/login`.
  - [x] Token refresh `POST /api/v1/auth/refresh-token`.
  - [x] Remote logout revocation `POST /api/v1/auth/logout`.
  - [x] Password recovery `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password`.
  - [x] Client self-registration `POST /api/v1/auth/register-client` and OTP verification `POST /api/v1/auth/verify-client-otp`.
  - [x] Platform and tenant invitation acceptance (`/auth/accept-platform-invitation`, `/auth/accept-tenant-invitation`).
- [x] **Session & Permission Store (`src/providers/AuthProvider.tsx`, `src/lib/auth-storage.ts`)**:
  - [x] Dual-storage synchronization between `localStorage` and `document.cookie` (`httpOnly` compatible).
  - [x] Multi-tenant session hydration via concurrent `GET /api/v1/me` and `GET /api/v1/auth/permissions/me`.
  - [x] Granular reactive helpers: `can(permission)`, `hasRole(role)`, `isTenantAdmin()`.
- [x] **Route Protection Middleware (`src/middleware.ts`, `src/app/(dashboard)/layout.tsx`)**:
  - [x] Server-side host and tenant resolution.
  - [x] Client/server role and permission validation before layout rendering.

---

## Phase 3: Tenant Admin, Dynamic White-Labeling & RBAC/PBAC
- [x] **White-Label Customizer (`src/domains/settings/`, `src/app/(dashboard)/settings/`)**:
  - [x] Tenant branding settings UI with live color picker preview and preset palette selector.
  - [x] Logo and favicon asset uploader.
  - [x] Company profile settings (Commercial Registration, 700 Number, VAT number, Civil Defense license).
  - [x] Organization contact information and SEO/Open Graph metadata management.
  - [x] Segregation of Duties: `DeputyAdmin` read-only enforcement on sovereign branding and financial policies.
- [x] **RBAC & PBAC Management Console (`src/domains/users/`, `src/features/staff-admin/`)**:
  - [x] Staff user directory with pagination, debounced search, and status filtering.
  - [x] User invitation flow with role assignment based on backend permission catalogue.
  - [x] Per-user permission overrides and toggle grids (`PUT /api/v1/tenant-users/{id}/permissions`).
  - [x] User activation/deactivation (`PUT /api/v1/tenant-users/{id}/status`).

---

## Phase 4: Dynamic Intake Engine & JSON Form Schema Renderer
- [x] **Schema-Driven Form Generator (`src/components/forms/schema-form-renderer.tsx`)**:
  - [x] Consumes backend workflow templates (`GET /api/v1/workflow-templates`).
  - [x] Dynamic field controls: text, number, select, multi-select, date, file upload, checkboxes.
  - [x] Dynamic dependency evaluation and conditional field display.
  - [x] Client-side validation matching backend schema validation rules.
- [x] **Intake Submission Pipeline (`src/domains/requests/`, `src/app/(dashboard)/requests/new/`)**:
  - [x] Multi-step intake wizard with service category selection (`Licensing`, `Maintenance`, `Contracting`).
  - [x] Draft initialization (`POST /api/v1/intake`) and auto-saving (`PUT /api/v1/intake/{id}`).
  - [x] Document and architectural drawing upload (`POST /api/v1/intake/{id}/documents`).
  - [x] Formal submission with SLA timer ignition and sovereign transaction ID allocation (`POST /api/v1/intake/{id}/submit`).

---

## Phase 5: Engineering Desk & Operational Triage Workflow
- [x] **Operational Triage Dashboard (`src/app/(dashboard)/requests/`, `src/features/triage/`)**:
  - [x] High-density data tables with sorting, multi-attribute filtering, debounced search, and pagination.
  - [x] Role-specific status-lane view (Kanban) and split-screen detail views.
  - [x] Administrative triage actions: Accept (`POST /api/v1/intake/{id}/accept`), Return for Revision (`POST /api/v1/intake/{id}/reject`).
- [x] **Engineering Review & Quotation Desk (`src/app/(dashboard)/blueprint-review/`, `src/app/(dashboard)/quotations/`)**:
  - [x] SBC 801 Saudi Building Code compliance verdicts (`Compliant`, `RequiresModifications`, `Rejected`) restricted strictly to `ConsultingEngineer`.
  - [x] Quotation line-item builder with dynamic costing (materials, labor, equipment).
  - [x] Two-tier quotation authorization: Preparation by Engineer/Sales, Issuance by Admin/DeputyAdmin with margin floor checks.
  - [x] Client quotation approval/rejection lifecycle.

---

## Phase 6: Field Execution, EXIF Auditing & S3 Upload Pipeline
- [x] **Field Resource & Equipment Management (`src/domains/field-ops/`)**:
  - [x] Field worker roster with internal/external classification and hourly/daily cost rates.
  - [x] Equipment and machinery registry with ownership tracking (`CompanyOwned`, `Rented`, `NewlyPurchased`).
  - [x] Resource approval queue for field personnel and machinery requests.
- [x] **Field Execution & WBS (`src/app/(dashboard)/execution/`)**:
  - [x] Work Breakdown Structure (WBS) with sprints and milestones.
  - [x] Task assignment, status transitions (`Start`, `Submit`, `Review`).
  - [x] Obstacle and blocker reporting with escalation triggers (`POST /api/v1/field-tasks/{id}/obstacles`).
- [x] **Auditable Media Upload & EXIF Verification**:
  - [x] Client-side EXIF metadata extraction (GPS latitude/longitude, timestamp, camera model) preserving byte integrity.
  - [x] Geotag verification indicator showing alignment with assigned job site geofence.
  - [x] Administrative justification workflow for flagged or stripped metadata (`POST /api/v1/field-photos/{id}/justify`).

---

## Phase 7: Financial Governance & ZATCA Invoicing Module
- [x] **Project Ledger & Cost Tracking (`src/domains/payments/`, `src/app/(dashboard)/expenses/`)**:
  - [x] Direct cost ledger tracking labor hours, subcontractor expenses, and materials.
  - [x] Expense recording with receipt attachments and spending ceiling enforcement.
  - [x] Client payment gateway supporting electronic card, bank transfer receipt, and on-site cash collections.
- [x] **Legal Closure & Digital Sealing Vault (`src/domains/closure/`, `src/app/(dashboard)/certificates/`)**:
  - [x] Pre-closure readiness evaluation and punch list inspection (SBC 801 criteria).
  - [x] Dual-party digital signature capture (Client + Company Manager).
  - [x] Official closure certificate generation (`CRT-YYYY-NNNNN`) and irreversible project sealing.
- [x] **ZATCA-Compliant Invoicing (`src/domains/invoices/`, `src/app/(dashboard)/invoices/`)**:
  - [x] Saudi ZATCA Phase 2 e-invoicing layout (bilingual Arabic/English).
  - [x] Cryptographic hash, UUID, invoice counter, and Base64 TLV QR code rendering.
  - [x] Accurate tax breakdown (VAT rate from tenant financial policy, subtotal, discount, total).
  - [x] Print and PDF stylesheet optimization with clean page margins and hidden UI chromes.

---

## Phase 8: Hardening, E2E Verification, Responsive Audit & Push
- [x] Full responsive verification (Mobile 360px, Tablet 768px, Desktop 1080p, Ultrawide 1440p+).
- [x] Defensive UI states audit across all views: Skeleton Loading, Empty State, Error Banner, Success Toast.
- [x] Cross-tenant data isolation and multi-domain resolution verification.
- [x] Production build validation (`npm run build` and `npx tsc --noEmit`).
- [x] Git atomic commits and push to `origin/feature/full-stack-integration`.
- [x] Executive Arabic Integration Report.
