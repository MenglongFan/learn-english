#!/bin/bash
# 构建并部署到 gh-pages 分支（GitHub Pages）
# 用法：./scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

WORKTREE=/tmp/ghp-deploy
git worktree remove --force "$WORKTREE" 2>/dev/null || true
git worktree add --detach "$WORKTREE" >/dev/null
git -C "$WORKTREE" checkout --orphan gh-pages >/dev/null
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r dist/. "$WORKTREE"/
touch "$WORKTREE/.nojekyll"

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "no changes to deploy"
  exit 0
fi
git -C "$WORKTREE" commit -m "deploy: site build at $(date +%F\ %T)"
git -C "$WORKTREE" push origin gh-pages --force

echo "deployed: https://MenglongFan.github.io/learn-english/"
