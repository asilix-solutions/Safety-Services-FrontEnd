# SSLM — Session Handoff

Verified 2026-07-28 via `git log`, `git status`, `git fetch && git rev-list`, and `grep`. HEAD == origin/main (0/0 ahead-behind) — everything below is pushed, working tree is clean.

## Pushed to origin (verified via git log)

- `4c28057` feat: replace alerts with toast notifications for simulated downloads and validation errors
- `2fa81d3` feat: integrate sonner for toast notifications and add error handling messages
- `a5d972b` fix: centralize employee permissions checks using constants
- `afeda39` chore: gitignore .claude/ harness artifacts, drop stray lock file
- `b99f452` refactor(rbac): consolidate 29 inline role checks into permissions.ts
- `697138c` test
- `7f4e5ce` fix(deps): patch next.js to 15.5.21 (Server Actions SSRF/DoS advisories)
- `0b6abe6` fix(deps): patch runtime security advisories (axios, form-data, js-yaml)
- `78e51dd` refactor(vat): unify VAT_RATE into constants/tax.ts, remove inline calc from route
- `98a43ea` refactor(requests): remove dead workflows/ module, document two-field status design
- `e665367` feat: refactor PaymentConfirmDialog to use useRouter for navigation and improve button handling
- `d2e207e` feat: integrate Stripe payment processing and enhance invoice dialogs

## Committed but NOT pushed

None. `git rev-list --left-right --count origin/main...HEAD` returned `0  0` after `git fetch origin main`.

## Uncommitted in working tree

None. `git status --short` returned empty — no CRLF noise files present right now.

## sonner toast migration — exact state

- Infra (`2fa81d3`): sonner installed, `<Toaster/>` mounted in `app/layout.tsx`, RTL confirmed visually.
- Template `shared/components/file-upload.tsx`: done (part of `4c28057`).
- Current `alert()` count in `src/`: **24**.
- Current `confirm()`/`prompt()` count in `src/`: **3** (batch B, unchanged).

### Group 1 (`4c28057`) — DONE, pushed

Files actually touched (verified via `git show --stat 4c28057`):
- `src/features/contracts/contract-list/hooks/use-contract-list.ts`
- `src/features/invoices/invoice-list/hooks/use-invoice-list.ts`
- `src/features/projects/project-workspace/components/certificates-card.tsx`
- `src/features/projects/project-workspace/components/contracts-card.tsx`
- `src/features/projects/project-workspace/hooks/use-project-workspace.ts`

New locale key added: `common:contracts_download_simulated` ({title} single-brace interpolation, ar+en, parity confirmed via diff).

**Correction vs. prior notes:** `use-certificate-list.ts` was **not** part of Group 1. It still has a raw, non-i18n `alert()` at line 82 (`alert(\`Downloading compliance certificate PDF for "${certificate.title}" (Simulated)\`)`) — untouched, not yet on a `t()` key, not yet a toast. Treat it as still outstanding, not done.

## Remaining toast work (batch A — alert→toast)

Current `alert()` sites (verified via grep, 24 total):

- **Group 2**: `blueprint-review/components/blueprint-files-card.tsx:131,140`; `blueprint-review/components/blueprint-viewer.tsx:133` (hardcoded string, needs new key), `:211,220` — all info intent
- **Group 3**: `client-request-wizard/wizard-step-review-submit.tsx:92,96,308`; `client-request-wizard/client-request-wizard.tsx:220,237` — success/error/info
- **Group 4 (hardest)**: `projects/project-workspace/tabs/site-visits-tab.tsx:56,59,137,140,160,163` (59, 140, 163 are `alert(err.message)`); `requests/[jobNumber]/page.tsx:94,258,279,291,308,557,566` (largest file, interpolation)
  - `err.message` pattern: `toast.error(t("common:<generic>"))` + `err.message` to console/description, NOT shown raw.
- **Outstanding, not yet grouped**: `certificates/hooks/use-certificate-list.ts:82` — raw hardcoded string, needs an i18n key first, then toast (was previously assumed done — it is not).

## Batch B — dialogs (separate task, NOT toast)

- `confirm()` `requests/[jobNumber]/page.tsx:262` → shadcn AlertDialog (yes/no before destructive replace)
- `prompt()` `requests/[jobNumber]/page.tsx:266` → input dialog (filename)
- `prompt()` `certificates/hooks/use-certificate-list.ts:69` → input dialog (revocation reason, required before `revokeCertificate`)

## Independent bug

- `hooks/use-photos.ts` `onSuccess`: silent save, no notification. Add `toast.success` (not a migration — missing-feedback bug).

## Deferred (my decisions needed / separate projects)

- Contracts RBAC: Super Admin scope — code already SRS-compliant, no action
- Customers RBAC: already SRS-compliant, no action
- i18n namespaces, ZATCA rounding, fat-page decomposition, Sales Agent CRM
- Delete old OneDrive clone (manual)
- `.gitattributes` forcing LF on `*.ts`/`*.tsx` (stops VS Code CRLF noise)

## Rules that proved their worth this session (FOLLOW THESE)

- `git add` BY NAME always. Never `-A`/`.` (one `-A` caused a long reset/amend detour).
- Truth is git/the file, NOT any summary — including Claude's. Verify before acting. (This handoff itself caught one wrong claim: use-certificate-list.ts was assumed done and wasn't.)
- Test production build before diagnosing a reactivity bug (the i18n "bug" was a dev-only Turbopack HMR artifact, not real — 3 static diagnoses wasted first).
- CLASSIFY before swapping: alert→toast, but confirm/prompt→dialog (converting a confirm to a toast silently drops the yes/no → unconfirmed destructive action).
- Repo lives OUTSIDE OneDrive (F:/01_Projects); one live clone only; confirm HEAD==origin/main before work.
- Browser-verify toasts — tsc/build never proves rendering or RTL.
- Template-first, verify, THEN replicate. One file per step.

## Next session starts here

Group 2 (`blueprint-files-card.tsx` + `blueprint-viewer.tsx`). Same pattern: alert→toast.info, preserve expression, add sonner import, sed-normalize CRLF, one file per step, tsc+diff+review each, then commit the group. `blueprint-viewer.tsx:133` needs a new `fullscreen` key (propose ar+en, flag for review) since it's currently a hardcoded English string, not a `t()` call.

Separately: `certificates/hooks/use-certificate-list.ts:82` needs its own i18n key before it can join a toast group — flag this as a small fix-up, not assumed pre-done.
