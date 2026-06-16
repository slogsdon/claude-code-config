#!/usr/bin/env bash
# Thin wrapper around gen-roster.py — the real generator. Regenerates every
# downstream LLM-roster config from claude-code-config/models.yaml.
# Usage: bin/gen-roster.sh [--dry-run]
set -euo pipefail
exec python3 "$(dirname "$0")/gen-roster.py" "$@"
