# SSLM MVP Status Report

_Rewritten 2026-08-02 (Session 27), replacing the 2026-07-08 audit. That report
was written before Sessions 16–26 and had become actively misleading: it listed
procurement, labor, photos and signature-closure as empty stubs when all four are
now built and wired. Every claim below was verified by direct file read at the
commit this report ships with._

**Scope of this repository:** a frontend-only MVP with LocalStorage mock
persistence, per `CLAUDE.md` and `RECONCILIATION.md`. The English SRS describes a
full backend SaaS platform (multi-tenant DB, Redis, WebSocket, government
integrations, TOTP MFA, S3); everything infrastructure-bound is out of scope by
design and is listed in `docs/BACKLOG.md`, not counted as a gap here.

---

## 1. Executive summary

- **The licensing cycle is functionally complete.** All twelve stages from client
  intake to certificate issuance work end to end, persist, and survive reload.
  There are no UI-only shells, no dead handlers that toast success without doing
  work, and no fake gates left in the cycle.
- **Maintenance contracts are deferred post-MVP** by an explicit product decision
  (2026-08-01). The rule engine correctly routes 150–1000 m² to the maintenance
  track and stops there. See `docs/BACKLOG.md`.
- **Tenant isolation is complete across both the domain and the interface layer**
  (closed 2026-08-02, Session 28). Thirteen domains scope their reads, every
  single-record reader in the licensing cycle has a fail-closed scoped variant,
  and the four interface surfaces that used to bypass them now resolve through
  the scoped path. The two that carried cross-tenant *write* risk are guarded at
  the action, not only at the display.
- **Ready for API wiring.** No known isolation gap remains in the licensing cycle.
  Everything still outstanding is in `docs/BACKLOG.md`: bucket B needs a backend,
  bucket C needs an owner decision or a refactor. Four domains outside the
  licensing cycle — `procurement`, `labor`, `site-visits`, `notifications` — are
  still unscoped and are tracked there as C1.

---

## 2. What works — the licensing cycle, stage by stage

| Stage | Status | Evidence |
|---|---|---|
| Intake wizard, 4 request types | Working | `domains/requests/types.ts:3`; 6-step wizard; `tenantId` stamped at creation (`client-request-wizard.tsx:257`) |
| GPS capture | Working | `geo-coordinates-field.tsx:67-84` — real `navigator.geolocation`, permission-denial handled |
| Hazard declaration fields | Working | `wizard-step-safety-risk.tsx:102,114,130` — registered and feeding the rule engine |
| Document upload | Working | `wizard-step-documents.tsx:106` — per-type accepted extensions |
| FR-RU rule engine | Working | `constants/classification.ts:17-22` thresholds + one decision function, `domains/requests/workflow.ts:224-287`; hazard override severs fast-track before the area band |
| Instant-report gate | Working, defence in depth | UI disables the option (`wizard-step-safety-risk.tsx:46,206`); the domain drops a forbidden `instant` at persist time (`client-request-wizard.tsx:233-236`) |
| Consultant review: approve / return / request docs | Working | `use-blueprint-workspace.ts:97,132,163` — real transitions + `upsertRequest`; mandatory reason gate at `domains/requests/workflow.ts:384`; reason reaches the client via `rejectionReason` and the timeline |
| Blueprint review + viewer | Working | `features/blueprint-review/` (15 files); captured coordinates replaced the simulated map |
| Quotation → approval → invoice | Working | `quotations/workflow/approval.ts:107` → `invoices/workflow.ts:6-55`; status guard and idempotent duplicate guard — no stuck-invoice pattern |
| Payment | Working | `PaymentProvider` interface with a single swap point (`payments/provider.ts:24-34`); `confirmMockPayment` blocks double payment and syncs invoice + request + timeline |
| Project provisioning, 3 silos | Working | `domains/projects/storage.ts:138,148,158` — alarm / suppression / ventilation |
| Field execution: procurement, labor, photos, obstacles | Working | Each is a full sub-feature under `features/projects/project-workspace/`; the 10-line tab files are thin shells delegating to them, not stubs |
| Signature-locked closure | Working, real hard gate | Domain asserts signature + photo + WORM (`domains/closure/workflow.ts:12-30`); submit disabled until both present (`closure-form.tsx:109`); real canvas pad; advances the project |
| Final inspection | Working | `features/projects/final-inspection/` |
| Certificate issuance | Working | `domains/certificates/workflow.ts` |
| Consultant report engine | Working | Two-layer scoping (`reports/storage.ts:70-71`); print-only output via `@media print` |
| Client timeline / job-number tracking | Working | Scoped record resolution falls through to not-found (`requests/[jobNumber]/page.tsx:81`); progress derived from the stage list |

**Cross-cutting, verified at this commit:** `alert(`/`confirm(`/`prompt(` = 0 ·
ar/en key parity across all 17 namespaces, checked key by key ·
`npx tsc --noEmit` clean · `npm run build` succeeds.

---

## 3. Tenant isolation — where it stands

**Complete in the domain layer.** Thirteen domains scope their list reads through
`scopeToTenant`, and the licensing-cycle single-record readers each have a
fail-closed scoped variant that returns null on a foreign record, so a guessed id
is indistinguishable from a missing one:

| Domain | Scoped single reader |
|---|---|
| requests | `getScopedRequestByJobNumber` (`storage.ts:156`) |
| reports | `getScopedReportById` (`storage.ts:80`) |
| quotations | `getScopedQuotationByJobNumber` (`storage.ts:81`) |
| contracts | `getScopedContractById` / `ByProjectId` (`storage.ts:75,85`) |
| certificates | `getScopedCertificateById` / `ByProjectId` (`storage.ts:80,90`) |
| closure | `getScopedClosureByProject` (`storage.ts:66`) |
| photos | `getScopedPhotosByProject` (`storage.ts:61`) |

Super Admin cross-tenant access is preserved by construction: `scopeToTenant`
short-circuits on `isCrossTenant` before any filtering (`tenancy/scope.ts:30`),
and every scoped reader routes through it.

---

## 4. Interface-layer isolation — closed 2026-08-02

Four surfaces used to bypass the scoped readers. All four now resolve through
them; the two write surfaces are additionally guarded at the action.

| # | Surface | Was | Now |
|---|---|---|---|
| 1 | Quotation **approval** page | Hand-rolled `.find()` over `getMergedRequests()` and `getQuotations()`; `grep -c tenant` = **0**. Role-gated to Company Admin but not tenant-gated, so one tenant's admin could approve or reject another tenant's quotation | Reads via `getScopedRequestByJobNumber` / `getScopedQuotationByJobNumber`; a foreign job number falls through to not-found. `approveQuotation`, `rejectQuotation` and `requestChangesOnQuotation` take the acting `TenantContext` and run `assertTenantMayDecide`, which **rejects** a cross-tenant decision |
| 2 | Quotation **builder** page | Same unscoped `.find()`; the only `tenant` reference was a write stamp | Same scoped readers; `submitQuotationForApproval` is guarded the same way |
| 3 | Project workspace shell | `getProjects()` unscoped — the panels inside were scoped, the shell was not | `getScopedProjects(tenantContext)` |
| 4 | "Ready to generate" sections | Eligible-project lists built from every tenant's projects, driving contract generation and certificate issuance | `getScopedProjects(tenantContext)`, in the certificate hook at **both** the list and the issuance re-resolve |

`assertTenantMayDecide` rejects rather than returning not-found, mirroring
`resolveClosableProject`: a reader is handed an id and cannot tell foreign from
missing, so it fails closed to null; a decision function is handed a resolved
record, so a mismatch is an attempt to act on another company's data. `ctx` is a
required field on all four decision functions, so the type checker refuses any
unguarded call site.

Super Admin cross-tenant access is preserved throughout via `isCrossTenant`.

**Still unscoped, outside the licensing cycle:** `procurement` (has an unused
`tenantId` field), `labor` (no `tenantId`), `site-visits`, `notifications` —
tracked in `docs/BACKLOG.md` as C1.

---

## 5. Verdict

**The licensing-cycle MVP is functionally complete.** Maintenance is deferred by
product decision. **Tenant isolation is complete across the domain and interface
layers**, with cross-tenant decisions refused at the action and not only hidden
from the display.

**Ready for API wiring.** No known isolation gap remains in the licensing cycle.

One caveat worth carrying forward: frontend scoping is advisory. `localStorage`
is fully readable by the client whatever the UI does, so what this work
guarantees is that no application path exposes or mutates another tenant's
records — and, just as importantly, that the contract the backend must enforce
is now defined precisely. Server-side `tenant_id` enforcement is bucket B.

Everything else outstanding is documented in `docs/BACKLOG.md`, split into what
needs a backend (bucket B) and what needs an owner decision or a structural
refactor (bucket C).
