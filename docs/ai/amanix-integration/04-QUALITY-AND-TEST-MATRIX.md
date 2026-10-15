# Quality, Test Matrix and Definition of Done

## 1. Non-negotiable screen completion checklist

A page is not complete just because it renders. For every route and high-value component, confirm:

### Data and integration
- [ ] API types generated from current OpenAPI or the project’s equivalent schema source.
- [ ] No fake/mock/stub data in the shipped path unless the feature is explicitly a documented demo mode.
- [ ] Shared API client/envelope/error path used; no duplicate ad hoc fetch parsing.
- [ ] Query keys and mutation invalidation are centralized and correct for the framework.
- [ ] All links, buttons, menu items and form actions perform their advertised behavior or are intentionally disabled with an explanation.
- [ ] Pagination, search, sort/filter parameters match API schema; loading previous pages cannot show stale data for a different tenant/user.

### States and interactions
- [ ] Loading skeleton that preserves layout and communicates what is loading.
- [ ] Meaningful empty state with a relevant next action when authorized.
- [ ] Error state using localized backend `message`/`errors`; preserve user input where safe.
- [ ] Field and form-level validation; focus the first error and summarize server validation clearly.
- [ ] Submitting/disabled states prevent accidental duplicate mutations.
- [ ] Conflict (`409`), unauthenticated (`401`), unauthorized (`403`), subscription (`402`), rate-limit (`429`) and upload errors have appropriate behavior.
- [ ] Destructive operations have confirmation and an explicit success/failure result.
- [ ] No action remains available after the backend tells the UI the resource is sealed/read-only.

### Permissions and data privacy
- [ ] Navigation is role-appropriate; every actionable control uses effective permissions from the live session.
- [ ] Client role sees client-safe allow-listed fields only; no margins, labor costs or confidential internal notes.
- [ ] Platform staff with null `tenantId` work without crashes or fake tenant identity.
- [ ] Tenant A cannot see IDs, counts, search results, notifications, export data, files or branding belonging to Tenant B.
- [ ] A cross-tenant record lookup returns the intended not-found behavior and UI does not confirm another tenant’s data exists.

### Internationalisation and responsive UX
- [ ] Arabic is complete and visually primary; English is complete, not placeholder fallback.
- [ ] Actual `dir="rtl"`/`dir="ltr"` behavior works across tables, forms, sidebars, menus, dialogs and charts.
- [ ] No hard-coded user-facing strings; API `Accept-Language` is consistent with the chosen language.
- [ ] Long names, validation messages, dates, numbers and mixed Arabic/Latin IDs do not overflow or reorder incorrectly.
- [ ] Layout is tested at representative small mobile, large mobile/tablet, laptop and wide desktop sizes.
- [ ] Keyboard focus, Escape behavior, focus trapping, form labels, non-color status cues, contrast and reduced-motion preferences work.

## 2. Required integration tests

| Area | Minimum scenarios |
|---|---|
| Contract parser | success object, success with `data: 0`, success with `data: false`, failure with missing data, localized errors, malformed/non-JSON fault. |
| API headers | correct bearer token, `Accept-Language` for public and private calls, `X-Tenant-Domain` on the correct anonymous requests only. |
| Auth | correct/incorrect login, inactive/pending account, forgot-password generic result, OTP from response in permitted environments, reset, rotation, concurrent 401s, failed refresh, remote logout, profile update/password change. |
| Tenant resolver | root host, tenant subdomain, localhost port, casing, unknown/reserved host, malformed host, local `*.localhost`, stage’s single-host limitation. |
| White-label | two companies’ logos/colors/SEO differ at first render; unknown tenant fails closed; branding update refreshes; open maps tolerate unknown keys; unsafe URL/color rejected or sanitized. |
| RBAC/PBAC | one user per role, effective extra permission grant, denied action never presented, DeputyAdmin read-only settings, PlatformSupport unresolved, user-specific assignable roles. |
| Cross-tenant isolation | signed in as Tenant A and Tenant B in separate browser contexts; same screens differ; using an ID copied from A under B shows not-found without revealing fields; files/exports/search/counts covered. |
| Dynamic forms | schema field types, required/optional, validation, conditional/step logic supported by contract, drafts, uploads, malformed schema safe failure, schema updates, submission result/job number. |
| Workflow lifecycle | legal transitions only, required rejection reason, revision loop, quote issue/accept/reject, payment state, WBS/task transitions, conflict refresh, sealed immutability. |
| Financial correctness | tenant policy read; no frontend-authoritative totals; VAT/subtotal/total fields displayed separately; margin/spending policy states; client view redacts internals. |
| Files/evidence | multipart content type, limits, rejected type/size/quota, signed/private download, upload failure retry, EXIF-preserving originals where required, verification statuses. |
| Localisation | Arabic and English screenshots/tests on key routes; API headers; translated local strings; RTL data tables and forms. |
| Resilience | offline/timeout/500, 429 backoff, stale session, empty/paged results, duplicate submit, navigation during request, cache isolation on sign-out/tenant change. |
| Responsive/accessibility | mobile nav and form workflows, keyboard-only smoke pass, visible focus, dialog behavior, narrow table/card treatment, reduced motion and contrast checks. |

## 3. Automation layers

Use what the frontend already has and extend consistently; do not introduce a second overlapping test stack without reason.

1. **Static gates:** formatter, linter, typecheck, generated API type drift check, production build.
2. **Unit tests:** envelope parser, API errors, host parser, tenant context, permissions, formatters, dynamic schema parsing, workflow state/action helpers.
3. **Component tests:** forms, dialogs, tables, loading/empty/errors, permission-dependent controls, language switching, upload status.
4. **Integration tests:** route handlers/BFF, cookie handling, refresh single-flight, API client, query invalidation and tenant isolation behavior.
5. **E2E tests:** Playwright or existing framework equivalent, testing root platform and at least two tenants with distinct accounts/data.
6. **Live smoke tests:** only safe staging demo accounts; verify diagnostic environment/build first. Avoid destructive production calls and do not assume all seeded accounts/OTP values are permanent.

Backend `.http` suites stay in the backend repository. Read them and run relevant suites where possible; never duplicate them into the frontend and later trust the stale copy.

## 4. Security/reliability checklist

- [ ] No secrets in `.env.example`, docs, console output, URL query strings, snapshots or commits.
- [ ] Cookies use correct `httpOnly`, `Secure` and `SameSite` properties for the environment; consider CSRF/origin protections for state-changing BFF routes.
- [ ] Server-side proxy/BFF allows only expected destinations/paths; no arbitrary URL proxy that introduces SSRF.
- [ ] Open redirects blocked; authorization revalidated for server actions/route handlers.
- [ ] Tenant host resolution is centralized and validates hostname/subdomain boundaries safely.
- [ ] Cache keys and server caches include tenant identity where data is tenant-specific; sign-out/tenant switch cannot reuse another session’s data.
- [ ] Protected downloads are fetched via authorization-enforcing endpoints.
- [ ] No private response/HTML/static generation cache shared across tenants or users.
- [ ] External URLs, logos, social links and theme values are validated before rendering/applying.
- [ ] Logs identify request/route/status without recording credentials, OTPs or sensitive record content.

## 5. Phase exit report

After each phase, append to the tracker:

- What changed, grouped by feature and commit.
- Files/routes/components integrated or removed.
- Endpoints/schema sections covered and known discrepancies.
- Commands run with pass/fail summaries.
- Screens/roles/tenants/languages/devices exercised.
- Any skipped test and why it was safe to skip.
- Known defects/dependencies and whether work is blocked.
- Exact commit SHA pushed to which branch.
- Explicit statement that the next phase has not begun until all exit criteria are green.
