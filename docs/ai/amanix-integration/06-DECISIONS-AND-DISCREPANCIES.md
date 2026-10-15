# Current Decisions, Source of Truth and Documentation Conflicts

## 1. Source precedence

There are multiple generations of Amanix documentation. The agent must verify actual code and note file dates/branches before adopting a statement. Recommended precedence for the frontend’s current behavior:

1. **Running staging OpenAPI/Scalar and diagnostic response** for the currently deployed API contract, provided staging confirms the expected environment/build.
2. **Current checked-out backend source + `.http` suites/tests + generated current OpenAPI** for intended behavior on the branch being integrated against.
3. **`Docs/frontend/README.md` and the `Docs/frontend/01-07` guide** for frontend architecture, contract semantics and recommended build order; the README says it was last verified against staging on 2026-10-13 and the contract guide includes 2026-10-14 notes.
4. Current generated references such as `Docs/frontend/reference/` and `Docs/APIs/` as discovery aids; regenerate rather than hand-copy when they disagree with code/live schema.
5. Current system blueprint, state reports, audit/backlog, SRS/BRD and roadmap, cross-checking whether each entry is “implemented”, “partial”, “planned”, “known issue” or “open question”.
6. Older `Docs/FRONTEND-INTEGRATION.md`, old sprint PDFs and historic planning notes are useful for rationale/history but can be superseded. Do not revive a deprecated requirement just because it appears in an older file.

If live staging is unreachable, state so explicitly. Do not claim the Scalar document was opened/tested. Use current backend code and tests as fallback, and keep any uncertain contract as a clearly marked issue.

## 2. Known discrepancies to reconcile during Phase 0

### Endpoint/test counts

- `Docs/frontend/README.md` and `Docs/frontend/reference/README.md` describe 157 endpoints and reference the live OpenAPI contract.
- Some older project overview, README and production-readiness/audit snapshots cite 133, 155 or 118 operations and different test-suite counts.
- The integration playbook describes 21 `.http` files covering the endpoint surface, while earlier roadmap snapshots refer to 10 suites.

**Decision:** inventory actual endpoint operations from current OpenAPI, actual files from `tests/http/`, route/controller definitions and test output. Record counts with branch/commit/environment and dates; do not treat counts alone as functional proof.

### Framework assumptions

- Current `Docs/frontend/` examples discuss Next.js App Router, route handlers, middleware and `generateMetadata`.
- Older planning materials include Nuxt 4-oriented wording and may refer to an earlier frontend proposal.

**Decision:** inspect the opened frontend’s `package.json`, lockfile, app structure and existing deployment config. Preserve its current framework unless migration is proven necessary and explicitly scoped. Translate architecture requirements to the detected framework rather than copying framework-specific APIs literally.

### Implemented product workflow vs older system-state snapshots

- `Docs/ai/00_SYSTEM_BLUEPRINT_MASTER.md` and the current integration docs list the workflow/form engine, intake, engineering review, quotations, WBS/field work, photo verification, closure vault, notifications/SLA, invoicing, subscriptions and maintenance features as implemented on their audited branch/snapshot.
- Some older roadmap/readiness text describes the platform as only a SaaS chassis or lists fewer operations/features.

**Decision:** verify each requested journey on the actual backend branch and staging. If the controller/endpoint/schema exists, test it; if only the SRS describes it, classify it as planned rather than implement a fake frontend feature. The state machine and current source win over a stale narrative, and real runtime behavior wins over intended behavior.

### Auth token naming

- Older docs mention login `data.token`, refresh `data.accessToken`.
- The newer frontend guide says login returns both `accessToken` and deprecated `token` alias; use `accessToken` exclusively.

**Decision:** normalize once in the API/auth adapter, generate types from the current schema, prefer `accessToken`, and do not make every page depend on the deprecated alias.

### Tenant header semantics

- Tenant identity for authenticated requests comes from the signed-in token and backend global query filters.
- `X-Tenant-Domain` is used only for specific anonymous/pre-auth tenant-scoped calls; it cannot switch an authenticated token’s tenant.

**Decision:** never put arbitrary tenant IDs in authenticated requests and never use a client-selected tenant header as an authorization mechanism.

### White-label and custom domains

- The guides describe white-labeling through subdomains and public branding/SEO settings.
- Historical business/SRS material may refer to apex/custom-domain binding and SSL.

**Decision:** confirm actual hostname resolution, domain verification, certificate and public-branding endpoint support. Build only supported configuration controls and label future capability honestly; do not pretend DNS/SSL setup is automated if it is not.

### Notifications, subscription billing and regulatory integration

- Current frontend guide reports no genuinely sending email/SMS/WhatsApp transport configured in Dev/Staging, no subscription-billing checkout, and no ZATCA submission (although invoice generation exists).
- Documentation may mention OTP/invitation values surfaced for testing in Dev/Staging.

**Decision:** do not promise, expose or simulate unavailable outbound delivery/payment/submission. Keep dev-only OTP/invitation behavior out of production, and render actual in-app notifications and actual supported payment/invoice states.

### VAT, area routing and pricing

- An older sprint PDF contains area-threshold routing and fixed 15% VAT wording.
- Current reconciled docs state that hard-coded area routing was deliberately removed in favor of dynamic workflows, the three-value `ServiceCategory` remains, and VAT/margin/commission are per-tenant financial policy.

**Decision:** no hard-coded routing thresholds or VAT constants. Show/submit fields and transitions according to current workflow schemas and financial policy. Escalate any unresolved SRS/code contradiction instead of silently selecting the older plan.

### PDFs and the sealed legal archive

- Historic planning says the frontend renders ordinary reports/quotes from backend JSON.
- Reconciliation notes a genuine decision point over whether the final immutable closure archive is server-compiled.

**Decision:** follow actual endpoint contract. Do not invent a PDF generation endpoint or claim client-generated output is the server-sealed legal archive. Log the contract discrepancy if unresolved.

### PlatformSupport and privileged platform visibility

- Current role guide reports `PlatformSupport` has no effective permissions and should not get invented capabilities.
- The project has historical/open discussions about platform cross-tenant visibility/estate view.

**Decision:** use actual effective permission lists/endpoints. Any cross-tenant platform screen must have explicit verified authorization and fields; otherwise mark it blocked/open and do not approximate it with tenant APIs.

## 3. Known API behavior gotchas worth regression testing

- `ApiEnvelope` contract uses `isSuccess`, localized `message`, optional `data`, and `errors`; branch on `isSuccess`.
- Enums are integers in the wire contract; current OpenAPI may carry literal enum values so generated types can be unions.
- 401 refresh uses rotated tokens and must be single-flight; logout should revoke remotely.
- 402 can mean company writes are locked by subscription/quota, while reads continue.
- 404 may intentionally mean absent or cross-tenant/invisible.
- 403 generally means the UI exposed an action the current permissions do not authorize.
- The backend guide flags deep pagination on `GET /audit-logs` as a known performance problem in the audited staging/dev snapshot. Verify current status/backlog before designing deep-page UX.
- Field photo EXIF may be required for verification; front-end image processing can destroy it.
- Server totals, VAT, margin and job states are authoritative.

## 4. Required reconciliation output

Phase 0 must create a compact report containing:

- backend and frontend repository path, remotes, branch, commit and upstream state;
- API environment/commit observed from diagnostics, plus current OpenAPI operation count and schema hash/date;
- actual `.http` file list/count and test-run outcome;
- documented versus implemented front routes/features;
- mismatches grouped into **verified bug**, **missing frontend integration**, **backend capability absent**, **stale documentation**, and **open product decision**;
- explicit decisions for the discrepancies above with evidence and source dates.
