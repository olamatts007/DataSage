#!/usr/bin/env bash
# Deploy a fresh build to the GitHub Pages test URL (branch arena/01a031e8-datasage, folder /docs).
# Prereq: Pages enabled once in repo Settings → Pages → "Deploy from a branch".
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ building…"
npm run build

echo "→ staging docs/…"
cp -r dist/* docs/
touch docs/.nojekyll

if [ ! -f public/access-codes.json ]; then
  echo "!! public/access-codes.json missing — customers on the hosted URL will see an empty registry."
  echo "   Export a provisioning bundle from #/admin and place it there, then re-run."
  exit 1
fi

git add docs public
git commit -m "Deploy test build to GitHub Pages (docs/) • $(date -u +%Y-%m-%dT%H:%MZ)" || echo "nothing to commit"
git push origin arena/01a031e8-datasage

echo "✓ Pushed. https://olamatts007.github.io/DataSage/ refreshes in ~1–2 minutes."
