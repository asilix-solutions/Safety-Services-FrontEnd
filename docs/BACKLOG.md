# SSLM Product Backlog

The single consolidated backlog: everything deliberately not done, why, and what
unblocks it. Current status of what *is* done: `docs/analysis/MVP_STATUS_REPORT.md`.

Items are bucketed:

- **BLOCKING** — must close before API wiring.
- **B — needs the backend.** Cannot be built against a LocalStorage mock.
- **C — needs an owner decision or a structural refactor.** Changes behaviour or
  touches stable logic; not cleanup, and not to be picked up inside a tidy-up pass.

Narrower tech-debt inventories live in `docs/debt/ANY_BACKLOG.md` (the `any`
cleanup) and `docs/debt/FR_RU_BACKLOG.md` (rule-engine deviations).

---

## 🚧 BLOCKING — four UI surfaces bypass the scoped readers

Tenant isolation is complete in the domain layer; these four files query unscoped
collections directly instead of using the scoped readers that already exist. Two
of them permit cross-tenant **writes**. Each fix is a substitution — no new
mechanism is needed.

| # | Surface | File | Unblocker |
|---|---|---|---|
| 1 | Quotation approval | `app/(dashboard)/quotations/approvals/[jobNumber]/page.tsx:66-77` | Use `getScopedQuotationByJobNumber` + `getScopedRequestByJobNumber`. Today an admin of one tenant can approve/reject another tenant's quotation |
| 2 | Quotation builder | `app/(dashboard)/quotations/[jobNumber]/page.tsx:45-53` | Same substitution; allows pricing a foreign request |
| 3 | Project workspace shell | `features/projects/project-workspace/hooks/use-project-workspace.ts:69` | Replace `getProjects()` with `getScopedProjects(tenantContext)` — the hook already holds `tenantContext` |
| 4 | "Ready to generate" lists | `features/contracts/contract-list/hooks/use-contract-list.ts:38`; `features/certificates/hooks/use-certificate-list.ts:41,56` | Replace `getProjects()` with `getScopedProjects(tenantContext)` |

**Why not fixed in the Session-27 cleanup pass:** these change who can access and
mutate what. That is a behaviour change, and behaviour changes do not belong in a
cleanup commit — they need their own session with verification per fix.

---

## 🔴 DEFERRED — Maintenance-Contract System (POST-MVP)

_Decision date: 2026-08-01. Status: **deferred by product decision**, not a defect._

The entire maintenance-contract lifecycle is **out of scope for the licensing-cycle MVP**
and will be built as a **later phase**. Nothing about it is broken; it was never started.

### What is deferred

| Capability | SRS ref | State today |
|---|---|---|
| Maintenance-contract creation from approved 150–1000 m² requests | `FR-RUL-02` | **Does not exist** |
| Splitting an annual maintenance contract into 4 quarters | `FR-OPS-09` | **Does not exist** |
| Auto-generating the 4 scheduled quarterly visits | `FR-OPS-09` | **Does not exist** |
| Scheduling / tracking / completing a quarterly visit | `FR-OPS-09` | **Does not exist** |
| Client + operations views of the quarterly visit schedule | `FR-OPS-09` | **Does not exist** |

### What DOES exist (and is correct)

The **classification rule engine is complete and working**. A request whose area falls in
150–1000 m² is routed to the maintenance track exactly as the SRS requires:

- `constants/classification.ts` — `AREA_THRESHOLDS.MAINTENANCE_MAX_INCLUSIVE = 1000`
- `domains/requests/workflow.ts#classifyRequest` — returns
  `classification: "maintenance_strategy"`, `assignedQueue: "MAINTENANCE"`,
  `siteVisitRequired: true`

**The routing decision is the end of the line.** No contract is created, no visit schedule
is seeded, and no downstream maintenance system consumes the `MAINTENANCE` queue. This is
the intended state of the MVP: the licensing cycle classifies the request correctly and
stops there.

> **Do not file this as a bug.** "The rule engine routes to a maintenance contract but no
> maintenance contract appears" is the documented, deliberate behaviour of this phase.

### Related dead scaffolding — leave in place

These artifacts predate the decision and are currently unreferenced by any live code path.
They are **not** the deferred system and should not be mistaken for a partial build:

- `app/(dashboard)/maintenance/page.tsx` — calls `notFound()`
- `types/maintenance.ts` + `mock/maintenance.ts` — a CMMS-style `MaintenanceJob` asset
  model (asset name, facility, technician, priority); imported only by each other
- `constants/statuses.ts#MAINTENANCE_STATUS_METADATA`,
  `constants/status-translations.ts#MAINTENANCE_STATUS_TX`,
  `ROUTES.MAINTENANCE`, `QUERY_KEYS.MAINTENANCE`
- `locales/{ar,en}/maintenance.json`

### Known prerequisite when this phase is picked up

`domains/site-visits` is **not tenant-scoped** — `SiteVisit` (`domains/site-visits/types.ts`)
carries no `tenantId`, and `getSiteVisits()` reads unscoped with no scoped getter beside it.
Quarterly visits would almost certainly reuse this entity, so tenant scoping must be fixed
**before** any visit generation is built, or the new records inherit the gap.

### Explicitly excluded even when this phase is built

- Email/notification reminders 7 days before a due visit (`FR-OPS-09`) — requires a backend
- Planning-calendar ticket injection
- A recurring-visit rescheduling engine
- Per-visit rich reports (the SRS requires the signature/closure gate at **project**
  close-out, `FR-OPS-10` — not per periodic visit)

---

## B — Needs the backend

Not buildable against a LocalStorage mock. Each is unblocked by the same thing: a
real API. None is a frontend gap.

| Item | Why deferred | Unblocker |
|---|---|---|
| `ipAddress` on closure and labor records | The browser cannot obtain a client IP. Typed `null` with the reason recorded inline (`domains/closure/types.ts:18`, `domains/labor/types.ts:19`) | A backend stamps it server-side on write |
| Real payment gateway | MVP boundary excludes it | Implement `PaymentProvider` against the API and assign it at the single swap point, `domains/payments/provider.ts:34`. No caller, dialog or workflow changes |
| TOTP / MFA (`NFR-SEC-05`) | Requires an auth backend | Auth service with TOTP enrolment and challenge |
| Real notification delivery, email reminders (incl. `FR-OPS-09` 7-day notice) | No mail transport in the MVP | Backend job runner + mail service |
| Server-enforced tenant isolation | The frontend rules are advisory only; `localStorage` is fully readable by the client regardless | `tenant_id` scoping in the API. **The frontend scoping still matters** — it defines the contract the API must enforce and prevents leaks in the UI layer |
| Government / Civil Defense integration (`NFR-INT-01/02`) | External systems | Integration adapters |
| S3 object storage, Redis, WebSocket chat (`FR-COM-03`) | Infrastructure | Respective services |
| PDF certificate generation with watermark and tamper-proof signature fusion (`FR-CON-05/07`) | Needs server-side rendering and key material | Document service |

---

## C — Needs an owner decision or a structural refactor

Real items, none of them cleanup. Each changes behaviour or touches stable logic,
so each needs its own analyzed session.

### C1 — Domains with no tenant scoping

| Domain | State | Unblocker |
|---|---|---|
| `procurement` | `ProcurementRecord.tenantId` **exists and is never read**; `getProcurementByProject` is unscoped (`domains/procurement/storage.ts:40`) | Add a scoped reader and wire `use-procurement.ts:24`. The field is already there — smallest of the four |
| `labor` | No `tenantId` at all (`domains/labor/types.ts:8-22`). Records carry worker names and agreed wages | Add the field, add a scoped reader, wire `use-labor.ts:41`. Needs a decision on existing rows |
| `site-visits` | No `tenantId`; `getSiteVisits()` seeds mock data into localStorage on read (`storage.ts:26`) | Add the field and a scoped reader; stop seeding on read. `use-reports-hub.ts:98-99` shows the correct interim pattern — intersect with an already-scoped project set |
| `notifications` | Scoped by `companyId` only; passing no id returns everything, which internal roles do (`domains/notifications/storage.ts:34-37`) | Add `tenantId` to `Notification` and a tenant-scoped reader |

### C2 — Behaviour changes deliberately left alone

| Item | Current behaviour | Why it needs a decision |
|---|---|---|
| Invoice duplicate guard | Returns any existing invoice for the job number regardless of its status (`domains/invoices/workflow.ts:20-27`) | Today this makes creation idempotent and produces no stuck invoice. Narrowing the condition changes what happens on re-issue — a product question, not a bug fix |
| `payments/workflow.ts:67` sets `status: "quotation_created"` alongside `currentStage: "PAYMENT_CONFIRMED"` | Semantically odd but **no visible effect**: that intermediate object is never persisted; `provisionProjectWorkspace` immediately writes `PROJECT_CREATED` + `approved` together | Cosmetic. Touching the payment path for a cosmetic reason is not worth the regression risk |
| Review decision buttons gate on `isEngineeringEligible`, not on the workflow stage (`use-blueprint-workspace.ts:51-64`) | Buttons are enabled by queue/classification | Making them stage-aware changes when decisions are available to the consultant |
| `SiteVisit.status` is a free-text-ish 7-value union disconnected from `executionPhase` (`domains/site-visits/types.ts:10`) | Two overlapping vocabularies (`upcoming`/`scheduled`, `completed`/`approved`) | Unifying it is a state-model change touching four consumers |

### C3 — Structural

| Item | Measurement | Note |
|---|---|---|
| Files over 400 lines | `requests/[jobNumber]/page.tsx` **900**; `quotations/approvals/[jobNumber]` 513; `quotations/[jobNumber]` 509; `client-request-wizard.tsx` 484; `customer-hub-drawer.tsx` 431; `domains/requests/workflow.ts` 425 | The three route pages also violate the thin-page rule (ADR-004). Decomposing them is the largest single refactor left |
| `any` usages | **75** | `docs/debt/ANY_BACKLOG.md` gates flipping `no-explicit-any` to error |
| Physical-direction classes | **22** occurrences of `ml-`/`mr-`/`pl-`/`pr-`/`text-left`/`text-right` in `.tsx` | Should be logical properties (`ms-`/`me-`/`ps-`/`pe-`/`text-start`/`text-end`) |
| Unused imports and locals | **89** flagged by `tsc --noUnusedLocals` across ~40 files | Not a safe blanket sweep: the flag also reports unused locals **with initialisers**, and deleting `const x = call()` removes the call. Needs a per-file pass that separates imports from initialised locals |
| Dead `MaintenanceJob` model | `types/maintenance.ts` + `mock/maintenance.ts` | **Not safely deletable as-is**: `MaintenanceStatus` from the same file is live in `shared/components/status-badge.tsx:44-45`, `constants/statuses.ts` and `constants/status-translations.ts`. Deleting requires splitting the type out first |
| Hazard-matrix widening; FR-RU deviations S-2/S-3/S-4/S-6 | — | Owner decision, documented in `docs/debt/FR_RU_BACKLOG.md` |
| Four `PlaceholderWidgetCard` tiles in the project overview | `features/projects/project-workspace/components/overview/widget-grid.tsx:113-148` | `procurementStatus` shows a "coming soon" placeholder for a system that is now built — worth replacing with real data |
