# FR-RU Rule Engine — Deferred Items

_Opened: 2026-07-29, during the FR-RU classification consolidation (Session 3)._

The area/hazard rule engine now has a single source of truth:
`constants/classification.ts` (data) + `domains/requests/workflow.ts#classifyRequest`
(the one decision function). The items below were found during that work,
reviewed with the owner, and deliberately **not** actioned in that session.

## 1. Widen the hazard matrix to additional trades — needs owner decision

Arabic hazard keywords were added so Arabic input (the product's default
language) is matched at all. Three proposed terms were **removed** before commit
because they have no English counterpart in the pre-consolidation list and no
basis in the four FR-RUL-04 seed categories:

| Term | Meaning | Why it was dropped |
|---|---|---|
| `نجارة` | carpentry | Not one of the four seeded categories at all |
| `حداد` | blacksmith / metalwork | Adjacent to "heavy workshop" but no English counterpart |
| `كافتيريا` | cafeteria | No English counterpart; restaurants already covered via ISIC 5610 |

Re-adding any of them widens classification in Arabic only, so an identical
facility would route differently depending on the language its activity name was
typed in. Decide as one batch, not term by term.

## 2. Deferred SRS deviations (agreed as backlog in Session 3)

| ID | Deviation | Ref |
|---|---|---|
| S-2 | FR-RUL-04 is not truly ISIC-driven — ISIC is a 4-code allowlist; the real decision is activity-name substring matching | FR-RUL-04 |
| S-3 | Keyword list is broader than the SRS seed and over-triggers (English `gas` also matches `gasket`); Arabic alef/ya spelling variants (أ/ا، ي/ى) are not normalised before comparison | FR-RUL-04 |
| S-4 | No standalone automated technical-certificate path — low-risk simple structures fall through the area bands instead | FR-RUL-06 |
| S-6 | Medium-scale requests route to `MAINTENANCE`; there is no `SALES` queue, so the sales CRM pipeline is never fed | FR-RUL-02 |

## 3. Downstream FR-C gap (next session's work)

`classifyRequest` returns `instantReportAllowed` as an explicit field so this can
be built without re-deriving any rule. Three layers are still unconnected:

- Nothing compares the client's chosen `reportType: "instant"`
  (`domains/requests/types.ts`) against `instantReportAllowed`. A high-hazard
  facility can still request an instant report — exactly what FR-RUL-05 forbids.
- `wizard-step-classification.tsx` receives `instantReportAllowed`,
  `siteVisitRequired`, `engineeringReviewRequired`, `area`, `requestType` and
  `requestData` as props and renders none of them, so the client is never told
  the instant report was severed.
- `types/report.ts#ReportType` is a different axis entirely
  (`technical_safety`, `site_inspection`, …) with no mapping from
  `"instant" | "non_instant" | "compliance"`, so the decision is lost once a
  report is produced.

## 4. Smaller items found in passing

- `app/(dashboard)/requests/[jobNumber]/page.tsx` uses
  `.replace(/_/, "")` without the `g` flag, so `"high_hazard_review"` normalises
  to `"HIGHHAZARD_REVIEW"` and matches none of the `===` comparisons beside it.
  It only behaves correctly because `assignedQueue === "HIGH_HAZARD"` is checked
  first; a request with a null queue would show the wrong next-step text.
- `classification-matrix-card.tsx` still has hardcoded English table copy
  ("Rule / Metric", "Evaluation Result", "Area Constraint", "Activity Type",
  "High Hazard Override", "Final Target Queue", "Routing Reason") and
  `wizard-step-classification.tsx` has a hardcoded "Assigned Path".
- `domains/requests/storage.ts` and `app/(dashboard)/requests/page.tsx` each
  re-derive `assignedQueue` from `classification` as a legacy-record fallback.
  `classifyRequest` now returns `assignedQueue`, so both could delegate.
