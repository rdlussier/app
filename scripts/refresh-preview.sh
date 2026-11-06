#!/usr/bin/env bash
# Preview-only helper (never part of a suggestion PR).
# Rebuilds the play-test preview branch from the friend's current master plus
# every open suggestion branch, and pushes it; Render redeploys
# joes-app-preview on push. The branch is throwaway, so it is force-pushed.
# Expected conflicts: src/components/ui/panels.vue (PRs #3, #4, #5 each add a
# block after effectivePanel and to the vue import list); keep all of them.
# #3/#4: theme.scss and panels.vue (keep both). PR #6 vs #2: OfflinePanel imports and window.confirm -> askConfirm (keep
# both), #10 vs #2: theme.scss route card block (take #2, it has the same fix),
# and docs/10.features.md + docs/11.routes.md (take #2, then say the
# delete goes through the in-app dialog).
set -euo pipefail
PREVIEW=claude/project-thread-ygoeet
BRANCHES=(
  claude/project-thread-yw526i   # side panel look (fork PR #2)
  claude/project-thread-3zu78p   # panel closing animation (fork PR #3)
  claude/smoother-motion         # smoother motion, Esc to close (fork PR #4)
  claude/swipe-to-close          # swipe to close (fork PR #5)
  claude/friendly-delete         # in-app delete confirm (fork PR #6)
  claude/map-3d-tip              # 3D tilt tip (fork PR #7)
  claude/project-thread-xsf8eo   # Offline Maps layout (fork PR #9)
  claude/project-thread-v7xhr7   # card buttons + tab names on phones (fork PR #10)
)
git fetch origin
git fetch https://github.com/OpenGIS/app.git master   # sets FETCH_HEAD
git checkout -B "$PREVIEW" FETCH_HEAD
for b in "${BRANCHES[@]}"; do
  git merge --no-edit "origin/$b"
done
git checkout "origin/$PREVIEW" -- scripts/refresh-preview.sh
git commit -m "chore(preview): add script to rebuild the preview branch"
npm run build
git push --force-with-lease origin "$PREVIEW"
