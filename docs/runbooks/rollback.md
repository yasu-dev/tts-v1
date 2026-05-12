# Rollback Runbook — triage-tag-system

## Goal

Restore `https://triage-tag-system.netlify.app` to the **pre-feature production state** when a newly merged feature causes incidents, **without losing DB data**.

## Guarantees

- Code: reverted to the state before the offending feature merge (Netlify auto-rebuilds from the new `main` HEAD).
- DB: untouched. Data remains intact. Schema may carry forward additions (forward-only policy) — the reverted code still works against it.
- Env vars: untouched. Newly added env vars remain set but unused by the reverted code.

## Pre-feature anchor

A Git annotated tag is pushed at the production commit before each feature wave:

```
release/<YYYY-MM-DD>-pre-<scope>
```

Current anchor: `release/2026-05-13-pre-feat` → `bc52c22`.

## Pre-conditions enforced upstream

| Mechanism                         | Purpose                                                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/sql-guard.yml` | CI rejects PRs that add `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM <table>;` (no WHERE), or `ALTER COLUMN ... SET NOT NULL` to `supabase/**/*.sql`. |
| GitHub repo: squash-merge only    | `allow_squash_merge=true`, others `false`. Each feature lands as a single commit on `main`, so `git revert <sha>` is sufficient (no `-m 1` branch).            |
| `scripts/rollback.sh`             | One-shot script that performs the revert + push.                                                                                                               |

## Rollback procedure (AI-executable)

Pre-flight: verify Netlify auto-publish is not locked. Query the deploy and confirm `locked` is `null` (e.g., via the Netlify MCP `get-deploy-for-site` or the dashboard).

Execute:

```
bash scripts/rollback.sh <feat-merge-sha>
```

The script:

1. `git checkout main && git pull --ff-only origin main`
2. Verifies `<feat-merge-sha>` is an ancestor of `main`.
3. `git revert --no-edit <feat-merge-sha>` — squash-merge policy guarantees a single-parent revert.
4. `git push origin main` — Netlify auto-rebuilds.

## Verification

1. Visit `https://triage-tag-system.netlify.app` and exercise the pre-feature workflow.
2. Confirm the new production deploy reaches `state: ready` on the Netlify dashboard (typical rebuild: 1–3 minutes; prior `deploy_time` ≈ 95 s).

## What this runbook does NOT do

- It does not restore Supabase DB to a prior state. The forward-only policy is the reason DB rollback is unnecessary for code rollback. If a destructive DB change reaches production (bypassing `sql-guard`), DB recovery requires a separate procedure (Supabase Free plan provides no Dashboard restore — see `docs/runbooks/db-recovery.md` if added later).
- It does not roll back Netlify env vars. The repo policy is "additive only" for env vars; existing keys are never modified or deleted in feature PRs, so the reverted code finds the env vars it needs.

## When the runbook is insufficient

- Production traffic is high and a 1–3 minute rebuild is unacceptable: use Netlify Instant Rollback instead via `netlify api restoreSiteDeploy --data '{"site_id":"046ba9ac-bcf7-4cd1-b535-06f435bd4183","deploy_id":"<prior-deploy-id>"}'`. This republishes a previously built atomic deploy in seconds. Follow up with the revert+push above to keep `main` consistent with what is published.
- Multiple feature waves have been merged: revert each in reverse chronological order, or hard-reset `main` to the tag (requires force-push, requires explicit approval).
