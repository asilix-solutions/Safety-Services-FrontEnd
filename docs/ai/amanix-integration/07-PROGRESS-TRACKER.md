# Amanix Frontend Integration — Living Progress Tracker

> The coding agent must update this file after each phase or coherent tested slice. Do not mark a box complete without evidence.

## Baseline / discovery

- [ ] Frontend root identified: `TBD`
- [ ] Frontend remote/default branch: `TBD`
- [ ] Frontend baseline SHA: `TBD`
- [ ] Frontend current/upstream branch relation: `TBD`
- [ ] Backend root identified: `TBD`
- [ ] Backend remote/default branch: `asilix-solutions/amanix-backend` expected; confirm actual local remote
- [ ] Backend baseline SHA: `TBD`
- [ ] Local changes preserved and status recorded: `TBD`
- [ ] Frontend integration branch verified/created safely: `TBD`
- [ ] Frontend framework/runtime/package manager: `TBD`
- [ ] Staging diagnostics environment + API commit: `TBD`
- [ ] OpenAPI URL/schema timestamp/hash/operation count: `TBD`
- [ ] `.http` inventory + command/test results: `TBD`
- [ ] Docs/SRS/audit differences report: `TBD`
- [ ] Initial frontend audit and route/feature map created: `TBD`

## Phase status

| Phase | Status | Commit/PR | Evidence of exit gate | Blockers |
|---|---|---|---|---|
| 0. Discovery, Git sync, contract foundation | Not started | — | — | — |
| 1. Tenant routing and branding | Not started | — | — | — |
| 2. Auth and session lifecycle | Not started | — | — | — |
| 3. Registration and activation | Not started | — | — | — |
| 4. Company settings and financial policy | Not started | — | — | — |
| 5. Staff administration and platform console | Not started | — | — | — |
| 6. Workers and equipment/resources | Not started | — | — | — |
| 7. Client and job lifecycle | Not started | — | — | — |
| 8. Hardening and release candidate | Not started | — | — | — |

Allowed status values: `Not started`, `In progress`, `Blocked`, `Needs rework`, `Complete`. A phase is `Complete` only after all exit checks, tests, review and documentation are green.

## Each completed work item

### Template

**Date:** YYYY-MM-DD  
**Phase / slice:**  
**User-visible behavior delivered:**  
**Backend endpoint/schema references:**  
**Files changed:**  
**Tests/commands run and outcomes:**  
**Languages / roles / tenant contexts / viewports tested:**  
**Known limitations or skipped checks:**  
**Review findings fixed:**  
**Commit SHA / branch / push result:**  
**Next action:**  

## Open questions and blockers

| ID | Question / defect | Evidence | Category | Owner/next step | Status |
|---|---|---|---|---|---|
| Q-001 | Confirm frontend framework and current production/deployment target | package files and local config | Discovery | inspect frontend root | Open |
| Q-002 | Verify staging host and live OpenAPI contract | `/diagnostics/ping`, `/openapi/v1.json` | Contract | fetch through editor/browser or local network | Open |
| Q-003 | Confirm actual custom-domain support | resolver/controllers/docs | Product/API | inspect current backend | Open |
| Q-004 | Reconcile endpoint/test counts and older docs | API/`.http` inventories | Documentation | compare current branch and staging | Open |

Remove or resolve template questions once evidenced; do not keep stale questions after confirming them.

## End-of-phase sign-off checklist

- [ ] Phase scope is complete and demonstrated.
- [ ] No unreviewed high/critical defects remain in the phase diff.
- [ ] Format/lint/typecheck/build passed as applicable.
- [ ] Relevant unit/component/integration/e2e tests passed.
- [ ] No secrets or unrelated changes were committed.
- [ ] Arabic RTL, English LTR, permission rules and tenant isolation were exercised where relevant.
- [ ] API/schema docs and this tracker were updated.
- [ ] Atomic commit(s) were pushed to the intended branch; push verified.
- [ ] Only now may work advance to the next phase.
