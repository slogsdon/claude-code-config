#!/usr/bin/env bash
# build-plugin.sh — Sync skills into plugins/shane-config/ and optionally package as .plugin
#
# Usage:
#   ./scripts/build-plugin.sh           # sync only (updates plugins/shane-config/)
#   ./scripts/build-plugin.sh --package # sync + write shane-config.plugin to repo root
#   ./scripts/build-plugin.sh --package /path/to/output.plugin

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_DIR="$REPO_DIR/plugins/shane-config"
PACKAGE=false
OUTPUT="$REPO_DIR/shane-config.plugin"

for arg in "$@"; do
  case "$arg" in
    --package) PACKAGE=true ;;
    /*) OUTPUT="$arg" ;;
  esac
done

echo "Syncing skills into plugins/shane-config/..."

# ── Ensure plugin directory structure ────────────────────────────────────────

mkdir -p "$PLUGIN_DIR/.claude-plugin"
mkdir -p "$PLUGIN_DIR/skills"

# ── Manifest ─────────────────────────────────────────────────────────────────

cat > "$PLUGIN_DIR/.claude-plugin/plugin.json" << 'EOF'
{
  "name": "shane-config",
  "version": "0.1.0",
  "description": "Shane's personal Claude configuration — vault workflow, knowledge exploration, and dev skills",
  "author": {
    "name": "Shane Logsdon"
  }
}
EOF

# ── MCP servers ──────────────────────────────────────────────────────────────

cat > "$PLUGIN_DIR/.mcp.json" << 'EOF'
{
  "mcpServers": {
    "lmstudio-agent": {
      "command": "/opt/homebrew/bin/python3.13",
      "args": ["/Users/shane/Code/claude-code-config/mcp-servers/lmstudio-agent/server.py"],
      "env": {}
    }
  }
}
EOF

# ── Sync skills ──────────────────────────────────────────────────────────────

# Wipe and rebuild skills directory cleanly
chmod -R u+w "$PLUGIN_DIR/skills" 2>/dev/null || true
rm -rf "$PLUGIN_DIR/skills"
mkdir -p "$PLUGIN_DIR/skills"

skill_count=0
for skill_dir in "$REPO_DIR/skills/"/*/; do
  skill_name="$(basename "$skill_dir")"
  if [ -f "$skill_dir/SKILL.md" ]; then
    cp -r "$skill_dir" "$PLUGIN_DIR/skills/$skill_name"
    skill_count=$((skill_count + 1))
  else
    echo "  WARNING: $skill_name has no SKILL.md, skipping"
  fi
done

echo "  $skill_count skills synced"

# ── Validate ─────────────────────────────────────────────────────────────────

if ! python3 -c "import json; json.load(open('$PLUGIN_DIR/.claude-plugin/plugin.json'))" 2>/dev/null; then
  echo "ERROR: plugin.json is not valid JSON" >&2
  exit 1
fi

echo "Sync complete → $PLUGIN_DIR"

# ── Package (optional) ───────────────────────────────────────────────────────

if [ "$PACKAGE" = true ]; then
  TMP_DIR="$(mktemp -d)"
  cleanup() { rm -rf "$TMP_DIR"; }
  trap cleanup EXIT

  cp -r "$PLUGIN_DIR" "$TMP_DIR/shane-config"
  (cd "$TMP_DIR/shane-config" && zip -qr "$OUTPUT" . -x "*.DS_Store")

  echo "Packaged → $OUTPUT ($(du -sh "$OUTPUT" | cut -f1))"
fi
