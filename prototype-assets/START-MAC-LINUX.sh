#!/usr/bin/env bash
# TaxSage Prototype — one-command start (macOS & Linux)
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  echo "Starting TaxSage prototype with Node…"
  node server.js
elif command -v python3 >/dev/null 2>&1; then
  echo "Node not found — starting with Python instead…"
  echo "Open http://localhost:4173 in your browser (serve index.html from dist/)"
  cd dist && python3 -m http.server 4173
else
  echo "Please install Node.js (https://nodejs.org) or Python 3, then run this again."
  exit 1
fi
