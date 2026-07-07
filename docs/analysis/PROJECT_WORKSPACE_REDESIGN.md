# Project Workspace — Diagnosis & Redesign Plan
_Generated: 2026-07-07 — read-only analysis. No application code was modified to produce this document._

**Scope note on sourcing:** No SRS PDF/Word document exists anywhere in this repository (`find . -iname "*srs*"` and `*.pdf` both return empty, confirmed again during this pass). The only committed SRS distillation is the **"Business Rules from the SRS"** section of `CLAUDE.md` (lines 69–73) plus the ADRs. Section 1 below is grounded in that text, in `docs/architecture/RECONCILIATION.md`, and in corroborating evidence already staged in the codebase (domain types, storage seeders, and locale namespaces that name a feature but whose UI was never built — cited by exact file/line). Where the task brief's suggested items (UC-03, §3.4.x, obstacle "broadcast", commissioning metrics, signed/stamped closure photo) have **no corresponding line in any committed document or code artifact**, this is stated explicitly as **[UNGROUNDED — no SRS citation found]** rather than invented.

---

## 1. SRS truth for Projects / Field Execution (MVP only)

| Requirement | Tag | Grounding |
|---|---|---|
| 3 silos — Alarm / Suppression / Ventilation, auto-created on payment confirmation | **[MVP]** | `CLAUDE.md` line 72–73: "On payment confirmation, auto-create a project split into 3 silos: Alarm, Suppression, Ventilation." Implemented: `src/domains/projects/storage.ts` `buildProjectWorkspaceTemplate()` (lines 133–164) hard-codes exactly these three `SiloExecutionData` entries when `workspaceTemplate` is `installation_full`/`installation_fast`. |
| Lifecycle owned by this page: `PROJECT_CREATED → FIELD_EXECUTION → FINAL_INSPECTION → COMPLETED` | **[MVP]** | `CLAUDE.md` line 61–62 (Official Lifecycle). Internally the feature subdivides this into a 9-step `ProjectExecutionPhase` enum (`src/types/project.ts` lines 5–14) and a matching guarded state machine (`src/domains/projects/workflow/state-machine.ts` lines 6–32). |
| 15% ZATCA VAT, partitioned taxable/exempt | **[MVP]** | `CLAUDE.md` line 71: "ZATCA-compliant 15% VAT, partitioned on taxable items only." Currently only implemented in the **Quotation** builder (`src/app/(dashboard)/quotations/[jobNumber]/page.tsx` lines 82–85, per-item `taxable` boolean). `src/locales/en/projects.json` already stages a `procurement.*` namespace (lines 67–70, 88–89: `procurement.title`, `procurement.totalCost`, `procurement.invoices`, `procurement.noInvoices`, `procurement.noMaterials`) implying a field-execution procurement ledger was planned for this page — but no VAT-aware procurement UI or domain field exists in `src/domains/projects/types.ts` or `SiloExecutionData`. |
| Field labor: Internal (cost-zeroed) vs. Outsource (wage entry) distinction | **[MVP]** | `src/locales/en/projects.json` lines 71–74 (`labor.title`, `labor.crewSize`, `labor.fieldStatus`, `labor.fieldNotes`, `labor.noStaff`) stage a "Field Workforce & Hours" concept. `SiloExecutionData` (`src/types/project.ts` lines 22–31) only has one blended `laborCount: number` and one blended `costSAR: number` — there is no `laborType: "internal" | "outsource"` or per-worker wage field anywhere in the type or storage layer. The Internal/Outsource split named in the task brief has no further grounding beyond this locale-namespace evidence; the specific "cost-zeroed" wording is **[UNGROUNDED — no SRS citation found]** beyond that inference. |
| Obstacle log (description) | **[MVP]** | Implemented as `ProjectTask` (`src/types/project.ts` lines 64–72) filtered into critical/standard by `groupProjectObstacles()` (`src/features/projects/project-workspace/helpers/obstacles.ts`). Locale keys `obstacles.log`, `obstacles.photos`, `obstacles.noPhotos` (`projects.json` lines 75–79) additionally stage a **photo-attachment** concept for obstacles that is not built. |
| Obstacle "broadcast" (notify other roles) | **[UNGROUNDED — no SRS citation found]** | No field, event, or locale key anywhere in `domains/projects`, `types/project.ts`, or `projects.json` implies a broadcast/notification mechanism. Also out of MVP boundary per `CLAUDE.md` line 110 ("No... WebSocket"). Do not build. |
| Commissioning metrics | **[UNGROUNDED — no SRS citation found]** | No `safetyScore`-adjacent metrics beyond the single `Project.safetyScore?: number` field (`src/types/project.ts` line 87), gated only as a guard condition for the `COMPLETED` transition (`state-machine.ts` line 113). No "metrics" plural, dashboard, or chart requirement is cited anywhere. Treat the existing single `safetyScore` value as the MVP-complete implementation of this concept; do not expand scope. |
| Closure via signed/stamped report photo | **[MVP, partially]** | `src/locales/en/projects.json` line 86 stages `clientView.finalPhotos: "Upload Completion Photos"`. `ProjectCompletionData`/`ProjectInspectionData` (`src/types/project.ts` lines 44–55) carry `notes`, `decisionBy`, `completedAt` but **no photo/attachment/signature field**. `src/features/projects/final-inspection/` (a sibling feature, out of this page's direct scope but consumed by `OverviewTab` at `overview-tab.tsx` line 106 `<FinalInspectionPanel>`) is where closure documentation should live per ADR-001 boundaries — worth flagging as a cross-feature dependency, not duplicating in project-workspace. |
| Silos auto-created only for `installation_full`/`installation_fast` templates (not maintenance/compliance) | **[MVP]** | `storage.ts` line 133 conditional; confirms silos are template-scoped, matching `ExecutionTab`'s own guard at `execution-tab.tsx` line 72. |

---

## 2. Audit

### 2a. Exists & correct (keep as-is)

| Item | File |
|---|---|
| Thin route → Feature Shell → Hook → Presentational Components chain | `src/app/(dashboard)/projects/[projectId]/page.tsx` → `project-workspace.tsx` → `use-project-workspace.ts` → `tabs/*.tsx` — matches ADR-004 exactly, confirmed by `RECONCILIATION.md` §2 trace |
| Guarded workflow actions for the real business transitions (kickoff, start/complete silo, complete execution, approve/return inspection) | `src/domains/projects/workflow/{kickoff,execution,completion,inspection}.ts` — each calls a `canX()` guard from `src/domains/workflow-validation` before mutating, then routes through `persistProject`/`persistRequest` |
| 3-silo auto-provisioning on payment confirmation | `src/domains/projects/storage.ts` `buildProjectWorkspaceTemplate()` |
| Storage isolation (only `domains/projects/storage.ts` touches `localStorage`) | Confirmed — no `localStorage` call found anywhere under `features/projects/project-workspace/` |
| ViewModel used only for this high-complexity screen | `src/features/projects/project-workspace/view-models/project-workspace.viewmodel.ts`, per ADR-004 |
| Quotation-page VAT/taxable partitioning pattern (reference implementation, not part of this page) | `src/app/(dashboard)/quotations/[jobNumber]/page.tsx` lines 82–85 |

### 2b. Exists but wrong

| Defect | File / Line | Rule violated |
|---|---|---|
| **Clickable Workflow Stage Timeline** — every stepper node is a `<button onClick>` that calls an unguarded phase-jump handler | `src/features/projects/project-workspace/tabs/overview-tab.tsx` line 66–78 (`onClick={() => handlePhaseTransition(phase.id)}`) | ADR-003 (state transitions must be gated, not click-driven UI shortcuts) |
| **The handler it calls has zero guards** — `transitionProjectPhase()` ignores the entire state machine (`canTransition`/`validateTransition` in `state-machine.ts`) and just overwrites `executionPhase` unconditionally | `src/domains/projects/workflow/transitions.ts` lines 4–29 | ADR-003 — this is a *domain-layer* bug, not just a UI bug: even if called from a legitimate place, this function bypasses `ALLOWED_TRANSITIONS` and all guard conditions defined in `state-machine.ts`. Every other workflow function (`startProjectExecution`, `updateProjectSiloStatus`, `startExecutionSilo`, `completeExecutionSilo`, `completeProjectExecution`, `approveFinalInspection`) calls a `canX()` validator first — `transitionProjectPhase` is the sole exception and exists only to serve this clickable stepper |
| Hardcoded role checks instead of `hasPermission()` | `overview-tab.tsx` lines 122, 194, 273, 306 (`user.role === USER_ROLES.OPERATIONS_OFFICER`, `=== USER_ROLES.CONSULTING_ENGINEER`); `execution-tab.tsx` line 168 (same pattern) | CLAUDE.md RBAC rule ("Never hardcode role checks... use `constants/permissions.ts`"). `src/constants/permissions.ts` has no `projects.execute`/`projects.transition`-shaped permission key at all — the permission model doesn't even cover field-execution actions yet, so today's role checks can't be swapped in without first extending `ROLE_PERMISSIONS` |
| Hardcoded RTL-unsafe spacing | `project-workspace.tsx` line 68 (`mr-2 rtl:ml-2 rtl:mr-0` — should be a single `me-2`); `components/project-timeline-card.tsx` line 20 (`pl-4 ml-2` — should be `ps-4 ms-2`) | CLAUDE.md i18n rule (no `ml-*`/`mr-*`/`pl-*`/`pr-*`) |
| Hardcoded English copy bypassing `t()` | `components/obstacle-list.tsx` lines 39 ("This system installation is currently marked as BLOCKED...") 54 ("Critical & High Risk Blockers"), 75 ("Standard Checklist Tasks & Audits"); `overview-tab.tsx` lines 127–130, 160, 197–201 (kickoff form labels/descriptions) | CLAUDE.md i18n rule — copy must come from `t("projects:...")`, not literal JSX strings, even though matching keys largely already exist in `projects.json` |
| Dead/duplicated tab constant | `src/features/projects/project-workspace/constants/project-tabs.ts` defines `PROJECT_TABS`, but `project-workspace.tsx` lines 115–144 hardcodes four `<Button>` elements instead of mapping over it | Composition-over-duplication (CLAUDE.md Code Quality) |
| Stub file with no real implementation, name-colliding with the real tabs bar | `src/features/projects/project-workspace/project-workspace-tabs.tsx` (`return <div>Workspace Tabs</div>;`) — dead code, not imported anywhere in the traced flow | ADR-006 (no stub components left in a feature that is otherwise fully built) |
| `any` usage in this feature (worst offenders per `docs/debt/ANY_BACKLOG.md`) | `tabs/overview-tab.tsx` — 6 occurrences (worst single file in the whole 86-occurrence repo backlog); `tabs/execution-tab.tsx` — 3; plus 1 each in `certificates-card.tsx`, `contracts-card.tsx`, `execution-summary-card.tsx`, `linked-request-card.tsx`, `obstacle-list.tsx`, `project-completed-card.tsx`, `project-health-card.tsx`, `project-timeline-card.tsx`, `request-documents-card.tsx`, `documents-tab.tsx`, `obstacles-tab.tsx` (each `t: any` prop typing) | CLAUDE.md "Use TypeScript strictly. Avoid `any`." / RECONCILIATION.md D4. `features/projects` is the single largest contributor to the repo's 86-occurrence `any` backlog (26 of 86, per `ANY_BACKLOG.md` line 14), and `domains/projects` is second (13 of 86, line 15) |

### 2c. Missing per SRS [MVP]

| Gap | Evidence it was planned but not built |
|---|---|
| Procurement + VAT-aware materials ledger for field execution | `src/locales/en/projects.json` lines 67–70, 88–89 stage `procurement.*` keys; no UI consumes them anywhere in `execution-tab.tsx` or any other tab; no procurement/VAT field exists on `SiloExecutionData` or `ProjectExecutionData` (`src/types/project.ts` lines 22–42) |
| Internal (cost-zeroed) vs. Outsource (wage) labor distinction | `projects.json` lines 71–74 stage `labor.*` keys ("Field Workforce & Hours", "Total Technicians On-Site"); `SiloExecutionData.laborCount`/`costSAR` are single blended numbers with no `laborType` discriminator |
| Obstacle photo documentation | `projects.json` lines 76–79 stage `obstacles.photos`/`obstacles.noPhotos`; `ProjectTask` (`types/project.ts` lines 64–72) has no photo/attachment field; `SiloExecutionData.photosCount` exists as a number (line 30) but nothing writes or displays it anywhere in `execution-tab.tsx` or `obstacle-list.tsx` |
| Closure completion photo upload | `projects.json` line 86 stages `clientView.finalPhotos`; no corresponding field on `ProjectCompletionData`/`ProjectInspectionData` and no upload control in any tab of this feature |

---

## 3. Timeline defect trace

**Component:** `src/features/projects/project-workspace/tabs/overview-tab.tsx`
**Handler:** lines 60–85, the "Stepper Card". Every phase node is rendered as:

```
<button type="button" onClick={() => handlePhaseTransition(phase.id)} ...>
```
(line 66–68) for **every** entry in `viewModel.internalPhases` — passed, current, and future phases alike receive the same click handler with no phase-order or role gating in the JSX itself.

**Hook:** `src/features/projects/project-workspace/hooks/use-project-workspace.ts` lines 208–217:
```
const handlePhaseTransition = (phase: ProjectExecutionPhase) => {
  if (!project) return;
  try {
    const updated = transitionProjectPhase({ project, phase });
    ...
```
It does route through a domain workflow function (technically satisfying "hooks must call `domains/*/workflow.ts`, not localStorage directly"), **but** the domain function it calls is the defective one:

**Domain function:** `src/domains/projects/workflow/transitions.ts` lines 4–29. `transitionProjectPhase()` unconditionally sets `executionPhase: phase` and persists — it never imports or calls `canTransition()`/`validateTransition()` from `src/domains/projects/workflow/state-machine.ts`, even though that state machine (with its `ALLOWED_TRANSITIONS` matrix and per-phase guard conditions) already exists in the same domain folder and is fully implemented, just unused by this one function. Net effect: a user can click the 9th stepper node from the 1st and jump straight to `COMPLETED`, skipping kickoff approval, all three silo completions, and final inspection approval.

**Contrast — Quotation page's display-only stage pattern:** `src/app/(dashboard)/quotations/[jobNumber]/page.tsx` lines 439–446:
```
<span className="text-muted-foreground">{fieldCurrentStage}</span>
<Badge variant="warning" className="capitalize">
  {getWorkflowStageDisplayName(request.currentStage, t)}
</Badge>
```
This renders `request.currentStage` through a pure display formatter (`getWorkflowStageDisplayName`, imported from `@/domains/requests/workflow`) inside a `<Badge>` with **no `onClick`, no button, no handler at all**. The stage is read-only output; every real stage change on the Requests/Quotations side happens elsewhere, through dedicated action buttons (`handleSave("SUBMITTED_FOR_APPROVAL")` etc.) that call specific, guarded workflow functions — never a generic "jump to any stage" primitive.

**Conceptual fix (describe only, no diff):**
1. In `overview-tab.tsx`, remove the `<button onClick={...}>` wrapper around each stepper node (lines 66–78) and replace it with a non-interactive element (`<div>` or `<span>`) that keeps the same visual states (`isPassed`/`isCurrent` styling) but has no handler and no `type="button"`.
2. Delete the `handlePhaseTransition` prop from `OverviewTabProps` and stop passing it from `project-workspace.tsx` (lines 105, 159) and from the hook's return object (`use-project-workspace.ts` line 286) — there is no legitimate caller of `transitionProjectPhase` left once the click is removed, since every real transition already has its own guarded, named workflow function (`initiateKickoffVisit`, `handleKickoffDecision`, `startExecution`, `startExecutionSilo`, `completeExecutionSilo`, `completeProjectExecution`, `approveFinalInspection`).
3. Delete `transitionProjectPhase` from `domains/projects/workflow/transitions.ts` and its barrel export in `domains/projects/workflow/index.ts`/`workflow.ts` (confirm no other caller first — grep during implementation, not in this pass) rather than trying to retrofit guards onto a function whose only purpose was to serve the removed click handler.
4. The stepper's visual state (`isPassed`/`isCurrent`) already derives purely from `viewModel.currentPhaseIndex`, which already derives purely from `project.executionPhase` (`getCurrentPhaseIndex` in `helpers/execution.ts`) — so display-only rendering requires no new data plumbing, only handler removal.

---

## 4. Redesign plan — structure before visuals

Project-workspace is already the ADR-004 **Golden Reference** and already follows the canonical sub-feature shape (`index.ts`, `project-workspace.tsx` thin shell, `hooks/`, `components/`, `view-models/`, plus a `layouts/`, `tabs/`, `helpers/`, `constants/` split that the base convention doesn't even require). The redesign plan below is corrective, not structural-from-scratch — it tightens the existing pattern rather than replacing it.

**Component tree (target state, annotated with each SRS [MVP] item's home):**
```
app/(dashboard)/projects/[projectId]/page.tsx      Thin Route
└─ project-workspace.tsx                            Feature Shell (reads PROJECT_TABS constant, no inline tab literals)
   └─ hooks/use-project-workspace.ts                 Orchestration (loses handlePhaseTransition)
      └─ view-models/project-workspace.viewmodel.ts  ViewModel (adds procurement/labor/obstacle-photo view slices — P3)
         ├─ tabs/overview-tab.tsx
         │  ├─ components/project-timeline-card.tsx  [display-only stepper + timeline — the P0 fix lands here]
         │  ├─ components/project-health-card.tsx
         │  └─ components/linked-request-card.tsx
         ├─ tabs/execution-tab.tsx                    3 silos (Alarm/Suppression/Ventilation) — existing
         │  ├─ components/execution-summary-card.tsx
         │  └─ [NEW — P3] components/procurement-card.tsx    Procurement + VAT ledger
         │  └─ [NEW — P3] components/field-labor-card.tsx    Internal vs Outsource labor
         ├─ tabs/documents-tab.tsx
         │  ├─ components/request-documents-card.tsx
         │  ├─ components/contracts-card.tsx
         │  └─ components/certificates-card.tsx
         └─ tabs/obstacles-tab.tsx
            └─ components/obstacle-list.tsx            [NEW — P3] photo attachment slot per obstacle
```

**domains/ vs features/ split (confirm zero business logic in components):** All financial math (VAT, procurement totals), labor-cost aggregation, and obstacle grouping must live in `src/domains/projects/{types.ts,workflow/*.ts}` and be surfaced through `src/features/projects/project-workspace/helpers/*.ts` (pure formatting/derivation, already the existing pattern for `calculateExecutionTotals`, `groupProjectObstacles`, `buildProjectTimeline`) — never computed inline in a `tabs/*.tsx` or `components/*.tsx` file. This already holds today except for the one workflow-layer defect in §3; no component in `project-workspace` currently computes a workflow transition or persists anything itself.

**Tab organization (unchanged, already matches SRS needs):**
- **Overview** — kickoff form, execution phase display, health, timeline (display-only after P0)
- **Execution** — the 3 silos; home for [P3] procurement/VAT card and field-labor card
- **Documents** — linked request, contracts, certificates
- **Obstacles** — obstacle log; home for [P3] photo attachment

**i18n check:** `projects.json` already has namespaced keys for everything in scope, including features not yet built (procurement, labor, obstacle photos — see §2c). The gap is the reverse of the usual problem: components under-consume an already-populated locale file. Confirmed hardcoded strings needing `t()` are listed in §2b (`obstacle-list.tsx` lines 39/54/75; `overview-tab.tsx` kickoff form labels). No new locale library or namespace is needed — extend `projects.json` (`ar`/`en`) only for the specific new [P3] copy (procurement/labor/photo card labels), which is largely already present.

---

## 5. Phased roadmap

### P0 — Fix the clickable-timeline defect
**Changes:** Remove the `onClick`/`<button>` wrapper in `overview-tab.tsx` lines 66–78 (render as non-interactive `<div>`/`<span>` styled identically); delete `handlePhaseTransition` from `use-project-workspace.ts` (lines 208–217, and its entry in the returned object, line 286) and from `OverviewTabProps`/call sites in `project-workspace.tsx` (lines 105, 159); delete the now-orphaned `transitionProjectPhase` from `domains/projects/workflow/transitions.ts` (confirm zero other callers via repo-wide grep before deleting) and its export.
**Files touched:** `tabs/overview-tab.tsx`, `hooks/use-project-workspace.ts`, `project-workspace.tsx`, `domains/projects/workflow/transitions.ts`, `domains/projects/workflow/index.ts` (or `workflow.ts` barrel, wherever `transitionProjectPhase` is re-exported).
**Risk to lifecycle:** None if the grep confirms no other caller — every legitimate transition already has its own guarded function; removing the unguarded generic one cannot regress a real flow, it can only remove the ability to skip stages illegitimately.
**Verify:** Manually walk a project through kickoff → active execution → all 3 silos complete → final inspection → completed using only the dedicated action buttons; confirm the stepper still visually reflects `project.executionPhase` at each step and that clicking any stepper node does nothing.

### P1 — Structural reorg to ADR-004 shape (no visual change)
**Changes:** Delete the dead `project-workspace-tabs.tsx` stub (unused, name-collides with the real tab bar); replace the four hardcoded `<Button>` tab elements in `project-workspace.tsx` (lines 115–144) with a `.map()` over the existing `PROJECT_TABS` constant (`constants/project-tabs.ts`), removing the duplication.
**Files touched:** `project-workspace-tabs.tsx` (delete), `project-workspace.tsx`.
**Risk to lifecycle:** None — purely presentational wiring, no workflow/storage code touched.
**Verify:** All four tabs still render and switch correctly for an Operations Officer / Consulting Engineer login; Client-role split (which bypasses the tab bar entirely, per `project-workspace.tsx` line 93) is unaffected.

### P2 — Visual redesign (layout, RTL, theme tokens)
**Changes:** Fix `mr-2 rtl:ml-2 rtl:mr-0` → `me-2` in `project-workspace.tsx` line 68; fix `pl-4 ml-2` → `ps-4 ms-2` in `project-timeline-card.tsx` line 20; replace hardcoded literal strings in `obstacle-list.tsx` (lines 39, 54, 75) and `overview-tab.tsx` (kickoff form labels/descriptions, lines 127–130, 160, 197–201) with `t("projects:...")` calls against the already-existing (or minimally extended) `projects.json` keys.
**Files touched:** `project-workspace.tsx`, `project-timeline-card.tsx`, `obstacle-list.tsx`, `overview-tab.tsx`, `locales/{ar,en}/projects.json` (only if a key is genuinely missing).
**Risk to lifecycle:** None — text/spacing only.
**Verify:** Toggle `NEXT_LOCALE` to `ar`, confirm the stepper/timeline/obstacle cards mirror correctly under `dir="rtl"` and no copy falls back to a raw key string.

### P3 — Fill missing SRS [MVP] gaps
**Changes:** Add `laborType: "internal" | "outsource"` and a `procurement` slice (items, taxable flag, unit price/qty, VAT calc reusing the same 15%-on-taxable formula already proven in the Quotation builder) to `ProjectExecutionData`/`SiloExecutionData` in `domains/projects/types.ts` (re-exported via `src/types/project.ts`); add corresponding guarded workflow functions in a new `domains/projects/workflow/procurement.ts` (never mutate inline in a component, per ADR-002/003); add `photos: string[]` (or an attachment-id list, consistent with however `file-upload` is modeled elsewhere in `shared/components`) to `ProjectTask` and `ProjectCompletionData`; surface these through new `components/procurement-card.tsx` and `components/field-labor-card.tsx` in the Execution tab, and a photo-attachment control in `obstacle-list.tsx`.
**Files touched:** `domains/projects/types.ts`, new `domains/projects/workflow/procurement.ts`, `types/project.ts`, `view-models/project-workspace.viewmodel.ts`, `tabs/execution-tab.tsx`, new `components/procurement-card.tsx`, new `components/field-labor-card.tsx`, `components/obstacle-list.tsx`, `locales/{ar,en}/projects.json` (fill any still-missing keys).
**Risk to lifecycle:** Low-medium — new data added to `ProjectWorkspaceData` requires extending `migrateProjectWorkspace()` in `domains/projects/storage.ts` (lines 4–57) so existing localStorage-persisted projects from before this change don't break; must follow the existing `isNew`/legacy-shape migration pattern already used there.
**Verify:** Load a pre-existing mock/localStorage project (old shape), confirm `migrateProjectWorkspace` backfills the new fields without throwing; add a procurement item, confirm VAT computes identically to the Quotation builder's formula (15% on taxable subtotal only).

### P4 — Clean the `any` in this feature
**Changes:** Replace the repeated `t: any` prop typing (11+ files listed in §2b) with the project's actual translation function type (whatever `useTranslation()` returns in `src/providers/i18n-provider.tsx` — reuse that type, don't invent a new one); type `overview-tab.tsx`'s `handlePhaseTransition: (phase: any) => void` prop correctly as `(phase: ProjectExecutionPhase) => void` (moot after P0 removes it, but apply the same discipline to any remaining `any` in that file); type `execution-tab.tsx`'s `siloStatus: any`/`setSiloStatus: (status: any) => void` as `SiloExecutionData["status"]`.
**Files touched:** All files listed under "any usage in this feature" in §2b.
**Risk to lifecycle:** None — types only, no runtime behavior change; must keep `npx tsc --noEmit` clean (per `ANY_BACKLOG.md`, it already is) after the change.
**Verify:** `npx eslint src/features/projects/project-workspace src/domains/projects --format json` shows zero remaining `no-explicit-any` warnings for these paths; `npx tsc --noEmit` still passes.
