# SSLM Product Backlog

Product-scope decisions and deferred systems. This file records **what we chose not to
build and why** — it is not a bug list and not a tech-debt list.

For tech debt see `docs/debt/ANY_BACKLOG.md` (the `any` cleanup) and
`docs/debt/FR_RU_BACKLOG.md` (rule-engine deviations).

---

## 🔴 DEFERRED — Maintenance-Contract System (POST-MVP)

_Decision date: 2026-08-01. Status: **deferred by product decision**, not a defect._

The entire maintenance-contract lifecycle is **out of scope for the licensing-cycle MVP**
and will be built as a **later phase**. Nothing about it is broken; it was never started.

### What is deferred

| Capability | SRS ref | State today |
|---|---|---|
| Maintenance-contract creation from approved 150–1000 m² requests | `FR-RUL-02` | **Does not exist** |
| Splitting an annual maintenance contract into 4 quarters | `FR-OPS-09` | **Does not exist** |
| Auto-generating the 4 scheduled quarterly visits | `FR-OPS-09` | **Does not exist** |
| Scheduling / tracking / completing a quarterly visit | `FR-OPS-09` | **Does not exist** |
| Client + operations views of the quarterly visit schedule | `FR-OPS-09` | **Does not exist** |

### What DOES exist (and is correct)

The **classification rule engine is complete and working**. A request whose area falls in
150–1000 m² is routed to the maintenance track exactly as the SRS requires:

- `constants/classification.ts` — `AREA_THRESHOLDS.MAINTENANCE_MAX_INCLUSIVE = 1000`
- `domains/requests/workflow.ts#classifyRequest` — returns
  `classification: "maintenance_strategy"`, `assignedQueue: "MAINTENANCE"`,
  `siteVisitRequired: true`

**The routing decision is the end of the line.** No contract is created, no visit schedule
is seeded, and no downstream maintenance system consumes the `MAINTENANCE` queue. This is
the intended state of the MVP: the licensing cycle classifies the request correctly and
stops there.

> **Do not file this as a bug.** "The rule engine routes to a maintenance contract but no
> maintenance contract appears" is the documented, deliberate behaviour of this phase.

### Related dead scaffolding — leave in place

These artifacts predate the decision and are currently unreferenced by any live code path.
They are **not** the deferred system and should not be mistaken for a partial build:

- `app/(dashboard)/maintenance/page.tsx` — calls `notFound()`
- `types/maintenance.ts` + `mock/maintenance.ts` — a CMMS-style `MaintenanceJob` asset
  model (asset name, facility, technician, priority); imported only by each other
- `constants/statuses.ts#MAINTENANCE_STATUS_METADATA`,
  `constants/status-translations.ts#MAINTENANCE_STATUS_TX`,
  `ROUTES.MAINTENANCE`, `QUERY_KEYS.MAINTENANCE`
- `locales/{ar,en}/maintenance.json`

### Known prerequisite when this phase is picked up

`domains/site-visits` is **not tenant-scoped** — `SiteVisit` (`domains/site-visits/types.ts`)
carries no `tenantId`, and `getSiteVisits()` reads unscoped with no scoped getter beside it.
Quarterly visits would almost certainly reuse this entity, so tenant scoping must be fixed
**before** any visit generation is built, or the new records inherit the gap.

### Explicitly excluded even when this phase is built

- Email/notification reminders 7 days before a due visit (`FR-OPS-09`) — requires a backend
- Planning-calendar ticket injection
- A recurring-visit rescheduling engine
- Per-visit rich reports (the SRS requires the signature/closure gate at **project**
  close-out, `FR-OPS-10` — not per periodic visit)
