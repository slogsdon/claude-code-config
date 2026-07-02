# LiteLLM Virtual Keys — Budget Caps (WS3) + Privacy Allowlists (WS2)

- **Date:** 2026-07-02
- **Status:** WS3 mechanism DONE + verified live; WS2 + workflow-wiring are follow-ons
- **Spec:** `2026-07-02-multi-model-agentic-workflow-design.md` §5 (WS2, WS3)

## What this delivers

WS2 and WS3 share one mechanism: **LiteLLM virtual keys**. A per-workflow key carries
both a `max_budget`/`budget_duration` (WS3 cost cap) and a `models` allowlist (WS2 privacy —
a private key omits every `free: true` cloud alias so vault/private work can only reach local
models). Prerequisite for either: a database connected to LiteLLM (without one, `/key/*` is
disabled — confirmed: `/key/info` → "Database not connected").

## Done (verified live 2026-07-02)

- **Dedicated Postgres** `litellm-db` (`postgres:16-alpine`, named volume `litellm_pgdata`,
  healthcheck) added to `otel-local-ai/docker-compose.yml`, isolated from Langfuse's DB.
- **LiteLLM wired to it** — `DATABASE_URL` + `LITELLM_SALT_KEY` env (secrets auto-generated
  into gitignored `.env`), `depends_on: litellm-db (healthy)`. Prisma migrations run on boot;
  `/key/*` endpoints live.
- **Verified:** minted a key with `max_budget: 1.0`, `budget_duration: 7d`,
  `models: [exec-free, exec-cloud, plan-frontier, code]`. Allowlist **enforcement proven** — a
  call to `max` (not in the allowlist) was rejected: *"key not allowed to access model … can
  only access models=['exec-free','code']"*. Test keys cleaned up.
- **Helper** `otel-local-ai/scripts/litellm-key.sh` — `mint <alias> <budget> <duration> <models>`
  / `list` / `delete <alias>`.

Commits: `otel-local-ai@775ba00` (DB + helper); `773cbaa` (prior NIM wiring).

## Follow-on 1 — WS2 privacy allowlists (define the keys)

Mint the standing per-workflow keys, allowlists chosen by data-sensitivity:
- **Public/OSS workflows** → include cloud aliases: `exec-free,exec-cloud,plan-frontier,code`.
- **Private/vault workflows** → local ONLY: `code,max,reasoning,writing,structured` — **no**
  `free: true` cloud alias. This is the enforced privacy boundary.

Add a validation step so a key tagged private can never be minted with a `free: true` alias
(cross-check against `cloud_models[].free` in `models.yaml`).

## Follow-on 2 — wire workflows to their keys

Point each consumer at its own key instead of the master key:
- **ralph** — `RALPH_*` env / `lib/common.sh` provider key.
- **hermes-dispatch** — per-agent or per-pipeline key (the pipeline run seeds it).
Store minted key values where the workflow reads them (not in git).

## Note on current priority

The cloud tier is presently all-free (NIM), so budget caps have nothing to cap yet — WS3's
value is realized when OpenRouter paid is enabled (uncomment the dormant tier in `models.yaml`,
add OR credits). The mechanism is now in place so that switch is a config change, not a build.
The WS2 privacy boundary (keep vault/private off free endpoints) IS relevant now.
