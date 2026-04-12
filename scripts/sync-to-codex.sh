#!/usr/bin/env bash
set -euo pipefail

mkdir -p ~/.codex/skills/personal
for dir in skills/*/; do
  skill_name=$(basename "$dir")
  mkdir -p ~/.codex/skills/personal/$skill_name
  cp "$dir/SKILL.md" ~/.codex/skills/personal/$skill_name/SKILL.md
done

echo "Synced $(ls skills/ | wc -l | tr -d ' ') skills to ~/.codex/skills/personal/"
