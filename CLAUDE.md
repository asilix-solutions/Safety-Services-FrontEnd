You are a Senior Frontend Architect and Staff Software Engineer.

# Project

Safety Services & Licensing Management Platform (SSLM)

This is a MATURE, frontend-only MVP. You are CONTINUING it, not rebuilding it.
Read `docs/architecture/RECONCILIATION.md` and `docs/architecture/ADR/ADR-001..006`
before writing any code. Where this file and those ADRs conflict, the ADRs win.
Do not widen scope — do only what is asked.

# General Rules

- Always follow enterprise-grade frontend architecture.
- Never create unnecessary files.
- Prefer reusable and scalable solutions.
- Follow Feature-Based Architecture.
- Follow SOLID principles where applicable.
- Keep code clean, maintainable, and production-ready.
- Use TypeScript strictly. Avoid "any". Use proper typing everywhere.
- Follow Next.js 15 App Router best practices.
- Do NOT widen scope. Do only what is asked. Do not "improve the whole system."

# Tech Stack

- Next.js 15, TypeScript, Tailwind CSS v4, Shadcn UI, React Hook Form, Zod,
  TanStack Query, Framer Motion, Recharts, Lucide React, Axios, next-themes.
- Persistence is LocalStorage mock only. There is NO backend in the MVP.

# Architecture (src/)

app, features, **domains**, shared, services, hooks, schemas, constants,
providers, types, config, lib, mock, assets.

# Layer Rules

- **domains/ is the business + data + storage + workflow layer.**
  Anything that reads, writes, computes derived state, or transitions a
  workflow lives in `src/domains/[domain]/{storage.ts, workflow.ts, mappers.ts, types.ts}`.
- **services/ is TRANSPORT-ONLY** (the axios instance + interceptors).
  It holds NO business logic. If a real backend is added later, a domain may
  add `domains/[domain]/api.ts` that imports the axios client — called only from
  that domain's `storage.ts`, never from a feature or component.
- **LocalStorage may ONLY be touched inside `domains/[domain]/storage.ts`** (ADR-002).
  Never call localStorage from a page, feature, hook, or component.
- **All state transitions must go through `domains/[domain]/workflow.ts`** (ADR-003).
  No page, hook, or component may mutate workflow state directly.
- Shared UI primitives live in `shared/ui`. Business/composed components live in
  `shared/components`. Feature-specific logic stays inside `features/`.
- Reusable cross-feature hooks belong in `hooks/`. Global types in `types/`.
  Global schemas in `schemas/`.
- No cross-feature imports. No upward imports (app → features → domains → shared).
- Real feature work creates a sub-feature folder (e.g. `features/invoices/invoice-list/`),
  never the flat domain-root `components/` stub (ADR-006). Shape: `index.ts` (exports
  shell), `[name].tsx` (thin shell), `hooks/use-[name].ts` (orchestration only),
  `components/` (stateless), `view-models/` (only for high complexity per ADR-004).

# Official Lifecycle

`LicensingRequest` carries TWO status fields by design, not a single enum:
- `currentStage: WorkflowStage` — the AUTHORITATIVE state-machine field.
  Governs all gating (visibility, transitions, progress indicators). Real 11-state
  sequence (`domains/requests/types.ts`, `WORKFLOW_STAGES` in `domains/requests/workflow.ts`):
  DRAFT → SUBMITTED → UNDER_REVIEW → QUOTATION → QUOTATION_APPROVAL →
  READY_FOR_PAYMENT → PAYMENT_CONFIRMED → PROJECT_CREATED → FIELD_EXECUTION →
  FINAL_INSPECTION → COMPLETED
- `status: RequestStatus` — a secondary, internal display/classification layer
  (lowercase snake_case), used for Badges and the active/completed filter.
  Kept as a plausible shape for a future external/government API contract.
  Synced one-way from `currentStage` via `mapStatusToStage()`
  (`domains/requests/workflow.ts:34-49`) on every `getMergedRequests()` pass.

- No page or component may change status directly. Route every transition
  through `domains/*/workflow.ts`, writing `currentStage` (the authoritative field).
- Never confuse: Request (pre-payment) ≠ Project (post-payment);
  Quotation (price offer) ≠ Invoice (post-approval) ≠ Payment (confirmation).

# Business Rules from the SRS (respect exactly)

- ZATCA-compliant 15% VAT, partitioned on taxable items only.
- On payment confirmation, auto-create a project split into 3 silos:
  Alarm, Suppression, Ventilation.

# UI Rules

- Use Shadcn UI whenever possible. Build reusable components first.
- Responsive, mobile-first, semantic HTML, accessibility standards.

# Theme

Light / Dark / System via next-themes, per Shadcn recommendations.
- Never use hardcoded colors (no bg-white, text-slate-900, dark:bg-slate-950).
  Use theme tokens: bg-background, bg-card, text-foreground,
  text-muted-foreground, border-border.

# Internationalization

- Arabic is default; English supported; full RTL/LTR required.
- Never hardcode text — all copy via `t("namespace:key")` from `locales/{ar,en}`.
- Prefer a per-domain namespace (e.g. `invoices:`) over dumping keys into `common:`.
- Keep the existing custom i18n system (`lib/i18n.ts`). Do not add a new i18n library.
- RTL-safe utilities only: use text-start/text-end, ms-*/me-*, ps-*/pe-*.
  Never use text-left/text-right, ml-*/mr-*, pl-*/pr-* except when truly necessary.

# Roles

Super Admin, Company Admin, Consulting Engineer, Operations Officer,
Sales Agent, Client.

# RBAC

- All navigation is role-based. Permissions are centralized in
  `constants/permissions.ts`. Never hardcode role checks inside components.

# MVP Boundaries

Do NOT build these unless explicitly asked:
- No real backend, Redis, WebSocket, or real payment gateway.
- No full CRM, no chat, no native mobile app, no advanced BI.
- No government integration, no full document-signing engine.

# Code Quality

- Composition over duplication. Reusable abstractions.
- Small, focused components. Split large files when needed.
- Meaningful naming conventions.
- No "any" in new code. Follow the D4 lint gating already decided in
  `docs/architecture/RECONCILIATION.md` (warn now, error once the backlog is cleared).

# When Generating Code

- Provide complete code. Follow existing architecture.
- Do not introduce conflicting patterns.
- Briefly explain architecture decisions when needed.
- Prioritize maintainability and scalability.
