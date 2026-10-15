# Phased Frontend Delivery Plan

This plan is a baseline inferred from the current backend frontend guide (`Docs/frontend/07-integration-playbook.md`). Confirm the exact endpoint surface before implementation. Work phase-by-phase; every phase must meet its exit gate before the next starts.

## Phase 0 — Discovery, safe Git synchronization, contract baseline and foundations

**Goals:** identify the two exact local repositories, sync safely, understand the frontend’s actual framework, reconcile docs, and establish a typed, tested API seam.

Tasks:
- Inventory both projects, remotes, current branches, worktree changes and upstream state.
- Fetch/prune GitHub refs and safely fast-forward/rebase only when safe; preserve uncommitted/local work.
- Create/switch to the frontend `integration` branch based on the current remote default branch, without force-resetting or losing work. Confirm actual branch ownership and push capability.
- Read every backend/frontend `.md`, `.http`, current OpenAPI, API/controller/auth/tenancy/role/enum/domain source, existing tests and CI workflows.
- Open Scalar in a real browser/editor session, inspect every tag/domain and key endpoints, and verify `/diagnostics/ping` or the current diagnostics equivalent identifies the staging environment/build.
- Inventory differences between deployed staging schema, local backend schema and generated reference/docs; capture a reconciliation report.
- Confirm the frontend stack; retain it unless a technical blocker justifies a migration. Build one typed API client/envelope parser/error type, one tenant host parser, one auth/session strategy, generated API types, `Accept-Language` plumbing and environment configuration.

**Exit gate:** clean documented Git baseline; current branch/remote/commit known for each repo; no data loss; a reproducible type-generation command; `GET /diagnostics/ping` or the current equivalent succeeds using the shared API layer in the supported environment; unit/type/lint checks pass; discrepancies and any staging access blocker are recorded.

## Phase 1 — Tenant detection and public white-label branding

Tasks:
- Resolve root/platform host versus tenant host before app rendering.
- Add explicit unknown tenant/not found/suspended states, using actual API behavior.
- Fetch public branding server-side where the stack permits, avoiding a flash of default colors or wrong tenant data.
- Apply sanitized CSS variable tokens, logo/favicon, contact/welcome information and SEO/Open Graph/canonical metadata.
- Support flexible branding/social maps; invalidate or refresh branding after a successful change.
- Verify root host, two distinct tenant hosts and unknown tenant; validate local `*.localhost` behavior if supported.

**Exit gate:** two tenant hosts display independent real branding on first render; unknown tenant never gets another company’s/default private information; metadata and branding refresh work; tests pass.

## Phase 2 — Authentication and session lifecycle

Tasks:
- Sign-in, session restoration, `/me`, effective permissions, refresh rotation, single-flight refresh, logout/revocation, change password, forgot/reset password, invite accept and client registration/OTP flows supported by current API.
- Prefer BFF/server-only secure cookies appropriate to the detected stack. Do not persist bearer tokens in browser-readable local storage.
- Preserve generic forgot-password confirmation, translate all server errors, handle 401/403/429 properly.
- Test two tenant/company sessions in isolated profiles; make sure token identity determines company access.

**Exit gate:** all auth journeys pass with realistic staging/dev values; rotated refresh token is stored; concurrent 401s trigger one refresh; logout revokes remotely; `/me` and permissions both load; expiry/logout messaging is clear; no token/OTP leaks into logs or URLs.

## Phase 3 — Registration and activation

Tasks:
- Subdomain availability with debounce, legal/business intake, admin registration, OTP verification and supported activation choices (manual, card, bank receipt as exposed by current schema).
- Show clear pending/approved/rejected states and mandatory reasons where the API requires them.
- Implement graceful retries and protect against duplicate submissions.

**Exit gate:** all server-supported paths have working UI and tests; numeric enums are rendered as localized labels; duplicate or invalid flow transitions are handled without data loss.

## Phase 4 — Company settings and financial policy

Tasks:
- Profile/contact settings, branding and asset upload, SEO/Open Graph, company policy.
- Wire policy VAT/margin/commission from the API; display server-calculated information only.
- Enforce read-only branding/policy for roles disallowed by current backend rules.

**Exit gate:** read/update/asset flows are typed and tested, branding invalidation is immediate, tenant values are used instead of constants, and permission failures are not reachable by ordinary UI clicks.

## Phase 5 — Staff administration and platform console

Tasks:
- Staff list/pagination/search/filter, invitations, activation/deactivation only if endpoints exist, permission catalogue and per-user overrides.
- Separate platform console and tenant portal layout/navigation.
- Implement platform tenant review/activation/suspension/financial/support screens only for endpoints and permissions that demonstrably exist.
- Preserve undecided behavior as an explicit blocker, not a fabricated workflow.

**Exit gate:** role and permission cases have automated coverage; `PlatformSupport` is not assigned invented capabilities; the caller-specific assignable role list is respected; no cross-tenant information can leak through lists, counts, exports or detail screens.

## Phase 6 — Field workers and equipment/resources

Tasks:
- Resource lists, detail/create/update/approval operations that are actually exposed; cost rates; file/photo handling; pagination, filtering and safe empty states.
- Handle any known slow/deep-pagination endpoints conservatively and document constraints rather than hiding server errors.

**Exit gate:** CRUD operations represented in the actual API work end-to-end; unsupported operations are explicitly absent/blocked instead of mocked; server state and cost fields remain authoritative.

## Phase 7 — Core client and job lifecycle

Build in dependency order; complete each sub-stage and its gate before beginning the next:

1. Client portal shell and client-safe job views.
2. Dynamic intake/form schema renderer and draft/submit/upload lifecycle.
3. Manager triage and revision loop.
4. Engineering review and relevant technical/report forms.
5. Quotation create/edit/issue, margin gate, VAT display and client acceptance/rejection.
6. Job payment flow and state transitions exposed by current API.
7. Execution plan/WBS, sections, sprints, tasks, assignments and obstacles.
8. Field photo evidence and verification result handling.
9. Ledger/expenses/cost ceilings/escalation.
10. Punch list/inspection/signatures/countersignature/sealed archive.
11. Tax invoice screens and current maintenance scheduler/contract journeys.
12. Subscription/quotas/expiry/read-only status, notification inbox and supported operational reports.

**Per-stage gate:** exact endpoint and DTO mapped; actor/permission/state guard proven; loading/empty/error/validation/conflict/success states implemented; Arabic RTL and English LTR verified; tenant isolation tested; state refresh/cache invalidation verified; unit/integration/e2e coverage appropriate; tracker and docs updated.

## Phase 8 — Hardening, UX polish and release candidate

Tasks:
- Full responsive and accessibility pass, keyboard/screen-reader focus, reduced motion, form semantics and contrast.
- Performance: bundle, server requests, image sizes, query caching and pagination. Avoid over-polling because rate limits may be tenant-shared.
- Security review of host resolution, BFF routes, cookies, CSRF/origin protection, redirects, logs, upload behavior and document access.
- E2E for platform and company actors, multiple tenants, Arabic/English, mobile and desktop.
- Run all builds/tests and validate environment configuration without committing `.env`/secret files.
- Final audit of all routes, interactive controls, links, forms and dead/mocked actions; fix findings before calling the frontend complete.

**Final exit gate:** no known high/critical frontend issues; production build succeeds; all required tests pass; staging smoke suite passes; all user-visible strings are localized; no mocked backend success on core flows; documentation/tracker/changelog reflect verified reality; branch is pushed and the final report states exact commit/test results and remaining blockers.

## Change/phase rule

The agent is authorized to proceed without asking for routine approval. Stop only for a genuine destructive-risk boundary, credentials/security incident, incompatible backend contract requiring a backend change, or external dependency that cannot be resolved from the repositories. Otherwise, resolve ambiguities through evidence, document decisions and continue. Never call a phase complete because the page renders or a type-check alone passes.
