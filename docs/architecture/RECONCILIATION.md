# SSLM Architecture Reconciliation

_Generated: 2026-07-06 — supersedes the "intended stack" assumptions in the original product spec. This document, plus the existing ADRs, is now the binding architecture reference._

## 1. ADR Digest

| ADR | Decision Locked |
|---|---|
| ADR-001 — Feature Boundaries | Features live in `src/features/[name]`, are isolated units, and must never import directly from another feature; cross-feature communication goes through domain selectors/actions or `src/shared`. |
| ADR-002 — Domain Storage Ownership | Only `src/domains/[name]/storage.ts` may touch `localStorage`; features read/write exclusively through domain selector/API methods (`getMergedInvoices()`, `upsertRequest()`, etc.). |
| ADR-003 — Workflow Ownership | State transitions (mark-paid, phase changes, etc.) must be routed through domain workflow handlers (`domains/*/workflow.ts`); hooks and page templates must never mutate workflow state directly. |
| ADR-004 — Project Workspace Pattern | `features/projects/project-workspace/` is the Golden Reference: Thin Route → Feature Shell → Hook → Presentational Components, with a ViewModel introduced only for high-complexity screens. |
| ADR-005 — Dashboard KPI Strategy | All KPI/summary math is centralized in domain selectors; dashboards and ViewModels query selectors instead of computing counts inline. |
| ADR-006 — Feature Folder Convention | Features are organized by business domain (`features/invoices/`), with concrete screens as sub-features (`invoices/invoice-list/`) and cross-screen shared code in a `shared/` sub-directory. |

`dependency-rules.md` formalizes the layering as `app → features → hooks/helpers → domains → shared`, with no upward imports and no cross-feature imports. `feature-template.md` gives the two canonical folder shapes (simple vs. ViewModel-bearing) and a PR checklist (thin route, stateless components, no inline business logic, no direct storage access, no `any`).

## 2. Real Data-Flow — Traced Feature: `projects/project-workspace`

Traced via `src/app/(dashboard)/.../[projectId]/page.tsx` → `project-workspace.tsx` → `use-project-workspace.ts` → domain layer.

1. **Route** (`app/(dashboard)/.../page.tsx`) — thin wrapper, mounts the Feature Shell only.
2. **Feature Shell** (`project-workspace.tsx`) — composition root; renders `workspace-layout.tsx` and delegates all data/state to the hook.
3. **Hook** (`hooks/use-project-workspace.ts`) — orchestration layer. Calls `getProjects()`, `getMergedRequests()`, `getContracts()`, `getCertificateByProjectId()` (all domain **storage** reads) and `startExecution`, `updateProjectSiloStatus`, `transitionProjectPhase`, `completeProjectExecution`, `startExecutionSilo`, `completeExecutionSilo` (all domain **workflow** actions from `domains/projects/workflow.ts`). No `localStorage` call, no business rule, and no `fetch`/`axios` call appears in the hook itself.
4. **Domain workflow** (`domains/projects/workflow/*.ts`) — encapsulates state-machine transitions (`state-machine.ts`, `transitions.ts`), persistence side-effects (`workflow/helpers/persist.ts`), and cross-entity sync (`workflow/helpers/sync.ts`).
5. **Domain storage** (`domains/projects/storage.ts`) — the only file touching `localStorage`; also owns migration logic (`migrateProjectWorkspace`) for legacy shapes.
6. **ViewModel** (`view-models/project-workspace.viewmodel.ts`) — formats/aggregates `project`, `request`, `contract`, `certificate` into display-ready shape, per ADR-004's "ViewModel only for high complexity" rule.
7. **Presentational components** (`tabs/*.tsx`, `components/*.tsx`) — stateless, receive data/callbacks as props, mounted through `layouts/workspace-content.tsx`.
8. **Mock data root**: domain storage reads ultimately hydrate from `src/mock/*` seed data on first load, then persist through `localStorage` — there is no real backend; `services/api-client.ts` (axios) is wired but not called anywhere in this flow.

**Verdict:** Business/data logic lives in **`domains/`**, not `services/`. `services/api-client.ts` is the only file in `services/` and it is a transport primitive (axios instance + auth header injection + error normalization) — it is not invoked by any traced feature today. Every read, write, and state transition in the real, working feature goes through `domains/*/storage.ts` and `domains/*/workflow.ts`. This matches ADR-002 and ADR-003 exactly; the product spec's flat "intended architecture" simply never anticipated this layer.

## 3. The 4 Locked Decisions

### D1 — `domains/` vs `services/`

**Decision:** `domains/` is the sanctioned, sole business/data layer. `services/` is reserved exclusively for transport-level concerns — HTTP client configuration, auth token injection, request/response interceptors, and (in a future real-backend phase) thin per-domain HTTP call wrappers that `domains/*/storage.ts` will call internally once mocks are replaced.

**Reasoning:** The traced flow (§2) proves `domains/` already carries 100% of live business logic, storage, and workflow state machines, backed by six approved ADRs. `services/` has never grown past a single axios instance in the months this repo has existed — there is no organic pressure to duplicate that responsibility. Introducing a second "service layer" for business logic now would immediately violate ADR-002/003 and fork the single source of truth the ADRs exist to protect.

**Rule for contributors:** New business/data logic — anything that reads, writes, computes derived state, or transitions a workflow — goes in `src/domains/[domain]/{storage.ts,workflow.ts,mappers.ts,types.ts}`. `src/services/` may only contain HTTP transport primitives (axios instances, interceptors, generic request wrappers). If a domain eventually needs a real network call, add `domains/[domain]/api.ts` that imports `apiClient` from `services/api-client.ts` and is itself called only from that domain's `storage.ts` — never directly from a feature or hook.

### D2 — Radix Primitives

**Decision:** Install Radix primitives and generate shadcn wrappers for the patterns already in wide use. Do not continue hand-rolling.

**Reasoning:** ~15 features already implement Dialog/Tabs/Tooltip-shaped UI by hand (`contract-audit-dialog.tsx`, `invoice-audit-dialog.tsx`, `project-workspace-tabs.tsx`, etc.), each with its own focus-trap/keyboard/ARIA behavior (or lack of it). That's accessibility and consistency debt compounding with every new feature, not a one-time cost. `@radix-ui/react-dropdown-menu` and `react-slot` are already installed and working, proving the shadcn pattern is already accepted practice here — the missing packages are the exception, not a new precedent.

**Packages to install:** `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-avatar`, `@radix-ui/react-popover`. Generate matching shadcn wrappers into `src/shared/ui/`: `dialog.tsx`, `tabs.tsx`, `tooltip.tsx`, `select.tsx` (replace raw `<select>`), `checkbox.tsx` (replace raw `<input>`), `label.tsx`, `avatar.tsx`, `popover.tsx`, plus `separator.tsx`/`sheet.tsx`/`skeleton.tsx`/`table.tsx` as the next features need them.

**Rule for contributors:** Any new overlay, tab set, tooltip, select, or checkbox must be built from `src/shared/ui/*` shadcn wrappers, never a hand-rolled `<div>`-based equivalent. Migrating existing hand-rolled instances is follow-up work, not blocking for this pass.

### D3 — i18n

**Decision:** Keep the custom `lib/i18n.ts` dictionary system. Do not migrate to `next-intl`/`i18next`.

**Reasoning:** The custom system is already fully wired end-to-end and working: cookie-driven `NEXT_LOCALE`, middleware-based locale resolution, `<html dir>` RTL/LTR switching, 10 namespaced JSON dictionaries per locale, and a provider consumed throughout the app. A migration would touch every feature that calls `useTranslation()` / `t()` for zero functional gain — this is a textbook case of "don't rewrite working infra" to chase a library name. `next-intl`/`i18next` would only pay off if the team hit a wall the custom system can't clear (e.g., ICU plural rules, server-component-only translation, translation-management-platform integration) — none of which has been raised.

**Rule for contributors:** All new copy goes through the existing `t("namespace:key")` pattern and the existing per-locale JSON files under `src/locales/{ar,en}/`. Do not introduce a second translation mechanism.

### D4 — `any` Backlog + `ignoreBuildErrors`

**Decision:** Env-gate the build-error bypass to CI-only, and gate the `any` rule in two steps: `warn` now, `error` once the current backlog is cleared.

**Reasoning:** `next.config.ts` currently sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` unconditionally (with Arabic comments indicating this was a deliberate, not accidental, choice for velocity during active development) — meaning even CI builds pass with type errors. That's an unacceptable release gate but a reasonable local-dev convenience. Flipping `no-explicit-any` straight to `error` today would fail the build on all 85 existing occurrences at once, which blocks unrelated PRs; a `warn → error` staged rollout lets the backlog be paid down incrementally without a stop-the-world fix.

**Rule for contributors:**
1. Set `eslint.ignoreDuringBuilds` / `typescript.ignoreBuildErrors` to `false` unconditionally in `next.config.ts`, and read the bypass from an env var (e.g. `NEXT_DISABLE_BUILD_CHECKS`) that is only set `true` in local-dev scripts, never in the CI build command.
2. Add `@typescript-eslint/no-explicit-any: "warn"` now so new `any` usages are visible in review without breaking builds.
3. Triage the 85 existing occurrences into a tracked backlog; once cleared, flip the rule to `"error"` and remove the env-gate default so `any` is a hard build failure everywhere.

## 4. Canonical Feature-Folder Convention

Every `features/*` sub-feature must follow one of the two shapes already defined in `feature-template.md` — this reconciliation does not introduce a new shape, it locks the existing one as mandatory going forward:

```text
src/features/[domain]/[sub-feature]/
  index.ts             # public export — the Feature Shell only
  [name].tsx           # Feature Shell / Composition Root
  hooks/
    use-[name].ts
  helpers/
    helpers.ts
  components/          # stateless presentational components
  view-models/          # ONLY if ViewModel-level complexity (ADR-004)
    [name].viewmodel.ts
  schemas/              # per-feature zod schemas, if any
  types/                # per-feature types, if any
```

**Rule:** `components/`, `hooks/`, `schemas/`, `types/`, `utils/` at the top level of a domain folder (e.g. `features/analytics/components/.gitkeep`) are placeholders only — real implementation work must create the sub-feature folder (e.g. `features/analytics/analytics-dashboard/`) and follow the shape above, not populate the domain-root stub directories directly.

**Stub features awaiting this convention:** `auth`, `chat`, `licenses`, `maintenance`, `engineering`, `sales`, `tracking`, `analytics`, `customers`, `dashboard`, `projects` (root-level stubs), `reports`, `settings` — all currently only `.gitkeep` placeholders at the domain root and must be built as sub-feature folders per the tree above.

**Nested-duplication smell — resolved:** `contracts/contract-list/` and `invoices/invoice-list/` are **not** duplication to fix — they are the correct, ADR-006-compliant sub-feature folders and are the ones actually wired into routes (`app/(dashboard)/contracts/page.tsx` imports `ContractList` from `contract-list/contract-list.tsx`). The sibling flat directories — `features/contracts/components/*` and `features/invoices/components/*` (`contracts-table.tsx`, `invoice-audit-dialog.tsx`, `ready-to-generate-section.tsx`, etc.) — are **dead code**: grep confirms nothing outside their own domain folder imports them. **Decision: flatten by deletion** — remove the orphaned flat `components/`/`helpers/` directories at `features/contracts/` and `features/invoices/` root in a follow-up PR (out of scope for this read-only-plus-rename pass); keep the nested `contract-list/` and `invoice-list/` folders as-is.

## 5. Recommended Build Order

**Reference implementation candidate: `licenses`.** It already has real domain-adjacent scaffolding — `types/license.ts`, `schemas/license.schema.ts` (Zod), and seed data in `mock/licenses.ts` — but no `src/domains/licenses/` yet and only `.gitkeep` stubs under `features/licenses/*`. This makes it the cleanest test of the reconciled convention end-to-end: build `domains/licenses/{storage.ts,workflow.ts,mappers.ts,types.ts}` from scratch following ADR-002/003 exactly, then a `features/licenses/license-list/` (or similar) sub-feature following §4's shape and ADR-004's Thin Route → Shell → Hook → Components chain. Because nothing pre-existing needs to be reconciled or migrated (unlike `contracts`/`invoices`, which carry the dead flat-folder baggage), `licenses` gives the clearest signal on whether the locked conventions are actually sufficient before every remaining stub (`auth`, `chat`, `maintenance`, `engineering`, `sales`, `tracking`) is built against them.

## 6. Cleanup Log

- **Renamed:** `package.json` `"name"` field — `temp-app` → `sslm-platform`. (Applied in this pass.)
- **Safe to delete (not deleted yet):** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` — default Next.js starter boilerplate icons, confirmed unreferenced by any product code.
- **Flagged for a follow-up PR (not deleted yet):** `src/features/contracts/components/*` and `src/features/invoices/components/*` (flat, orphaned duplicates of `contract-list/components/` and `invoice-list/components/` — see §4).
- **Flagged for a follow-up PR (discovered building `/subscriptions`, not fixed here):** `src/features/companies/` uses a flat, non-ADR-006-compliant folder structure — its files (`company-list.tsx`, `hooks/`, `components/`) sit directly at the feature root instead of inside a `companies/company-list/` sub-feature folder, the same anti-pattern flagged for `contracts`/`invoices` in §4. The new `features/subscriptions/subscription-matrix/` sub-feature was built compliant instead of mirroring it.
- **Flagged for a follow-up PR (discovered building `/subscriptions`, not fixed here):** `src/features/companies/` i18n copy lives as flat `companies.*` keys inside `locales/{ar,en}/common.json` instead of a dedicated namespace file, unlike every other domain. `/subscriptions` was given its own `locales/{ar,en}/subscriptions.json` namespace instead of repeating this.
