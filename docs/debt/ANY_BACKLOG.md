# `any` Backlog — RECONCILIATION.md D4

_Generated: 2026-07-06, via `npx eslint src --format json` with `@typescript-eslint/no-explicit-any` set to `"warn"`._

**Total: 86 occurrences across 43 files.**

Flip `no-explicit-any` to `"error"` and remove the `NEXT_DISABLE_BUILD_CHECKS` default once this list is cleared.

## By domain / feature (rollup)

| Path group | Count |
|---|---|
| `features/projects` | 26 |
| `domains/projects` | 13 |
| `features/employees` | 13 |
| `features/reports` | 7 |
| `app` | 5 |
| `features/certificates` | 3 |
| `features/contracts` | 3 |
| `features/customers` | 3 |
| `features/invoices` | 3 |
| `features/requests` | 3 |
| `domains/requests` | 2 |
| `features/blueprint-review` | 2 |
| `features/settings` | 2 |
| `shared` | 1 |

## By file

| Path | Count |
|---|---|
| `src/domains/projects/workflow/execution.ts` | 6 |
| `src/features/projects/project-workspace/tabs/overview-tab.tsx` | 6 |
| `src/features/reports/hooks/use-reports-hub.ts` | 6 |
| `src/features/employees/dialogs/invite-employee-dialog.tsx` | 5 |
| `src/app/(dashboard)/quotations/[jobNumber]/page.tsx` | 3 |
| `src/domains/projects/workflow/inspection.ts` | 3 |
| `src/features/contracts/contract-list/hooks/use-contract-list.ts` | 3 |
| `src/features/employees/components/employee-filters.tsx` | 3 |
| `src/features/employees/drawers/employee-details-drawer.tsx` | 3 |
| `src/features/projects/project-workspace/tabs/execution-tab.tsx` | 3 |
| `src/features/requests/components/service-details-card.tsx` | 3 |
| `src/domains/projects/storage.ts` | 2 |
| `src/domains/projects/workflow/completion.ts` | 2 |
| `src/domains/requests/storage.ts` | 2 |
| `src/features/blueprint-review/hooks/use-blueprint-workspace.ts` | 2 |
| `src/features/certificates/hooks/use-certificate-list.ts` | 2 |
| `src/features/customers/hooks/use-customer-list.ts` | 2 |
| `src/features/employees/hooks/use-employee-list.ts` | 2 |
| `src/features/projects/final-inspection/components/inspection-checklist.tsx` | 2 |
| `src/features/projects/final-inspection/components/inspection-summary.tsx` | 2 |
| `src/features/projects/final-inspection/hooks/use-final-inspection.ts` | 2 |
| `src/app/(dashboard)/layout.tsx` | 1 |
| `src/app/(dashboard)/requests/[jobNumber]/page.tsx` | 1 |
| `src/features/certificates/helpers/formatters.ts` | 1 |
| `src/features/customers/components/customer-filters.tsx` | 1 |
| `src/features/invoices/invoice-list/components/invoice-actions.tsx` | 1 |
| `src/features/invoices/invoice-list/components/invoice-table.tsx` | 1 |
| `src/features/invoices/invoice-list/hooks/use-invoice-list.ts` | 1 |
| `src/features/projects/project-workspace/components/certificates-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/contracts-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/execution-summary-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/linked-request-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/obstacle-list.tsx` | 1 |
| `src/features/projects/project-workspace/components/project-completed-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/project-health-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/project-timeline-card.tsx` | 1 |
| `src/features/projects/project-workspace/components/request-documents-card.tsx` | 1 |
| `src/features/projects/project-workspace/tabs/documents-tab.tsx` | 1 |
| `src/features/projects/project-workspace/tabs/obstacles-tab.tsx` | 1 |
| `src/features/reports/components/report-drawer.tsx` | 1 |
| `src/features/settings/components/tabs/security-tab.tsx` | 1 |
| `src/features/settings/components/tabs/workspace-tab.tsx` | 1 |
| `src/shared/components/empty-state.tsx` | 1 |

## Blocking type errors (`tsc --noEmit`)

None. `npx tsc --noEmit` is clean — flipping `typescript.ignoreBuildErrors` to its env-gated default (`false`) does not surface any type errors today.

## Blocking lint errors — RESOLVED (2026-07-06)

All 15 pre-existing `error`-severity ESLint violations (unrelated to `any`) that were blocking `next build` with the bypass off have been fixed in a dedicated mechanical pass:

| Path | Line | Rule | Fix |
|---|---|---|---|
| `src/app/(dashboard)/layout.tsx` | 45 | `prefer-const` | `let isAllowed` → `const isAllowed` |
| `src/app/(dashboard)/quotations/[jobNumber]/page.tsx` | 116 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/quotations/workflow` |
| `src/app/(dashboard)/requests/[jobNumber]/page.tsx` | 651 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/projects/storage` |
| `src/app/(dashboard)/requests/[jobNumber]/page.tsx` | 670 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/site-visits/storage` |
| `src/features/invoices/components/invoices-table.tsx` | 150 | `prefer-const` | `let label` → `const label` (dead file — see note below) |
| `src/features/invoices/invoice-list/components/invoice-actions.tsx` | 225 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/site-visits/storage` |
| `src/features/projects/project-workspace/tabs/overview-tab.tsx` | 140 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/projects/workflow/kickoff` |
| `src/features/projects/project-workspace/tabs/overview-tab.tsx` | 206 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/site-visits/storage` |
| `src/features/projects/project-workspace/tabs/overview-tab.tsx` | 223 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/projects/workflow/kickoff` |
| `src/features/projects/project-workspace/tabs/overview-tab.tsx` | 247 | `@typescript-eslint/no-require-imports` | `require()` → static import from `@/domains/projects/workflow/kickoff` |
| `src/shared/ui/checkbox.tsx` | 4 | `@typescript-eslint/no-empty-object-type` | `interface CheckboxProps extends X {}` → `type CheckboxProps = X` |
| `src/shared/ui/input.tsx` | 4 | `@typescript-eslint/no-empty-object-type` | `interface InputProps extends X {}` → `type InputProps = X` |
| `src/shared/ui/label.tsx` | 4 | `@typescript-eslint/no-empty-object-type` | `interface LabelProps extends X {}` → `type LabelProps = X` |
| `src/shared/ui/select.tsx` | 4 | `@typescript-eslint/no-empty-object-type` | `interface SelectProps extends X {}` → `type SelectProps = X` |
| `src/shared/ui/textarea.tsx` | 4 | `@typescript-eslint/no-empty-object-type` | `interface TextareaProps extends X {}` → `type TextareaProps = X` |

Verified: `npx tsc --noEmit` clean, `npx next build --turbopack` with `NEXT_DISABLE_BUILD_CHECKS` unset now **passes** end-to-end. The `ignoreDuringBuilds: false` / `ignoreBuildErrors: false` defaults in `next.config.ts` now have real teeth in CI.

**Note:** `src/features/invoices/components/invoices-table.tsx` is part of the dead flat `features/invoices/components/` folder flagged for deletion in `RECONCILIATION.md` §4. It was fixed here only to unblock the build; deleting the whole flat folder (out of scope for this pass) would remove this file and its fix along with it.
