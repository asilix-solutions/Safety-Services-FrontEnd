# SSLM MVP Status Report

> ## ⚠️ SCOPE DECISION — 2026-08-01 (supersedes this report where they conflict)
>
> **MVP scope = the licensing cycle. That cycle is complete.**
> Request intake → classification → blueprint review → quotation → invoice → payment →
> project execution (procurement, labor, photos, obstacles) → signature-locked closure →
> final inspection → certificate → contract. Sessions 1–22 closed the gaps this report
> lists as P-critical below.
>
> **Maintenance is DEFERRED to a post-MVP phase.** The maintenance-contract system
> (contract creation from approved 150–1000 m² requests, quarterly visit scheduling, the
> 4 periodic visits, visit completion) is **intentionally not built**. See
> **`docs/BACKLOG.md`** for the full record.
>
> The rule engine already routes 150–1000 m² to the maintenance track
> (`classifyRequest` → `"maintenance_strategy"` / queue `MAINTENANCE`) and correctly
> stops there. **A routed request producing no maintenance contract is a product-scope
> decision, not a bug.**
>
> The body of this report is a snapshot dated 2026-07-08 and is **stale** on
> completion percentages and on the procurement / labor / photos / signature-closure
> rows. It is kept for its SRS grounding and its structural findings.

_Generated: 2026-07-08 — read-only audit. Sources: `docs/srs/(Software Requirements Specification - SRS).pdf` (Arabic original, text extraction partially garbled by RTL reflow — used only for MVP-boundary/roadmap corroboration), `docs/srs/Safety Services & Licensing Management System.pdf` (English SRS, FR-ID numbered, primary grounding source, cited as `SRS §n` / `FR-XXX-NN`), `docs/architecture/RECONCILIATION.md`, ADR-001..006, `docs/analysis/PROJECT_ANALYSIS.md`, `docs/debt/ANY_BACKLOG.md`, and the code on disk as of this commit._

> Note on SRS grounding: the English SRS (`Safety Services & Licensing Management System.pdf`) describes a **full backend SaaS platform** (multi-tenant DB, Redis, WebSocket chat, government integrations, TOTP MFA, S3 object storage). `CLAUDE.md` and `RECONCILIATION.md` explicitly scope this repository to a **frontend-only MVP with LocalStorage mock persistence**, excluding all of that infrastructure. Every "required per SRS" claim below is filtered through that MVP boundary — features whose SRS description is inherently backend/infra (multi-tenant DB, Redis, WebSocket, government API, real MFA) are marked POST-MVP regardless of SRS priority, per `CLAUDE.md` "MVP Boundaries."

---

## 1. Executive Summary

- **Overall MVP completion: ~50-55%** (revised down from an initial 60-65% pass on this report after direct file reads of the field-execution tabs — see corrections marked throughout §2/§4/§5). The **domain layer is the strongest part of the codebase** — 13 of 13 needed domains exist with real `storage.ts`/`workflow.ts` (`certificates, contracts, customers, employees, invoices, payments, projects, quotations, reports, requests, settings, site-visits`, plus shared `workflow-validation/` and legacy `workflows/`), and the core paid lifecycle (Request → Quotation → Payment → Project → Certificate) is wired end-to-end for the roles that drive it (Client, Consulting Engineer, Company Admin).
- **The Operations Officer — the SRS's central field-execution actor (UC-03) — cannot actually close a project today.** The project workspace has 11 tab shells, but direct reads of each tab file show `procurement-tab.tsx`, `labor-tab.tsx`, and `photos-tab.tsx` are all 17-line components rendering nothing but an `EmptyState` placeholder, and no signature/canvas capture code exists anywhere in `features/projects` to produce the mandatory signed closure artifact. This is the single most consequential finding in this report: the tab *navigation* structure being complete had previously been mistaken for the *features* being complete.
- **Biggest structural gap: 8 of 26 feature folders are pure `.gitkeep` scaffolding with zero implementation** — `analytics`, `auth`, `chat`, `engineering`, `licenses`, `maintenance`, `sales`, `tracking` — and their matching routes (`/analytics`, `/calendar`, `/commissions`, `/leads`, `/messages`, `/pipeline`, `/profile`, `/tracking`, `/maintenance`) all call `notFound()`. SRS-required capabilities behind them (BI dashboards `FR-COM-05`, live milestone tracking `FR-COM-02`, recurring-maintenance scheduling `FR-OPS-09`, Sales Agent CRM pipeline `FR-RUL-02`, TOTP MFA `NFR-SEC-05`) are simply absent.
- **Sales Agent has no real workspace.** The role exists in RBAC/nav (`Customers`, `Requests`, `Projects` links) but has no dedicated feature beyond `sales-agent-overview` (a 3-file dashboard-only stub) and the fully-empty `features/sales/` scaffold — the SRS's sales-CRM-pipeline requirement (`FR-RUL-02`, medium-scale routing → "push to sales CRM pipeline") has no UI at all.
- **Architecture drift from the app's own ADRs**: several route pages (`requests/[jobNumber]/page.tsx` 791 lines, `quotations/[jobNumber]/page.tsx` 512 lines, `quotations/approvals/[jobNumber]/page.tsx` 511 lines, `requests/page.tsx` 259 lines, `quotations/page.tsx` 236 lines, `projects/page.tsx` 108 lines) contain real business/data logic and direct `domains/*/storage.ts` calls, violating the "thin page wrapper" rule in `project-tree.md` and ADR-004's Route→Shell→Hook chain that the newer `projects/project-workspace` code follows correctly.
- **Cross-cutting health is mixed**: RBAC is centrally *defined* well but not consistently *used* — 21 call sites still hardcode `role === "..."` in feature hooks/pages instead of the central config. i18n/RTL/theme-token infra is real, but grep-verified backlogs remain open (84 RTL-unsafe classes, 30 hardcoded-color classes, 84 `any` occurrences essentially flat against the 86 documented in `ANY_BACKLOG.md`). 5 legacy routes (`documents`, `execution`, `expenses`, `labor`, `obstacles`) are deprecated redirect shims that should eventually be deleted.
- **No blocking build-gate issue today**: directly confirmed against `next.config.ts` — `eslint.ignoreDuringBuilds`/`typescript.ignoreBuildErrors` are correctly env-gated behind `NEXT_DISABLE_BUILD_CHECKS` (default `false`), matching `RECONCILIATION.md` D4 step 1 exactly.

---

## 2. Lifecycle Table

Lifecycle per `CLAUDE.md`: `DRAFT → SUBMITTED → UNDER_REVIEW → QUOTATION → PAYMENT_CONFIRMED → PROJECT_CREATED → FIELD_EXECUTION → FINAL_INSPECTION → COMPLETED`.

| Stage | Domain exists? | UI exists? | Wired? | Role-gated? | Status | Evidence |
|---|---|---|---|---|---|---|
| Request intake (DRAFT/SUBMITTED) | ✅ `domains/requests/{storage,workflow,mappers}.ts` | ✅ `features/requests/client-request-wizard/` | ✅ `app/(dashboard)/requests/new/page.tsx` mounts `ClientRequestWizard` | ✅ Client + Sales Agent + Consulting Engineer see `/requests` in `ROLE_NAVIGATION` | **BUILT** | `SRS FR-INT-01` (intake wizard: CR/700, area, GPS) |
| Auto-routing by area/ISIC (`UNDER_REVIEW`) | ✅ routing logic referenced in `domains/requests` + `service-config.ts` | ✅ `wizard-step-classification.tsx` | ✅ | n/a (system) | **BUILT** (area-band routing); ISIC hazard-matrix depth [UNVERIFIED — not traced line-by-line] | `SRS FR-RUL-01/02/03/04/05` |
| Request detail / review | ✅ | ✅ `app/(dashboard)/requests/[jobNumber]/page.tsx` (791 lines — business logic in the page itself, not a thin wrapper) | ✅ | ✅ role nav | **BUILT but architecture-drifted** | violates `project-tree.md` "Pages must remain thin wrappers" |
| Blueprint review (Consulting Engineer) | engineering logic lives inside `domains/engineering` + `domains/requests`, not a separate route domain | ✅ `features/blueprint-review/` (15 files: queue, workspace, viewer, notes-card, view-model, 2 hooks) | ✅ `app/(dashboard)/blueprint-review/[page,[jobNumber]]/page.tsx` | ✅ Consulting Engineer only in nav | **BUILT** | `SRS FR-CON-01/02` (workspace, Approve/Return) |
| Quotation (builder, VAT, approval) | ✅ `domains/quotations/{storage,workflow.ts + workflow/ (9 files)}` | ✅ `quotations/page.tsx`, `quotations/[jobNumber]/page.tsx` (builder, 512 lines), `quotations/approvals/{page,[jobNumber]}.tsx` | ✅ | ✅ Company Admin (approvals), Consulting Engineer (builder) | **BUILT but architecture-drifted** (heavy logic in page files) | `SRS FR-CON-03..07`; VAT rule ZATCA 15% in `CLAUDE.md` |
| Invoice | ✅ `domains/invoices/{storage,mappers,workflow}.ts` | ✅ `features/invoices/invoice-list/` | ✅ `app/(dashboard)/invoices/page.tsx` | ✅ Company Admin, Client | **BUILT** | `SRS FR-OPS-04` (VAT/expense logic partitioned) |
| Payment confirmation | ✅ `domains/payments/{storage,workflow}.ts` | ⚠️ no dedicated `/payments` route or `features/payments/*` UI folder found — payment confirmation appears to be an action inside invoice/quotation flows, not a standalone screen | ⚠️ [UNVERIFIED — not traced to a specific button/dialog] | — | **PARTIAL** | domain exists, but no first-class "Payments" nav item or feature folder — cross-check against `SRS FR-OPS-03` "On Paid/Financially-Confirmed status, auto-create project" |
| Project auto-creation → 3 silos | ✅ `domains/projects/workflow/` (12 files incl. state-machine, transitions, kickoff, sync) | ✅ | ✅ | ✅ | **BUILT** | `CLAUDE.md` rule "auto-create project split into Alarm/Suppression/Ventilation"; `SRS FR-OPS-03` |
| Project workspace (field execution) | ✅ | ✅ `features/projects/project-workspace/` — the Golden Reference (ADR-004), 62 files: 11 tabs, hooks, view-models, components | ✅ `app/(dashboard)/projects/[projectId]/page.tsx` (thin, correctly follows ADR-004) | ✅ per-tab RBAC via `PROJECT_WORKSPACE_TAB_ACCESS` (`constants/permissions.ts`) | **PARTIAL** — the shell/architecture is the most mature part of the app, but 3 of 11 tabs (procurement, labor, photos) are empty-state stubs and a 4th (signature closure) has no capture UI at all — see the 4 rows immediately below | `SRS §UC-03`, `FR-OPS-01..11` |
| Procurement / VAT logic | ⚠️ no procurement-specific fields in `domains/employees`/`domains/payments`; only `domains/invoices` VAT | ❌ `tabs/procurement-tab.tsx` is 17 lines, renders `<EmptyState icon={<ShoppingCart/>} .../>` only — verified by direct read, no form, no state, no data | — | — | **STUB, not BUILT** (correction: this row was previously marked BUILT on the mistaken assumption that the tab's existence implied a working feature) | `SRS FR-OPS-04` |
| Labor governance (W2/Outsource) | ❌ no wage/W2/outsource field anywhere in `domains/employees/types.ts` (verified by direct read — 20 lines, no such fields) | ❌ `tabs/labor-tab.tsx` is 17 lines, renders `<EmptyState icon={<HardHat/>} .../>` only — verified by direct read | — | — | **STUB, not BUILT** (same correction as above) | `SRS FR-OPS-06/07` |
| Obstacle logging | ✅ | ✅ `obstacles` tab wired to real `ObstacleList` component + `ObstaclesViewModel` — verified by direct read | ✅ | ✅ | **BUILT**; webhook broadcast is POST-MVP (no backend) | `SRS FR-OPS-08` |
| Site visits / scheduling | ✅ `domains/site-visits/{storage,types}.ts` (no `workflow.ts`) | ✅ `features/site-visits/site-visits-list/`, `tabs/site-visits-tab.tsx` (211 lines, real) | ✅ `app/(dashboard)/site-visits/page.tsx` | ✅ Consulting Engineer, Operations Officer | **BUILT** (list); calendar/drag-drop scheduling UI (`FR-OPS-01`) → route `/calendar` is `notFound()` | `SRS FR-OPS-01` |
| Photo capture (installation photos) | ❌ no photo/camera/EXIF concept in any domain | ❌ `tabs/photos-tab.tsx` is 17 lines, renders `<EmptyState icon={<Camera/>} .../>` only — verified by direct read | — | — | **STUB** | `SRS FR-OPS-05` |
| Signature/closure capture | ⚠️ `domains/projects/workflow/completion.ts` gates on `executionPhase === "COMPLETED"` but no signature artifact type | ❌ `tabs/completion-tab.tsx` (24 lines) shows a static `ProjectCompletedCard` only when already complete; zero hits for `signature`/`canvas` anywhere in `features/projects` (grep-verified) — no capture UI exists to ever *reach* that completed state per the SRS flow | — | — | **MISSING, not BUILT** (correction: no canvas signature pad exists anywhere in the codebase) | `SRS FR-OPS-10` |
| Final inspection | ✅ | ✅ `features/projects/final-inspection/` (checklist, summary, hook) | ✅ | ✅ | **BUILT** | `SRS FR-OPS-11` |
| Certificate issuance | ✅ `domains/certificates/{storage,workflow,constants,types}.ts` | ✅ `features/certificates/` | ✅ `app/(dashboard)/certificates/page.tsx` | ✅ all roles per nav | **PARTIAL**: certificate *records* (list, actions, status) are built; PDF generation with watermark/tamper-proof signature fusion is grep-verified **missing** (zero `watermark`/`signature`/PDF-generation hits in `domains/certificates` or `features/certificates`) | `SRS FR-CON-05/07` |
| Contracts | ✅ `domains/contracts/{storage,workflow,mappers}.ts` | ✅ `features/contracts/contract-list/` | ✅ `app/(dashboard)/contracts/page.tsx` | ✅ Company Admin, Consulting Engineer, Client | **BUILT** | — |

---

## 3. Feature-Area Inventory

| Area | Status | Evidence | MVP-critical? |
|---|---|---|---|
| `features/projects` (incl. `project-workspace`, `final-inspection`) | **PARTIAL** | 62 files, ADR-004 golden reference architecture; but 3 of 11 workspace tabs (procurement, labor, photos) are `EmptyState` stubs and closure has no signature-capture UI (see §2) | Yes |
| `features/requests` (incl. `client-request-wizard`) | **BUILT** | 9 files + wizard steps | Yes |
| `features/blueprint-review` | **BUILT** | 15 files | Yes |
| `features/invoices` (`invoice-list/`) | **BUILT**; dead flat `features/invoices/components/*` duplicate flagged for deletion in `RECONCILIATION.md` §4/§6 | 11 files | Yes |
| `features/contracts` (`contract-list/`) | **BUILT**; same dead flat-folder issue as invoices | 12 files | Yes |
| `features/certificates` | **BUILT** | 7 files | Yes |
| `features/customers` | **BUILT** | 16 files (7 are unrelated stub subfolders: `constants/`, `services/`, `utils/` etc. — real code lives in `components/`, `hooks/`) | Yes |
| `features/employees` | **BUILT** | 9 files (dialogs, drawers, hooks) | Yes (Company Admin/Ops staff mgmt) |
| `features/reports` | **BUILT** | 13 files incl. `report-drawer.tsx`, `use-reports-hub.ts` | Yes |
| `features/settings` | **BUILT** | 19 files (tabbed: security, workspace, etc.) | Yes |
| `features/site-visits` | **BUILT** | 7 files | Yes |
| `features/dashboard` (per-role resolver + 6 dashboards) | **BUILT** | `dashboard-resolver.tsx` + `{client,company-admin,consulting-engineer,operations-officer,sales-agent,super-admin}-dashboard.tsx` all present and non-empty | Yes |
| `features/dashboard-overview` | **BUILT** | 12 files, shared overview-shell/cards used across role dashboards | Yes |
| `features/{client,company-admin,consulting-engineer,operations-overview,sales-agent-overview,super-admin-overview}` | **BUILT** (thin, 3 files each) | role-specific dashboard entry components | Yes |
| `features/analytics` | **STUB** (.gitkeep only) | route `/analytics` → `notFound()` | No (POST-MVP-ish: BI dashboards are `FR-COM-05`, arguably MVP per SRS but explicitly scaffolded, not started) |
| `features/auth` | **STUB** (.gitkeep only) | login itself is handled ad hoc in `app/(auth)/login/page.tsx` (236 lines) + `providers/AuthProvider`, not via this feature folder — folder is dead scaffold | No functional gap (auth works, just not through this stub) |
| `features/chat` | **STUB** | route `/messages` → `notFound()` | No — `FR-COM-03` WebSocket chat is explicitly POST-MVP per `CLAUDE.md` ("No chat") |
| `features/engineering` | **STUB** | no route references it; real engineering-review UI lives in `blueprint-review` instead | No (naming leftover, not a gap) |
| `features/licenses` | **STUB**, but `RECONCILIATION.md` §5 flags it as the intended next reference build (has `types/license.ts`, `schemas/license.schema.ts`, `mock/licenses.ts` already) | no route/nav entry | **Yes, per SRS** — but "licenses" as a distinct product concept overlaps heavily with "certificates" (already built); needs a scoping decision, not blind implementation |
| `features/maintenance` | **STUB** | route `/maintenance` → `notFound()` | Yes — `FR-OPS-09` recurring quarterly maintenance scheduling has zero UI |
| `features/sales` | **STUB** | no dedicated route; `sales-agent-overview` covers only the dashboard | Yes — `FR-RUL-02` sales CRM pipeline (`/pipeline`, `/leads`, `/commissions` all `notFound()`) is entirely missing |
| `features/tracking` | **STUB** | route `/tracking` → `notFound()` | Partial — client-facing milestone tracking (`FR-COM-02`) may be partially covered by `projects/project-workspace` `timeline` tab for logged-in clients, but there's no standalone Job-Number tracking view for the "track by Job Number" SRS flow |
| Deprecated routes: `documents`, `execution`, `expenses`, `labor`, `obstacles` | **DEAD CODE** | all 5 are `redirect("/projects")` shims explicitly marked `@deprecated TEMPORARY` | No — cleanup item, not a gap |
| Deprecated routes: `activities`, `calendar`, `commissions`, `leads`, `messages`, `pipeline`, `profile`, `tracking`, `analytics`, `maintenance` | **DEAD/UNBUILT ROUTES** | all call `notFound()`, none linked in `ROLE_NAVIGATION` | Mixed — `profile`/`activities` look like abandoned scaffolding; the rest map to real unbuilt SRS features (see above) |
| `shared/ui` primitives | **PARTIAL** | only 10 of the needed shadcn primitives exist (avatar, badge, button, card, checkbox, dropdown-menu, input, label, select, textarea); dialog/tabs/tooltip/popover/sheet/table/separator/skeleton are hand-rolled per-feature, no Radix packages installed | Yes — flagged in `RECONCILIATION.md` D2, not yet executed |
| `services/api-client.ts` | **BUILT but unused** | axios instance + interceptors exist, correctly not called anywhere (no real backend yet) | No — correct MVP state per D1 |
| RBAC (`constants/permissions.ts`) | **BUILT** | 6 roles, `ROLE_PERMISSIONS`, `PROJECT_WORKSPACE_TAB_ACCESS`, `PROJECT_WORKSPACE_ROLE_CONFIG` all centralized | Yes |

---

## 4. Per-Role Journey Table

| Role | Can complete SRS journey today? | Blocking gap |
|---|---|---|
| **Client** | **Partial** — submit request (`/requests/new`) → track (`/requests/[jobNumber]`) → view quotation/contract/invoice/certificate → view project workspace (read-only tabs: overview, timeline, photos, siteVisits, completion) per `PROJECT_WORKSPACE_TAB_ACCESS`. | The `photos` tab the client is granted access to is itself an empty stub (see §2 correction) — client cannot actually see live installation photos as SRS promises; no standalone "track by Job Number" public view (must be logged in). |
| **Consulting Engineer** | **Yes for the core loop** — receives requests, reviews blueprints (`blueprint-review`), builds/approves quotations, participates in project workspace (overview/timeline/systems/siteVisits/inspection/attachments, read-only). | Snippet library (`FR-CON-04`, reusable text arrays) and rich-text/WYSIWYG report editor (`FR-CON-03`) depth not verified in `blueprint-review` or `reports` feature — grep-checked (`tiptap`/`ckeditor`/`wysiwyg`/`snippet`), zero real hits found, so treat as **MISSING** not just unverified. |
| **Operations & Projects Officer** | **No — blocked at the core of UC-03** (correction from an earlier pass of this report that marked this role fully served). Officer has edit access to all 11 tabs, but **3 of the role's defining tabs — procurement, labor, and the missing signature-capture step for completion — are empty-state stubs**, verified by direct file read (`procurement-tab.tsx`, `labor-tab.tsx` are 17-line `EmptyState`-only components; no signature/canvas capture exists anywhere in `features/projects`). | Cannot record vendor invoices/VAT (`FR-OPS-04`), cannot enter labor/wage data or confirm outsource settlement (`FR-OPS-06/07`), cannot upload installation photos (`FR-OPS-05`), and cannot produce the signed/stamped closure artifact that legally closes a project (`FR-OPS-10`) — the officer cannot complete UC-03 end-to-end today despite the workspace shell being the most structurally complete part of the app. Recurring maintenance scheduling (`FR-OPS-09`) is also missing (`features/maintenance` is a stub). |
| **Company Admin** | **Mostly yes** — requests, quotation approvals, customers, employees, reports, contracts, certificates, invoices, settings, and read-only project workspace (all tabs, `canEdit:false`) are all built and in nav. | Executive BI dashboard (`FR-COM-05`, Chart.js/Recharts month-over-month by silo) — `/analytics` is `notFound()`; `dashboard/company-admin-dashboard.tsx` may cover some KPIs but the dedicated analytics screen described in the SRS does not exist. |
| **Sales Agent** | **No — largest gap.** Has Dashboard, Customers, Requests, and read-only Projects (`overview` tab only) in nav, but no CRM pipeline. | `FR-RUL-02` (medium-scale requests "push to sales CRM pipeline for a site audit") and commission tracking (`SRS §2.3` "commission isolation") have zero UI — `/pipeline`, `/leads`, `/commissions` all `notFound()`; `features/sales/` is an empty stub. |
| **Super Admin** | **Partial** — Dashboard, Companies, Subscriptions, Users, Certificates, Settings pages exist but `companies`/`subscriptions`/`users` pages (`ExplicitModulePage`) render only a static "Workspace Node Information" card with no real CRUD/table (checked `companies/page.tsx`, `users/page.tsx`, `subscriptions/page.tsx` verbatim — no data table, no list, no actions). | Multi-tenant management (`FR-TEN-05/06`, Super Admin Matrix Dashboard + Suspend/Activate/tier controls) is explicitly POST-MVP (no real multi-tenant backend), but even the **mock/local UI shell for it is unbuilt** — these three pages are placeholders, not stubs-with-a-plan. |

---

## 5. Cross-Cutting Health

- **RBAC**: ⚠️ Mixed, corrected from an earlier pass of this report that found none. Centralized definitions are real and good (`constants/permissions.ts`: `ROLE_PERMISSIONS`, `hasPermission()`, `PROJECT_WORKSPACE_TAB_ACCESS`, `PROJECT_WORKSPACE_ROLE_CONFIG`), but **21 call sites still hardcode `user.role === "..."` / `role === "..."` directly in feature hooks and a page**, contradicting CLAUDE.md's "never hardcode role checks inside components" rule — grep-verified (`grep -rn 'role === "' src/features src/app src/shared`). Concrete examples: `features/certificates/hooks/use-certificate-list.ts:27,32,84`, `features/contracts/contract-list/hooks/use-contract-list.ts:28,82`, `features/customers/hooks/use-customer-list.ts:42-43`, `features/employees/hooks/use-employee-list.ts:25,40`, `features/invoices/invoice-list/hooks/use-invoice-list.ts:46`, `features/reports/hooks/use-reports-hub.ts:61-63`, `app/(dashboard)/layout.tsx:74,78`. One additional note: SRS `NFR-SEC-04` names roles (`Field Technician`, `Accountant`) that don't match the app's 6 roles (`Consulting Engineer`, `Operations Officer` instead) — an inconsistency inside the SRS itself between §2.3 and §4.7, not a code defect.
- **i18n**: ✅ Real and wired — custom `lib/i18n.ts`, cookie-driven `NEXT_LOCALE` via `src/middleware.ts` (defaults to `ar`), 10 namespaced JSON dictionaries per locale (`src/locales/{ar,en}/`), `useTranslation()`/`useNamespaceTranslations()` used throughout audited files. Not exhaustively scanned for hardcoded strings, but `companies/page.tsx`, `subscriptions/page.tsx`, `users/page.tsx` all have hardcoded English literals (`title="Safety Workspace Module"` etc., grep-verified: 4 files match `title="[A-Z]` in `app/`) — these are also the 3 fully-placeholder Super Admin pages, so fixing the placeholder fixes the i18n violation too.
- **RTL**: ⚠️ Grep-verified (was previously unscanned): **84 occurrences** of non-logical-direction Tailwind classes (`text-left`, `text-right`, `ml-*`, `mr-*`, `pl-*`, `pr-*`) remain across `src/**/*.tsx`, violating the "RTL-safe utilities only" rule. Not pervasive relative to codebase size, but a real, sizeable backlog — worth a dedicated sweep.
- **Theme tokens**: ⚠️ Grep-verified: **30 occurrences** of hardcoded Tailwind palette classes (`bg-white`, `bg-black`, `text-slate-*`, `bg-slate-*`, `text-gray-*`, `bg-gray-*`) remain across `src/**/*.tsx`, including `app/(dashboard)/layout.tsx`'s loading state (`bg-slate-950`, `border-indigo-500`, `text-slate-400` instead of `bg-background`/`text-muted-foreground`) — a file every authenticated user hits on every load.
- **`any` backlog**: ⚠️ Open, essentially flat. Grep-verified current count: **84** occurrences of `: any`/`as any` in `src/**/*.ts(x)`, against **86** documented in `docs/debt/ANY_BACKLOG.md` (2026-07-06) — no material progress since that snapshot. Lint rule is `warn`, not yet `error` — D4 step 3 ("flip once cleared") not yet executed.
- **Build gate**: ✅ Confirmed directly against `next.config.ts` (re-verified, not just taken from `ANY_BACKLOG.md`'s narrative): `eslint.ignoreDuringBuilds` / `typescript.ignoreBuildErrors` both read from `NEXT_DISABLE_BUILD_CHECKS` (default `false`), matching D4 step 1 exactly. Not a live risk as long as CI never sets that env var.
- **Hardcoded copy**: `companies/page.tsx`, `users/page.tsx`, `subscriptions/page.tsx` all contain raw English strings ("Safety Workspace Module", "Enterprise SaaS safety engineering...", "Secure Verification Node") not routed through `t()` — violates `CLAUDE.md`'s i18n rule. These are also the same 3 placeholder pages flagged in §4 as functionally empty, so fixing the placeholder *is* fixing the i18n violation.
- **ADR-005 (Dashboard KPI Strategy) is not actually followed**: grep-verified zero `getStats`/`getDashboardSummary`/`getKpi`/`getSummary`-style selectors anywhere in `src/domains`. Only two `getMerged*` selectors exist project-wide (`getMergedRequests`, `getMergedInvoices`). ADR-005 mandates dashboards/ViewModels compute KPI math via centralized domain selectors, not inline — this strongly suggests the 6 role dashboards and `dashboard-overview` are computing counts/sums inline instead, which is exactly the duplication/sync-risk pattern ADR-005 was written to prevent. Not individually traced per-dashboard here; worth a follow-up pass before more dashboards are built.
- **In-flight fix worth noting (uncommitted)**: the working tree has untracked `features/projects/project-workspace/components/overview/` (a new role-aware widget system: `widget-grid.tsx`, `kpi-row.tsx`, `action-panel.tsx`, etc.) and `helpers/overview.ts`, plus modified `constants/permissions.ts`. This appears to be a live rewrite of `overview-tab.tsx` (now 53 lines, down from the file that previously held several of the 21 hardcoded `role === "..."` sites and part of the `any` backlog) to read role-gating from a new `PROJECT_WORKSPACE_ROLE_CONFIG` in `permissions.ts` instead of inline checks — directionally exactly the RBAC-cleanup and `any`-cleanup work items 12/17 call for. Confirm this lands and re-run the RBAC/`any` grep counts after it's committed, since this report's counts may already be partially stale against the working tree.
- **Architecture-rule drift**: page-level business logic in `requests/[jobNumber]`, `quotations/[jobNumber]`, `quotations/approvals/[jobNumber]`, `requests/page.tsx`, `quotations/page.tsx`, `projects/page.tsx` — these predate or diverge from ADR-004's Route→Shell→Hook pattern that `project-workspace` correctly follows. `projects/page.tsx` calls `getProjects()` (a domain storage read) directly inside a page component with `useEffect`, bypassing the feature/hook layer entirely.
- **Dead code**: 5 deprecated redirect routes (`documents`, `execution`, `expenses`, `labor`, `obstacles`) and the flat orphaned `features/{contracts,invoices}/components/*` duplicates (flagged in `RECONCILIATION.md` §6, not yet deleted) — none of this blocks functionality, but it's accumulating.

---

## 6. Prioritized Remaining MVP Work

### P-critical (blocks a role's core SRS journey)

1. **Procurement tab (vendor invoice capture + 15% VAT taxable/exempt toggle + mandatory receipt photo)** — Area: `features/projects/project-workspace/tabs/procurement-tab.tsx` (currently a 17-line `EmptyState` stub) + a new domain/storage extension. Size: **L**. Why: `SRS FR-OPS-04` (High) — the Operations Officer cannot record any field expense today, which blocks downstream net-margin computation (`FR-COM-04`).
2. **Labor tab (W2-internal vs. outsource wage entry, Confirm Final Outsource Settlement)** — Area: same tab folder (currently a 17-line stub) + `domains/employees/types.ts` extension (has no wage/outsource concept today, verified by direct read). Size: **L**. Why: `SRS FR-OPS-06/07` (High) — this is a domain-model gap, not just a UI gap.
3. **Photo capture (live camera, client-side compression) for installation photos** — Area: `photos-tab.tsx` (currently a 17-line stub) + a new shared capture widget. Size: **M**. Why: `SRS FR-OPS-05` (High) — needed by both the Operations Officer (upload) and the Client (the `photos` tab the client is already granted read access to has nothing to show).
4. **Signature-locked project closure (canvas signature pad, disables Complete-Ticket until signed doc uploaded)** — Area: `completion-tab.tsx` (currently a static summary card only) + `domains/projects/workflow/completion.ts`. Size: **M**. Why: `SRS FR-OPS-10` (High) and UC-03 step 10 — this is the literal legal close-out gate for every project; without it no project can be closed per the SRS flow, and zero signature/canvas code exists anywhere in `features/projects` today (grep-verified).
5. **Sales Agent CRM pipeline** — `features/sales/` (build `sales-pipeline` or similar sub-feature) + wire `/pipeline`, `/leads`, `/commissions` routes + nav entries. Size: **L**. Why: `SRS FR-RUL-02` (medium-scale requests must push to sales pipeline) and the Sales Agent's entire reason for existing in the role list has no UI today.
6. **Super Admin tenant/company/user management screens** — replace the 3 `ExplicitModulePage` placeholders (`companies`, `users`, `subscriptions`) with real (mock-data-backed) list/detail/CRUD UI. Size: **M**. Why: `SRS FR-TEN-05/06` — even in a frontend-only MVP with mocked tenants, Super Admin currently cannot do anything role-specific; the pages are literally static cards, and are also the app's clearest i18n violation (hardcoded English copy).
7. **Payment confirmation UI** — confirm whether a first-class payment-confirmation screen/action exists; if not, build it in `features/payments/` (domain already exists: `domains/payments/{storage,workflow}.ts`). Size: **S–M**. Why: `SRS FR-OPS-03` — "On Paid/Financially-Confirmed status, auto-create project" is the pivot of the entire lifecycle (`CLAUDE.md`'s official state machine); if this is only reachable as a buried action inside another screen, it should be surfaced explicitly. [Flagged UNVERIFIED — first task of any follow-up should be to trace this precisely before sizing.]

### P-important (SRS-required, doesn't block a role's minimum journey)

8. ~~**Recurring maintenance scheduling** (`features/maintenance/`) — quarterly visit generation UI. Size: **M**. Why: `SRS FR-OPS-09`; domain-adjacent data may already exist via `site-visits`.~~ **→ REMOVED FROM MVP SCOPE (2026-08-01).** The whole maintenance-contract system is deferred post-MVP — see `docs/BACKLOG.md`. Do not pick this up as remaining MVP work.
9. **Company Admin analytics/BI screen** (`features/analytics/`) — month-over-month revenue/expense charts by silo, using existing `shared/charts/*` (Recharts wrappers already built). Size: **M**. Why: `SRS FR-COM-05`; the chart infra already exists and is unused for this purpose.
10. **`licenses` vs `certificates` scoping decision, then build** — per `RECONCILIATION.md` §5, `licenses` was earmarked as the reference build for the new convention but has zero UI; needs a product decision on whether it's a duplicate of `certificates` or a distinct SRS concept before building. Size: **S** (decision) + **M** (build).
11. **TOTP MFA** for admin/operations/cash accounts — Area: `features/auth/` (currently `.gitkeep`) + login flow. Size: **M**. Why: `NFR-SEC-05` is High priority and currently has zero implementation trace (`TOTP`/`mfa`/`authenticator` grep across `src/` → 0 hits).
12. **RBAC hardcoding cleanup** — move the 21 grep-verified inline `role === "..."` checks (see §5) into `constants/permissions.ts`-driven helpers. Size: **S–M**. Why: direct violation of `CLAUDE.md`'s RBAC rule, and a correctness risk every time a new role is added.
13. **Radix primitive migration** (`RECONCILIATION.md` D2) — install missing `@radix-ui/*` packages, generate `dialog.tsx`/`tabs.tsx`/`tooltip.tsx`/`popover.tsx`/`sheet.tsx`/`table.tsx`/`separator.tsx`/`skeleton.tsx`, migrate ~15 hand-rolled dialog/tab implementations. Size: **L**. Why: accessibility debt compounding with every new feature (`RECONCILIATION.md` D2 reasoning).
14. **Page-to-hook refactor for architecture-drifted routes** — `requests/[jobNumber]`, `quotations/[jobNumber]`, `quotations/approvals/[jobNumber]`, `requests/page.tsx`, `quotations/page.tsx`, `projects/page.tsx` — extract business logic into feature hooks per ADR-004. Size: **L**. Why: these are the largest files in the app-router tree and the biggest violation of the codebase's own binding ADRs.
15. **RTL/theme-token sweep** — 84 non-logical-direction classes + 30 hardcoded-color classes, grep-verified (see §5), including `app/(dashboard)/layout.tsx`'s loading state. Size: **M** (mechanical but wide).
16. **i18n the 3 Super Admin placeholder pages** — folds into P-critical item 6's rebuild.
17. **Clear the ~84-occurrence `any` backlog and flip `no-explicit-any` to `error`** (`ANY_BACKLOG.md` D4 step 3). Size: **L** (spread across 43 files) but mechanical.

### P-nice (cleanup, no functional gap)

18. **Certificate PDF generation with watermark + locked signature fusion** (`FR-CON-05/07`) — Area: `domains/certificates/workflow.ts`. Size: **M**. Why: High priority in SRS but doesn't block any role's *minimum* journey since a certificate record exists without the PDF artifact.
19. **Rich-text report editor + snippet library** (`FR-CON-03/04`) — Size: **M**. Grep-confirmed zero implementation (`tiptap`/`ckeditor`/`wysiwyg`/`snippet` → no real hits).
20. **Fire-compartment calculation form** (`FR-CON-06`) — Size: **S**. Grep-confirmed zero implementation ("compartment" only appears as unrelated flavor text in mock report content).
21. Delete the 5 deprecated redirect routes (`documents`, `execution`, `expenses`, `labor`, `obstacles`) once confirmed no external links depend on them.
22. Delete orphaned flat `features/{contracts,invoices}/components/*` duplicates (`RECONCILIATION.md` §6).
23. Delete unused default Next.js boilerplate SVGs in `public/`.
24. Delete or repurpose the fully-empty `features/{auth,chat,engineering}/` stub scaffolds (auth logic already lives in `providers/AuthProvider` + `app/(auth)/login`; chat and full engineering-portal are POST-MVP; keeping empty `.gitkeep` folders around invites confusion about where new code should go).

---

## 7. POST-MVP — Explicitly Out of Scope (do not build now)

Per `CLAUDE.md` "MVP Boundaries" and `RECONCILIATION.md`, the following SRS-described capabilities are backend/infra-dependent and must **not** be built against this frontend-only, LocalStorage-mock MVP:

- Multi-tenant database, `tenant_id` isolation middleware, wildcard-subdomain routing (`FR-TEN-01..04`).
- Real WebSocket chat (`FR-COM-03`) — `features/chat` stays a stub.
- Real payment gateway integration.
- TOTP/MFA (`NFR-SEC-05`) — real multi-factor auth backend.
- Redis cache / Pub/Sub (`NFR-PER-02`).
- AWS S3 / GCP object storage, presigned URLs (`NFR-SEC-01/02`).
- Government/Civil Defense portal integration, OpenAPI/GraphQL adapters (`NFR-INT-01/02`).
- Full document e-signature engine beyond the local canvas-signature-pad capture already scoped into the project workspace `completion` tab.
- Native mobile app — SRS itself already scopes the MVP to responsive web only (§1.2, §2.4).
- **The maintenance-contract system (`FR-OPS-09`, `FR-RUL-02` downstream)** — contract
  creation from approved 150–1000 m² requests, quarterly visit scheduling, the 4 periodic
  visits, and visit completion. Deferred 2026-08-01 as a **product-scope decision**: the
  MVP delivers the licensing cycle, and maintenance is a later phase. Unlike the entries
  above, this one is not blocked by missing infrastructure — it is simply out of scope.
  Full record and prerequisites: `docs/BACKLOG.md`.
- Full CRM beyond the Sales Agent pipeline gap noted as P-critical above (advanced lead scoring, external CRM sync, etc. — out of scope; the *basic* pipeline view is in-scope and listed as P-critical item 5).
- Advanced BI beyond the single analytics screen listed as P-important item 9 (predictive analytics, custom report builder, etc.).

---

## 8. Grounding Notes / Uncertainty Log

This report went through two passes. The first pass inferred feature completeness from tab/route *existence* without opening every tab file, which produced three incorrect "BUILT" verdicts (procurement, labor, signature/closure) later found to be `EmptyState`-only stubs by direct read — those are corrected throughout §2/§4/§5/§6 above, with the correction noted inline at each location. Remaining open items, still not traced to line-level evidence and worth verifying before sizing follow-up work:

- ISIC hazard-matrix depth (`FR-RUL-04`) — area-band routing (150/1000 m² thresholds) and a high-hazard ISIC code list (`5610, 2011, 4520, 4730`) are both confirmed present in `domains/requests/workflow.ts:180-189`; whether this covers the SRS's full named hazard categories (Commercial Kitchens, Chemical Warehousing, Compressed Gas Outlets, Heavy Workshops) by name/keyword vs. only by ISIC code was not individually cross-checked.
- Payment confirmation UI location — domain confirmed (`domains/payments/{storage,workflow}.ts`), screen/action location not traced to a specific button/dialog.
- Snippet library (`FR-CON-04`) and WYSIWYG editor (`FR-CON-03`) — now grep-verified as **missing** (no `tiptap`/`ckeditor`/`wysiwyg`/`snippet` hits in real code), not merely unverified.
- Canvas signature pad — now grep-verified as **missing** (zero `signature`/`canvas` hits in `features/projects`), not merely unverified.
- PDF/watermark rendering for certificates (`FR-CON-05/07`) — now grep-verified as **missing** (zero `watermark`/`signature`/`pdf`-generation hits in `domains/certificates` or `features/certificates`), not merely unverified.
- RTL-utility and hardcoded-color violation scans — now grep-verified: 84 RTL-unsafe classes, 30 hardcoded-color classes (counts in §5), though individual files were not all opened to confirm each hit is a true violation vs. a false positive (e.g. a class name substring match).
- 100% i18n coverage — still spot-checked only, not exhaustive; 3 Super Admin pages confirmed to have hardcoded English strings via direct read, no systematic sweep of all ~200+ component files was performed.
- `SRS FR-OPS-08` obstacle webhook/broadcast semantics — obstacle *logging* UI is confirmed real and wired; whether it attempts any webhook-shaped call (which would be a no-op without a backend) was not checked.
