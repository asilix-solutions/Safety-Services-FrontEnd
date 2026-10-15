# Git Synchronisation and Change Safety

## 1. Identify the projects before running Git commands

There should be two opened repositories: the Amanix backend and the Amanix frontend. Determine the real filesystem roots rather than assuming the terminal starts in either one. For each root record:

- absolute path;
- `git rev-parse --show-toplevel`;
- `git remote -v`;
- current branch, local HEAD and `git status --short --branch`;
- upstream branch and ahead/behind counts;
- untracked, staged and unstaged files;
- recent commit summaries;
- default branch and relevant `integration`, `dev`, `stage` or similarly named branches that actually exist.

The discovered backend GitHub repository is `asilix-solutions/amanix-backend`. Do not guess the frontend repository name; use its actual local `.git/config` remote and confirm it matches the opened frontend project.

## 2. Safe synchronization protocol

1. Start with read-only inspection (`status`, remotes, branch list, log, diff, fetch).
2. Run `git fetch --all --prune` in each repository. This updates remote-tracking refs but should not overwrite working files.
3. Inspect how each local branch differs from upstream, including commits and changes to the same files.
4. If the worktree is clean and the current branch has a known upstream, fast-forward or rebase only when the operation is unambiguous and preserves all local work. Prefer a simple fast-forward when possible.
5. If there are local changes, divergent commits, conflicts, an unclear remote or an untracked file that would be overwritten, stop and diagnose. Do not hide the issue by stashing without documenting/recovering it.
6. Never use `git reset --hard`, `git clean -fd`, force-push, branch deletion, or destructive checkout as a shortcut. Never rewrite `main`/`stage` history.
7. If the backend and frontend have intentionally different deployment branches, do not merge their branches together. Synchronize each repository against its own intended upstream.
8. Capture baseline commits and working-tree state in `docs/ai/amanix-integration/07-PROGRESS-TRACKER.md` (or an equivalent existing tracker).

## 3. Integration branch policy

- The requested implementation branch is the frontend `integration` branch. Check whether it exists locally/remotely.
- If it exists, inspect its merge base and upstream, fetch updates, and safely bring it up to date before implementation.
- If it does not exist, create it from the latest suitable frontend development/base branch after confirming the correct remote branch. Record the chosen parent commit.
- Do not create an `integration` branch in the backend by default if the backend uses `dev`/`stage`/`main` for specific roles. First inspect the branch strategy; backend defects should normally be addressed in a separate suitable branch or surfaced as a blocker/PR request.
- All implementation commits should land on the frontend `integration` branch until the user’s workflow dictates otherwise. Do not merge it to `main` automatically.

## 4. Small, reviewable change units

Use atomic, conventional commits, for example:

- `docs(amanix): add reconciled frontend integration plan`
- `feat(api): add generated Amanix API types and shared client`
- `feat(tenant): resolve host and load public branding`
- `feat(auth): add secure session refresh flow`
- `feat(i18n): complete Arabic RTL and English LTR shell`
- `test(tenant): cover cross-tenant cache isolation`

Commit only after that unit’s tests pass. Every completed phase needs a reviewable diff and updated tracker. Do not make one enormous “frontend rewrite” commit.

## 5. Push policy

- Push the working integration branch after a completed, tested phase or a coherent slice that has its own passing gates, as the user requested step-by-step publication.
- Before each push, inspect `git diff --check`, `git status`, staged diff, commit, upstream and CI status.
- Never include `.env`, credentials, tokens, personal test data, build output or generated temporary files that are not intended to be tracked.
- If push is rejected, fetch and reconcile carefully; never force push to “make it work”.
- Never claim a push or deployment succeeded unless the command/CI/host confirms it. Record the exact SHA and URL where available.

## 6. Backend changes

The frontend is the implementation target. Do not modify backend production/business code casually during frontend integration. If a real contract gap is found:

1. Reproduce it using current OpenAPI + a backend `.http` test or a focused test.
2. Search the docs/backlog to see whether it is known/accepted/blocked.
3. Record endpoint, request, expected result, actual result, impact and safest fix.
4. If the user’s workspace and branch strategy clearly authorizes backend changes, create a suitable isolated backend change with tests, XML/OpenAPI docs and required localization; otherwise continue using valid endpoints and report the backend blocker for a separate patch.
5. Never build a fake frontend success state to conceal a missing backend capability.

## 7. End-of-session handoff

At each stop/phase boundary report the two repo SHAs, current branch, pushed branch and URL, tests run, uncommitted work, next phase, and blockers. Keep the `.md` tracker current so a new AI session can resume without re-auditing everything unnecessarily.
