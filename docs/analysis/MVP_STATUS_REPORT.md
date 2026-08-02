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
- **Tenant isolation is complete in the domain layer and incomplete at four UI
  surfaces.** Thirteen domains scope their reads, and every single-record reader
  in the licensing cycle now has a fail-closed scoped variant. But four feature
  and route files bypass those readers and query unscoped collections directly —
  two of them are cross-tenant *write* surfaces. These are listed in §4 and in
  `docs/BACKLOG.md` as blocking.
- **Readiness for API wiring: blocked on §4 only.** Nothing else in the licensing
  cycle needs frontend work first. The four fixes are each a substitution of an
  unscoped reader for its existing scoped counterpart — no new mechanism is
  required.

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

## 4. Open before API wiring — four UI surfaces bypass the scoped readers

These are the only items standing between this repository and API wiring. Each is
a substitution, not a new mechanism.

| # | Surface | File | Why it matters |
|---|---|---|---|
| 1 | Quotation **approval** page | `app/(dashboard)/quotations/approvals/[jobNumber]/page.tsx:66-77` | Resolves request and quotation from unscoped collections by URL job number. `grep -c tenant` on the file returns **0**. Role-gated to Company Admin but not tenant-gated, so an admin of one tenant can **approve or reject another tenant's quotation** — a cross-tenant financial write |
| 2 | Quotation **builder** page | `app/(dashboard)/quotations/[jobNumber]/page.tsx:45-53` | Same hand-rolled `.find()` over unscoped collections; does not use `getScopedQuotationByJobNumber`. Allows pricing a foreign tenant's request |
| 3 | Project workspace shell | `features/projects/project-workspace/hooks/use-project-workspace.ts:69` | `getProjects()` unscoped. The contract, certificate and quotation panels inside are scoped, but the project record itself — name, client, job number, silos, costs — is not |
| 4 | "Ready to generate" sections | `features/contracts/contract-list/hooks/use-contract-list.ts:38`; `features/certificates/hooks/use-certificate-list.ts:41,56` | Eligible-project lists are built from all tenants' projects, so a contract or certificate can be issued against a foreign project |

Domains still lacking tenant scoping altogether — `procurement` (has an unused
`tenantId` field), `labor` (no `tenantId`), `site-visits`, `notifications` — are
described in `docs/BACKLOG.md` under bucket C.

---

## 5. Verdict

**The licensing-cycle MVP is functionally complete.** Maintenance is deferred by
product decision. Tenant isolation is complete in the domain layer.

**Ready for API wiring once the four surfaces in §4 are closed.** Until then the
system leaks across tenants at those four points, and two of them permit
cross-tenant writes — on a real backend those become real cross-tenant mutations,
which is why they are called out here rather than filed as ordinary backlog.

Everything else outstanding is documented in `docs/BACKLOG.md`, split into what
needs a backend (bucket B) and what needs an owner decision or a structural
refactor (bucket C).
