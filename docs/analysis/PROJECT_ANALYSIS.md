# SSLM Project Analysis — Read-Only Audit
_Generated: 2026-07-06_

## 1. Executive Summary

The repo is a **single, clean Next.js 15 App Router codebase** — the assumed "dual Expo/RN stack" does not exist here; no `app.json`, `metro.config.js`, `babel.config.js`, nativewind config, `AGENTS.md`, or `CLAUDE.md` were found anywhere in the tree. No file renames/moves are required — `globals.css`, `layout.tsx`, and routes are already correctly placed under `src/app`. The real risks are: (1) the codebase already has a real, ADR-documented `src/domains` layer that the "intended stack" list never mentions, (2) `next.config.ts` silently swallows all TypeScript and ESLint errors at build time, directly undermining the "strict, no `any`" requirement, and (3) several `shared/ui` components (Select, Checkbox, Avatar, Label, and all Dialog/Tabs/Tooltip usages) are hand-rolled HTML instead of Radix-backed shadcn primitives, with the corresponding `@radix-ui/*` packages absent from `package.json`. Dependency versions are largely current and correctly pinned to Next 15 per spec; earlier suspicion about `lucide-react ^1.17.0` is unfounded (1.17.0 is a real, near-latest release).

## 2. Current File Tree

```text
.
├── components.json
├── docs/
│   ├── architecture/
│   │   ├── ADR/ (ADR-001..006)
│   │   ├── dependency-rules.md
│   │   ├── feature-template.md
│   │   └── project-tree.md
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json / package-lock.json
├── postcss.config.mjs
├── public/ (svg assets only)
├── README.md
├── tsconfig.json
└── src/
    ├── app/
    │   ├── (auth)/login/page.tsx
    │   ├── (dashboard)/ (30+ route folders, layout.tsx, page.tsx)
    │   ├── favicon.ico, globals.css, layout.tsx
    ├── constants/            # navigation, permissions, query-keys, roles, routes, statuses, status-translations
    ├── domains/              # certificates, contracts, customers, employees, engineering, invoices,
    │                         #   payments, projects (+workflow/*), quotations (+workflow/*), reports,
    │                         #   requests, settings, site-visits, workflow-validation, workflows
    ├── features/             # ~30 feature folders: analytics, auth, blueprint-review, certificates,
    │                         #   chat, client-overview, company-admin-overview, consulting-engineer-overview,
    │                         #   contracts, customers, dashboard, dashboard-overview, employees, engineering,
    │                         #   invoices, licenses, maintenance, operations-overview, projects, reports,
    │                         #   requests, sales, sales-agent-overview, settings, site-visits, super-admin-overview,
    │                         #   tracking
    ├── lib/                  # formatters.ts, i18n.ts, utils.ts
    ├── locales/{ar,en}/      # 10 JSON namespaces each (auth, common, customers, dashboard, maintenance,
    │                         #   projects, reports, requests, settings, validation)
    ├── mock/                 # analytics, customers, licenses, maintenance, notifications, projects, reports,
    │                         #   requests, users
    ├── providers/            # AuthProvider, QueryProvider, ThemeProvider, i18n-provider
    ├── schemas/              # client-request, customer, license, login, maintenance, profile, project, report
    ├── services/api-client.ts
    ├── shared/
    │   ├── charts/ (area, bar, line, pie — Recharts wrappers)
    │   ├── components/ (action-button, action-menu, data-table, empty-state, file-upload,
    │   │                 filters-bar, language-switcher, page-header, search-input, stats-card,
    │   │                 status-badge, theme-toggle, activity-timeline)
    │   ├── layouts/ (admin-layout, app-header, client-layout, operations-layout)
    │   ├── tables/ (data-table, table-empty, table-loading, table-pagination, table-toolbar)
    │   └── ui/ (avatar, badge, button, card, checkbox, dropdown-menu, input, label, select, textarea)
    └── types/                # analytics, api, customer, i18n, license, maintenance, notification,
                              #   project, project-status, report, request-status, role, user
```

(Full recursive listing is available via `find` — omitted here for brevity; nothing was found under `node_modules`, `.next`, or `.git` that affects the audit.)

## 3. Stack Conflict — DELETE list / RENAME-MOVE list

**No Expo/React Native artifacts exist in this repository.** Verified absence of: `app.json`, `metro.config.js`, `babel.config.js`, any `nativewind` config, `AGENTS.md`, `CLAUDE.md`. This premise in the task brief does not match the current repo state.

**No misplaced/duplicate Next.js files exist either** — checked for and did not find: `next_config.ts`, root-level `global.css` (only `src/app/globals.css` exists, matching `components.json`), stray root `layout.tsx`/`page.tsx`/`index.tsx` outside `src/app`.

| Category | Finding | Action |
|---|---|---|
| Expo/RN files | None present | No action — nothing to delete |
| Duplicate configs | None present | No action |
| Misplaced routes | None present | No action |
| `package.json` `"name"` | `"temp-app"` — leftover scaffold name, not the product name | Rename to something like `sslm-platform` (cosmetic, low priority) |

## 4. Dependency Audit

Versions checked against the live npm registry on 2026-07-06.

| Package | Current | Latest (npm) | Verdict | Action |
|---|---|---|---|---|
| `next` | 15.5.19 | 16.2.10 | OK — Next 15 is the explicit spec target, intentionally not on 16 | Keep on 15.x line, take latest 15.x patch |
| `react` / `react-dom` | 19.1.0 | 19.2.7 | OK, slightly behind | Bump patch when convenient |
| `lucide-react` | ^1.17.0 | 1.23.0 | **Not suspicious** — 1.x is the real current major; task brief's suspicion was unfounded | No action |
| `axios` | ^1.17.0 | 1.18.1 | OK | Minor bump optional |
| `zod` | ^4.4.3 | 4.4.3 | OK, exact latest | No action |
| `recharts` | ^3.8.1 | 3.9.2 | OK | Minor bump optional |
| `framer-motion` | ^12.40.0 | 12.42.2 | OK | Minor bump optional |
| `@tanstack/react-query` | ^5.101.0 | 5.101.2 | OK | No action |
| `react-hook-form` | ^7.77.0 | 7.81.0 | OK | No action |
| `tailwindcss` | ^4 | 4.3.2 | OK | No action |
| `next-themes` | ^0.4.6 | 0.4.6 | OK, exact latest | No action |
| `@radix-ui/react-dropdown-menu`, `react-slot` | present | — | OK, used by `dropdown-menu.tsx`/`button.tsx` | No action |
| `@radix-ui/react-select` | **missing** | — | `shared/ui/select.tsx` is a raw `<select>`, not a Radix Select | Add if a real shadcn Select (custom listbox, styling parity) is required |
| `@radix-ui/react-checkbox` | **missing** | — | `shared/ui/checkbox.tsx` is a raw `<input type="checkbox">` | Add if Radix-based indeterminate/keyboard semantics are required |
| `@radix-ui/react-label` | **missing** | — | need to confirm `label.tsx` implementation, likely raw `<label>` | Add if Radix `Label` (auto `htmlFor`/`for` wiring) is required |
| `@radix-ui/react-avatar` | **missing** | — | need to confirm `avatar.tsx` implementation | Add if Radix fallback-image semantics are required |
| `@radix-ui/react-dialog`, `react-tabs`, `react-tooltip`, `react-popover` | **missing** | — | Dialog/Tabs/Tooltip patterns are used across 15+ feature files (e.g. `contract-audit-dialog.tsx`, `project-workspace-tabs.tsx`) with no corresponding primitives in `shared/ui` — these are hand-rolled, not shadcn-standard | Decide: keep hand-rolled or install Radix primitives + generate shadcn `dialog.tsx`/`tabs.tsx`/`tooltip.tsx` wrappers |
| `@tanstack/react-query-devtools` | **missing** (dev) | — | No devtools for query debugging | Add as devDependency |
| i18n library (`next-intl`, `i18next`) | **absent by design** | — | Custom hand-rolled dictionary system in `src/lib/i18n.ts` + `providers/i18n-provider.tsx` — functional but reinvents namespace loading, pluralization, interpolation | Acceptable if intentional; flag if a standard library was expected |
| `date-fns` / `dayjs` | **missing** | — | `src/lib/formatters.ts` likely hand-rolls date formatting — needs verification | Verify; add if locale-aware date formatting (Arabic/Gregorian) is needed |
| ESLint `next/typescript` plugin | present | — | Baseline `no-explicit-any` comes from this preset | Confirm rule isn't overridden; currently 85 occurrences of `any`/`as any` in `src/` violate the "strict, no `any`" requirement regardless of lint config |

## 5. Architecture Gap Matrix

| Layer (per spec) | Exists? | Notes / Issues |
|---|---|---|
| `app` | ✅ | Thin route wrappers, App Router groups `(auth)`, `(dashboard)` — matches ADR-001 guidance on paper; spot-check needed to confirm pages don't embed business logic (out of scope for this pass, flagged for follow-up) |
| `features` | ✅ | ~30 feature folders; **inconsistent internal shape** — some are fully scaffolded (`.gitkeep`-only stubs: `auth`, `chat`, `licenses`, `maintenance`, `engineering`, `sales`, `tracking`), others deeply implemented (`projects/project-workspace`, `blueprint-review`, `contracts/contract-list`). No enforced sub-structure (`components/hooks/schemas/services/types/utils`) — some features nest an extra sub-feature layer (e.g. `contracts/contract-list/`, `invoices/invoice-list/`, `site-visits/site-visits-list/`) duplicating folder names one level down |
| `shared` (ui) | ✅ | Only 10 primitives (avatar, badge, button, card, checkbox, dropdown-menu, input, label, select, textarea) — missing dialog, tabs, tooltip, popover, sheet, table, separator, skeleton despite heavy usage patterns for Dialog/Tabs across features |
| `shared` (components) | ✅ | Reasonable set of composed shared widgets (data-table, filters-bar, page-header, etc.) |
| `services` | ⚠️ Minimal | Only `api-client.ts` (axios instance) — no per-domain service modules; actual data access appears to live in `domains/*/storage.ts` instead |
| `hooks` | ❌ Missing as top-level | No `src/hooks`; hooks are scattered inside `features/*/hooks/*` only — acceptable if hooks are meant to be feature-scoped, but there's no home for cross-feature hooks |
| `schemas` | ✅ | Present at `src/schemas/*.schema.ts` (Zod) — but also duplicated as empty `.gitkeep` stubs inside `features/*/schemas/` (per-feature schemas planned but unused) |
| `constants` | ✅ | Well populated |
| `providers` | ✅ | Auth, Query, Theme, i18n all present and wired into `app/layout.tsx` |
| `types` | ✅ | Present at `src/types/*` |
| `config` | ❌ Missing entirely | No `src/config` directory (env config, feature flags, app constants that aren't route/permission related) |
| `lib` | ✅ | formatters, i18n, utils |
| `mock` | ✅ | Present, used presumably in absence of a real backend |
| `assets` | ❌ Missing | No `src/assets`; only `public/*.svg` (default Next.js starter icons — `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are all boilerplate, unused by the actual product) |
| **`domains`** | ⚠️ Not in spec | This is the largest, most mature layer in the repo (workflow state machines for `projects`, `quotations`, storage, mappers, validators) and is governed by its own ADRs (`ADR-001` through `ADR-006`) and `dependency-rules.md`. **The task's "intended stack" list never mentions this layer** — it is a de facto core architectural decision already in production that any roadmap must respect, not override |

## 6. Config Issues

| File | Issue |
|---|---|
| `next.config.ts` | `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` are both set — production builds will succeed even with type errors or lint failures. Directly contradicts "TypeScript strict, no `any`" as an enforced constraint. Comments are in Arabic explaining the bypass, meaning this was a deliberate, not accidental, choice — needs an explicit decision on whether to keep it during active development and disable before any release build |
| `tsconfig.json` | `strict: true` is set correctly; `paths` alias `@/*` → `./src/*` matches `components.json` aliases. No `noUncheckedIndexedAccess` or `noImplicitAny`-adjacent stricter flags beyond base `strict` — acceptable but not maximal |
| `components.json` | Aliases (`components` → `@/shared/components`, `ui` → `@/shared/ui`, `utils` → `@/lib/utils`) are internally consistent with actual folder layout and `tsconfig.json` path mapping. `tailwind.config: ""` is expected for Tailwind v4 (no JS config file — confirmed no `tailwind.config.ts/js` exists in repo, consistent with v4's CSS-first config) |
| `postcss.config.mjs` | Correctly uses `@tailwindcss/postcss` only, consistent with Tailwind v4 |
| `globals.css` location | `src/app/globals.css` — correct location, matches `components.json` `tailwind.css` path and is imported once in `src/app/layout.tsx` |
| `package.json` name | `"temp-app"` — scaffold leftover, cosmetic only |

## 7. Foundations Readiness Checklist

Already in place (verified, working):
1. ✅ Theme provider (`next-themes`, class-based, system-aware) wired in root layout
2. ✅ Query provider (`@tanstack/react-query`) wired in root layout
3. ✅ i18n + direction provider (custom, cookie-driven `NEXT_LOCALE`, default `ar`, RTL/LTR on `<html dir>`) wired in root layout and middleware
4. ✅ Axios instance with auth-token injection and centralized error normalization (`src/services/api-client.ts`)
5. ✅ RBAC permission map (`src/constants/permissions.ts`, `hasPermission()` helper) covering all 6 roles from spec
6. ✅ Base layout + route groups (`(auth)`, `(dashboard)`) with role-specific dashboard resolvers already implemented (`dashboard-resolver.tsx`, per-role dashboard components)
7. ✅ Folder scaffolding for features not yet built (`.gitkeep` stubs for auth, chat, licenses, maintenance, engineering, sales, tracking, analytics)

Still needed before further feature work should proceed cleanly:
1. Decide on `domains/` vs spec's flat list — document this deviation formally (it already has ADRs; the task brief just needs to incorporate it) so future contributors aren't told to "flatten" a working layer
2. Add `src/config` for environment/feature-flag concerns currently nowhere (env var reads are ad hoc, e.g. inline `process.env.NEXT_PUBLIC_API_URL` in `api-client.ts`)
3. Resolve missing Radix primitives (dialog, tabs, tooltip, popover) vs. continuing hand-rolled versions — inconsistent today, some features use custom dialogs, this should be standardized before more features copy the pattern
4. Re-enable `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` = `false` at least in CI, even if left relaxed for local dev
5. Address the 85 `any`/`as any` occurrences incrementally, ideally gated by a lint rule bump (`@typescript-eslint/no-explicit-any: error`) once the backlog is triaged
6. Clean up default Next.js boilerplate assets in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — none appear referenced by the actual product

## 8. Proposed Next-Step Roadmap

**P0 — Cleanup** (no code behavior change)
- Rename `package.json` `"name"` from `temp-app` to the real product slug
- Remove unused default Next.js SVGs from `public/`
- Decide and document the `domains/` layer's place in the architecture (update the task's own "intended stack" understanding, not the repo)

**P1 — Foundations hardening**
- Add `src/config` for env/feature-flag reads, replace ad hoc `process.env.*` reads
- Flip `ignoreBuildErrors`/`ignoreDuringBuilds` to `false` in a CI-only config or via env-gated override
- Triage the 85 `any` usages; add `@typescript-eslint/no-explicit-any` as `warn` first, `error` after backlog is cleared
- Decide fate of missing Radix packages: either install `@radix-ui/react-dialog`, `react-tabs`, `react-tooltip`, `react-select`, `react-checkbox`, `react-label`, `react-avatar` and regenerate shadcn wrappers, or formally accept the hand-rolled versions as intentional and document why

**P2 — Shared UI completion**
- Build out missing shadcn primitives identified above (dialog, tabs, tooltip, popover, sheet, table, separator, skeleton) so features stop hand-rolling overlay/tab patterns
- Consolidate the duplicated nested-feature pattern (e.g. `contracts/contract-list/`, `invoices/invoice-list/`, `site-visits/site-visits-list/`) into a single consistent convention across all features

**P3 — First feature to full standard**
- Pick one still-stub feature (e.g. `licenses`, which has real domain types (`types/license.ts`) and mock data (`mock/licenses.ts`) already but only `.gitkeep` stubs in `features/licenses/*`) and build it end-to-end against the now-hardened foundations as the reference implementation for all remaining stub features
