#!/usr/bin/env bash
# Thin wrapper around gen-roster.py — the real generator. Regenerates every
# downstream LLM-roster config from claude-code-config/models.yaml.
#
# Usage: bin/gen-roster.sh [--dry-run] [--reload]
#   --dry-run  print diffs without writing (passed through to gen-roster.py).
#   --reload   after a real (non-dry-run) generate, bounce the live services so
#              new/changed models go live immediately:
#                • LiteLLM container  — re-reads its model_list, so /v1/models is
#                  current → Hermes Desktop (live fetch) + Pi see new models.
#                • llama-swap         — registers new GGUF model defs (it does
#                  NOT hot-reload its config).
#              No-op under --dry-run. Reload steps are best-effort: a service
#              that isn't running is skipped with a note, never a hard failure.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

reload=false
dry=false
pyargs=()
for a in "$@"; do
  case "$a" in
    --reload)  reload=true ;;
    --dry-run) dry=true; pyargs+=("$a") ;;
    *)         pyargs+=("$a") ;;
  esac
done

python3 "$DIR/gen-roster.py" ${pyargs[@]+"${pyargs[@]}"}

if [ "$reload" = true ] && [ "$dry" = false ]; then
  echo
  echo "── reloading live services (--reload) ──"

  # LiteLLM: restart the container so it re-reads the regenerated model_list.
  if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx litellm; then
    echo "• restarting LiteLLM container…"
    if docker restart litellm >/dev/null 2>&1; then echo "  ✓ litellm reloaded"; else echo "  ✗ litellm restart failed"; fi
  else
    echo "• litellm container not running — skipped"
  fi

  # llama-swap: kickstart so new GGUF models register (no hot-reload).
  svc="gui/$(id -u)/com.shanelogsdon.llama-swap"
  if launchctl print "$svc" >/dev/null 2>&1; then
    echo "• kickstarting llama-swap…"
    if launchctl kickstart -k "$svc" >/dev/null 2>&1; then echo "  ✓ llama-swap reloaded"; else echo "  ✗ llama-swap kickstart failed"; fi
  else
    echo "• llama-swap service not loaded — skipped"
  fi

  echo "Tip: in Hermes Desktop, run '/model --refresh' to re-fetch the live model list."
fi
