#!/usr/bin/env bash
# Keep .claude/skills/ ↔ .codex/skills/ byte-identical.
#
# Per cardinal rule 25 (stories are docs; primitive is canon) and
# umbrella rule 12 (concept-first, one-name-per-concept) the skill
# body should exist once, not twice. We physically mirror them so
# Claude Code (reads `.claude/`) and Codex (reads `.codex/`) both
# see the same content — drift would silently produce two skills
# with the same name but different bodies.
#
# Usage:
#   scripts/sync-skills.sh           # check parity, fail if drifted
#   scripts/sync-skills.sh --apply   # rewrite the trailing copy

set -euo pipefail

cd "$(dirname "$0")/.."

CLAUDE_DIR=".claude/skills"
CODEX_DIR=".codex/skills"
APPLY=0

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    -h|--help)
      sed -n '2,15p' "$0"
      exit 0
      ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ ! -d "$CLAUDE_DIR" ]]; then
  echo "no $CLAUDE_DIR — nothing to sync" >&2
  exit 0
fi

mkdir -p "$CODEX_DIR"

drift=0
while IFS= read -r -d '' claude_file; do
  rel="${claude_file#$CLAUDE_DIR/}"
  codex_file="$CODEX_DIR/$rel"
  if [[ ! -f "$codex_file" ]] || ! cmp -s "$claude_file" "$codex_file"; then
    drift=1
    if [[ "$APPLY" -eq 1 ]]; then
      mkdir -p "$(dirname "$codex_file")"
      cp "$claude_file" "$codex_file"
      echo "✓ synced $rel"
    else
      echo "✗ drifted: $rel"
    fi
  fi
done < <(find "$CLAUDE_DIR" -type f -print0)

# Reverse direction — catch files that exist only in .codex/
while IFS= read -r -d '' codex_file; do
  rel="${codex_file#$CODEX_DIR/}"
  claude_file="$CLAUDE_DIR/$rel"
  if [[ ! -f "$claude_file" ]]; then
    drift=1
    echo "✗ exists only in .codex/: $rel"
  fi
done < <(find "$CODEX_DIR" -type f -print0)

if [[ "$drift" -eq 0 ]]; then
  echo "✓ .claude/skills ↔ .codex/skills in parity"
  exit 0
fi

if [[ "$APPLY" -eq 1 ]]; then
  exit 0
fi

echo
echo "drift detected — run \`scripts/sync-skills.sh --apply\` to fix"
exit 1
