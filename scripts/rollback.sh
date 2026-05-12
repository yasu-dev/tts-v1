#!/usr/bin/env bash
#
# Rollback the production deployment of triage-tag-system.netlify.app
# by reverting a feature merge commit on main and pushing to origin.
# Netlify will auto-rebuild from the new main HEAD.
#
# Usage:
#   scripts/rollback.sh <feat-merge-sha>
#
# Pre-flight (manual or via AI assistant):
#   - Verify Netlify auto-publish is not locked. Check the Netlify dashboard
#     or query the API: locked field must be null on the current deploy.
#   - Verify the SHA to revert is the squash-merged commit on main.
#
# This script intentionally does NOT touch Supabase or Netlify env vars.
# Forward-only DB design and env-vars-unchanged policy are enforced by:
#   - .github/workflows/sql-guard.yml (CI)
#   - PR review (env vars)
# so the production code at the pre-feature anchor (tag release/*) remains
# functional against the current DB schema and env vars.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <feat-merge-sha>" >&2
  exit 2
fi

REVERT_SHA="$1"
SITE_URL="https://triage-tag-system.netlify.app"
NETLIFY_ADMIN="https://app.netlify.com/projects/triage-tag-system"

echo "==> Sync main with origin"
git checkout main
git pull --ff-only origin main

echo "==> Verify SHA exists in main history"
if ! git merge-base --is-ancestor "$REVERT_SHA" HEAD; then
  echo "ERROR: $REVERT_SHA is not an ancestor of main HEAD. Abort." >&2
  exit 1
fi

echo "==> Revert $REVERT_SHA (squash-merge policy: single-parent revert)"
git revert --no-edit "$REVERT_SHA"

echo "==> Push to origin/main (triggers Netlify auto-rebuild)"
git push origin main

cat <<EOF

Rollback initiated.

  Site:        $SITE_URL
  Netlify UI:  $NETLIFY_ADMIN

Netlify will rebuild from the new main HEAD (revert commit) and publish.
Typical rebuild time: 1-3 minutes.

Verify rollback success by:
  1. Visiting $SITE_URL and exercising the pre-feature workflow.
  2. Checking the deploy state on the Netlify dashboard (state must be "ready").

DB and env vars are intentionally untouched. Forward-only policy (enforced by
sql-guard CI) ensures that the reverted code still works against the current
schema. If a feature added new env vars, those vars remain set but unused.

EOF
