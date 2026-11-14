#!/usr/bin/env bash
# One morning's work: find out which feeds exist, then read them.
#
# Run by a scheduler, so it says where it is and logs what happened. A
# failure must leave the database as it was rather than half written,
# which is why run.mjs wraps its writes in a transaction.
set -euo pipefail

cd "$(dirname "$0")/.."
LOG="${ODYSSEUS_LOG:-data/ingest.log}"
mkdir -p "$(dirname "$LOG")"

{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  # discovery is cheap and companies move between ATSs, so it runs first
  node ingest/discover.mjs
  node ingest/run.mjs --design
  echo
} >> "$LOG" 2>&1
